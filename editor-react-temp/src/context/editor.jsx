import React from 'react';
import { createContext, useState } from 'react';
export const EditorContext = createContext({
    canvas: null,
    setCanvas: () => { },
    activeObject: null,
    setActiveObject: () => { },
    editor: null,
    setEditor: () => { },
    zoomRatio: 1,
    setZoomRatio: () => { },
    contextMenuRequest: null,
    setContextMenuRequest: () => { }
});
export const EditorProvider = ({ children }) => {
    const [canvas, setCanvas] = useState(null);
    const [activeObject, setActiveObject] = useState(null);
    const [editor, setEditor] = useState(null);
    const [zoomRatio, setZoomRatio] = useState(1);
    const [contextMenuRequest, setContextMenuRequest] = useState(null);
    const context = {
        canvas,
        setCanvas,
        activeObject,
        setActiveObject,
        editor,
        setEditor,
        zoomRatio,
        setZoomRatio,
        contextMenuRequest,
        setContextMenuRequest
    };
    return React.createElement(EditorContext.Provider, { value: context }, children);
};