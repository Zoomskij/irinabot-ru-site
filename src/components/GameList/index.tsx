import { Image, Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";
import React, { memo, useContext } from "react";
import ConnectorAddButton from "./ConnectorAddButton";

import "./GameList.scss";
import { GameListGame } from "./../../models/websocket/ServerGameList";
import ConnectorId from "../ConnectorId";
import SendSignalButton from "./SendSignalButton";
import ReactTimeAgo from "react-time-ago";
import classnames from "classnames";
import copy from "clipboard-copy";
import { AppRuntimeSettingsContext } from "../../context";

// TODO AdsFile

const ADS = [
  {
    img: "https://irinabot.ru/kaisa/ZBRestored.png",
    link: "https://discord.com/invite/bfkq5JcDPT",
    index: undefined,
    creatorId: 171118,
    expire: 1670706000000,
  },
  {
    img: "https://irinabot.ru/kaisa/XGMLogo.png",
    link: "https://xgm.guru/p/wc3/xgm-irina-autohost",
    index: undefined,
    creatorId: 170246,
  },
];

interface GameListProps {
  gameList: GameListGame[];
  selectedGame: GameListGame | null;
  setSelectedGame: (game: GameListGame | null) => void;
}

function GameList({ gameList, selectedGame, setSelectedGame }: GameListProps) {
  const { language } = useContext(AppRuntimeSettingsContext);

  const getPlayerSlots = (game: GameListGame): number => {
    let usedSlots = 0;

    game.players.forEach((player) => {
      if (player.name.length > 0) usedSlots++;
    });

    return usedSlots;
  };

  let remaingAdsRow = ADS.filter((i) => !i.expire || i.expire > Date.now());

  return (
    <Table selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={2}>Слоты</Table.HeaderCell>
          <Table.HeaderCell width={4}>Игра</Table.HeaderCell>
          <Table.HeaderCell>Игроки</Table.HeaderCell>
          <Table.HeaderCell width={2}>Владелец</Table.HeaderCell>
          <Table.HeaderCell width={2}></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameList.map((game: GameListGame, index) => {
          const classList = classnames(
            "game-list-row",
            {
              "game-started": game.gameFlags.started,
            },
            {
              "game-vip": game.gameFlags.hasGamePowerUp,
            },
            {
              "game-external": game.gameFlags.hasOtherGame,
            },
            {
              "game-selected": game.gameCounter === selectedGame?.gameCounter,
            }
          );

          const rowIndex =
            (remaingAdsRow.findIndex((i) => i.index === index) + 1 ||
              remaingAdsRow.findIndex((i) => i.creatorId === game.creatorID) +
                1) - 1;

          const adsRow =
            rowIndex === -1 ? null : remaingAdsRow.splice(rowIndex, 1)[0];

          return (
            <React.Fragment key={game.gameCounter}>
              <Table.Row
                className={classList}
                onClick={() => {
                  if (selectedGame?.gameCounter === game.gameCounter)
                    setSelectedGame(null);
                  else setSelectedGame(game);
                }}
              >
                <Table.Cell>
                  {getPlayerSlots(game) + "/" + game.players.length}
                </Table.Cell>
                <Table.Cell>
                  <div className="game-title">{game.name}</div>
                  {game.gameFlags.started && (
                    <span className="duration">
                      (
                      <ReactTimeAgo
                        date={new Date(Date.now() - game.gameTicks)}
                        locale={language.currentLocale}
                      />
                      )
                    </span>
                  )}
                  {game.iccupHost && !game.gameFlags.started && (
                    <span
                      className="iccup"
                      title="Копировать"
                      onClick={() => copy(game.iccupHost)}
                    >
                      ({game.iccupHost})
                    </span>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <GameListPlayers players={game.players} />
                </Table.Cell>
                <Table.Cell>
                  <ConnectorId id={game.creatorID} />
                </Table.Cell>
                <Table.Cell>
                  <ConnectorAddButton game={game} />
                  <SendSignalButton game={game} />
                </Table.Cell>
              </Table.Row>
              {adsRow && (
                <Table.Row>
                  <Table.Cell colSpan="5">
                    <a href={adsRow.link}>
                      <Image style={{ width: "100%" }} src={adsRow.img}></Image>
                    </a>
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default memo(GameList);
