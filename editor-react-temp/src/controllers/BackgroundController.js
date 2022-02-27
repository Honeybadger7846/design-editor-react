class BackgroundController {
  constructor(handler) {
      this.setBackgroundColor = (color) => {
          this.handler.setBackgroundColor(color);
      };
      this.setGradient = (angle, colors) => {
          this.handler.setGradient({ angle, colors });
      };
      this.handler = handler;
  }
}
export default BackgroundController;