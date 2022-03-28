import { fabric } from "fabric";
import "./objects/index.js";
import objectToFabric from "./utils/objectToFabric.js";

export default class {
  constructor() {
    this.canvas = new fabric.Canvas(null, {
      width: 1000,
      height: 1000,
    });
  }
  getPage() {
    return this.canvas.getObjects().find((object) => object.type === "Page");
  }
  // based on ./handlers/TemplateHandler.js => importFromJSON method ( need to make sure they match )
  async loadTemplate(template) {
    const svgPages = [];
    for (let i = 0; i < template.pages.length; i++) {
      let svgPage = await this.loadPage(template.pages[i]);
      svgPages.push(svgPage);
    }
    return svgPages;
  }
  async loadPage(template) {
    this.canvas._objects = [];
    const page = new fabric.Page({
      width: template.size.width,
      height: template.size.height,
      name: template.name,
      id: template.id,
      fill: template.background,
    });
    this.canvas.add(page);
    const pageOptions = page.toJSON([
      "id",
      "name",
      "description",
      "src",
      "keys",
      "keyValues",
      "metadata",
    ]);
    for (const object of template.objects) {
      const element = await objectToFabric.run(object, pageOptions);
      if (element) this.canvas.add(element);
    }
    return {
      left: page.left,
      top: page.top,
      width: page.width,
      height: page.height,
      svg: this.canvas.toSVG({
        viewBox: {
          x: page.left,
          y: page.top,
          width: page.width,
          height: page.height,
        },
        width: page.width,
        height: page.height,
      }),
    };
  }
  getSVG() {
    const page = this.getPage();
    return this.canvas.toSVG({
      viewBox: {
        x: page.left,
        y: page.top,
        width: page.width,
        height: page.height,
      },
      width: page.width,
      height: page.height,
    });
  }
  getPDF(PDFDocument, Base64Encode, svg, callback) {
    const doc = new PDFDocument({
      size: [svg[0].width, svg[0].height],
    });
    const stream = doc.pipe(new Base64Encode());
    let base64PDF = "";
    svg.forEach((svgPage, index) => {
      if (index > 0) {
        doc.addPage({
          size: [svgPage.width, svgPage.height],
        });
      }
      doc.addSVG(svgPage.svg, 0, 0, {
        width: svgPage.width,
        height: svgPage.height,
        preserveAspectRatio: `${svgPage.width}x${svgPage.height}`,
        imageCallback: function (opt) {},
      });
    });
    doc.end();
    stream.on("data", (chunk) => {
      base64PDF += chunk;
    });
    stream.on("end", () => {
      callback && callback(base64PDF);
    });
  }
  destroy() {}
}
