import {
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
  useMemo,
  useContext,
} from "react";
import {
  Dropdown,
  Form,
  Grid,
  Header,
  Modal,
  Message,
} from "semantic-ui-react";

import { Category } from "../../models/rest/Category";
import { Flags } from "../../models/rest/Flags";
import { AdditionalFlags, MapService } from "../../services/MapService";
import { useCategoryFilter } from "../../hooks/useCategoryFilter";
import { DragAndDropField } from "./DragAndDropField";
import { AppRuntimeSettingsContext, CacheContext, RestContext } from "./../../context/index";
import React from "react";

interface PrepareUploadMapModalProps {
  onMapSelected: (
    file: FileList,
    flags: Flags,
    additionalFlags: AdditionalFlags
  ) => void;
  open: boolean;
  onClose: (event: SyntheticEvent, data: object) => void;
}

function PrepareUploadMapModal({
  onMapSelected,
  open,
  onClose,
}: PrepareUploadMapModalProps) {
  const [selectedCategories, setSelectedCategories] = useState<any>([]);

  const [isDragging, setDragging] = useState(false);
  const dragCounter = useMemo(() => ({ value: 0 }), []);

  const cacheContext = useContext(CacheContext);
  
  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  useEffect(() => {
    if (cacheContext.cachedCategories.length === 0)
      cacheContext.cacheCategories();
  }, [cacheContext.cachedCategories, cacheContext.cacheCategories]);

  const dropdownOptions = useCategoryFilter(
    selectedCategories,
    cacheContext.cachedCategories,
    5
  );

  const fileInput = useRef<HTMLInputElement>(null);

  const emitMapSelected = (files: FileList) => {
    const flags: Flags = {
      categories: selectedCategories,
    };

    onMapSelected(files, flags, {});
  };

  const handleDrag = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();
  };

  const handleDragEnter = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();

    dragCounter.value++;

    const { items } = ev.dataTransfer;
    if (items?.[0].kind !== "file") {
      return;
    }

    if (items[0] && selectedCategories.length) {
      setDragging(true);
    }
  };

  const handleDragExit = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.stopPropagation();

    dragCounter.value--;
    if (dragCounter.value === 0) {
      setDragging(false);
    }
  };

  const handleDrop = (ev: React.DragEvent<HTMLDivElement>) => {
    dragCounter.value = 0;
    setDragging(false);
    ev.preventDefault();
    ev.stopPropagation();

    if (!selectedCategories.length) return;

    const file = ev.dataTransfer.files[0];
    if (file && (file.name.endsWith(".w3x") || file.name.endsWith(".w3m"))) {
      emitMapSelected(ev.dataTransfer.files);
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>{t("modal.mapUploader.chooseMap")}</Modal.Header>

      <Modal.Content
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragExit}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isDragging && <DragAndDropField />}
        <Modal.Description>
          <Header>{t("modal.mapUploader.whichUploadLabel")}</Header>
          <p>
            {t("modal.mapUploader.whichUploadHint")}
          </p>
          <Form>
            <Form.Field>
              <label>{t("modal.mapUploader.categoryLabel")}</label>
              <Dropdown
                fluid
                multiple
                placeholder={t("modal.mapUploader.category")}
                selection
                options={dropdownOptions}
                loading={cacheContext.cachedCategories.length === 0}
                onChange={(e, p) => {
                  setSelectedCategories(p.value);
                }}
                value={selectedCategories}
              />
            </Form.Field>
            <Form.Field>
              <Grid>
                <Grid.Row centered>
                  <input
                    multiple
                    accept=".w3x , .w3m"
                    onChange={(e) => {
                      if (e.target.files) emitMapSelected(e.target.files);
                    }}
                    type="file"
                    hidden
                    ref={fileInput}
                  />
                  <Grid.Row>
                    <Message
                      header={t("modal.mapUploader.loading")}
                      content={
                        selectedCategories.length === 0
                          ? t("modal.mapUploader.beforeLoading")
                          : t("modal.mapUploader.loadingHint")
                      }
                      onClick={() => {
                        selectedCategories.length && fileInput.current?.click();
                      }}
                    />
                  </Grid.Row>
                </Grid.Row>
              </Grid>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
}

export default PrepareUploadMapModal;
