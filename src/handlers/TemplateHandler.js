import exportObject from '../utils/fabricToObject'
import objectToFabric from '../utils/objectToFabric'
import BaseHandler from './BaseHandler'
class TemplateHandler extends BaseHandler {
    setHoverCursor(cursor) {
        const background = this.getBackground()
        if (background) {
            background.set('hoverCursor', cursor)
        }
    }
    setBackgroundColor(color) {
        const background = this.getBackground()
        if (background) {
            background.set('fill', color)
            this.canvas.requestRenderAll()
            this.handlers.historyHandler.save('background:fill')
        }
    }
    setSize(options) {
        const background = this.getBackground()
        if (background) {
            const {
                width,
                height
            } = options
            background.set('width', width)
            background.set('height', height)
            background.center()
        }
    }
    getBackground() {
        return this.canvas.getObjects().find(object => object.type === 'Background')
    }
    exportToJSON() {
        const canvasJSON = this.canvas.toJSON(this.handlers.propertiesToInclude)
        const frameOptions = this.handlers.pageHandler.getOptions()
        const page = {
            name: 'Page 1',
            objects: [],
            background: frameOptions.fill || '#fff',
            size: {
                width: frameOptions.width,
                height: frameOptions.height
            }
        }
        const objects = canvasJSON.objects.filter(object => object.type !== 'Page')
        objects.forEach(object => {
            const exportedObject = exportObject.run(object, frameOptions)
            page.objects = page.objects.concat(exportedObject)
        })
        return page
    }
    async importFromJSON(page) {
        this.handlers.objectsHandler.clearAll()
        this.handlers.pageHandler.initialize()
        this.handlers.pageHandler.setSize(page.size)
        this.handlers.pageHandler.setBackgroundColor(page.background || '#fff')
        const frameOptions = this.handlers.pageHandler.getOptions()
        for (const object of page.objects) {
            const element = await objectToFabric.run(object, frameOptions)
            if (element) this.canvas.add(element)
        }
        this.handlers.historyHandler.save('template:load')
        this.handlers.historyHandler.clear()
        this.handlers.zoomHandler.zoomToFit()
    }
}
export default TemplateHandler