class PageController {
    constructor(handler) {
        this.handler = handler
    }
    setBackgroundColor(color) {
        this.handler.setBackgroundColor(color)
    }
    update(options) {
        this.handler.update(options)
    }
    setSize(options) {
        this.handler.setSize(options)
    }
}
export default PageController