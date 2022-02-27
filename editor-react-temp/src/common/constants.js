export const PROPERTIES_TO_INCLUDE = [
  'id',
  'name',
  'description',
  'src',
  'keys',
  'keyValues',
  'animation',
  'metadata'
];
export var ObjectType;
(function (ObjectType) {
  ObjectType["STATIC_VECTOR"] = "StaticVector";
  ObjectType["STATIC_GROUP"] = "StaticGroup";
  ObjectType["DYNAMIC_GROUP"] = "DynamicGroup";
  ObjectType["STATIC_PATH"] = "StaticPath";
  ObjectType["DYNAMIC_PATH"] = "DynamicPath";
  ObjectType["STATIC_IMAGE"] = "StaticImage";
  ObjectType["DYNAMIC_IMAGE"] = "DynamicImage";
  ObjectType["STATIC_TEXT"] = "StaticText";
  ObjectType["DYNAMIC_TEXT"] = "DynamicText";
  ObjectType["ACTIVE_SELECTION"] = "activeSelection";
  ObjectType["BACKGROUND"] = "Background";
  ObjectType["GROUP"] = "group";
  ObjectType["FRAME"] = "Frame";
})(ObjectType || (ObjectType = {}));

export var ObjectTypeAlt;
(function (ObjectTypeAlt) {
  ObjectTypeAlt["STATIC_IMAGE"] = "image:static";
  ObjectTypeAlt["DYNAMIC_IMAGE"] = "image:dynamic";
  ObjectTypeAlt["TEXTAREA"] = "Textarea";
})(ObjectTypeAlt || (ObjectTypeAlt = {}));
export const defaultEditorConfig = {
  clipToFrame: true,
  scrollLimit: 200
};
export const commonParams = {
  backgroundColor: '',
  fillRule: 'nonzero',
  globalCompositeOperation: 'source-over',
  strokeDashArray: null,
  strokeDashOffset: 0,
  strokeLineCap: 'butt',
  strokeLineJoin: 'miter',
  strokeMiterLimit: 4,
  strokeUniform: false
};
const getCopyStyleVector = () => {
  const copyStyleVector = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 3.5H5a.5.5 0 0 0-.5.5v1.5A.5.5 0 0 0 5 6h11a.5.5 0 0 0 .5-.5V4a.5.5 0 0 0-.5-.5zM5 2a2 2 0 0 0-2 2v1.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-.25h.5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-.75.75h-5.75a2.25 2.25 0 0 0-2.25 2.25v1.563A2 2 0 0 0 9 15v5a2 2 0 0 0 2 2h.5a2 2 0 0 0 2-2v-5a2 2 0 0 0-1.5-1.937V11.5a.75.75 0 0 1 .75-.75h5.75a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25h-.515A2 2 0 0 0 16 2H5zm7 13a.5.5 0 0 0-.5-.5H11a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5v-5z" fill="currentColor"></path></svg>
  `;
  return `data:image/svg+xml;base64,${window.btoa(copyStyleVector)}`;
};
export const getCopyStyleCursor = () => {
  return `url(${getCopyStyleVector()}), crosshair`;
};
export const copyStyleProps = {
  StaticText: [
      'fill',
      'opacity',
      'stroke',
      'strokeWidth',
      'textAlign',
      'fontWeight',
      'fontFamily',
      'fontSize',
      'underline',
      'shadow',
      'angle'
  ],
  DynamicText: [
      'fill',
      'opacity',
      'stroke',
      'strokeWidth',
      'textAlign',
      'fontWeight',
      'fontFamily',
      'fontSize',
      'underline',
      'shadow',
      'angle'
  ],
  StaticImage: ['opacity', 'stroke', 'strokeWidth', 'shadow', 'angle'],
  DynamicImage: ['opacity', 'stroke', 'strokeWidth', 'shadow', 'angle'],
  StaticPath: ['fill', 'opacity', 'stroke', 'strokeWidth', 'shadow', 'angle']
};