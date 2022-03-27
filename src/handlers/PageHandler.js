import { fabric } from 'fabric'
import BaseHandler from './BaseHandler'
class PageHandler extends BaseHandler {
    constructor(props) {
        super(props)
        this.getPage = () => {
            return this.canvas.getObjects().find(object => object.type === 'Page')
        }
        this.getSVG = () => {
            const page = this.getPage()
            return this.canvas.toSVG({
                viewBox: {
                    x: page.left,
                    y: page.top,
                    width: page.width,
                    height: page.height
                },
                width: '100%',
                height: '100%'
            })
        }
        this.setSize = options => {
            const page = this.getPage()
            if (page) {
                const { width, height } = options
                page.set('width', width)
                page.set('height', height)
                page.center()
                this.handlers.templateHandler.setSize(options)
            }
            this.handlers.zoomHandler.zoomToFit()
        }
        this.update = options => {
            const page = this.getPage()
            const { width, height } = options
            page.set('width', width)
            page.set('height', height)
            page.center()
            this.handlers.zoomHandler.zoomToFit()
        }
        this.setName = (name) => {
            const page = this.getPage()
            page.set('name', name)
        }
        this.setId = (id) => {
            const page = this.getPage()
            page.set('id', id)
        }
        this.setBackgroundColor = (color) => {
            const page = this.getPage()
            page.set('fill', color)
            this.canvas.renderAll()
        }
        this.getOptions = () => {
            const page = this.getPage()
            return page.toJSON(this.handlers.propertiesToInclude)
        }
        this.getFitRatio = () => {
            const canvasWidth = this.canvas.getWidth() - 120
            const canvasHeight = this.canvas.getHeight() - 120
            const options = this.getOptions()
            let scaleX = canvasWidth / options.width
            let scaleY = canvasHeight / options.height
            if (options.height >= options.width) {
                scaleX = scaleY
                if (canvasWidth < options.width * scaleX) {
                    scaleX = scaleX * (canvasWidth / (options.width * scaleX))
                }
            }
            else {
                if (canvasHeight < options.height * scaleX) {
                    scaleX = scaleX * (canvasHeight / (options.height * scaleX))
                }
            }
            return scaleX
        }
        //this.initialize()
    }
    initialize() {
        const page = new fabric.Page({
            width: 1280,
            height: 720,
            name: 'Page 1',
            fill: '#ffffff',
            hoverCursor: 'default'
        })
        this.canvas.add(page)
        page.center()
    }
}
export default PageHandler