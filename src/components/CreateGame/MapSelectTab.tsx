import React, { useEffect, useState } from "react";
import { Button, Form, Grid, Header } from "semantic-ui-react";
import { SearchFilters, SearchOrder } from "../../models/rest/SearchFilters";
import { MapFilters } from "../MapListPage/MapFilters";
import { useDefaultMaps } from "../../hooks/useDefaultMaps";
import { useSearchMaps } from "../../hooks/useSearchMaps";
import { useVisibility } from "../../hooks/useVisibility";
import { MapCard } from "../MapListPage/MapCard";

import "./MapSelectTab.scss";
import { Link, useNavigate } from "react-router-dom";

function MapSelectTab() {
  const [searchOptions, setSearchOptions] = useState<
    [SearchFilters | null, SearchOrder | null]
  >([null, null]);
  const [searchValue, setSearchValue] = useState("");

  const defalutMaps = useDefaultMaps();

  const [searchedMaps, isFull, isLoading, errorMessage, loadNextPage] =
    useSearchMaps(searchOptions[0], searchOptions[1], searchValue);

  const [loadButton, setLoadButton] = useState<HTMLButtonElement | null>(null);

  const isVisible = useVisibility(loadButton, { rootMargin: "100px" });

  useEffect(() => {
    loadNextPage();
  }, [isVisible]);

  const renderMapList = searchedMaps || defalutMaps;

  return (
    <Grid columns="equal" stackable className="map-select-tab">
      <Grid.Column width={3}>
        <Header size="small">Фильтры</Header>
        <Form className="filter-form">
          <MapFilters
            value={searchOptions}
            autoCommit
            onFitlerChange={setSearchOptions}
          />
        </Form>
      </Grid.Column>
      <Grid.Column>
        <Grid.Row>
          <Form>
            <Form.Input
              fluid
              onChange={(_, data) => {
                setSearchValue(data.value);
              }}
              loading={isLoading}
              value={searchValue}
              error={!!errorMessage}
              label="Поиск карты"
              placeholder="Введите часть названия карты..."
            />
          </Form>
        </Grid.Row>
        <Grid.Row className="map-list">
          {renderMapList.map((map, key) => (
            <MapCard
              key={key}
              {...map}
              selectElement={
                <Button as={Link} to={`/create/confirm?mapId=${map.id}`}>
                  Выбрать
                </Button>
              }
            />
          ))}
        </Grid.Row>
        {searchedMaps && !isFull && (
          <Grid textAlign="center">
            <button
              onClick={() => loadNextPage()}
              disabled={isLoading}
              className="ui floated button"
              ref={(el: HTMLButtonElement) => {
                setLoadButton(el);
              }}
            >
              {isLoading ? "Загрузка. . ." : "Загрузить еще"}
            </button>
          </Grid>
        )}
      </Grid.Column>
    </Grid>
  );
}

export default MapSelectTab;
