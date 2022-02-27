import CanvasHandler from './CanvasHandler';
import EventsHandler from './EventsHandler';
import FrameHandler from './FrameHandler';
import ObjectsHandler from './ObjectsHandler';
import HistoryHandler from './HistoryHandler';
import ZoomHandler from './ZoomHandler';
import PersonalizationHandler from './PersonalizationHandler';
import TemplateHandler from './TemplateHandler';
import ScrollbarHandler from './ScrollbarHandler';
import DesignHandler from './design-handler/design-handler';
import GuidelinesHandler from './GuidelinesHandler';
import BackgroundHandler from './BackgroundHandler';
class Handlers {
    constructor(props) {
        this.destroy = () => { };
        this.propertiesToInclude = [
            'id',
            'name',
            'description',
            'src',
            'keys',
            'keyValues',
            'animation',
            'metadata'
          ];
        this.canvas = props.canvas;
        const handlerOptions = {
            handlers: this,
            canvas: props.canvas,
            context: props.context,
            config: props.config,
            editor: props.editor
        };
        this.canvasHandler = new CanvasHandler(handlerOptions);
        this.frameHandler = new FrameHandler(handlerOptions);
        this.objectsHandler = new ObjectsHandler(handlerOptions);
        this.historyHandler = new HistoryHandler(handlerOptions);
        this.zoomHandler = new ZoomHandler(handlerOptions);
        this.eventsHandler = new EventsHandler(handlerOptions);
        this.personalizationHandler = new PersonalizationHandler(handlerOptions);
        this.templateHandler = new TemplateHandler(handlerOptions);
        this.scrollbarHandler = new ScrollbarHandler(handlerOptions);
        this.designHandler = new DesignHandler(handlerOptions);
        this.guidelinesHandler = new GuidelinesHandler(handlerOptions);
        this.backgroundHandler = new BackgroundHandler(handlerOptions);
    }
}
export default Handlers;