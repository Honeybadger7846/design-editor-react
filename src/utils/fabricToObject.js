import { ObjectType } from '../common/constants';
class ExportObject {
    run(item, options, inGroup = false) {
        let object;
        switch (item.type) {
            case ObjectType.STATIC_IMAGE:
                object = this[ObjectType.STATIC_IMAGE](item, options, inGroup);
                break;
            case ObjectType.STATIC_TEXT:
                object = this[ObjectType.STATIC_TEXT](item, options, inGroup);
                break;
            case ObjectType.STATIC_VECTOR:
                object = this[ObjectType.STATIC_VECTOR](item, options, inGroup);
                break;
            case ObjectType.STATIC_PATH:
                object = this[ObjectType.STATIC_PATH](item, options, inGroup);
                break;
            case ObjectType.GROUP:
                object = this[ObjectType.GROUP](item, options, inGroup);
                break;
        }
        return object;
    }
    [ObjectType.STATIC_TEXT](item, options, inGroup) {
        return item;
    }
    [ObjectType.STATIC_IMAGE](item, options, inGroup) {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        const object = Object.assign(Object.assign({}, baseOptions), { metadata: {
                src: item.src,
                cropX: item.cropX,
                cropY: item.cropY
            } });
        return object;
    }
    [ObjectType.STATIC_VECTOR](item, options, inGroup) {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        const object = Object.assign(Object.assign({}, baseOptions), { metadata: {
                src: item.src
            } });
        return object;
    }
    [ObjectType.STATIC_PATH](item, options, inGroup) {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        const object = Object.assign(Object.assign({}, baseOptions), { metadata: {
                value: item.path,
                fill: item.fill
            } });
        return object;
    }
    [ObjectType.GROUP](item, options, inGroup) {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        const groupObjects = item.objects.map(object => {
            return this.run(object, options, true);
        });
        return Object.assign(Object.assign({}, baseOptions), { objects: groupObjects });
    }
    getBaseOptions(item, options, inGroup = false) {
        const { id, name, top, left, width, height, scaleX, scaleY, originX, originY, type, stroke, strokeWidth, opacity, angle, flipX, flipY, skewX, skewY, visible, animation } = item;
        const baseOptions = {
            id,
            name,
            angle,
            stroke,
            strokeWidth,
            left: inGroup ? left : left - options.left,
            top: inGroup ? top : top - options.top,
            width,
            height,
            opacity,
            originX,
            originY,
            scaleX,
            scaleY,
            type,
            flipX,
            flipY,
            skewX,
            skewY,
            visible
        };
        return baseOptions;
    }
}
export default new ExportObject();