import { fabric } from 'fabric';
import React, { useContext, useEffect, useRef } from 'react';
import { EditorContext } from './context';
import Editor from './Editor';
import './objects';
function Canvas({ config }) {
    const containerRef = useRef(null);
    const context = useContext(EditorContext);
    const { setEditor } = context;
    useEffect(() => {
        const editorConfig = Object.assign({clipToFrame: true, scrollLimit: 200}, config);
        const container = containerRef.current;
        const { clientHeight, clientWidth } = container;
        const canvas = new fabric.Canvas('canvas', {
            backgroundColor: '#f6f7f9',
            height: clientHeight,
            width: clientWidth,
            preserveObjectStacking: true,
            fireMiddleClick: true,
            fireRightClick: true
        });
        const editor = new Editor({
            canvas: canvas,
            context: context,
            config: editorConfig
        });
        setEditor(editor);
        context.setCanvas(canvas);
        const resizeObserver = new ResizeObserver(entries => {
            const { width = clientWidth, height = clientHeight } = (entries[0] && entries[0].contentRect) || {};
            editor.canvas.resize(width, height);
        });
        resizeObserver.observe(container);
        return () => {
            editor.destroy();
            if (container) {
                resizeObserver.unobserve(container);
            }
        };
    }, []);
    return (React.createElement("div", { id: "editor-container", ref: containerRef, style: { flex: 1, position: 'relative', overflow: 'hidden' } },
        React.createElement("div", { style: {
                position: 'absolute',
                height: '100%',
                width: '100%'
            } },
            React.createElement("canvas", { id: "canvas" }))));
}
export default Canvas;