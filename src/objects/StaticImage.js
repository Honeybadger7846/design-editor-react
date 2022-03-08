import { fabric } from 'fabric';
class StaticImageObject extends fabric.Image {
    //@ts-ignore
    initialize(element, options) {
        super.initialize(element, options)
    }
    static fromObject(options, callback) {
        fabric.util.loadImage(options.src, function (img) {
            // @ts-ignore
            return callback && callback(new fabric.StaticImage(img, options));
        }, null, 
        // @ts-ignore
        { crossOrigin: 'anonymous' });
    }
}
StaticImageObject.type = 'StaticImage';
fabric.StaticImage = fabric.util.createClass(StaticImageObject, {
    type: StaticImageObject.type
});
fabric.StaticImage.fromObject = StaticImageObject.fromObject;
export default StaticImageObject;