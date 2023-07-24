import React from "react";
import { useContext, useState } from "react";
import { Icon, Label, Menu } from "semantic-ui-react";
import { AppRuntimeSettingsContext, WebsocketContext } from "../context";
import { Chat } from "./Chat";
import OnlineStatsCounter from "./Footer/OnlineStatsCounter";

function Footer(props) {
  const runTimeContext = useContext(AppRuntimeSettingsContext);
  const websocketContext = useContext(WebsocketContext);

  const [showChat, setShowShat] = useState(false);
  const [hasUnreadMessages, setUnreadMessages] = useState(false);

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  const refreshButtonOnClick = () => {
    runTimeContext.gameList.setLocked((locked) => {
      return !locked;
    });
  };

  const connectorClassList = runTimeContext.gameList.locked ? ["red"] : [];

  return (
    <>
      <Chat
        open={showChat}
        setOpen={setShowShat}
        setUnreadMessages={setUnreadMessages}
      />
      <Menu text fixed="bottom" size="massive" className="footer-menu">
        <OnlineStatsCounter />
        <Menu.Item title={t("footerHostbotWebsocketHint")}>
          <Icon
            name="plug"
            color={
              websocketContext.isGHostSocketConnected ? "green" : undefined
            }
          ></Icon>
        </Menu.Item>
        <Menu.Item position="right" onClick={refreshButtonOnClick}>
          <Icon
            name="sync alternate"
            className={connectorClassList.join(" ")}
          ></Icon>
        </Menu.Item>
        <Menu.Item onClick={() => setShowShat(!showChat)}>
          <Icon name="envelope"></Icon>
          {hasUnreadMessages && <Label circular color="red" empty floating />}
        </Menu.Item>
        <Menu.Item
          as="a"
          href="https://discordapp.com/invite/zFZsGTQ"
          onClick={(e) => {
            window.open("https://discordapp.com/invite/zFZsGTQ");
            e.preventDefault();
          }}
        >
          <Icon name="discord"></Icon>
        </Menu.Item>
        <Menu.Item
          as="a"
          href="https://vk.com/irina_bot"
          onClick={(e) => {
            window.open("https://vk.com/irina_bot");
            e.preventDefault();
          }}
        >
          <Icon name="vk"></Icon>
        </Menu.Item>
        <Menu.Item
          as="a"
          href="https://github.com/kirill-782/irinabot-ru-site"
          onClick={(e) => {
            window.open("https://github.com/kirill-782/irinabot-ru-site");
            e.preventDefault();
          }}
        >
          <Icon name="github"></Icon>
        </Menu.Item>
      </Menu>
    </>
  );
}

export default Footer;
