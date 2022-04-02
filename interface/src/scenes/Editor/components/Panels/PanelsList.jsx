import * as React from "react";
import useAppContext from "../../../../hooks/useAppContext";
import { styled } from "baseui";
import PanelListItem from "./PanelListItem";
import UserLock from "../Users/UserLock";

const panelListItems = [
  {
    id: "templates",
    name: "Templates",
  },
  {
    id: "elements",
    name: "Elements",
  },
  {
    id: "photos",
    name: "Photos",
  },
  {
    id: "text",
    name: "Text",
  },
];

function PanelsList() {
  const { activePanel, isMobile, userInterface } = useAppContext();
  const Container = styled("div", (props) => ({
    width: isMobile ? "auto" : "76px",
    height: isMobile ? "76px" : "auto",
    display: "flex",
    flexDirection: isMobile ? "row" : "column",
    justifyContent: isMobile ? "center" : "start",
    backgroundColor: props.$theme.colors.primary100,
  }));
  return (
    <Container>
      {panelListItems.map((panelListItem) => (
        <UserLock
          type="template"
          action={panelListItem.id}
          key={panelListItem.name}
          slot={
            <PanelListItem
              label={panelListItem.name}
              name={panelListItem.name}
              key={panelListItem.name}
              icon={panelListItem.name}
              activePanel={activePanel}
            />
          }
        />
      ))}
    </Container>
  );
}

export default PanelsList;
