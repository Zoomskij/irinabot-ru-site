import { Icon, Menu } from "semantic-ui-react";
import { useContext, useEffect, useState } from "react";
import { Flags } from "../../models/rest/Flags";
import { AdditionalFlags } from "../../services/MapService";
import PrepareUploadMapModal from "../Modal/PrepareUploadMapModal";
import ProgressUploadMapModal from "../Modal/ProgressUploadMapModal";
import {
  AppRuntimeSettingsContext,
  AuthContext,
  RestContext,
} from "../../context";
import { toast } from "@kokomi/react-semantic-toasts";
import {
  UploadMapCompleteEvent,
  UploadMapProgressEvent,
  UploadMapStartEvent,
} from "../../services/MapUploaderService";
import React from "react";
import { useNavigate } from "react-router-dom";

// interface UploadState {
//   file: FileList;
//   flags: Flags;
//   additionalFlags: AdditionalFlags;
// }

interface CurrentMapUploadDescription {
  fillename: string;
  totalSize: number;
  loadedSize: number;
}

function UploadMap() {
  const mapUploader = useContext(RestContext).mapUploader;
  const [modalOpen, setModalOpen] = useState(false);

  const [isMapUploading, setMapUploadind] = useState(mapUploader.isUploading());

  const apiToken = useContext(AuthContext).auth.apiToken;

  const go = useNavigate();

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;
  const t = language.getString;

  const [currentUpload, setCurrentUpload] =
    useState<CurrentMapUploadDescription>({
      fillename: "",
      totalSize: 1,
      loadedSize: 0,
    });

  useEffect(() => {
    const onUploadComplete = (event: UploadMapCompleteEvent) => {
      if (event.detail.remain === 0) {
        setMapUploadind(false);
        setModalOpen(false);
      }

      if (event.detail.error)
        toast({
          title: lang.uploadMapUploadingError,
          description: event.detail.error.toString(),
          type: "error",
        });
      else if (event.detail.map)
        toast(
          {
            title: `${lang.uploadMapMapUploadedNotificationTitle}.`,
            description: t("uploadMapMapUploadedNotificationDescription", {name: event.detail.map.mapInfo?.name}),
            type: "success",
            time: 10000,
          },
          undefined,
          () => {
            go(`/maps/${event.detail.map.id}`);
          }
        );
    };

    const onUploadProgress = (event: UploadMapProgressEvent) => {
      setCurrentUpload((currentUpload) => {
        return {
          ...currentUpload,
          totalSize: event.detail.total,
          loadedSize: event.detail.loaded,
        };
      });
    };

    const onUploadStart = (event: UploadMapStartEvent) => {
      setMapUploadind(true);
      setCurrentUpload({
        totalSize: event.detail.entry.file.size,
        loadedSize: 0,
        fillename: event.detail.entry.file.name,
      });
    };

    mapUploader.addEventListener("complete", onUploadComplete);
    mapUploader.addEventListener("progress", onUploadProgress);
    mapUploader.addEventListener("start", onUploadStart);

    return () => {
      mapUploader.removeEventListener("complete", onUploadComplete);
      mapUploader.removeEventListener("progress", onUploadProgress);
      mapUploader.removeEventListener("start", onUploadStart);
    };
  }, [mapUploader, modalOpen, go]);

  const onMapSelected = (
    files: FileList,
    flags: Flags,
    additionalFlags: AdditionalFlags
  ) => {
    for (let i = 0; i < files.length; ++i)
      mapUploader.queueUploadMap({
        flags,
        additionalFlags,
        file: files[i],
      });
  };

  const onItemClick = () => {
    setModalOpen(true);
  };

  const onModalClose = () => {
    setModalOpen(false);
  };

  const renderModal = () => {
    if (!modalOpen) return null;

    if (isMapUploading)
      return (
        <ProgressUploadMapModal
          percent={Math.round(
            (currentUpload.loadedSize / currentUpload.totalSize) * 100
          )}
          filename={currentUpload.fillename}
          open={modalOpen}
          onClose={onModalClose}
        ></ProgressUploadMapModal>
      );
    else
      return (
        <PrepareUploadMapModal
          onMapSelected={onMapSelected}
          open={modalOpen}
          onClose={onModalClose}
        ></PrepareUploadMapModal>
      );
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {renderModal()}
      </div>
      <Menu.Item
        disabled={!apiToken.hasAuthority("MAP_CREATE")}
        onClick={onItemClick}
        title={
          isMapUploading
            ? `${lang.loading}: ${currentUpload.fillename} ${
                (currentUpload.loadedSize / currentUpload.totalSize) * 100
              }%`
            : lang.uploadMapNoUploadingHint
        }
      >
        <Icon color={isMapUploading ? "green" : undefined} name="upload" />
        {lang.uploadMapUploadMap}
      </Menu.Item>
    </>
  );
}

export default UploadMap;
