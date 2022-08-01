import { Table } from "semantic-ui-react";
import GameListPlayers from "./GameListPlayers";
import React, { memo } from "react";
import ConnectorAddButton from "./ConnectorAddButton";

import "./GameList.scss";
import { GameListGameFilterExtends } from "../../hooks/useGameListFilter";
import { GameListGame } from "./../../models/websocket/ServerGameList";

interface GameListProps {
  gameList: GameListGame[];
  selectedGame: GameListGame | null;
  setSelectedGame: (game: GameListGame | null) => void;
}

function GameList({ gameList, selectedGame, setSelectedGame }: GameListProps) {
  const getPlayerSlots = (game: GameListGameFilterExtends): number => {
    let usedSlots = 0;

    game.players.forEach((player) => {
      if (player.name.length > 0) usedSlots++;
    });

    return usedSlots;
  };

  return (
    <Table selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Патч</Table.HeaderCell>
          <Table.HeaderCell>Слоты</Table.HeaderCell>
          <Table.HeaderCell>Игра</Table.HeaderCell>
          <Table.HeaderCell>Игроки</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {gameList.map((game: GameListGameFilterExtends) => {
          return (
            <Table.Row
              key={game.gameCounter}
              positive={
                game.gameFlags.started ||
                game.gameCounter == selectedGame?.gameCounter
              }
              error={game.gameFlags.hasGamePowerUp}
              warning={game.gameFlags.hasOtherGame}
              className={game.hidden ? "hidden" : ""}
              onClick={() => {
                if (selectedGame?.gameCounter == game.gameCounter)
                  setSelectedGame(null);
                else setSelectedGame(game);
              }}
            >
              <Table.Cell>1.26</Table.Cell>
              <Table.Cell>
                {getPlayerSlots(game) + "/" + game.players.length}
              </Table.Cell>
              <Table.Cell className="game-title">{game.name}</Table.Cell>
              <Table.Cell>
                <GameListPlayers players={game.players} />
              </Table.Cell>
              <Table.Cell>
                <ConnectorAddButton game={game} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

export default memo(GameList);
