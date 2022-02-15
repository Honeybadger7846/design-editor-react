const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const opentype = require('opentype.js')
const fabric = require('./frontend/src/canvas-modules/Fabric.js')
const app = express()
const port = 3000

const getDirectories = source =>
    fs.readdirSync(source, {
        withFileTypes: true
    })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

//get cliparts
let clipartsList = []
getDirectories('./cliparts/').forEach(directory => {
    clipartsList.push({
        name: directory,
        files: fs.readdirSync(`./cliparts/${directory}`, {
            withFileTypes: true
        }).map(dirent => dirent.name)
    })
})
// get fonts
let fontsList = []
getDirectories('./fonts/').forEach(directory => {
    fontsList.push({
        name: directory,
        files: fs.readdirSync(`./fonts/${directory}`, {
            withFileTypes: true
        }).map(dirent => dirent.name)
    })
})

let clipartsOutput = []
clipartsList.forEach(list => {
    let outputList = {
        category: list.name,
        files: []
    }
    list.files.forEach(file => {
        outputList.files.push({
            name: file.substring(file.indexOf('_') || 0, file.lastIndexOf('.')),
            url: `${list.name}/${file}`
        })
    })
    clipartsOutput.push(outputList)
})

let fontsOutput = []
fontsList.forEach(list => {
    let outputList = {
        family: list.name,
        fonts: []
    }
    list.files.forEach(file => {
        let font = opentype.loadSync(`./fonts/${list.name}/${file}`)
        let path = font.getPath(file.substring(file.indexOf('_') || 0, file.lastIndexOf('.')), 0, 0, 30)
        let bbox = path.getBoundingBox()
        outputList.fonts.push({
            name: file.substring(file.indexOf('_') || 0, file.lastIndexOf('.')),
            url: `${list.name}/${file}`,
            svgPreview: `<svg xmlns="http://www.w3.org/2000/svg" viewbox="${bbox.x1} ${bbox.y1} ${Math.abs(bbox.x2 - bbox.x1)} ${Math.abs(bbox.y2 - bbox.y1)}"> <path fill="currentColor" d="${path.toPathData()}" /></svg>`
        })
        // push for fabric render
        let fObject = fabric.Typr.parse(fs.readFileSync(`./fonts/${list.name}/${file}`))[0]
        fabric.fontArrayList.push({
            FontName: file.substring(file.indexOf('_') || 0, file.lastIndexOf('.')),
            fObject: fObject
        })
    })
    fontsOutput.push(outputList)
})

app.use(cors())
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}))
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}))
app.use(express.static('cliparts'))
app.use(express.static('fonts'))
app.use(express.static('themes'))
app.use(express.static('languages'))
app.use(express.static('frontend/dist')) // host editor

app.get('/api/cliparts', (req, res) => {
    res.send(clipartsOutput)
})
app.get('/api/fonts', (req, res) => {
    res.send(fontsOutput)
})
app.post('/api/svg', function (req, res) {
    let body = req.body
    console.log(body)
    if (body.page) {
        let page = body.page
        let canvas = new fabric.Canvas(null, {
            width: 1000,
            height: 1000
        })
        canvas.loadPage(JSON.stringify(page), () => {
            res.send(canvas.toSVG({
                viewBox: {
                    x: canvas._page.left,
                    y: canvas._page.top,
                    width: canvas._page.width * canvas._page.scaleX,
                    height: canvas._page.height * canvas._page.scaleY
                },
                width: canvas._page.width * canvas._page.scaleX,
                height: canvas._page.height * canvas._page.scaleY
            }))
            canvas.clear()
            canvas.dispose()
        })
    }
})
app.listen(port, () => {
    console.log(`Editor http://localhost:${port}`)
})