import React, { useContext } from "react";
import { Table, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { Slot } from "../../models/rest/Slot";
import { getClassColorByIndex } from "./MapSlots";

import "./MapSlots.scss";

const ALL_RACES_FLAGS = 1 | 2 | 4 | 8 | 32;
const SELECTABLE_RACE = 64;

const slotStatusOptions = [
  {
    text: "page.map.slots.type.open",
    value: 0,
  },
  {
    text: "page.map.slots.type.closed",
    value: 1,
  },
  {
    text: "page.map.slots.type.aiEasy",
    value: 2,
  },
  {
    text: "page.map.slots.type.aiMedium",
    value: 3,
  },
  {
    text: "page.map.slots.type.aiInsane",
    value: 4,
  },
];

const slotRacesOptions = [
  {
    text: "page.map.slots.race.human",
    value: 1,
  },
  {
    text: "page.map.slots.race.orc",
    value: 2,
  },
  {
    text: "page.map.slots.race.nightelf",
    value: 4,
  },
  {
    text: "page.map.slots.race.undead",
    value: 8,
  },
  {
    text: "page.map.slots.race.random",
    value: 32,
  },
];

const slotTeamsOptions = (() => {
  let result: any[] = [];

  for (let i = 0; i < 25; ++i) {
    result[i] = {
      teamNumber: (i + 1),
      text: "page.map.slots.slot.team",
      value: i,
    };
  }

  return result;
})();

const slotColorsOptions = (() => {
  let result: any[] = [];

  for (let i = 0; i < 25; ++i) {
    result[i] = {
      value: i,
      text: <span className={`slot-color ${getClassColorByIndex(i)}`}></span>,
    };
  }

  return result;
})();

interface SlotsEditProps {
  slots?: Slot[];
  options?: number;
  onSlotsChange?: (slots: Slot[]) => void;
}

interface SlotExtends extends Slot {
  sid: number;
}

function SlotsEdit({ slots, options, onSlotsChange }: SlotsEditProps) {
  const customForces = ((options || 0) & 64) === 64;

  let teamSlots: SlotExtends[][] = [];

  const { language } = useContext(AppRuntimeSettingsContext);
  const t = language.getString;

  if (slots) {
    if (!customForces)
      teamSlots[0] = slots.map((slot, index) => {
        return {
          ...slot,
          sid: index,
        };
      });
    else {
      slots.forEach((slot, index) => {
        if (!teamSlots[slot.team]) teamSlots[slot.team] = [];
        teamSlots[slot.team].push({ ...slot, sid: index });
      });
    }
  }

  const collectSlots = () => {
    let slots: SlotExtends[] = [];

    return slots
      .concat(...teamSlots)
      .filter((i) => !!i)
      .sort((a, b) => a.sid - b.sid);
  };

  const assemblySlots = (updateSlot: SlotExtends): Slot[] => {
    return collectSlots().map((i) => {
      if (i.sid === updateSlot.sid)
        return {
          status: updateSlot.status,
          team: updateSlot.team,
          colour: updateSlot.colour,
          race: updateSlot.race,
          handicap: updateSlot.handicap,
        };

      return {
        status: i.status,
        team: i.team,
        colour: i.colour,
        race: i.race,
        handicap: i.handicap,
      };
    });
  };

  return (
    <>
      {teamSlots.map((slots, index) => {
        return (
          <React.Fragment key={index}>
            {customForces && <label>{t("page.map.slots.force")} {index + 1}</label>}
            <Table>
              {index === 0 && (
                <Table.Header>
                  <Table.HeaderCell width={1}>SID</Table.HeaderCell>
                  <Table.HeaderCell width={4}>{t("page.map.slots.slot.type")} </Table.HeaderCell>
                  <Table.HeaderCell width={3}>{t("page.map.slots.slot.team")}</Table.HeaderCell>
                  <Table.HeaderCell width={4}>{t("page.map.slots.slot.race")}</Table.HeaderCell>
                  <Table.HeaderCell width={1}>{t("page.map.slots.slot.teamcolor")}</Table.HeaderCell>
                  <Table.HeaderCell width={2}>{t("page.map.slots.slot.handicap")}</Table.HeaderCell>
                </Table.Header>
              )}
              {slots.map((slot, index) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell width={1}>{slot.sid + 1}</Table.Cell>
                    <Table.Cell width={4}>
                      <Form.Dropdown
                        options={slotStatusOptions.map((i) => {
                          return { ...i, text: t(i.text)   }
                        })}
                        value={slot.status}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                status: data.value as number,
                              })
                            );
                        }}
                      ></Form.Dropdown>
                    </Table.Cell>
                    <Table.Cell width={3}>
                      <Form.Dropdown
                        options={slotTeamsOptions.map((i)=> {
                          return { ...i, text: t(i.text) + " " + i.teamNumber}
                        })}
                        value={slot.team}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                team: data.value as number,
                              })
                            );
                        }}
                      ></Form.Dropdown>
                    </Table.Cell>
                    <Table.Cell width={4}>
                      <Form.Dropdown
                        options={slotRacesOptions.map((i)=>{
                          return { ...i, text: t(i.text)}
                        })}
                        value={slot.race & ALL_RACES_FLAGS}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                race:
                                  (slot.race & ~ALL_RACES_FLAGS) |
                                  (data.value as number),
                              })
                            );
                        }}
                      ></Form.Dropdown>
                      <Form.Checkbox
                        checked={!!(slot.race & SELECTABLE_RACE)}
                        label={t("page.map.slotsEdit.allowChange")}
                        onChange={(_, data) => {
                          if (onSlotsChange) {
                            if (data.checked) {
                              onSlotsChange(
                                assemblySlots({
                                  ...slot,
                                  race: slot.race | SELECTABLE_RACE,
                                })
                              );
                            } else {
                              onSlotsChange(
                                assemblySlots({
                                  ...slot,
                                  race: slot.race & ~SELECTABLE_RACE,
                                })
                              );
                            }
                          }
                        }}
                      ></Form.Checkbox>
                    </Table.Cell>
                    <Table.Cell width={1}>
                      <Form.Dropdown
                        options={slotColorsOptions}
                        value={slot.colour}
                        scrolling
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                colour: data.value as number,
                              })
                            );
                        }}
                      ></Form.Dropdown>
                    </Table.Cell>
                    <Table.Cell width={2}>
                      <Form.Input
                        fluid
                        type="number"
                        value={slot.handicap}
                        onChange={(_, data) => {
                          if (onSlotsChange)
                            onSlotsChange(
                              assemblySlots({
                                ...slot,
                                handicap: parseInt(data.value),
                              })
                            );
                        }}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table>
          </React.Fragment>
        );
      })}
    </>
  );
}

export default SlotsEdit;
