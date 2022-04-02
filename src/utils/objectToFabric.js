import { loadImageFromURL } from "./image-loader.js";
import { fabric } from "fabric";
import { ObjectType } from "../common/constants.js";
class ObjectToFabric {
  async run(item, options, inGroup = false) {
    let object;
    switch (item.type) {
      case ObjectType.STATIC_TEXT:
        object = await this[ObjectType.STATIC_TEXT](item, options, inGroup);
        break;
      case ObjectType.STATIC_IMAGE:
        object = await this[ObjectType.STATIC_IMAGE](item, options, inGroup);
        break;
      case ObjectType.STATIC_VECTOR:
        object = await this[ObjectType.STATIC_VECTOR](item, options, inGroup);
        break;
      case ObjectType.GROUP:
        object = await this[ObjectType.GROUP](item, options, inGroup);
        break;
    }
    return object;
  }
  [ObjectType.STATIC_TEXT](item, options, inGroup) {
    return new Promise((resolve, reject) => {
      try {
        const element = new fabric.StaticText(item);
        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }
  [ObjectType.STATIC_IMAGE](item, options, inGroup) {
    return new Promise(async (resolve, reject) => {
      try {
        const src = item.metadata.src;
        const image = await loadImageFromURL(src);
        const element = new fabric.StaticImage(image, item);
        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }
  [ObjectType.GROUP](item, options, inGroup) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        let objects = [];
        for (const object of item.objects) {
          objects = objects.concat(await this.run(object, options, true));
        }
        const element = new fabric.Group(objects, baseOptions);
        resolve(element);
      } catch (err) {
        reject(err);
      }
    });
  }
  [ObjectType.STATIC_VECTOR](item, options, inGroup) {
    return new Promise(async (resolve, reject) => {
      try {
        const baseOptions = this.getBaseOptions(item, options, inGroup);
        const src = item.metadata.src;
        fabric.loadSVGFromURL(src, (objects, opts) => {
          objects.forEach((object) => {
            if (item.fill) {
              object.fill = item.fill;
            }
          });
          const object = new fabric.StaticVector(
            objects,
            opts,
            Object.assign(Object.assign({}, item), { src })
          );
          resolve(object);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  getBaseOptions(item, options, inGroup) {
    const {
      id,
      name,
      left,
      top,
      width,
      height,
      scaleX,
      scaleY,
      stroke,
      strokeWidth,
      angle,
      opacity,
      flipX,
      flipY,
      skewX,
      skewY,
      originX,
      originY,
      animation,
    } = item;
    let metadata = item.metadata ? item.metadata : {};
    const { fill } = metadata;
    let baseOptions = {
      id,
      name,
      angle: angle ? angle : 0,
      top: inGroup ? top : options.top + top,
      left: inGroup ? left : options.left + left,
      width: width,
      height: height,
      originX: originX || "left",
      originY: originY || "top",
      scaleX: scaleX || 1,
      scaleY: scaleY || 1,
      fill: fill || "#000000",
      stroke: stroke ? stroke : "#ffffff",
      strokeWidth: strokeWidth ? strokeWidth : 0,
      opacity: opacity ? opacity : 1,
      flipX: flipX ? flipX : false,
      flipY: flipY ? flipY : false,
      skewX: skewX ? skewX : 0,
      skewY: skewY ? skewY : 0,
      metadata: metadata,
      animation,
    };
    return baseOptions;
  }
}
export default new ObjectToFabric();
