import { memo, useContext, useState } from "react";
import { Button, Grid } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import MapStats from "./MapStats";
import { GameListGame } from "../../models/websocket/ServerGameList";
import GameJoinButton from "./GameJoinButton";
import React from "react";
import MapDownloadButton from "./MapDownloadButton";
import MapCategoryList from "./MapCategoryList";
import { Link } from "react-router-dom";
import { AuthContext, MapContext } from "./../../context/index";
import CloneConfigButton from "./CloneConfigButton";
import "./MapFooter.scss";
import MapReportModal from "./../Modal/MapReportModal";
import MapFavoriteButton from "./FavoriteButton";

interface MapFooterProps {
  gameList: GameListGame[];
}

function MapFooter({ gameList }: MapFooterProps) {
  const { accessMask, apiToken } = useContext(AuthContext).auth;

  const { categories, downloadUrl, fileName, fileSize, id, configs, favorite } =
    useContext(MapContext).map;

  const showCreateButton =
    apiToken.hasAuthority("MAP_READ") && accessMask.hasAccess(64);

  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      <Grid.Row>
        <MapCategoryList categories={categories} />
        <MapStats gameList={gameList} mapId={id || 0} />
      </Grid.Row>
      <Grid.Row className="map-footer-buttons" verticalAlign="middle">
        {downloadUrl && (
          <MapDownloadButton
            className="centred"
            downloadUrl={downloadUrl}
            fileSize={fileSize}
            fileName={fileName}
            id={id || 0}
          />
        )}
        <GameJoinButton
          className="centred"
          gameList={gameList}
          mapId={id || 0}
        />
        {showCreateButton && (
          <Button
            className="centred"
            color="green"
            basic
            icon="plus"
            as={Link}
            to={`/create/confirm?mapId=${id}`}
          />
        )}
        <div className="divider"></div>

        <MapFavoriteButton />
        <CloneConfigButton
          className="centred"
          mapId={id || 0}
          configs={configs}
        />
        <Button
          className="centred"
          color="red"
          basic
          icon="warning"
          onClick={() => {
            setReportModalOpen(true);
          }}
        />
      </Grid.Row>
      <MapReportModal
        mapId={id || 0}
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
        }}
      ></MapReportModal>
    </>
  );
}

export default memo(MapFooter);
