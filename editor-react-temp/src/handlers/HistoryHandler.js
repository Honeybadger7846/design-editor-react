import { fabric } from 'fabric';
import throttle from 'lodash/throttle';
import BaseHandler from './BaseHandler';
class HistoryHandler extends BaseHandler {
    constructor() {
        super(...arguments);
        this.redos = [];
        this.undos = [];
        this.state = [];
        this.active = false;
        this.getStatus = () => {
            return {
                hasUndo: this.undos.length > 1,
                hasRedo: this.undos.length > 0,
                undos: this.undos,
                redos: this.redos,
                state: this.state
            };
        };
        this.save = (type) => {
            try {
                if (this.state) {
                    const json = this.state;
                    this.undos.push({
                        type,
                        json
                    });
                    const canvasJSON = this.canvas.toJSON(this.handlers.propertiesToInclude);
                    // @ts-ignore
                    canvasJSON.objects.forEach(object => {
                        if (object.clipPath) {
                            // @ts-ignore
                            fabric.util.enlivenObjects([object.clipPath], function (arg1) {
                                object.clipPath = arg1[0];
                            });
                        }
                    });
                    // @ts-ignore
                    this.state = canvasJSON.objects;
                }
            }
            catch (err) {
                console.log(err);
            }
            this.editor.emit('history:changed', {
                hasUndo: this.undos.length > 1,
                hasRedo: this.redos.length > 0
            });
        };
        this.clear = () => {
            this.redos = [];
            this.undos = [];
        };
        this.undo = throttle(() => {
            if (this.undos.length > 1) {
                const undo = this.undos.pop();
                if (!undo) {
                    return;
                }
                this.redos.push({
                    type: 'redo',
                    json: this.state
                });
                this.replay(undo);
            }
        }, 100);
        this.redo = throttle(() => {
            const redo = this.redos.pop();
            if (!redo) {
                return;
            }
            this.undos.push({
                type: 'undo',
                json: this.state
            });
            this.replay(redo);
        }, 100);
        this.replay = async (transaction) => {
            this.handlers.objectsHandler.clear();
            const objects = transaction.json;
            this.state = objects;
            this.active = true;
            fabric.util.enlivenObjects(objects, enlivenObjects => {
                enlivenObjects.forEach(enlivenObject => {
                    if (enlivenObject.type !== 'Frame') {
                        this.canvas.add(enlivenObject);
                    }
                });
                this.editor.emit('history:changed', {
                    hasUndo: this.undos.length > 1,
                    hasRedo: this.redos.length > 0
                });
            }, null);
            this.active = false;
        };
        this.getAll = () => {
            return {
                undos: this.undos,
                redos: this.redos,
                state: this.state
            };
        };
    }
}
export default HistoryHandler;