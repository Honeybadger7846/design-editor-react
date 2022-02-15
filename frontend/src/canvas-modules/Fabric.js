const fabric = require('./text/FabricText.js')

// pan zoom
fabric.Canvas.prototype.on('mouse:wheel', function (opt) {
    if (opt.e.ctrlKey === true) {
        const delta = Math.sign(opt.e.deltaY)
        let zoom = this.getZoom()
        const step = 12
        zoom = zoom - delta / step
        if (zoom > 4) zoom = 4
        if (zoom < 0.2) zoom = 0.2
        this.zoomToPoint({
            x: opt.e.offsetX,
            y: opt.e.offsetY
        }, zoom)
        this.fire('zoom:changed')
    } else {
        this.viewportTransform[5] -= opt.e.deltaY / 2
        this.viewportTransform[4] -= opt.e.deltaX / 2
    }
    this.calcOffset()
    this.calcViewportBoundaries()
    this.getObjects().forEach(object => {
        object.setCoords()
    })
    this.requestRenderAll()
    opt.e.preventDefault()
    opt.e.stopPropagation()
})

fabric.Canvas.prototype.on('mouse:down', function (opt) {
    const evt = opt.e
    if (evt.which === 2) {
        this.isDragging = true
        this.selection = false
        this.requestRenderAll()
    } else {
        this.isDragging = false
        this.selection = true
    }
    this.calcViewportBoundaries()
    this.lastPosX = evt.clientX
    this.lastPosY = evt.clientY
    this.lastViewportTransform = {
        x: this.viewportTransform[4],
        y: this.viewportTransform[5]
    }
})

fabric.Canvas.prototype.on('mouse:move', function (opt) {
    const e = opt.e
    if (this.isDragging) {
        this.viewportTransform[4] += e.clientX - this.lastPosX
        this.lastPosX = e.clientX
        this.viewportTransform[5] += e.clientY - this.lastPosY
        this.lastPosY = e.clientY
        this.calcViewportBoundaries()
        this.requestRenderAll()
        this.fire('zoom:changed')
        opt.e.preventDefault()
        opt.e.stopPropagation()
    } else {
        if (this.isDragging) {
            this.isDragging = false
            this.selection = true
        }
    }
})

fabric.Canvas.prototype.on('mouse:up', function () {
    this.isDragging = false
    this.selection = true
    this.getObjects().forEach(object => {
        object.setCoords()
    })
})


fabric.Canvas.prototype._historyNext = function () {
    return JSON.stringify(this.toJSON(['evented', 'role', 'selectable']))
}
fabric.Canvas.prototype._historyEvents = function () {
    return {
        'object:added': this._historySaveAction,
        'object:removed': this._historySaveAction,
        'object:modified': this._historySaveAction,
        'object:skewing': this._historySaveAction
    }
}

fabric.Canvas.prototype._historySaveAction = function () {
    if (this.historyProcessing)
        return
    const json = this.historyNextState
    this.historyUndo.push(json)
    this.historyNextState = this._historyNext()
    this.fire('history:append', {
        json: json
    })
}
fabric.Canvas.prototype.undo = function (callback) {
    this.historyProcessing = true
    const history = this.historyUndo.length > 1 ? this.historyUndo.pop() : null
    if (history) {
        this.historyRedo.push(this._historyNext())
        this.historyNextState = history
        this._loadHistory(history, 'history:undo', callback)
    } else {
        this.historyProcessing = false
    }
}

fabric.Canvas.prototype.redo = function (callback) {
        this.historyProcessing = true
        const history = this.historyRedo.pop()
        if (history) {
            this.historyUndo.push(this._historyNext())
            this.historyNextState = history
            this._loadHistory(history, 'history:redo', callback)
        } else {
            this.historyProcessing = false
        }
    },
    fabric.Canvas.prototype._loadHistory = function (history, event, callback) {
        this.loadFromJSON(history, () => {
            this.renderAll()
            this.fire(event)
            this.historyProcessing = false

            if (callback && typeof callback === 'function')
                callback()
        })
    }
fabric.Canvas.prototype.historyUndo = []
fabric.Canvas.prototype.historyRedo = []
fabric.Canvas.prototype.historyNextState = fabric.Canvas.prototype._historyNext()
fabric.Canvas.prototype.on(fabric.Canvas.prototype._historyEvents())

