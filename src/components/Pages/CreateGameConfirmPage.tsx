import React, {
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Container,
  DropdownItemProps,
  DropdownProps,
  Form,
  Grid,
  Input,
  Loader,
  Message,
  Modal,
} from "semantic-ui-react";
import { useLocation } from "react-router-dom";
import { Map } from "../../models/rest/Map";
import { ConfigInfo } from "../../models/rest/ConfigInfo";
import {
  AuthContext,
  CacheContext,
  RestContext,
  WebsocketContext,
} from "../../context";
import { convertErrorResponseToString } from "../../utils/ApiUtils";
import { GameOptions } from "../CreateGame/GameOptions";
import { GameOptionsData } from "../CreateGame/interfaces";
import MapPreview from "../CreateGame/MapPreview";
import ConfigPreview from "../CreateGame/ConfigPreview";
import CreateGameConfirmPatchNotifications from "../CreateGame/CreateGameConfirmPatchNotifications";
import CreateAutohostModal, {
  AuthostModalData,
} from "../Modal/CreateAutohostModal";
import { ClientAddAutohostConverter } from "./../../models/websocket/ClientAddAutohost";
import { ClientCreateGameConverter } from "./../../models/websocket/ClientCreateGame";
import { toast } from "@kokomi/react-semantic-toasts";
import {
  DEFAULT_CONTEXT_HEADER_CONSTANT,
  DEFAULT_AUTOHOST_ADD_RESPONSE,
  DEFAULT_CREATE_GAME_RESPONSE,
} from "../../models/websocket/HeaderConstants";
import { ServerAutohostAddResponse } from "../../models/websocket/ServerAutohostAddResponse";
import { GHostPackageEvent } from "../../services/GHostWebsocket";
import { ServerCreateGame } from "../../models/websocket/ServerCreateGame";
import copy from "clipboard-copy";
import "./CreateGameConfirmPage.scss";
import MetaRobots from "./../Meta/MetaRobots";

const assemblyMapOptions = (
  mapFlags: number,
  mapSpeed: number,
  mapVisibility: number,
  mapObservers: number
): number => {
  return (
    mapFlags | ((mapSpeed | (mapVisibility << 2) | (mapObservers << 5)) << 8)
  );
};

export interface DropdownItemPropsConfirmExtends extends DropdownItemProps {
  status?: null | number;
}

function CreateGameConfirmPage({}) {
  const [options, setOptions] = useState<GameOptionsData>({
    mask: 3,
    slotPreset: "",
    privateGame: false,
    mapSpeed: 3,
    mapVisibility: 4,
    mapObservers: 1,
    configName: "",
  });

  const [gameName, setGameName] = useState("");
  const [autohostModalOpen, setAutohostModalOpen] = useState(false);
  const [lastPassword, setLastPassword] = useState("");

  const [map, config, hasLoading, error] = useLocalMapCategories();

  const [configPatches, selectedPatch, updatePatch] = useLocalPatchSelector(
    map,
    config
  );

  const { accessMask } = useContext(AuthContext).auth;

  const handleAutohostCreate = useLocalAutohostCreateCallback(
    selectedPatch,
    map,
    config,
    options,
    setAutohostModalOpen
  );

  const handleCreateGame = useLocalCreateGameCallback(
    selectedPatch,
    map,
    config,
    options,
    setLastPassword,
    gameName
  );

  const canCreateGame =
    gameName.length > 0 && (config || selectedPatch?.status === 1);
  const canCreateAutohost = canCreateGame && accessMask.hasAccess(32);

  return (
    <Container className="create-game-confirm">
      <MetaRobots noIndex></MetaRobots>
      {error && <Message error>{error}</Message>}
      {hasLoading && (
        <Loader active size="massive">
          Загрузка . . .
        </Loader>
      )}
      {(map || config) && (
        <Grid>
          <Grid.Column width={11}>
            <Form>
              <Form.Group widths="equal">
                <Form.Input
                  fluid
                  label="Название игры"
                  placeholder="Название игры"
                  value={gameName}
                  onChange={(_, data) => {
                    setGameName(data.value);
                  }}
                />
                <Form.Select
                  fluid
                  label="Патч"
                  onChange={updatePatch}
                  options={configPatches}
                  value={selectedPatch?.value}
                  disabled={!!config}
                />
              </Form.Group>
            </Form>
            {!config && (
              <CreateGameConfirmPatchNotifications
                selectedPatch={selectedPatch}
              />
            )}
            {config && <ConfigPreview config={config} />}
            {map && <MapPreview map={map} />}
            <Grid.Row className="cretae-buttons-rows">
              <Button onClick={handleCreateGame} disabled={!canCreateGame}>
                Создать
              </Button>
              <Button
                onClick={() => {
                  setAutohostModalOpen(true);
                }}
                disabled={!canCreateAutohost}
              >
                Создать автохост
              </Button>
            </Grid.Row>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form>
              <GameOptions options={options} onOptionsChange={setOptions} />
            </Form>
          </Grid.Column>
        </Grid>
      )}
      {autohostModalOpen && (
        <CreateAutohostModal
          open={autohostModalOpen}
          onClose={() => {
            setAutohostModalOpen(false);
          }}
          onCreate={handleAutohostCreate}
          defaultGameName={gameName}
          defaultAutostart={map?.mapInfo?.numPlayers || 4}
        ></CreateAutohostModal>
      )}
      <Modal
        open={!!lastPassword}
        onClose={() => {
          setLastPassword("");
        }}
      >
        <Modal.Header>Пароль для входа в игру</Modal.Header>
        <Modal.Content>
          <p>Скопируйте этот пароль, чтобы попасть в игру.</p>
          <Input
            action={{
              icon: "copy",
              content: "Копировать",
              onClick: () => {
                copy(lastPassword);
              },
            }}
            disabled
            fluid
            value={lastPassword}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            positive
            onClick={() => {
              setLastPassword("");
            }}
          >
            Закрыть
          </Button>
        </Modal.Actions>
      </Modal>
    </Container>
  );
}

