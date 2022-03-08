import CanvasHandler from './CanvasHandler'
import EventsHandler from './EventsHandler'
import PageHandler from './PageHandler'
import ObjectsHandler from './ObjectsHandler'
import HistoryHandler from './HistoryHandler'
import PanZoomHandler from './PanZoomHandler'
import PersonalizationHandler from './PersonalizationHandler'
import FontsHandler from './FontsHandler'
import TemplateHandler from './TemplateHandler'
class Handlers {
    constructor(props) {
        this.propertiesToInclude = [
            'id',
            'name',
            'description',
            'src',
            'keys',
            'keyValues',
            'metadata'
        ]
        this.canvas = props.canvas
        const handlerOptions = {
            handlers: this,
            canvas: props.canvas,
            context: props.context,
            config: props.config,
            editor: props.editor
        }
        this.canvasHandler = new CanvasHandler(handlerOptions)
        this.templateHandler = new TemplateHandler(handlerOptions)
        this.pageHandler = new PageHandler(handlerOptions)
        this.objectsHandler = new ObjectsHandler(handlerOptions)
        this.historyHandler = new HistoryHandler(handlerOptions)
        this.zoomHandler = new PanZoomHandler(handlerOptions)
        this.eventsHandler = new EventsHandler(handlerOptions)
        this.fontsHandler = new FontsHandler(handlerOptions)
        this.personalizationHandler = new PersonalizationHandler(handlerOptions)
    }
}
export default Handlers