import { createContext } from "react";
import { AccessListRecord } from "../models/websocket/ServerAccessList";
import { ConnectorWebsocket } from "../services/ConnectorWebsocket";
import { GHostWebSocket } from "../services/GHostWebsocket";
import { MapService } from "../services/MapService";
import { MapUploaderService } from "../services/MapUploaderService";
import { AccessMaskHolder } from "../utils/AccessMaskHolder";
import { ApiTokenHolder } from "../utils/ApiTokenHolder";
import { ServerUserAuth } from "./../models/websocket/ServerUserAuth";

// Socket Context

export type WebsocketContextType = {
  ghostSocket: GHostWebSocket;
  isGHostSocketConnected: boolean;
  connectorSocket: ConnectorWebsocket;
  isConnectorSocketConnected: boolean;
};

export const WebsocketContext = createContext<WebsocketContextType>(null);

// Config Context

export type AppRuntimeSettingsContextType = {
  gameList: {
    locked: boolean;
    setLocked: (locked: ((locked: boolean) => boolean) | boolean) => void;
  };
  chat: {
    selectUser?: (nickname: string) => void;
  };
};

export const AppRuntimeSettingsContext =
  createContext<AppRuntimeSettingsContextType>(null);

// Auth Context

export type AuthCredentials = {
  type: number;
  token: string;
};

export type AuthData = {
  currentAuth: ServerUserAuth;
  authCredentials: AuthCredentials;
  forceLogin: boolean;
  apiToken: ApiTokenHolder;
  accessMask: AccessMaskHolder;
};

// Actions

type SaveCredentialsActionType = {
  action: "saveCredentials";
  payload: AuthCredentials;
};

type SaveAuthActionType = {
  action: "saveAuth";
  payload: ServerUserAuth;
};

type SaveTokenActionType = {
  action: "saveToken";
  payload: string;
};

type SaveAccessMask = {
  action: "saveAccessMask";
  payload: AccessListRecord[];
};

type ClearCredentialsActionType = {
  action: "clearCredentials";
};

type ClearAuthActionType = {
  action: "clearAuth";
};

type SetForcehActionType = {
  action: "setForce";
  payload: boolean;
};

export type AuthAction =
  | SaveAuthActionType
  | SaveCredentialsActionType
  | SaveTokenActionType
  | SaveAccessMask
  | ClearCredentialsActionType
  | ClearAuthActionType
  | SetForcehActionType;

export type AuthContextType = {
  dispatchAuth: React.Dispatch<AuthAction>;
  auth: AuthData;
};

export const AuthContext = createContext<AuthContextType>(null);

// RestApi context

export type RestContextType = {
  mapUploader: MapUploaderService;
  mapsApi: MapService;
};

export const RestContext = createContext<RestContextType>(null);

// Cache Context

export const CacheContext = createContext<CacheContextType>(null);

export type CachedConnetcorIds = { [key: number]: string };

interface CacheContextType {
  cachedConnectorIds: CachedConnetcorIds;

  cacheConnectorIdsDispatcher: React.Dispatch<CacheConnectorIdAction>;
}

type CacheConnectorId = {
  action: "cache";
  payload: {
    [key: number]: string;
  };
};

type RemoveConnectorId = {
  action: "remove";
  payload: number[];
};

type ClearConnectorId = {
  action: "clear";
};

export type CacheConnectorIdAction =
  | ClearConnectorId
  | RemoveConnectorId
  | CacheConnectorId;
