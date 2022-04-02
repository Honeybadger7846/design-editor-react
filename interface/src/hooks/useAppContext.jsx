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
    adminRole,
    setAdminRole,
    visiblePages,
    setVisiblePages,
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
    adminRole,
    setAdminRole,
    visiblePages,
    setVisiblePages,
  };
}

export default useAppContext;
