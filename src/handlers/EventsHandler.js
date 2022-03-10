import {
    fabric
} from 'fabric';
import BaseHandler from './BaseHandler';
import shourcutsManager from '../utils/shourcutsManager';
class EventsHandler extends BaseHandler {
    constructor(props) {
        super(props);
        this.onMouseDown = (e) => {
            if (e.button === 3) {
                this.context.setContextMenuRequest({
                    left: e.e.offsetX,
                    top: e.e.offsetY,
                    target: e.target
                });
            } else {
                this.context.setContextMenuRequest(null);
            }
            this._lastPosX = e.e.clientX
            this._lastPosY = e.e.clientY
            this._middleClick = e.e.which === 2
        };
        this.onMouseMove = (event) => {
            const isMiddleClick = event.e.which === 2
            if (isMiddleClick) {
                this.handlers.zoomHandler.relativePan(new fabric.Point(event.e.clientX - this._lastPosX, event.e.clientY - this._lastPosY))
            }
            this._lastPosX = event.e.clientX
            this._lastPosY = event.e.clientY
        };
        this.objectModified = event => {
            const {
                target
            } = event;
            if (target.type === 'StaticText') {
                this.scaleTextbox(target);
            }
            this.handlers.historyHandler.save('object:modified');
        };
        this.onMouseOut = () => {
            this.canvas.renderAll();
        };
        this.onMouseWheel = event => {
            const isCtrlKey = event.e.ctrlKey
            const delta = Math.sign(event.e.deltaY)
            const step = 12
            const zoom = this.canvas.getZoom() - delta / step
            if (isCtrlKey) {
                this.handlers.zoomHandler.zoomToPoint(new fabric.Point(event.e.offsetX, event.e.offsetY), zoom)
            } else if (!this._middleClick) {
                this.handlers.zoomHandler.relativePan(new fabric.Point(-event.e.deltaX / 2, -event.e.deltaY / 2))
            }
            event.e.preventDefault()
            event.e.stopPropagation()
        };
        this.handleSelection = target => {
            if (target) {
                this.context.setActiveObject(null);
                const initialSelection = this.canvas.getActiveObject();
                const isNotMultipleSelection = (initialSelection && initialSelection.type === 'group') ||
                    (initialSelection && initialSelection.type === 'StaticVector');
                if (initialSelection && !isNotMultipleSelection && initialSelection._objects) {
                    const filteredObjects = initialSelection._objects.filter(object => {
                        if (object.type === 'Background') {
                            return false;
                        }
                        return !object.locked;
                    });
                    this.canvas.discardActiveObject();
                    if (filteredObjects.length > 0) {
                        if (filteredObjects.length === 1) {
                            this.canvas.setActiveObject(filteredObjects[0]);
                            this.context.setActiveObject(filteredObjects[0]);
                        } else {
                            const activeSelection = new fabric.ActiveSelection(filteredObjects, {
                                canvas: this.canvas
                            });
                            this.canvas.setActiveObject(activeSelection);
                            this.context.setActiveObject(activeSelection);
                        }
                    }
                } else {
                    this.context.setActiveObject(initialSelection);
                }
            } else {
                this.context.setActiveObject(null);
            }
            this.canvas.renderAll();
            delete this._lastPosX
            delete this._lastPosY
            delete this._middleClick
        };
        this.scaleTextbox = (target) => {
            target._styleMap.forEach(style => {
				style.fontSize = Math.floor(style.fontSize * target.scaleX)
			})
			target.scaleX = 1
			target.scaleY = 1
			target.computeLayout()
			target.setCoords()
        };
        this.initialize();
    }
    initialize() {
        this.canvas.wrapperEl.tabIndex = 1;
        this.canvas.wrapperEl.style.outline = 'none';
        this.canvas.on({
            'mouse:down': this.onMouseDown,
            'mouse:move': this.onMouseMove,
            'mouse:up': this.handleSelection,
            'selection:cleared': this.handleSelection,
            'selection:updated': this.handleSelection,
            'mouse:wheel': this.onMouseWheel,
            'mouse:out': this.onMouseOut,
            'object:modified': this.objectModified
        });
        this.canvas.wrapperEl.addEventListener('keydown', this.onKeyDown.bind(this), false);
    }
    destroy() {
        this.canvas.off({
            'mouse:down': this.onMouseDown,
            'mouse:move': this.onMouseMove,
            'mouse:up': this.handleSelection,
            'selection:cleared': this.handleSelection,
            'selection:updated': this.handleSelection,
            'mouse:wheel': this.onMouseWheel,
            'mouse:out': this.onMouseOut,
            'object:modified': this.objectModified
        });
        this.canvas.wrapperEl.removeEventListener('keydown', this.onKeyDown.bind(this));
    }
    onKeyDown(event) {
        if (shourcutsManager.isCtrlZero(event)) {
            event.preventDefault();
            this.handlers.zoomHandler.zoomToFit();
        } else if (shourcutsManager.isCtrlMinus(event)) {
            event.preventDefault();
            this.handlers.zoomHandler.zoomIn();
        } else if (shourcutsManager.isCtrlEqual(event)) {
            event.preventDefault();
            this.handlers.zoomHandler.zoomOut();
        } else if (shourcutsManager.isCtrlOne(event)) {
            event.preventDefault();
            this.handlers.zoomHandler.zoomToOne();
        } else if (shourcutsManager.isCtrlZ(event)) {
            this.handlers.historyHandler.undo();
        } else if (shourcutsManager.isCtrlShiftZ(event)) {
            this.handlers.historyHandler.redo();
        } else if (shourcutsManager.isCtrlY(event)) {
            this.handlers.historyHandler.redo();
        } else if (shourcutsManager.isAltLeft(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.updateCharSpacing(-10);
        } else if (shourcutsManager.isAltRight(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.updateCharSpacing(+10);
        } else if (shourcutsManager.isAltUp(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.updateLineHeight(+0.1);
        } else if (shourcutsManager.isAltDown(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.updateLineHeight(-0.1);
        } else if (shourcutsManager.isCtrlA(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.selectAll();
        } else if (shourcutsManager.isDelete(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.remove();
        } else if (shourcutsManager.isCtrlC(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.copy();
        } else if (shourcutsManager.isCtrlV(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.paste();
        } else if (shourcutsManager.isCtrlX(event)) {
            event.preventDefault();
            this.handlers.objectsHandler.cut();
        } else if (shourcutsManager.isArrowUp(event)) {
            let nudgeValue = -1;
            if (shourcutsManager.isShift(event)) {
                nudgeValue = -10;
            }
            this.handlers.objectsHandler.moveVertical(nudgeValue);
        } else if (shourcutsManager.isArrowDown(event)) {
            let nudgeValue = 1;
            if (shourcutsManager.isShift(event)) {
                nudgeValue = 10;
            }
            this.handlers.objectsHandler.moveVertical(nudgeValue);
        } else if (shourcutsManager.isArrowLeft(event)) {
            let nudgeValue = -1;
            if (shourcutsManager.isShift(event)) {
                nudgeValue = -10;
            }
            this.handlers.objectsHandler.moveHorizontal(nudgeValue);
        } else if (shourcutsManager.isArrowRight(event)) {
            let nudgeValue = 1;
            if (shourcutsManager.isShift(event)) {
                nudgeValue = 10;
            }
            this.handlers.objectsHandler.moveHorizontal(nudgeValue);
        }
    }
}
export default EventsHandler;