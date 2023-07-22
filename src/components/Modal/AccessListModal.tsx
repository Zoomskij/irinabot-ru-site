import React, { useContext, useState } from "react";
import { Message, Modal, Table } from "semantic-ui-react";
import ConnectorId from "../ConnectorId";
import { AppRuntimeSettingsContext, AuthContext } from "./../../context/index";
import AccessMaskModal from "./AccessMaskModal";

import "./AccessListModal.scss";

export interface AccessListModalProps {
  open?: boolean;
  onClose?: () => void;
}

function AccessListModal({ open, onClose }: AccessListModalProps) {
  const auth = useContext(AuthContext).auth;
  const accessRows = auth.accessMask.getRecords();

  const [showAccessMask, setShowAccessMask] = useState<number | undefined>(
    undefined
  );

  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <Modal open={open} onClose={onClose} closeIcon>
      <Modal.Header>{lang.accessList}</Modal.Header>
      <Modal.Content>
        {showAccessMask !== undefined && (
          <AccessMaskModal
            open
            onClose={() => {
              setShowAccessMask(undefined);
            }}
            defaultAccessMask={showAccessMask}
            readOnly
          />
        )}
        {accessRows.length === 0 ? (
          <Message info>{lang.norights}</Message>
        ) : (
          <>
            <Message info>{lang.infoDonuteDate}</Message>
            <Table>
              <Table.Header>
                <Table.HeaderCell>
                  {lang.playerID}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {lang.accessMask}
                </Table.HeaderCell>
                <Table.HeaderCell>
                  {lang.playerID}
                </Table.HeaderCell>
              </Table.Header>
              {accessRows.map((i) => {
                return (
                  <Table.Row key={i.spaceId}>
                    <Table.Cell>
                      <ConnectorId id={i.spaceId} />
                    </Table.Cell>
                    <Table.Cell
                      onClick={() => {
                        setShowAccessMask(i.accessMask);
                      }}
                    >
                      <span className="access-list-modal access-mask">
                        {i.accessMask}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      {i.expireTime === 0
                        ? lang.indefinitely
                        : new Date(i.expireTime * 1000).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          </>
        )}
      </Modal.Content>
    </Modal>
  );
}

export default AccessListModal;
