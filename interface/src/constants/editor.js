export const SecondLevelMenus = ["FontFamily"];
export const FirstLevelMenus = ["Background"];

export const SubMenuType = {
  FONT_FAMILY: "FontFamily",
  BACKGROUND: "Background",
  COLOR: "Color",
};
export const Template = {
  name: "Default",
  unit: "Pixel",
  pages: [
    {
      name: "Page 1",
      id: 0,
      objects: [],
      background: "#ffffff",
      position: {
        left: 0,
        top: 0,
      },
      size: {
        width: 1280,
        height: 720,
      },
      preview:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="-140.5 63.5 1280 720" xml:space="preserve">\n<desc>Created with Fabric.js 5.2.1</desc>\n<defs>\n</defs>\n<rect x="0" y="0" width="100%" height="100%" fill="#f6f7f9"></rect>\n<g transform="matrix(1 0 0 1 499.5 423.5)"  >\n<rect style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;"  x="-640" y="-360" rx="0" ry="0" width="1280" height="720" />\n</g></svg>',
    },
  ],
  preview: "",
};

export const Interface = {
  sideMenu: {
    templates: true,
    elements: true,
    photos: true,
    text: true,
  },
  page: {
    list: true,
    edit: true,
    remove: true,
    add: true,
  },
  navbar: null,
};
