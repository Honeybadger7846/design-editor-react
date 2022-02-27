import BaseHandler from './BaseHandler';
import {
    fabric
} from 'fabric';

function angleToPoint(angle, sx, sy) {
    while (angle < 0)
        angle += 360;
    angle %= 360;
    let a = sy,
        b = a + sx,
        c = b + sy,
        p = (sx + sy) * 2,
        rp = p * 0.00277,
        pp = Math.round((angle * rp + (sy >> 1)) % p);
    if (pp <= a)
        return {
            x: 0,
            y: sy - pp
        };
    if (pp <= b)
        return {
            y: 0,
            x: pp - a
        };
    if (pp <= c)
        return {
            x: sx,
            y: pp - b
        };
    return {
        y: sy,
        x: sx - (pp - c)
    };
}

class BackgroundHandler extends BaseHandler {
    constructor(props) {
        super(props);
        this.getBackground = () => {
            return this.canvas.getObjects().find(object => object.type === 'Background');
        };
        this.setSize = options => {
            const background = this.getBackground();
            if (background) {
                const {
                    width,
                    height
                } = options;
                background.set('width', width);
                background.set('height', height);
                background.center();
            }
        };
        this.setBackgroundColor = (color) => {
            const background = this.getBackground();
            if (background) {
                background.set('fill', color);
                this.canvas.requestRenderAll();
                this.handlers.historyHandler.save('background:fill');
            }
        };
        this.setGradient = ({
            angle,
            colors
        }) => {
            const background = this.getBackground();
            if (background) {
                this.setObjectGradient(background, angle, colors);
                this.canvas.requestRenderAll();
                this.handlers.historyHandler.save('background:gradient');
            }
        };
        this.setHoverCursor = (cursor) => {
            const background = this.getBackground();
            if (background) {
                background.set('hoverCursor', cursor);
            }
        };
        this.setObjectGradient = (object, angle, colors) => {
            let odx = object.width >> 1;
            let ody = object.height >> 1;
            let startPoint = angleToPoint(angle, object.width, object.height);
            let endPoint = {
                x: object.width - startPoint.x,
                y: object.height - startPoint.y
            };
            object.set('fill', new fabric.Gradient({
                type: 'linear',
                coords: {
                    x1: startPoint.x - odx,
                    y1: startPoint.y - ody,
                    x2: endPoint.x - odx,
                    y2: endPoint.y - ody
                },
                colorStops: [{
                        offset: 0,
                        color: colors[0]
                    },
                    {
                        offset: 1,
                        color: colors[1]
                    }
                ]
            }));
        };
    }
}
export default BackgroundHandler;