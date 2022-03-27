import {
    fabric
} from 'fabric'
import './objects/index.js'
import objectToFabric from './utils/objectToFabric.js'

export default class {
    constructor() {
        this.canvas = new fabric.Canvas(null, {
            width: 1000,
            height: 1000
        })
    }
    getPage() {
        return this.canvas.getObjects().find(object => object.type === 'Page')
    }
    // based on ./handlers/TemplateHandler.js => importFromJSON method ( need to make sure they match )
    async loadTemplate(template) {
        const page = new fabric.Page({
            width: template.size.width || 1280,
            height: template.size.height || 720,
            name: 'Page 1',
            fill: template.background || '#fff',
            hoverCursor: 'default'
        })
        this.canvas.add(page)
        page.center()
        const pageOptions = page.toJSON([
            'id',
            'name',
            'description',
            'src',
            'keys',
            'keyValues',
            'metadata'
        ])
        for (const object of template.objects) {
            const element = await objectToFabric.run(object, pageOptions)
            if (element) this.canvas.add(element)
        }
    }
    getSVG() {
        const page = this.getPage()
        return this.canvas.toSVG({
            viewBox: {
                x: page.left,
                y: page.top,
                width: page.width,
                height: page.height
            },
            width: page.width,
            height: page.height
        })
    }
    getPDF(PDFDocument, Base64Encode, callback) {
        const page = this.getPage()
        const doc = new PDFDocument({
            size: [page.width, page.height]
        })
        const stream = doc.pipe(new Base64Encode())
        let base64PDF = ''
        console.log(this.getSVG())
        doc.addSVG(this.getSVG(), 0, 0, {
            width: page.width,
            height: page.height,
            preserveAspectRatio: `${page.width}x${page.height}`,
            imageCallback: function(opt) {
                console.log(opt)
            }
          })
        doc.end()
        stream.on('data', (chunk) => {
            base64PDF += chunk
        })
        stream.on('end', () => {
            callback && callback(base64PDF)
        })
    }
    destroy() {

    }
}