function useLocalMapCategories(): [
  Map | null,
  ConfigInfo | null,
  boolean,
  string
] {
  const [map, setMap] = useState<Map | null>(null);
  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const [hasLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const location = useLocation();
  const { mapsApi } = useContext(RestContext);

  useEffect(() => {
    const paramParser = new URLSearchParams(location.search);

    const abortController = new AbortController();

    if (paramParser.has("mapId")) {
      const mapId = parseInt(paramParser.get("mapId") || "");

      if (!isNaN(mapId)) {
        if (mapId !== map?.id) {
          // Reset current page conntent

          setLoading(true);
          setError("");

          setMap(null);
          setConfig(null);

          mapsApi
            .getMapInfo(mapId, { signal: abortController.signal })
            .then((map) => {
              setMap(map);
              setError("");
            })
            .catch((e) => {
              setError(convertErrorResponseToString(e));
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } else {
        setError("NaN");
      }
    } else if (paramParser.has("configId")) {
      const configId = parseInt(paramParser.get("configId") || "");

      if (!isNaN(configId)) {
        if (configId !== config?.id) {
          // Reset current page conntent

          setLoading(true);
          setError("");

          setMap(null);
          setConfig(null);

          mapsApi
            .getConfigInfo(configId, { signal: abortController.signal })
            .then((config) => {
              setMap(config.map || null);
              setConfig(config);
              setError("");
            })
            .catch((e) => {
              setError(convertErrorResponseToString(e));
            })
            .finally(() => {
              setLoading(false);
            });
        }
      } else {
        setError("NaN");
      }
    } else {
      setError("Параметры не переданы");
    }

    return () => {
      abortController.abort();
    };
  }, [location.search, mapsApi]);

  return [map, config, hasLoading, error];
}

function useLocalPatchSelector(
  map: Map | null,
  config: ConfigInfo | null
): [
  DropdownItemPropsConfirmExtends[],
  DropdownItemPropsConfirmExtends | undefined,
  (e: SyntheticEvent, data: DropdownProps) => void
] {
  const [configPatches, setConfigPatches] = useState<
    DropdownItemPropsConfirmExtends[]
  >([]);
  const [selectedPatch, setSelectedPatch] =
    useState<DropdownItemPropsConfirmExtends>();

  const { cachedVersions, cacheVersions } = useContext(CacheContext);
  const { mapsApi } = useContext(RestContext);
  const { apiToken } = useContext(AuthContext).auth;

  useEffect(() => {
    if (cachedVersions.length === 0) cacheVersions();
  }, [cachedVersions, cacheVersions]);

  // Config list select

  useEffect(() => {
    setConfigPatches(
      cachedVersions.map((version) => {
        const status = map?.configs?.find(
          (mapConfigVersion) => version === mapConfigVersion.version
        )?.status;

        return {
          text: version,
          value: version,
          status,
          disabled: status === 2,
          content: version + " S: " + status,
        };
      })
    );
  }, [cachedVersions, map]);

  // Default select

  useEffect(() => {
    if (configPatches.length === 0) return;

    if (config)
      setSelectedPatch(configPatches.find((i) => config.version === i.value));
    else {
      setSelectedPatch(
        configPatches.find((i) => i.status === 1) || configPatches[0]
      );
    }
  }, [configPatches, map, config]);

  // Autoparser

  useEffect(() => {
    if (
      !Number.isInteger(selectedPatch?.status) &&
      apiToken.hasAuthority("DEFAULT_CONFIG_PARSE")
    ) {
      if (map?.id && selectedPatch?.value) {
        mapsApi
          .parseMapConfig(map.id, selectedPatch.value.toString())
          .then((result) => {
            setConfigPatches((configPatches) => {
              for (let i = 0; i < configPatches.length; ++i) {
                if (configPatches[i].value === selectedPatch.value)
                  configPatches[i].status = result.status;
              }

              return [...configPatches];
            });

            // По хорошему надо перезапросить объект

            if (Array.isArray(map.configs)) {
              for (let i = 0; i < map.configs.length; ++i) {
                if (map.configs[i].version === selectedPatch.value)
                  map.configs[i].status = result.status;
              }
            }
          });
      }
    }
  }, [selectedPatch]);

  const onUpdatePatch = (e: SyntheticEvent, { value }: DropdownProps) => {
    setSelectedPatch(configPatches.find((e) => e.value === value));
  };

  return [configPatches, selectedPatch, onUpdatePatch];
}

function useLocalAutohostCreateCallback(
  selectedPatch: DropdownItemPropsConfirmExtends | undefined,
  map: Map | undefined | null,
  config: ConfigInfo | undefined | null,
  options: GameOptionsData,
  setAutohostModalOpen: (value: boolean) => void
) {
  const { mapsApi } = useContext(RestContext);
  const { ghostSocket } = useContext(WebsocketContext);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const onPacket = (packet: GHostPackageEvent) => {
      const packetData = packet.detail.package;
      if (
        packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packetData.type === DEFAULT_AUTOHOST_ADD_RESPONSE
      ) {
        const createGameResponse = packetData as ServerAutohostAddResponse;

        if (createGameResponse.status === 0) {
          toast({
            title: "Автохост создан",
            icon: "check",
            color: "green",
          });

          setAutohostModalOpen(false);
        } else {
          toast({
            title: "Автохост не создан " + createGameResponse.status,
            description: createGameResponse.description,
            icon: "check",
            color: "red",
          });
        }
      }
    };

    ghostSocket.addEventListener("package", onPacket);

    return () => {
      ghostSocket.removeEventListener("package", onPacket);
    };
  }, [ghostSocket]);

  return useCallback(
    (autohostData: AuthostModalData) => {
      if (!config && selectedPatch?.status !== 1) return;

      (config?.id
        ? mapsApi.getConfigInfoToken(config.id)
        : mapsApi.getMapConfig(
            map?.id || 0,
            selectedPatch?.value?.toString() || ""
          )
      )
        .then((mapData) => {
          ghostSocket.send(
            new ClientAddAutohostConverter().assembly({
              gameLimit: autohostData.countGames,
              autostart: autohostData.autostart,
              flags: assemblyMapOptions(
                options.mask,
                options.mapSpeed,
                options.mapVisibility,
                options.mapObservers
              ),
              spaceId: autohostData.spaceId,
              hcl: autohostData.hcl,
              slotPreset: "",
              name: autohostData.gameName,
              mapData,
              configName: options.configName,
            })
          );
        })
        .catch((e) => {
          toast({
            title: "Ошибка получения параметров карты",
            description: convertErrorResponseToString(e),
            color: "red",
          });
        });
    },
    [ghostSocket, selectedPatch, auth, options]
  );
}

function useLocalCreateGameCallback(
  selectedPatch: DropdownItemPropsConfirmExtends | undefined,
  map: Map | undefined | null,
  config: ConfigInfo | undefined | null,
  options: GameOptionsData,
  setLastPassword: (value: string) => void,
  gameName: string
) {
  const { mapsApi } = useContext(RestContext);
  const { ghostSocket } = useContext(WebsocketContext);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const onPacket = (packet: GHostPackageEvent) => {
      const packetData = packet.detail.package;

      if (
        packetData.context === DEFAULT_CONTEXT_HEADER_CONSTANT &&
        packetData.type === DEFAULT_CREATE_GAME_RESPONSE
      ) {
        const createGameResponse = packetData as ServerCreateGame;

        if (createGameResponse.status === 0) {
          if (!createGameResponse.password) {
            toast({
              title: "Игра создана",
              description: "Исполдьзуйте коннектор, чтобы войти в игру",
              icon: "check",
              color: "green",
            });
          } else {
            setLastPassword(createGameResponse.password);
          }
        } else {
          toast({
            title: "Ошибка при создании игры",
            description: createGameResponse.description,
            icon: "x",
            color: "red",
          });
        }
      }
    };

    ghostSocket.addEventListener("package", onPacket);

    return () => {
      ghostSocket.removeEventListener("package", onPacket);
    };
  }, [ghostSocket]);

  return useCallback(
    (event: SyntheticEvent, data: any) => {
      if (!config && selectedPatch?.status !== 1) return;

      (config?.id
        ? mapsApi.getConfigInfoToken(config.id)
        : mapsApi.getMapConfig(
            map?.id || 0,
            selectedPatch?.value?.toString() || ""
          )
      )
        .then((mapData) => {
          ghostSocket.send(
            new ClientCreateGameConverter().assembly({
              flags: assemblyMapOptions(
                options.mask,
                options.mapSpeed,
                options.mapVisibility,
                options.mapObservers
              ),
              slotPreset: "",
              gameName,
              mapData: mapData,
              privateGame: options.privateGame,
              configName: options.configName,
            })
          );
        })
        .catch((e) => {
          toast({
            title: "Ошибка получения параметров карты",
            description: convertErrorResponseToString(e),
            color: "red",
          });
        });
    },
    [ghostSocket, selectedPatch, auth, options, gameName]
  );
}

export default CreateGameConfirmPage;
