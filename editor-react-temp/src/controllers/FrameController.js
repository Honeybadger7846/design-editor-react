class FrameController {
  constructor(handler) {
      this.handler = handler;
  }
  update(options) {
      this.handler.update(options);
  }
  setSize(options) {
      this.handler.setSize(options);
  }
}
export default FrameController;