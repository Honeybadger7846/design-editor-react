import Handlers from "./handlers";
import EventManager from "./EventManager";
import PanZoomController from "./controllers/ZoomController";
import CanvasController from "./controllers/CanvasController";
import PageController from "./controllers/PageController";
class Editor extends EventManager {
  constructor(props) {
    super();
    this.zoomOut = () => {
      this.handlers.zoomHandler.zoomOut();
    };
    this.context = props.context;
    this.handlers = new Handlers(
      Object.assign(Object.assign({}, props), { editor: this })
    );
    this.zoom = new PanZoomController(this.handlers.zoomHandler);
    this.canvas = new CanvasController(this.handlers.canvasHandler);
    this.page = new PageController(this.handlers.pageHandler);
  }
  add(options) {
    this.handlers.objectsHandler.add(options);
  }
  update(options) {
    this.handlers.objectsHandler.update(options);
  }
  copy() {
    this.handlers.objectsHandler.copy();
  }
  copyStyle() {
    this.handlers.objectsHandler.copyStyle();
  }
  cut() {
    this.handlers.objectsHandler.cut();
  }
  paste() {
    this.handlers.objectsHandler.paste();
  }
  clone() {
    this.handlers.objectsHandler.clone();
  }
  delete() {
    this.handlers.objectsHandler.remove();
  }
  clear() {
    this.handlers.objectsHandler.clear();
  }
  deselect() {
    this.handlers.objectsHandler.deselect();
  }
  findByName(name) {
    return this.handlers.objectsHandler.findByName(name);
  }
  removeByName(name) {
    this.handlers.objectsHandler.removeByName(name);
  }
  findById(id) {
    return this.handlers.objectsHandler.findById(id);
  }
  removeById(id) {
    this.handlers.objectsHandler.removeById(id);
  }
  undo() {
    this.handlers.historyHandler.undo();
  }
  redo() {
    this.handlers.historyHandler.redo();
  }
  zoomIn() {
    this.handlers.zoomHandler.zoomIn();
  }
  zoomToOne() {
    this.handlers.zoomHandler.zoomToOne();
  }
  zoomToFit() {
    this.handlers.zoomHandler.zoomToFit();
  }
  zoomToRatio(zoomRatio) {
    this.handlers.zoomHandler.zoomToRatio(zoomRatio);
  }
  alignTop() {
    this.handlers.objectsHandler.alignTop();
  }
  alignMiddle() {
    this.handlers.objectsHandler.alignMiddle();
  }
  alignBottom() {
    this.handlers.objectsHandler.alignBottom();
  }
  alignLeft() {
    this.handlers.objectsHandler.alignLeft();
  }
  alignCenter() {
    this.handlers.objectsHandler.alignCenter();
  }
  alignRight() {
    this.handlers.objectsHandler.alignRight();
  }
  bringForward() {
    this.handlers.objectsHandler.bringForward();
  }
  bringToFront() {
    this.handlers.objectsHandler.bringToFront();
  }
  sendBackwards() {
    this.handlers.objectsHandler.sendBackwards();
  }
  sendToBack() {
    this.handlers.objectsHandler.sendToBack();
  }
  group() {
    this.handlers.objectsHandler.group();
  }
  ungroup() {
    this.handlers.objectsHandler.ungroup();
  }
  lock() {
    this.handlers.objectsHandler.lock();
  }
  unlock() {
    this.handlers.objectsHandler.unlock();
  }
  setGradient(options) {
    this.handlers.objectsHandler.setGradient(options);
  }
  setShadow(options) {
    this.handlers.objectsHandler.setShadow(options);
  }
  clear() {
    this.handlers.objectsHandler.clearAll(true);
  }
  exportToJSON() {
    return this.handlers.templateHandler.exportToJSON();
  }
  importFromJSON(data) {
    this.handlers.templateHandler.importFromJSON(data);
  }
  cancelContextMenu() {
    this.context.setContextMenuRequest(null);
  }
  getPageSVG() {
    return this.handlers.pageHandler.getSVG();
  }
  setFonts(fonts) {
    this.handlers.fontsHandler.setFonts(fonts);
  }
  destroy() {}
}
export default Editor;
