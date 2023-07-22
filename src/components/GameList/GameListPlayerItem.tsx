import { Button, Grid, Icon, List, Popup } from "semantic-ui-react";
import { GameListPlayer } from "../../models/websocket/ServerGameList";
import { memo, useContext, useState } from "react";
import "./GameListPlayerItem.scss";
import { AppRuntimeSettingsContext } from "../../context";
import React from "react";
import WarcraftIIIText from "../WarcraftIIIText";

const realmToText = {
  "178.218.214.114": "iCCup",
  connector: "IrInA Connector",
  "127.0.0.1": "Игрок другой платформы",
};

interface GameListPlayerItemProps {
  player: GameListPlayer;
}

interface GamePlayerStats {
  win: string;
  lose: string;
  percent: number;
  totalTime: number;
  apm: string;
}

const getClassColorByPlayer = ({ colour }) => {
  switch (colour) {
    case 0:
      return "red";
    case 1:
      return "blue";
    case 2:
      return "teal";
    case 3:
      return "purple";
    case 4:
      return "yellow";
    case 5:
      return "orange";
    case 6:
      return "green";
    case 7:
      return "pink";
    case 8:
      return "gray";
    case 9:
      return "light-blue";
    case 10:
      return "dark-green";
    case 11:
      return "brown";
    case 12:
      return "maroon";
    case 13:
      return "navy";
    case 14:
      return "turquoise";
    case 15:
      return "violet";
    case 16:
      return "wheat";
    case 17:
      return "peach";
    case 18:
      return "mint";
    case 19:
      return "leavender";
    case 20:
      return "coal";
    case 21:
      return "snow";
    case 22:
      return "emerald";
    case 23:
      return "peanut";
    default:
      return "";
  }
};

function GameListPlayerItem({ player }: GameListPlayerItemProps) {
  const [gamePlayerStats, setGamePlayerStats] =
    useState<GamePlayerStats | null>(null);
  //https://nwc3l.com/irinabot_profile?id=zsef_He_yIIaJI&json

  const { chat } = useContext(AppRuntimeSettingsContext);

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  const openUserChat = () => {
    if (chat.selectUser.selectUser) chat.selectUser.selectUser(player.name);
  };

  const loadStats = () => {
    const urlParser = new URLSearchParams();
    urlParser.append("id", player.name);
    urlParser.append("json", "");
    fetch("https://nwc3l.com/irinabot_profile?" + urlParser.toString()).then(
      (e) => {
        if (e.status === 200) {
          e.json().then((data) => {
            setGamePlayerStats(data.playerInfo);
          });
        } else setGamePlayerStats(null);
      }
    );
  };

  const renderStats = () => {
    if (gamePlayerStats === undefined)
      return (
        <span>{lang.statsLoading}</span>
      );

    if (gamePlayerStats === null)
      return <span>{lang.stats404}</span>;

    return (
      <List horizontal>
        <List.Item style={{ color: "green" }}>
          {lang.wins}: {gamePlayerStats.win}
        </List.Item>
        <List.Item style={{ color: "red" }}>
          {lang.defeats}: {gamePlayerStats.lose}
        </List.Item>{" "}
        <List.Item>
          {lang.winrate}: {gamePlayerStats.percent}%
        </List.Item>
        <List.Item>
          {lang.totalTime}:{" "}
          {gamePlayerStats.totalTime} {lang.h}.
        </List.Item>
        <List.Item style={{ color: "blue" }}>
          APM: {gamePlayerStats.apm}
        </List.Item>
      </List>
    );
  };

  return (
    <Popup
      on="click"
      onOpen={loadStats}
      trigger={
        <List.Item
          key={player.name}
          as="a"
          title={
            !realmToText[player.realm]
              ? player.realm
              : realmToText[player.realm]
          }
          className={`player-name ${getClassColorByPlayer(player)}`}
        >
          <WarcraftIIIText ignoreTags={["|n"]}>{player.name}</WarcraftIIIText>
        </List.Item>
      }
    >
      <Grid centered>
        <Grid.Row>{renderStats()}</Grid.Row>
        <Grid.Row>
          <Button
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              openUserChat();
            }}
          >
            <Icon name="envelope"></Icon>
            {lang.writeMessage}
          </Button>
        </Grid.Row>
      </Grid>
    </Popup>
  );
}

export default memo(GameListPlayerItem);
