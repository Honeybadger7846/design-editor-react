import { fabric } from 'fabric';
class StaticVectorObject extends fabric.Group {
    //@ts-ignore
    initialize(objects, options, others) {
        this.set('src', others.src);
        const object = fabric.util.groupSVGElements(objects, options);
        //@ts-ignore
        super.initialize([object], others);
        return this;
    }
    toObject(propertiesToInclude = []) {
        // @ts-ignore
        return super.toObject(propertiesToInclude, {
            src: this.src
        });
    }
    toJSON(propertiesToInclude = []) {
        // @ts-ignore
        return super.toObject(propertiesToInclude, {
            src: this.src
        });
    }
    static fromObject(options, callback) {
        fabric.loadSVGFromURL(options.src, (objects, opts) => {
            return callback && callback(new fabric.StaticVector(objects, opts, Object.assign({}, options)));
        });
    }
}
StaticVectorObject.type = 'StaticVector';
fabric.StaticVector = fabric.util.createClass(StaticVectorObject, {
    type: StaticVectorObject.type
});
fabric.StaticVector.fromObject = StaticVectorObject.fromObject;
export default StaticVectorObject;
