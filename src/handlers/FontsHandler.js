import {
    fabric
} from 'fabric'
import base64Font from '../objects/text/default-font.js'
import BaseHandler from './BaseHandler'
class FontsHandler extends BaseHandler {
    constructor(props) {
        super(props)
        this.fonts = []
        this.init()
        this.canvas.loadDefaultFont()
        this.canvas.on('missing:fonts', (fonts) => {
            fonts.forEach(mFont => {
                let fontMatch = this.fonts.filter(font => font.name === mFont)[0]
                if (fontMatch) {
                    fetch(fontMatch.url).then((response) => {
                        return response.arrayBuffer()
                    }).then((buffer) => {
                        this.canvas.loadFont(buffer, mFont)
                    })
                }
            })
        })
    }
    init() {
        // load font
        let _base64ToArrayBuffer = (base64) => {
            if (!(window || {}).atob) return
            let binary_string = window.atob(base64)
            let len = binary_string.length
            let bytes = new Uint8Array(len)
            for (let i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i)
            }
            return bytes.buffer
        }

        fabric.Canvas.prototype.loadDefaultFont = function () {
            let buffer = _base64ToArrayBuffer(base64Font)
            if (!buffer) return
            let name = 'OpenSans-Regular'
            this._defaultFont = name
            this.loadFont(buffer, name)
        }

        fabric.Canvas.prototype.loadFont = function (buffer, name) {
            let fObject = fabric.Typr.parse(buffer)[0]
            if (fabric.fontArrayList.some(font => font.fontName === name)) return
            fabric.fontArrayList.push({
                FontName: name,
                fObject: fObject
            })
            this.getObjects().forEach(object => {
                if (object.type === 'StaticText') {
                    object.computeLayout()
                }
            })
        }
        fabric.Canvas.prototype.getMissingFonts = function () {
            let missingFonts = []
            this.getObjects().forEach(object => {
                if (object.type === 'StaticText') {
                    if (object._styleMap) {
                        object._styleMap.forEach(style => {
                            if (!fabric.fontArrayList.some(font => font.FontName === style.fontFamily)) {
                                if (!missingFonts.some(missingFont => missingFont === style.fontFamily)) {
                                    missingFonts.push(style.fontFamily)
                                }
                            }
                        })
                    }
                }
            })
            return missingFonts
        }
        fabric.Canvas.prototype.fontIsLoaded = function (name) {
            console.log(name)
        }
    }
    setFonts(fonts) {
        this.fonts = fonts
    }
}
export default FontsHandler