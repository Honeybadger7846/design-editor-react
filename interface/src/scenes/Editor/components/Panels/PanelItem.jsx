import * as React from "react";
import useAppContext from "../../../../hooks/useAppContext";
import { useEditorContext } from "../../../../../../src";
import { styled } from "baseui";
import { useEffect } from "react";
import PanelItems from "./PanelItems";

function PanelsList() {
  const { activePanel, activeSubMenu, setActiveSubMenu, isMobile } =
    useAppContext();
  const { activeObject } = useEditorContext();

  const Container = styled("div", (props) => ({
    background: "#ffffff",
    width: isMobile ? "auto" : "320px",
    height: isMobile ? "320px" : "auto",
    flex: "none",
    display: activePanel || activeSubMenu ? "block" : "none",
    boxShadow: "1px 0px 1px rgba(0, 0, 0, 0.15)",
  }));

  useEffect(() => {
    if (!activeObject) {
      setActiveSubMenu(null);
    }
  }, [activeObject]);
  // const Component = activeObject && activeSubMenu ? PanelItems[activeSubMenu] : PanelItems[activePanel]
  const Component = activeSubMenu
    ? PanelItems[activeSubMenu]
    : PanelItems[activePanel];

  return <Container>{Component && <Component />}</Container>;
}

export default PanelsList;
