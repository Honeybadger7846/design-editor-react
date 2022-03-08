import { fabric } from 'fabric'
export function loadFabricImageFromURL(src) {
    return new Promise(resolve => {
        fabric.Image.fromURL(src, function (img) {
            resolve(img)
        })
    })
}
export function loadImageFromURL(src) {
    return new Promise(resolve => {
       // if (fabric.isLikelyNode) {
          //  resolve(src)
        //}
        console.log(src)
        const image = fabric.util.createImage()
        image.src = src
        image.crossOrigin = 'Anonymous'
        image.onload = () => {
            resolve(image)
        }
    })
}