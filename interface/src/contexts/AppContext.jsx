import * as React from "react";
import { PanelType } from "../constants/app-options";
import { createContext, useState } from "react";
export const AppContext = createContext({
  isMobile: false,
  setIsMobile: () => {},
  templates: [],
  setTemplates: () => {},
  template: null,
  setTemplate: () => {},
  templateIndex: 0,
  setTemplateIndex: () => {},
  activePage: {},
  setActivePage: () => {},
  elements: [],
  setElements: () => {},
  photos: [],
  setPhotos: () => {},
  fonts: [],
  setFonts: () => {},
  activePanel: PanelType.TEMPLATES,
  setActivePanel: () => {},
  activeSubMenu: null,
  setActiveSubMenu: (value) => {},
  userInterface: {},
  setUserInterface: (value) => {},
});
export const AppProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(undefined);
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [templateIndex, setTemplateIndex] = useState(0);
  const [activePage, setActivePage] = useState({});
  const [elements, setElements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [fonts, setFonts] = useState([]);
  const [activePanel, setActivePanel] = useState(PanelType.TEMPLATES);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [userInterface, setUserInterface] = useState({});
  const context = {
    isMobile,
    setIsMobile,
    templates,
    setTemplates,
    template,
    setTemplate,
    templateIndex,
    setTemplateIndex,
    activePage,
    setActivePage,
    activePanel,
    setActivePanel,
    elements,
    setElements,
    photos,
    setPhotos,
    fonts,
    setFonts,
    activeSubMenu,
    setActiveSubMenu,
    userInterface,
    setUserInterface,
  };
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
