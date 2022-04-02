import { fabric } from "fabric";
export function loadFabricImageFromURL(src) {
  return new Promise((resolve) => {
    fabric.Image.fromURL(src, function (img) {
      resolve(img);
    });
  });
}
export function loadImageFromURL(src) {
  return new Promise((resolve) => {
    // if (fabric.isLikelyNode) {
    //  resolve(src)
    //}
    // check if node.js
    if (fabric.isLikelyNode && fabric.base64Img) {
      fabric.base64Img.requestBase64(src, function (err, res, body) {
        if (err) resolve(null);
        else {
          const image = fabric.util.createImage();
          image.src = body;
          image.crossOrigin = "Anonymous";
          image.onload = () => {
            resolve(image);
          };
        }
      });
    } else {
      const image = fabric.util.createImage();
      image.src = src;
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        resolve(image);
      };
    }
  });
}
