import React, { useCallback, useEffect, useState } from "react";
import {
  AppRuntimeSettingsContext,
  AuthAction,
  AuthContext,
  AuthData,
  CacheContext,
  RestContext,
  SelectUserFunctionHolder,
  WebsocketContext,
} from "./context";
import "@kokomi/react-semantic-toasts/styles/react-semantic-alert.css";

import "./components/Slider.scss";
import { useGHostSocket } from "./hooks/useGHostSocket";
import { useWebsocketAuth } from "./hooks/useWebsocketAuth";
import { useConnectorSocket } from "./hooks/useConnectorSocket";
import { useConnectorGameAdd } from "./hooks/useConnectorGameAdd";
import RegisterAccountModal from "./components/Modal/RegisterAccountModal";
import {
  CONNECTOR_WEBSOCKET_ENDPOINT,
  WEBSOCKET_ENDPOINT,
} from "./config/ApplicationConfig";

import AfterContextApp from "./AfterContextApp";
import RouteList from "./components/RouteList";

import TimeAgo from "javascript-time-ago";

import ru from "javascript-time-ago/locale/ru.json";
import { loadTheme } from "./utils/Theme";
import SitePrepareLoader from "./components/SitePrepareLoader";

TimeAgo.addDefaultLocale(ru);
TimeAgo.addLocale(ru);

function App() {
  const [ghostSocket, isGHostSocketConnected] = useGHostSocket({
    url: WEBSOCKET_ENDPOINT,
  });

  const [connectorSocket, isConnectorSocketConnected] = useConnectorSocket({
    url: CONNECTOR_WEBSOCKET_ENDPOINT,
  });
  const [gameListLocked, setGameListLocked] = useState(false);

  const [authState, authDispatcher, needRegisterModal] = useWebsocketAuth({
    ghostSocket,
  });

  useConnectorGameAdd({ ghostSocket, connectorSocket });

  const [selectUser, setSelectUser] = useState<SelectUserFunctionHolder>({
    selectUser: () => {},
  });

  // Фиксики останутся пока не загрузятся стили

  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    loadTheme().then(() => {
      setStylesLoaded(true);
    });
  }, []);

  if (!stylesLoaded) {
    return <SitePrepareLoader noWait />;
  }

  return (
    <WebsocketContext.Provider
      value={{
        ghostSocket,
        isGHostSocketConnected,
        connectorSocket,
        isConnectorSocketConnected,
      }}
    >
      <AppRuntimeSettingsContext.Provider
        value={{
          gameList: { locked: gameListLocked, setLocked: setGameListLocked },
          chat: {
            selectUser,
            setSelectUser,
          },
        }}
      >
        <AuthContext.Provider
          value={{
            auth: authState as AuthData,
            dispatchAuth: authDispatcher as React.Dispatch<AuthAction>,
          }}
        >
          <AfterContextApp>
            <RouteList />
            <RegisterAccountModal
              open={needRegisterModal}
              onApprove={() => {
                authDispatcher({ action: "setForce", payload: true });
              }}
              onReject={() => {
                authDispatcher({ action: "clearCredentials" });
              }}
            ></RegisterAccountModal>
          </AfterContextApp>
        </AuthContext.Provider>
      </AppRuntimeSettingsContext.Provider>
    </WebsocketContext.Provider>
  );
}

export default App;
