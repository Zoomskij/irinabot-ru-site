import { Button, Form, Icon, Modal } from "semantic-ui-react";
import React, { useContext, useState } from "react";
import { WebsocketContext } from "../../context";
import { AuthContext } from "./../../context/index";
import { GameListGame } from "../../models/websocket/ServerGameList";
import { ClientRequestUDPGameConverter } from "../../models/websocket/ClientRequestUDPGame";

interface ConnectorAddButtonProps {
  game: GameListGame;
}

function ConnectorAddButton({ game }: ConnectorAddButtonProps) {
  const sockets = useContext(WebsocketContext);
  const auth = useContext(AuthContext).auth;

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const requestConnectorGame = (password?: string) => {
    const converter = new ClientRequestUDPGameConverter();
    sockets.ghostSocket.send(
      converter.assembly({
        gameId: game.gameCounter,
        isPrivateKey: false,
        password: password || "",
      })
    );
  };

  const onButtonClick = () => {
    if (game.gameFlags.hasPassword) setPasswordModalOpen(true);
    else requestConnectorGame();
  };

  const isEnabled =
    auth.currentAuth !== null && sockets.isConnectorSocketConnected;

  if (game.gameFlags.started) return null;

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Modal
          open={passwordModalOpen}
          closeIcon
          onClose={() => {
            setPasswordModalOpen(false);
          }}
        >
          <Modal.Header>Вход в закрытую игру</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Input
                label="Пароль"
                value={password}
                onChange={(_, data) => {
                  setPassword(data.value);
                }}
              ></Form.Input>
              <Form.Button
                color="green"
                onClick={() => {
                  requestConnectorGame(password);
                  setPasswordModalOpen(false);
                }}
              >
                <Icon name="check"></Icon>Войти
              </Form.Button>
            </Form>
          </Modal.Content>
        </Modal>
      </div>
      <Button
        icon={game.gameFlags.hasPassword ? "lock" : "gamepad"}
        disabled={!isEnabled}
        color={isEnabled ? "green" : "red"}
        basic
        size="mini"
        onClick={onButtonClick}
      />
    </>
  );
}

export default ConnectorAddButton;
