class ZoomController {
  constructor(handler) {
      this.zoomIn = () => {
          this.handler.zoomIn();
      };
      this.zoomOut = () => {
          this.handler.zoomOut();
      };
      this.zoomToOne = () => {
          this.handler.zoomToOne();
      };
      this.zoomToFit = () => {
          this.handler.zoomToFit();
      };
      this.zoomToRatio = (zoomRatio) => {
          this.handler.zoomToRatio(zoomRatio);
      };
      this.handler = handler;
  }
}
export default ZoomController;