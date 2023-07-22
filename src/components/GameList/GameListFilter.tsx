import React, { useContext } from "react";
import { memo } from "react";
import ReactSlider from "react-slider";
import { Button, Form } from "semantic-ui-react";
import { AppRuntimeSettingsContext } from "../../context";
import { FilterSettings } from "../../hooks/useGameListFilter";
import "./GameListFilter.scss";

const options = [
  {
    key: "default",
    text: "page.game.list.filter.options.default",
    value: "default",
  },
  {
    key: "freeSlots",
    text: "page.game.list.filter.options.freeSlots",
    value: "freeSlots",
  },
  {
    key: "allSlots",
    text: "page.game.list.filter.options.allSlots",
    value: "allSlots",
  },
  {
    key: "playerSlots",
    text: "page.game.list.filter.options.playerSlots",
    value: "playerSlots",
  },
];

export interface GameListFilterProps {
  filterSettings: FilterSettings;
  onFilterChange: (filterState: FilterSettings) => void;
  disabledFilters: string[];
}

function GameListFilter({
  filterSettings,
  onFilterChange,
  disabledFilters,
}: GameListFilterProps) {
  const { language } = useContext(AppRuntimeSettingsContext);
  const lang = language.languageRepository;

  return (
    <>
      <Form className="sidebar-filter">
        <Form.Checkbox
          label={lang.filterNoStarted}
          checked={filterSettings.noLoadStarted}
          name="noLoadStarted"
          disabled={disabledFilters.indexOf("noLoadStarted") > -1}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              noLoadStarted: !!data.checked,
            });
          }}
        ></Form.Checkbox>
        <Form.Checkbox
          label={lang.filterNoStarted}
          checked={filterSettings.forceReorder}
          name="forceReorder"
          disabled={disabledFilters.indexOf("forceReorder") > -1}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              forceReorder: !!data.checked,
            });
          }}
        ></Form.Checkbox>
        <Form.Checkbox
          name="onlySelfGames"
          disabled={disabledFilters.indexOf("onlySelfGames") > -1}
          checked={filterSettings.onlySelfGames}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              onlySelfGames: !!data.checked,
            });
          }}
          label={lang.filterOnlySelfGames}
        ></Form.Checkbox>
        <Form.Checkbox
          name="onlyFavoritedMaps"
          disabled={disabledFilters.indexOf("onlyFavoritedMaps") > -1}
          checked={filterSettings.onlyFavoritedMaps}
          onChange={(event, data) => {
            onFilterChange({
              ...filterSettings,
              onlyFavoritedMaps: !!data.checked,
            });
          }}
          label={lang.page_game_list_filter_onlyFavoritedMaps}
        ></Form.Checkbox>
        <Form.Group grouped>
          <label>{lang.filterGameType}</label>
          <Form.Field
            label={lang.page_game_list_filter_normalType}
            control="input"
            type="radio"
            name="gameType"
            disabled={disabledFilters.indexOf("gameType") > -1}
            checked={filterSettings.gameType === 1}
            onChange={(event, data) => {
              onFilterChange({
                ...filterSettings,
                gameType: 1,
              });
            }}
          />
          <Form.Field
            label={lang.filterAllType}
            control="input"
            type="radio"
            name="gameType"
            disabled={disabledFilters.indexOf("gameType") > -1}
            checked={filterSettings.gameType === 0}
            onChange={(event, data) => {
              onFilterChange({
                ...filterSettings,
                gameType: 0,
              });
            }}
          />
          <Form.Field
            label={lang.filterReposeType}
            control="input"
            type="radio"
            name="gameType"
            disabled={disabledFilters.indexOf("gameType") > -1}
            checked={filterSettings.gameType === 2}
            onChange={(event, data) => {
              onFilterChange({
                ...filterSettings,
                gameType: 2,
              });
            }}
          />
        </Form.Group>
        <Form.Group className="order-filter">
          <Form.Dropdown
            name="orderBy"
            className="order-filter-select"
            disabled={disabledFilters.indexOf("orderBy") > -1}
            onChange={(event, data) =>
              onFilterChange({
                ...filterSettings,
                orderBy: data.value as string,
              })
            }
            button
            basic
            floating
            options={options.map((i) => {
              return { ...i, text: t(i.text) };
            })}
            value={filterSettings.orderBy}
          />
          <Button
            floated="right"
            basic
            icon="exchange"
            name="reverseOrder"
            disabled={disabledFilters.indexOf("reverseOrder") > -1}
            color={filterSettings.reverseOrder ? "green" : undefined}
            onClick={() =>
              onFilterChange({
                ...filterSettings,
                reverseOrder: !filterSettings.reverseOrder,
              })
            }
          />
        </Form.Group>

        <Form.Field className="players-filter">
          <label>{lang.filterLobbyPlayers}</label>
          <ReactSlider
            value={filterSettings.players}
            onChange={(newValue) => {
              onFilterChange({
                ...filterSettings,
                players: newValue,
              });
            }}
            max={24}
            min={0}
            step={1}
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </Form.Field>
        <Form.Field>
          <label>{lang.page_game_list_filter_freeSlots}</label>
          <ReactSlider
            value={filterSettings.freeSlots}
            onChange={(newValue) => {
              onFilterChange({
                ...filterSettings,
                freeSlots: newValue,
              });
            }}
            max={24}
            min={0}
            step={1}
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
            renderTrack={(props, state) => <div {...props}></div>}
          />
        </Form.Field>
        <Form.Field>
          <label>{lang.filterSlotCount}</label>
          <ReactSlider
            value={filterSettings.slots}
            onChange={(newValue) => {
              onFilterChange({
                ...filterSettings,
                slots: newValue,
              });
            }}
            max={24}
            min={0}
            step={1}
            renderThumb={(props, state) => (
              <div {...props}>{state.valueNow}</div>
            )}
          />
        </Form.Field>
      </Form>
    </>
  );
}

export default memo(GameListFilter);
