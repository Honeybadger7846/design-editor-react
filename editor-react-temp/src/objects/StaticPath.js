
import { fabric } from 'fabric';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
  };
export class StaticPathObject extends fabric.Path {
  initialize(options) {
      const { path } = options, pathOptions = __rest(options
      //@ts-ignore
      , ["path"]);
      //@ts-ignore
      super.initialize(path, pathOptions);
      return this;
  }
  toObject(propertiesToInclude = []) {
      return super.toObject(propertiesToInclude);
  }
  toJSON(propertiesToInclude = []) {
      return super.toObject(propertiesToInclude);
  }
  static fromObject(options, callback) {
      return callback && callback(new fabric.StaticPath(options));
  }
}
StaticPathObject.type = 'StaticPath';
fabric.StaticPath = fabric.util.createClass(StaticPathObject, {
  type: StaticPathObject.type
});
fabric.StaticPath.fromObject = StaticPathObject.fromObject;