fabric.Canvas.prototype.minZoom = 0.25
fabric.Canvas.prototype.zoomIn = function () {
    this.zoomToPoint({
        x: this.getCenter().left,
        y: this.getCenter().top
    }, this.getZoom() * 1.1)
    this.getObjects().forEach(object => {
        object.setCoords()
    })
    this.fire('zoom:changed')
    this.requestRenderAll()
    return this
}
fabric.Canvas.prototype.zoomOut = function () {
    this.zoomToPoint({
        x: this.getCenter().left,
        y: this.getCenter().top
    }, this.getZoom() * 0.9)
    this.getObjects().forEach(object => {
        object.setCoords()
    })
    this.fire('zoom:changed')
    this.requestRenderAll()
    return this
}
fabric.Canvas.prototype.zoomTo = function (value) {
    this.zoomToPoint({
        x: this.getCenter().left,
        y: this.getCenter().top
    }, value)
    this.getObjects().forEach(object => {
        object.setCoords()
    })
    this.fire('zoom:changed')
    this.requestRenderAll()
    return this
}

fabric.Canvas.prototype.addText = function (options) {
    let interactiveText = new fabric.InteractiveText({
        textMarkup: options.text
    })
    interactiveText.transformTextMarkup()
    interactiveText.setStyles({
        fill: '#000000',
        fontSize: Number(options.fontSize),
        fontFamily: this._defaultFont
    })
    interactiveText.computeLayout()
    interactiveText.set({
        left: this._page ? this._page.getCenterPoint().x - interactiveText.width * interactiveText.scaleX / 2 : 0,
        top: this._page ? this._page.getCenterPoint().y - interactiveText.height * interactiveText.scaleY / 2 : 0
    })
    this.add(interactiveText)
    this.setActiveObject(interactiveText)
    interactiveText.enterEditing()
    interactiveText.setCursorPosition(interactiveText.getTextLength())
    this.requestRenderAll()
}
fabric.Canvas.prototype.addClipart = function (url) {
    fabric.Image.fromURL(url, (img) => {
        let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 5
        img.scaleToWidth(size)
        img.set({
            left: this._page ? this._page.getCenterPoint().x - size / 2 : 0,
            top: this._page ? this._page.getCenterPoint().y - size / 2 : 0
        })
        this.add(img)
        img.setCoords()
        this.setActiveObject(img)
    })
}
fabric.Canvas.prototype.addImage = function (base64) {
    fabric.Image.fromURL(base64, (img) => {
        let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 5
        img.scaleToWidth(size)
        img.set({
            left: this._page ? this._page.getCenterPoint().x - size / 2 : 0,
            top: this._page ? this._page.getCenterPoint().y - size / 2 : 0
        })
        this.add(img)
        img.setCoords()
        this.setActiveObject(img)
    })
}
fabric.Canvas.prototype.addSvg = function (base64) {
    fabric.loadSVGFromURL(base64, (objects, options) => {
        var svgData = fabric.util.groupSVGElements(objects, options)
        let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 5
        svgData.scaleToWidth(size)
        svgData.set({
            left: this._page ? this._page.getCenterPoint().x - size / 2 : 0,
            top: this._page ? this._page.getCenterPoint().y - size / 2 : 0
        })
        this.add(svgData)
        svgData.setCoords()
        this.setActiveObject(svgData)
    })
}
fabric.Canvas.prototype.addCircle = function () {
    let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 10
    let circle = new fabric.Circle({
        radius: size,
        fill: '#3cbc83',
        strokeWidth: 0,
        strokeUniform: true,
        left: this._page ? this._page.getCenterPoint().x - size : 0,
        top: this._page ? this._page.getCenterPoint().y - size : 0
    })
    this.add(circle)
    this.setActiveObject(circle)
}
fabric.Canvas.prototype.addTriangle = function () {
    let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 5
    let triangle = new fabric.Triangle({
        width: size,
        height: size,
        fill: '#3cbc83',
        strokeWidth: 0,
        strokeUniform: true,
        left: this._page ? this._page.getCenterPoint().x - size / 2 : 0,
        top: this._page ? this._page.getCenterPoint().y - size / 2 : 0
    })
    this.add(triangle)
    this.setActiveObject(triangle)
}
fabric.Canvas.prototype.addRect = function () {
    let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 5
    let rect = new fabric.Rect({
        width: size,
        height: size,
        fill: '#3cbc83',
        strokeWidth: 0,
        strokeUniform: true,
        left: this._page ? this._page.getCenterPoint().x - size / 2 : 0,
        top: this._page ? this._page.getCenterPoint().y - size / 2 : 0
    })
    this.add(rect)
    this.setActiveObject(rect)
}
fabric.Canvas.prototype.addEllipse = function () {
    let size = Math.min(this._page.width * this._page.scaleX, this._page.height * this._page.scaleY) / 10
    let ellipse = new fabric.Ellipse({
        rx: size,
        ry: size * 0.6,
        fill: '#3cbc83',
        strokeWidth: 0,
        strokeUniform: true,
        left: this._page ? this._page.getCenterPoint().x - size : 0,
        top: this._page ? this._page.getCenterPoint().y - size : 0
    })
    this.add(ellipse)
    this.setActiveObject(ellipse)
}
// experimental && temp

