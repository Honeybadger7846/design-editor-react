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
    let isBase64 = src && src.match(/data:image/gi);
    if (fabric.isLikelyNode && fabric._encode && fabric._decode && !isBase64) {
      (async () => {
        const _image = await fabric._encode(src, { string: true, ext: "jpg" });
        const image = fabric.util.createImage();
        image.src = `data:image/jpeg;base64,${_image}`;
        image.onload = () => {
          resolve(image);
        };
      })();
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
