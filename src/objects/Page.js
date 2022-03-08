import {
    fabric
} from 'fabric'
export class Page extends fabric.Rect {
    initialize(options) {
        super.initialize(Object.assign(Object.assign({}, options), {
            selectable: false,
            hasControls: false,
            lockMovementY: true,
            lockMovementX: true,
            strokeWidth: 0,
            padding: 0,
            evented: false
        }))
        return this
    }
    toObject(propertiesToInclude = []) {
        return super.toObject(propertiesToInclude)
    }
    toJSON(propertiesToInclude = []) {
        return super.toObject(propertiesToInclude)
    }
    static fromObject(options, callback) {
        return callback && callback(new fabric.Page(options))
    }
}
Page.type = 'Page'
fabric.Page = fabric.util.createClass(Page, {
    type: Page.type
})
fabric.Page.fromObject = Page.fromObject