import { fabric } from 'fabric';
// @ts-ignore
export class FrameObject extends fabric.Rect {
    initialize(options) {
        super.initialize(Object.assign(Object.assign({}, options), { selectable: false, hasControls: false, lockMovementY: true, lockMovementX: true, strokeWidth: 0, padding: 0, evented: false }));
        return this;
    }
    toObject(propertiesToInclude = []) {
        return super.toObject(propertiesToInclude);
    }
    toJSON(propertiesToInclude = []) {
        return super.toObject(propertiesToInclude);
    }
    static fromObject(options, callback) {
        return callback && callback(new fabric.Frame(options));
    }
}
FrameObject.type = 'Frame';
fabric.Frame = fabric.util.createClass(FrameObject, {
    type: FrameObject.type
});
fabric.Frame.fromObject = FrameObject.fromObject;