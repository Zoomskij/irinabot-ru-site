import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  DropdownItemProps,
  DropdownProps,
  Form,
  Grid,
  InputOnChangeData,
  Item,
  Message,
} from "semantic-ui-react";
import { RestContext, WebsocketContext } from "../../context";
import { ClientCreateGameConverter } from "../../models/websocket/ClientCreateGame";
import "./CreateGame.scss";
import { GameCardProps } from "./interfaces";

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

const assemblyMapFlags = (
  mapFlagTeamsTogether,
  mapFlagFixedTeams,
  mapFlagUnitShare,
  mapFlagRandomHero,
  mapFlagRandomRaces
) => {
  return (
    mapFlagTeamsTogether * 1 +
    mapFlagFixedTeams * 2 +
    mapFlagUnitShare * 4 +
    mapFlagRandomHero * 8 +
    mapFlagRandomRaces * 16
  );
};

/** Карточка игры в dropdown */
export const SelectedGameCard: React.FC<GameCardProps> = ({
  map,
  onClick,
  mapFlagFixedTeams,
  mapFlagRandomHero,
  mapFlagRandomRaces,
  mapFlagTeamsTogether,
  mapFlagUnitShare,
  mapSpeed,
  mapVisibility,
  mapObservers,
  patches,
  privateGame,
}) => {
  const [canCreateGame, setCanCreateGame] = useState(false);
  const [selectedPatch, setSelectedPatch] = useState<
    DropdownItemProps | undefined
  >();
  const [configPatches, setConfigPatches] = useState<DropdownItemProps[]>([]);
  const [gameName, setGameName] = useState("");
  const { mapsApi } = useContext(RestContext);
  const sockets = useContext(WebsocketContext);
  const [errorMessage, setErrorMessage] = useState("");

  const { mapInfo, fileName, fileSize, id } = map;
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  const handleCreateGame = (ev: React.SyntheticEvent) => {
    const mapFlags = assemblyMapFlags(
      mapFlagTeamsTogether,
      mapFlagFixedTeams,
      mapFlagUnitShare,
      mapFlagRandomHero,
      mapFlagRandomRaces
    );

    const flags = assemblyMapOptions(
      mapFlags,
      mapSpeed,
      mapVisibility,
      mapObservers
    );

    const patchId = selectedPatch?.value as string;

    if (!id || !patchId) return;

    mapsApi.getMapConfig(id, patchId).then((mapData) => {
      const clientCreateGame = new ClientCreateGameConverter();

      const data = clientCreateGame.assembly({
        flags,
        gameName,
        mapData,
        slotPreset: "",
        privateGame: !!privateGame,
      });
      sockets.ghostSocket.send(data);
    });

    ev.preventDefault();
    return false;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setCanCreateGame(false);
    setErrorMessage("");

    const mapId: number | undefined = map?.id;

    if (mapId) {
      mapsApi.getMapInfo(mapId).then((mapRes) => {
        const newPatches = patches.map((patch) => {
          const matchConfigInfo = mapRes?.configs?.find(
            (el) => el.version === patch.value
          );
          const isOk = matchConfigInfo?.status === 1;

          return {
            ...patch,
            isOk,
            content: (
              <div className={isOk ? "ok-patch" : "error-patch"}>
                {patch.text}
              </div>
            ),
            status: matchConfigInfo?.status,
          };
        });

        setConfigPatches(newPatches);
        setSelectedPatch(newPatches[0]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapNameChange = (_, { value }: InputOnChangeData) => {
    setGameName(value);
  };

  const handlePatchChange = (_, { value }: DropdownProps) =>
    setSelectedPatch(configPatches.find((el) => el.value === value));

  useEffect(() => {
    setCanCreateGame(selectedPatch?.isOk && gameName);

    if (selectedPatch?.isOk) {
      setErrorMessage("");
      return;
    }

    if (!selectedPatch?.value || !id) return;

    const { status } = selectedPatch;

    if (status === undefined) {
      mapsApi.parseMapConfig(id, selectedPatch.value as string).then((res) => {
        console.log("res", res);
        selectedPatch.status = res.status;
        setErrorMessage(
          "Карта отправлена на анализ. Дождитесь завершения загрузки конфига."
        );
      });
    } else if (status === 0) {
      setErrorMessage(
        "Дождитесь окончания загрузки конфига и попробуйте создать игру через 10 минут."
      );
    } else if (status === 2) {
      setErrorMessage(
        "Ошибка загрузки конфига."
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatch, gameName]);

  return (
    <>
      {configPatches.length && (
        <Form>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              name="name"
              label="Название игры"
              placeholder="Название игры"
              value={gameName}
              onChange={handleMapNameChange}
            />
            <Form.Select
              fluid
              name="patch"
              label="Патч"
              onChange={handlePatchChange}
              options={configPatches}
              value={selectedPatch?.value}
            />
          </Form.Group>
        </Form>
      )}

      <Item>
        <Item.Image size="tiny" src={coverImageUrl || mapImageUrl} />

        <Item.Content>
          <Item.Header as="a">{name}</Item.Header>
          <Item.Meta>{author}</Item.Meta>
          <Item.Extra>
            <Grid>
              <Grid.Row>
                {fileName} ({fileSize})
              </Grid.Row>
              <Grid.Row className="map-description">{description}</Grid.Row>
              <Grid.Row>
                <Button type="button" onClick={onClick}>
                  Выбрать другую карту
                </Button>
                <Button
                  role="button"
                  type="button"
                  onClick={handleCreateGame}
                  disabled={!canCreateGame}
                >
                  Создать
                </Button>
              </Grid.Row>
              {errorMessage && (
                <Grid.Row>
                  <Message negative>
                    <p>{errorMessage}</p>
                  </Message>
                </Grid.Row>
              )}
            </Grid>
          </Item.Extra>
        </Item.Content>
      </Item>
    </>
  );
};
