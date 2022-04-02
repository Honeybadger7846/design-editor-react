import { fabric } from "fabric";
import BaseHandler from "./BaseHandler";
class PanZoomHandler extends BaseHandler {
  constructor(props) {
    super(props);
  }
  zoomIn() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio += 0.05;
    const center = this.canvas.getCenter();
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    this.context.setZoomRatio(zoomRatio);
  }
  zoomOut() {
    let zoomRatio = this.canvas.getZoom();
    zoomRatio -= 0.05;
    const center = this.canvas.getCenter();
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    this.context.setZoomRatio(zoomRatio);
  }
  zoomToOne() {
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.zoomToPoint(new fabric.Point(center.left, center.top), 1);
    this.context.setZoomRatio(1);
  }
  zoomToFit() {
    const zoomFitRatio = this.handlers.pageHandler.getFitRatio();
    const center = this.canvas.getCenter();
    this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomFitRatio);
    this.context.setZoomRatio(zoomFitRatio);
  }
  zoomToRatio(zoomRatio) {
    const center = this.canvas.getCenter();
    this.zoomToPoint(new fabric.Point(center.left, center.top), zoomRatio);
    this.context.setZoomRatio(zoomRatio);
  }
  zoomToPoint(point, zoom) {
    const minZoom = 20;
    const maxZoom = 400;
    let zoomRatio = zoom;
    if (zoom <= minZoom / 100) {
      zoomRatio = minZoom / 100;
    } else if (zoom >= maxZoom / 100) {
      zoomRatio = maxZoom / 100;
    }
    this.canvas.zoomToPoint(point, zoomRatio);
    this.context.setZoomRatio(zoomRatio);
  }
  relativePan(point) {
    this.canvas.relativePan(point);
  }
}
export default PanZoomHandler;
