import BaseHandler from '../BaseHandler';
import objectToFabric from './objectToFabric';
import { fabric } from 'fabric';
class DesignHandler extends BaseHandler {
    async toDataURL(params) {
        const staticCanvas = new fabric.StaticCanvas(null);
        const template = this.handlers.templateHandler.exportToJSON();
        await this.loadTemplate(staticCanvas, template, params);
        const data = staticCanvas.toDataURL({
            top: 0,
            left: 0,
            height: staticCanvas.getHeight(),
            width: staticCanvas.getWidth()
        });
        return data;
    }
    async loadTemplate(staticCanvas, template, params) {
        const { frame, background } = template;
        this.setDimensions(staticCanvas, frame);
        this.setBackground(staticCanvas, background);
        for (const object of template.objects) {
            const element = await objectToFabric.run(object, params);
            if (element) {
                staticCanvas.add(element);
            }
            else {
                console.log('UNABLE TO LOAD OBJECT: ', object);
            }
        }
    }
    setDimensions(staticCanvas, { width, height }) {
        staticCanvas.setWidth(width).setHeight(height);
    }
    setBackground(staticCanvas, background) {
        if (!background) {
            return;
        }
        staticCanvas.setBackgroundColor(background.type === 'color' ? background.value : '#ffffff', () => {
            staticCanvas.renderAll();
        });
    }
}
export default DesignHandler;