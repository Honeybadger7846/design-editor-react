import * as React from "react";
import useAppContext from "../../../../hooks/useAppContext";
import { styled } from "baseui";
import PanelListItem from "./PanelListItem";

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
      {panelListItems.map((panelListItem) =>
        userInterface.sideMenu && userInterface.sideMenu[panelListItem.id] ? (
          <PanelListItem
            label={panelListItem.name}
            name={panelListItem.name}
            key={panelListItem.name}
            icon={panelListItem.name}
            activePanel={activePanel}
          />
        ) : null
      )}
    </Container>
  );
}

export default PanelsList;
