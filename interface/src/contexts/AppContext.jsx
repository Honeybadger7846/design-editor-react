import * as React from 'react';
import { PanelType } from '../constants/app-options';
import { createContext, useState } from 'react';
export const AppContext = createContext({
    isMobile: false,
    setIsMobile: () => { },
    templates: [],
    setTemplates: () => { },
    template: null,
    setTemplate: () => { },
    templateIndex: 0,
    setTemplateIndex: () => { },
    pageId: null,
    setPageId: () => { },
    elements: [],
    setElements: () => { },
    photos: [],
    setPhotos: () => { },
    fonts: [],
    setFonts: () => { },
    activePanel: PanelType.TEMPLATES,
    setActivePanel: () => { },
    activeSubMenu: null,
    setActiveSubMenu: (value) => { }
});
export const AppProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(undefined);
    const [templates, setTemplates] = useState([]);
    const [template, setTemplate] = useState(null);
    const [templateIndex, setTemplateIndex] = useState(0);
    const [pageId, setPageId] = useState(null);
    const [elements, setElements] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [fonts, setFonts] = useState([]);
    const [activePanel, setActivePanel] = useState(PanelType.TEMPLATES);
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const context = {
        isMobile,
        setIsMobile,
        templates,
        setTemplates,
        template,
        setTemplate,
        templateIndex,
        setTemplateIndex,
        pageId,
        setPageId,
        activePanel,
        setActivePanel,
        elements,
        setElements,
        photos,
        setPhotos,
        fonts,
        setFonts,
        activeSubMenu,
        setActiveSubMenu
    };
    return <AppContext.Provider value={context}>{children}</AppContext.Provider>
};