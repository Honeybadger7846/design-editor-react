import { loadImageFromURL } from './image-loader.js'
import { fabric } from 'fabric'
import { ObjectType } from '../common/constants.js'
class ObjectToFabric {
    async run(item, options, inGroup = false) {
        let object
        switch (item.type) {
            case ObjectType.STATIC_TEXT:
                object = await this[ObjectType.STATIC_TEXT](item, options, inGroup)
                break
            case ObjectType.STATIC_IMAGE:
                object = await this[ObjectType.STATIC_IMAGE](item, options, inGroup)
                break
            case ObjectType.STATIC_VECTOR:
                object = await this[ObjectType.STATIC_VECTOR](item, options, inGroup)
                break
            case ObjectType.STATIC_PATH:
                object = await this[ObjectType.STATIC_PATH](item, options, inGroup)
                break
            case ObjectType.BACKGROUND:
                object = await this[ObjectType.BACKGROUND](item, options, inGroup)
                break
            case ObjectType.GROUP:
                object = await this[ObjectType.GROUP](item, options, inGroup)
                break
        }
        return object
    }
    [ObjectType.STATIC_TEXT](item, options, inGroup) {
        return new Promise((resolve, reject) => {
            try {
                const element = new fabric.StaticText(item)
                resolve(element)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    [ObjectType.STATIC_IMAGE](item, options, inGroup) {
        return new Promise(async (resolve, reject) => {
            try {
                const baseOptions = this.getBaseOptions(item, options, inGroup)
                const src = item.metadata.src
                const image = await loadImageFromURL(src)
                const { width, height } = baseOptions
                if (!width || !height) {
                    baseOptions.width = image.width
                    baseOptions.height = image.height
                }
                const element = new fabric.StaticImage(image, Object.assign(Object.assign({}, baseOptions), { cropX: item.metadata.cropX || 0, cropY: item.metadata.cropY || 0 }))
                const { top, left } = element
                if (isNaN(top) || isNaN(left)) {
                    element.set({
                        top: options.top,
                        left: options.left
                    })
                    element.scaleToWidth(480)
                }
                resolve(element)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    [ObjectType.STATIC_PATH](item, options, inGroup) {
        return new Promise(async (resolve, reject) => {
            try {
                const baseOptions = this.getBaseOptions(item, options, inGroup)
                const path = item.metadata.value
                const fill = item.metadata.fill
                const element = new fabric.StaticPath(Object.assign(Object.assign({}, baseOptions), { path, fill: fill ? fill : '#000000' }))
                const { top, left } = element
                if (isNaN(top) || isNaN(left)) {
                    element.set({
                        top: options.top,
                        left: options.left
                    })
                    element.scaleToWidth(320)
                }
                resolve(element)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    [ObjectType.GROUP](item, options, inGroup) {
        return new Promise(async (resolve, reject) => {
            try {
                const baseOptions = this.getBaseOptions(item, options, inGroup)
                let objects = []
                for (const object of item.objects) {
                    objects = objects.concat(await this.run(object, options, true))
                }
                const element = new fabric.Group(objects, baseOptions)
                resolve(element)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    [ObjectType.BACKGROUND](item, options, inGroup) {
        return new Promise(async (resolve, reject) => {
            try {
                const baseOptions = this.getBaseOptions(item, options, inGroup)
                const fill = item.metadata.fill
                const element = new fabric.Background(Object.assign(Object.assign({}, baseOptions), { fill: fill ? fill : '#000000', id: 'background', name: '' }))
                const { top, left } = element
                if (isNaN(top) || isNaN(left)) {
                    element.set({
                        top: options.top,
                        left: options.left
                    })
                    element.scaleToWidth(320)
                }
                resolve(element)
            }
            catch (err) {
                reject(err)
            }
        })
    }
    [ObjectType.STATIC_VECTOR](item, options, inGroup) {
        return new Promise(async (resolve, reject) => {
            try {
                const baseOptions = this.getBaseOptions(item, options, inGroup)
                const src = item.metadata.src
                fabric.loadSVGFromURL(src, (objects, opts) => {
                    const { width, height, top, left } = baseOptions
                    if (!width || !height) {
                        baseOptions.width = opts.width
                        baseOptions.height = opts.height
                        baseOptions.top = options.top
                        baseOptions.left = options.left
                    }
                    const object = new fabric.StaticVector(objects, opts, Object.assign(Object.assign({}, baseOptions), { src }))
                    if (isNaN(top) || isNaN(left)) {
                        object.set({
                            top: options.top,
                            left: options.left
                        })
                        object.scaleToWidth(320)
                    }
                    resolve(object)
                })
            }
            catch (err) {
                reject(err)
            }
        })
    }
    getBaseOptions(item, options, inGroup) {
        const { id, name, left, top, width, height, scaleX, scaleY, stroke, strokeWidth, angle, opacity, flipX, flipY, skewX, skewY, originX, originY, animation } = item
        let metadata = item.metadata ? item.metadata : {}
        const { fill } = metadata
        let baseOptions = {
            id,
            name,
            angle: angle ? angle : 0,
            top: inGroup ? top : options.top + top,
            left: inGroup ? left : options.left + left,
            width: width,
            height: height,
            originX: originX || 'left',
            originY: originY || 'top',
            scaleX: scaleX || 1,
            scaleY: scaleY || 1,
            fill: fill || '#000000',
            stroke: stroke ? stroke : '#ffffff',
            strokeWidth: strokeWidth ? strokeWidth : 0,
            opacity: opacity ? opacity : 1,
            flipX: flipX ? flipX : false,
            flipY: flipY ? flipY : false,
            skewX: skewX ? skewX : 0,
            skewY: skewY ? skewY : 0,
            metadata: metadata,
            animation
        }
        return baseOptions
    }
}
export default new ObjectToFabric()