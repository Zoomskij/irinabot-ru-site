import React, { useState } from "react";
import { Button, Item } from "semantic-ui-react";
import { Map } from "../../models/rest/Map";
import "./CreateGame.scss";
import { Link } from "react-router-dom";
import WarcraftIIIText from "../WarcraftIIIText";
import MapStatusIcons from "../MapStatusIcons";

/** Карточка игры в dropdown */
export const GameCard: React.FC<
  Map & { onClick?(): void; selected: boolean }
> = ({ mapInfo, fileName, fileSize, onClick, id, ...map }) => {
  const { mapImageUrl, coverImageUrl, author, name, description } = mapInfo!;

  const [fullText, setFullText] = useState(false);

  let displayDesctiption = description;
  let needFulltextLink = false;

  if (!fullText && description?.length && description?.length > 500) {
    displayDesctiption = description?.substring(0, 500) + "...";

    needFulltextLink = true;
  }

  return (
    <Item>
      <Item.Image size="tiny" src={coverImageUrl || mapImageUrl} />

      <Item.Content>
        <Item.Header as={Link} to={`/maps/${id}`}>
          <WarcraftIIIText>{name}</WarcraftIIIText><MapStatusIcons {...map} />
        </Item.Header>
        <Item.Meta>
          <WarcraftIIIText>{author}</WarcraftIIIText>
        </Item.Meta>
        <Item.Extra>
          <div>
            <Button type="button" floated="right" onClick={onClick}>
              Выбрать
            </Button>

            <div>
              {fileName} ({fileSize})
            </div>
            <Item.Extra className="map-description">
              <WarcraftIIIText>{displayDesctiption}</WarcraftIIIText>
              {needFulltextLink && (
                <a
                  onClick={() => {
                    setFullText(true);
                  }}
                >
                  Показать весь текст
                </a>
              )}
            </Item.Extra>
          </div>
        </Item.Extra>
      </Item.Content>
    </Item>
  );
};