fabric.Canvas.prototype.selectionBorderColor = '#0BAB64'
fabric.Canvas.prototype.selectionColor = 'rgba(11, 171, 100, 0.1)'
fabric.Object.prototype.borderColor = '#0BAB64'
fabric.Object.prototype.borderOpacityWhenMoving = 1
fabric.Object.prototype.cornerColor = '#0BAB64'
fabric.Object.prototype.cornerStyle = 'circle'
fabric.Object.prototype.transparentCorners = false
fabric.Control.prototype.cursorStyle = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAB3RJTUUH3QYBCzMMpADxbgAAAAlwSFlzAAALEgAACxIB0t1+/AAAAARnQU1BAACxjwv8YQUAAAJvSURBVHjaXVRLaxNRFP7mkZjGUqRWJUZbX9AEikK1QtEsdCFIULLygdCN9BcIgkhBXKoIKr5wo7hyo1FcSBaiohFfO7WIQlAXolKL0po2k5nxu+femUw9l/s833mfGQsdsjgC7t1Yjz50YRqf8D3xHu2GbF6BEVzFJGYRcnj4gnvYj0WGayeUy2U5rsMXqI8W5tHmKeB8jM2C6UJZhA18hA6EBLVEJBot2gkxgzFCb+MZxA2beoZQQ47sFF/ep+vuz9Bu93ujWEN+Gy5+4zM24j72aJFuvKSeec5Gz8HdWaBg9fJ925LFhxmHctEXB+8odxzOYwb+Ir9asmFTpwvbpdDaHD7Ert7SESxFQ/xt9Azw5vZbIqKzlsIEmnTZwxwRN7TAPgkuxFEB6IrIutPFJZOpUIK/SX1klCRwH3XuvkJWrOowrMqbqo0LQxe/rZhb2coFy/x1eK4t1ETDNDbE5TslL6djWwsojdfC/oFVJgVFSYBys6hiohKHq6OV2ZI0RYHZwfD+yj7Lk3oPJA5fdqGqPMyweJDsAOP4hSmuMP1jxSehE6YKY9BJIBXyhXyiyzZhS1Jku7gV4onpy4hlm5hS5DRxKE5BxcIjU4kzAnMSAxUHV0wVzmkRpaMsxVdWTiLTKRznIB6IfeXy2ci2Ws6LDSXyFsexC8MYxQFcY+hRH9V3sCkzSkkfl3KG3a4Me+Y7aJqT6iIF/8jPNhE2RUpZXBZIm9lvG6g6qew/tAYWJhbmi92LV3Gzheb0FUe2ZjtwKyHCf0Ilc7cUqgh6Cf2Dd3harE1OCTj4X0CHr/SqRKd586oa5KQCL4wg/wA4WvtpoKznTAAAAABJRU5ErkJggg==) 12 12, auto`
fabric.ActiveSelection.prototype.borderColor = '#0BAB64'
fabric.ActiveSelection.prototype.borderOpacityWhenMoving = 1
fabric.ActiveSelection.prototype.cornerColor = '#0BAB64'
fabric.ActiveSelection.prototype.cornerStyle = 'circle'
fabric.ActiveSelection.prototype.transparentCorners = false


// page functionality
fabric.Canvas.prototype.addPage = function (options, callback) {
    this._createObjectPage(options, (page) => {
        callback && callback({
            ...options,
            json: {
                objects: [page]
            }
        })
    })
}
fabric.Canvas.prototype._createObjectPage = function (options, callback) {
    if (options.svg) {
        fabric.loadSVGFromURL(options.svg, (objects, opt) => {
            objects.forEach(object => {
                object.set({
                    fill: options.fill || '#ffffff',
                })
            })
            let page = fabric.util.groupSVGElements(objects, opt)
            page.scaleX = Number(options.width) / (page.width * page.scaleX)
            page.scaleY = Number(options.height) / (page.height * page.scaleY)
            page.role = 'page'
            page.evented = false
            page.selectable = false
            callback && callback(page.toJSON(['evented', 'role', 'selectable']))
        })
    } else {
        let page = new fabric.Rect({
            left: 0,
            top: 0,
            role: 'page',
            width: Number(options.width),
            height: Number(options.height),
            fill: options.fill || '#ffffff',
            evented: false,
            selectable: false,
        })
        callback && callback(page.toJSON(['evented', 'role', 'selectable']))
    }
}
fabric.Canvas.prototype.loadPage = function (json, callback) {
    this.loadFromJSON(json, () => {
        this.viewportTransform[4] = 0
        this.viewportTransform[5] = 0
        this.historyUndo = []
        this.historyRedo = []
        this.centerPage()
        this.getObjects().forEach(object => {
            if (object.role === 'page') {
                this._page = object
            }
        })
        if (this.getMissingFonts().length > 0) {
            this.fire('missing:fonts', this.getMissingFonts())
        }
        this.renderAll()
        callback && callback()
    })
}

// load font
let base64Font = require('./text/default-font.js')

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
        if (object.type === 'InteractiveText') {
            object.computeLayout()
        }
    })
}
fabric.Canvas.prototype.getMissingFonts = function () {
    let missingFonts = []
    this.getObjects().forEach(object => {
        if (object.type === 'InteractiveText') {
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
fabric.Canvas.prototype.centerPage = function () {
    this.getObjects().forEach(object => {
        if (object.role === 'page') {
            this.setZoom(1)
            this.viewportTransform[4] = object.left + this.width / 2 - object.width * object.scaleX / 2
            this.viewportTransform[5] = object.top + this.height / 2 - object.height * object.scaleY / 2
            this.zoomToPoint({
                x: this.getCenter().left,
                y: this.getCenter().top
            }, Math.min(this.width / (object.width * object.scaleX), this.height / (object.height * object.scaleY)) * 0.8)
            this.fire('zoom:changed')
            this.requestRenderAll()
        }
    })
}

fabric.Canvas.prototype.getTab = function (object) {
    if (object.type === 'InteractiveText') {
        return 'text'
    }
    if (object.type === 'image') {
        return 'images'
    }
    if (object.type !== 'activeSelection' && object.type !== 'group') {
        return 'shapes'
    }
    return 'shapes'
}

fabric.Canvas.prototype.initResponsive = function (container) {
    this.setWidth(Math.floor(container.offsetWidth))
    this.setHeight(Math.floor(container.offsetHeight))
    this.renderAll()
    const step = () => {
        setTimeout(() => {
            if (container) {
                const containerWidth = Math.floor(container.offsetWidth)
                const containerHeight = Math.floor(container.offsetHeight)
                if (Math.abs(containerWidth - this.width) > 2) {
                    this.setWidth(1)
                    setTimeout(() => {
                        this.setWidth(containerWidth).renderAll()
                        this.centerPage()
                    }, 1)
                }
                if (Math.abs(containerHeight - this.height) > 2) {
                    this.setHeight(1)
                    setTimeout(() => {
                        this.setHeight(containerHeight).renderAll()
                        this.centerPage()
                    }, 1)
                }
            }
            window.requestAnimationFrame(step)
        }, 100)
    }
    window.requestAnimationFrame(step)
}

fabric.Canvas.prototype.grid = false
fabric.Canvas.prototype.gridSize = 15
fabric.Canvas.prototype._drawGridLines = function (ctx) {
    if (!this.grid) return
    let pageSize = this._page ? this._page.width : this.width
    let gridSize = this.gridSize * pageSize / 100
    let i = this.getZoom(),
        r = gridSize * i,
        n = r - this.viewportTransform[4] % r,
        o = r - this.viewportTransform[5] % r,
        s = this.width,
        a = this.height
    ctx.fillStyle = "#eee"
    for (let x = -n; x <= s + n; x += r) {
        for (let y = -o; y <= a + o; y += r) {
            ctx.fillRect(x, 0, 0.5, a)
            ctx.fillRect(0, y, s, 0.5)
        }
    }
}

fabric.Canvas.prototype.renderCanvas = function (ctx, objects) {
    var v = this.viewportTransform,
        path = this.clipPath;
    this.cancelRequestedRender();
    this.calcViewportBoundaries();
    this.clearContext(ctx);
    fabric.util.setImageSmoothing(ctx, this.imageSmoothingEnabled);
    this.fire('before:render', {
        ctx: ctx,
    });
    this._renderBackground(ctx);
    this._drawGridLines(ctx);
    ctx.save();
    //apply viewport transform once for all rendering process
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
    this._renderObjects(ctx, objects);
    ctx.restore();
    if (!this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
    }
    if (path) {
        path.canvas = this;
        // needed to setup a couple of variables
        path.shouldCache();
        path._transformDone = true;
        path.renderCache({
            forClipping: true
        });
        this.drawClipPathOnCanvas(ctx);
    }
    this._renderOverlay(ctx);
    if (this.controlsAboveOverlay && this.interactive) {
        this.drawControls(ctx);
    }
    this.fire('after:render', {
        ctx: ctx,
    });
}

fabric.Canvas.prototype.positionActiveObject = function (position) {
    let activeObject = this.getActiveObject()
    if (!activeObject) return
    switch (position) {
        case "front":
            this.bringToFront(activeObject)
            break
        case "back":
            this.sendToBack(activeObject)
            break
        case "up":
            this.bringForward(activeObject)
            break
        case "down":
            this.sendBackwards(activeObject)
            break
    }
    if (this._objects.indexOf(this._page) !== 0) {
        this._objects.splice(this._objects.indexOf(this._page), 1)
        this._objects.unshift(this._page)
        this._page = this._objects[0]
    }
}
fabric.Canvas.prototype.alignActiveObject = function (e) {
    let i = this.getActiveObject()
    if (!i)
        return console.info("No active selection")
    if (i.type === 'activeSelection') {
        let selection = this.getActiveObject().getBoundingRect(true, true)
        let objects = this.getActiveObject()._objects
        objects.forEach(object => {
            if (e === 'left') {
                object.set({
                    left: -selection.width / 2
                })
            }
            if (e === 'center') {
                object.set({
                    left: -object.getBoundingRect(true, true).width / 2
                })
            }
            if (e === 'right') {
                object.set({
                    left: selection.width / 2 - object.getBoundingRect(true, true).width
                })
            }
        })
    } else {
        let r = this._page
        let o = i.getBoundingRect(),
            s = o.height / this.viewportTransform[3],
            a = o.width / this.viewportTransform[0]
        switch (e) {
            case "top":
                i.setPositionByOrigin(new fabric.Point(i.getCenterPoint().x, s / 2 + r.getCenterPoint().y - r.height / 2), "center", "center")
                break
            case "middle":
                i.setPositionByOrigin({
                    x: i.getCenterPoint().x,
                    y: r.getCenterPoint().y
                }, "center", "center")
                break
            case "bottom":
                i.setPositionByOrigin(new fabric.Point(i.getCenterPoint().x, r.getCenterPoint().y + r.height / 2 - s / 2), "center", "center")
                break
            case "left":
                i.setPositionByOrigin(new fabric.Point(r.getCenterPoint().x - r.width / 2 + a / 2, i.getCenterPoint().y), "center", "center")
                break
            case "center":
                i.setPositionByOrigin({
                    x: r.getCenterPoint().x,
                    y: i.getCenterPoint().y
                }, "center", "center")
                break
            case "right":
                i.setPositionByOrigin(new fabric.Point(r.getCenterPoint().x + r.width / 2 - a / 2, i.getCenterPoint().y), "center", "center")
        }
    }
}
fabric.Canvas.prototype.initKeyEvents = function () {
    fabric.util.addListener(document.body, 'keyup', event => {
        if (event.key === 'Delete') {
            if (!this.getActiveObject()) {
                return
            }
            if (this.getActiveObject().isEditing) {
                return
            }
            this.remove(...this.getActiveObjects())
            this.discardActiveObject()
            this.requestRenderAll()
        }
    })
}
module.exports = fabric