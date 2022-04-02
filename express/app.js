import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import { fabric } from "fabric";
import opentype from "opentype.js";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { Base64Encode } from "base64-stream";
import EditorNode from "../src/EditorNode.js";
import Templates from "./templates.js";
import base64Img from "base64-img";
fabric.base64Img = base64Img;
PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};

const app = express();
const port = 3000;

const getDirectories = (source) =>
  fs
    .readdirSync(source, {
      withFileTypes: true,
    })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

//get elements
let elementsList = [];
getDirectories("./elements/").forEach((directory) => {
  elementsList.push({
    name: directory,
    files: fs
      .readdirSync(`./elements/${directory}`, {
        withFileTypes: true,
      })
      .map((dirent) => dirent.name),
  });
});
//get photos
let photosList = [];
getDirectories("./photos/").forEach((directory) => {
  photosList.push({
    name: directory,
    files: fs
      .readdirSync(`./photos/${directory}`, {
        withFileTypes: true,
      })
      .map((dirent) => dirent.name),
  });
});
// get fonts
let fontsList = [];
getDirectories("./fonts/").forEach((directory) => {
  fontsList.push({
    name: directory,
    files: fs
      .readdirSync(`./fonts/${directory}`, {
        withFileTypes: true,
      })
      .map((dirent) => dirent.name),
  });
});

let elementsOutput = [];
elementsList.forEach((list) => {
  let outputList = {
    category: list.name,
    files: [],
  };
  list.files.forEach((file) => {
    outputList.files.push({
      name: file.substring(file.indexOf("_") || 0, file.lastIndexOf(".")),
      url: `http://localhost:${port}/${list.name}/${file}`,
    });
  });
  elementsOutput.push(outputList);
});

let photosOutput = [];
photosList.forEach((list) => {
  let outputList = {
    category: list.name,
    files: [],
  };
  list.files.forEach((file) => {
    outputList.files.push({
      name: file.substring(file.indexOf("_") || 0, file.lastIndexOf(".")),
      url: `http://localhost:${port}/${list.name}/${file}`,
    });
  });
  photosOutput.push(outputList);
});

let fontsOutput = [];
fontsList.forEach((list) => {
  let outputList = {
    family: list.name,
    fonts: [],
  };
  list.files.forEach((file) => {
    let font = opentype.loadSync(`./fonts/${list.name}/${file}`);
    let path = font.getPath(
      file.substring(file.indexOf("_") || 0, file.lastIndexOf(".")),
      0,
      0,
      30
    );
    let bbox = path.getBoundingBox();
    outputList.fonts.push({
      name: file.substring(file.indexOf("_") || 0, file.lastIndexOf(".")),
      url: `http://localhost:${port}/${list.name}/${file}`,
      svgPreview: `<svg xmlns="http://www.w3.org/2000/svg" viewbox="${
        bbox.x1
      } ${bbox.y1} ${Math.abs(bbox.x2 - bbox.x1)} ${Math.abs(
        bbox.y2 - bbox.y1
      )}"> <path fill="currentColor" d="${path.toPathData()}" /></svg>`,
    });
    // push for fabric render
    let fObject = fabric.Typr.parse(
      fs.readFileSync(`./fonts/${list.name}/${file}`)
    )[0];
    fabric.fontArrayList.push({
      FontName: file.substring(file.indexOf("_") || 0, file.lastIndexOf(".")),
      fObject: fObject,
    });
  });
  fontsOutput.push(outputList);
});

app.use(cors());
app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use(express.static("elements"));
app.use(express.static("photos"));
app.use(express.static("fonts"));
app.get("/api/templates", (req, res) => {
  res.send(Templates);
});
app.get("/api/elements", (req, res) => {
  res.send(elementsOutput);
});
app.get("/api/photos", (req, res) => {
  res.send(photosOutput);
});
app.get("/api/fonts", (req, res) => {
  res.send(fontsOutput);
});
app.post("/api/svg", function (req, res) {
  let body = req.body;
  const editor = new EditorNode();
  editor.loadTemplate(body).then((result) => {
    editor.getPDF(PDFDocument, Base64Encode, result, (base64) => {
      res.send(base64);
    });
  });
});
app.listen(port, () => {
  console.log(`Editor http://localhost:${port}`);
});
