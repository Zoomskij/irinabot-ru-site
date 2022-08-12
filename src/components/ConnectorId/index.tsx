import "./ConnectorId.scss";
import { useContext } from 'react';
import { CacheContext } from "../../context";

export interface ConnectorIdProps {
  id: number;
  resolve?: boolean;
}

function ConnectorId({id} : ConnectorIdProps) {

  const connectorCache = useContext(CacheContext).cachedConnectorIds;

  if(connectorCache[id])
    return <span className="connectorId" title={`#${id}`}>{connectorCache[id]}</span>;
  else
    return <span className="connectorId">#{id}</span>;
}

export default ConnectorId;
