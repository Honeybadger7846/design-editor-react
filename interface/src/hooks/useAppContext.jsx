import { AppContext } from "../contexts/AppContext";
import { useContext } from "react";

function useAppContext() {
  const {
    isMobile,
    setIsMobile,
    activePanel,
    setActivePanel,
    templates,
    setTemplates,
    template,
    setTemplate,
    templateIndex,
    setTemplateIndex,
    activePage,
    setActivePage,
    elements,
    setElements,
    fonts,
    setFonts,
    photos,
    setPhotos,
    activeSubMenu,
    setActiveSubMenu,
    userInterface,
    setUserInterface,
  } = useContext(AppContext);
  return {
    isMobile,
    setIsMobile,
    activePanel,
    setActivePanel,
    templates,
    setTemplates,
    template,
    setTemplate,
    templateIndex,
    setTemplateIndex,
    activePage,
    setActivePage,
    elements,
    setElements,
    fonts,
    setFonts,
    photos,
    setPhotos,
    activeSubMenu,
    setActiveSubMenu,
    userInterface,
    setUserInterface,
  };
}

export default useAppContext;
