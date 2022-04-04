import { fabric } from "fabric";
import { ObjectType } from "../common/constants";
import objectToFabric from "../utils/objectToFabric";
import BaseHandler from "./BaseHandler";
class ObjectHandler extends BaseHandler {
  constructor() {
    super(...arguments);
    this.add = async (item) => {
      const { canvas } = this;
      const options = this.handlers.pageHandler.getOptions();
      const object = await objectToFabric.run(item, options);
      if (object.type !== "StaticText") {
        object.scaleToWidth(480);
      }
      canvas.add(object);
      object.center();
      canvas.setActiveObject(object);
      this.context.setActiveObject(object);
      this.handlers.historyHandler.save("object:created");
    };
    this.update = (options) => {
      const activeObject = this.canvas.getActiveObject();
      const canvas = this.canvas;
      if (activeObject) {
        for (const property in options) {
          if (
            property === "angle" ||
            property === "top" ||
            property === "left"
          ) {
            if (property === "angle") {
              activeObject.rotate(options["angle"]);
              canvas.requestRenderAll();
            } else {
              activeObject.set(property, options[property]);
              canvas.requestRenderAll();
            }
          } else {
            // @ts-ignore
            if (activeObject._objects) {
              // @ts-ignore
              activeObject._objects.forEach((object) => {
                if (property === "metadata") {
                  object.set(
                    "metadata",
                    Object.assign(
                      Object.assign({}, object.metadata),
                      options["metadata"]
                    )
                  );
                } else {
                  object.set(property, options[property]);
                }
                object.setCoords();
              });
            } else {
              if (property === "metadata") {
                // @ts-ignore
                activeObject.set(
                  "metadata",
                  Object.assign(
                    Object.assign({}, activeObject.metadata),
                    options[property]
                  )
                );
              } else {
                // @ts-ignore
                activeObject.set(property, options[property]);
              }
              activeObject.setCoords();
            }
          }
          if (property === "ui") {
            //activeObject.set(property, options[property]);
          }
          activeObject.set(property, options[property]);
          canvas.requestRenderAll();
        }
        this.handlers.historyHandler.save("object:updated");
      }
    };
    this.clear = () => {
      const frame = this.handlers.pageHandler.getPage();
      this.canvas.getObjects().forEach((object) => {
        if (object.type !== "Page") {
          this.canvas.remove(object);
        }
      });
      frame.set("fill", "#ffffff");
      this.canvas.renderAll();
    };
    this.clearAll = (forceRender) => {
      this.canvas._objects = [];
      if (forceRender) this.canvas.renderAll();
    };
    this.deselect = () => {
      this.canvas.discardActiveObject();
      this.canvas.requestRenderAll();
    };
    this.moveVertical = (value) => {
      const activeObject = this.canvas.getActiveObject();
      const top = activeObject.top + value;
      this.update({
        top: top,
      });
    };
    this.moveHorizontal = (value) => {
      const activeObject = this.canvas.getActiveObject();
      const left = activeObject.left + value;
      this.update({
        left: left,
      });
    };
    this.updateLineHeight = (value) => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject.type === "DynamicText") {
        const lineHeight = activeObject.lineHeight + value;
        this.update({
          lineHeight: lineHeight,
        });
      }
    };
    this.updateCharSpacing = (value) => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject.type === "DynamicText") {
        const charSpacing = activeObject.charSpacing + value;
        this.update({
          charSpacing: charSpacing,
        });
      }
    };
    this.cut = () => {
      this.copy();
      this.isCut = true;
      this.remove();
    };
    this.copy = () => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.clipboard = activeObject;
      }
    };
    this.clone = () => {
      if (this.canvas) {
        const activeObject = this.canvas.getActiveObject();
        this.canvas.discardActiveObject();
        this.duplicate(activeObject, (duplicates) => {
          const selection = new fabric.ActiveSelection(duplicates, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
          this.canvas.requestRenderAll();
        });
      }
    };
    this.paste = () => {
      const object = this.clipboard;
      if (object) {
        this.canvas.discardActiveObject();
        this.duplicate(object, (duplicates) => {
          const selection = new fabric.ActiveSelection(duplicates, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
          this.canvas.requestRenderAll();
        });
      }
    };
    /**
     * Remove active object
     */
    this.remove = () => {
      this.canvas.getActiveObjects().forEach((obj) => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();
      this.handlers.historyHandler.save("object:removed");
    };
    this.selectAll = () => {
      this.canvas.discardActiveObject();
      const filteredObjects = this.canvas.getObjects().filter((object) => {
        if (object.type === "Page") {
          return false;
        } else if (!object.evented) {
          return false;
          //@ts-ignore
        } else if (object.locked) {
          return false;
        }
        return true;
      });
      if (!filteredObjects.length) {
        return;
      }
      if (filteredObjects.length === 1) {
        this.canvas.setActiveObject(filteredObjects[0]);
        this.canvas.renderAll();
        this.context.setActiveObject(filteredObjects[0]);
        return;
      }
      const activeSelection = new fabric.ActiveSelection(filteredObjects, {
        canvas: this.canvas,
      });
      this.canvas.setActiveObject(activeSelection);
      this.canvas.renderAll();
      this.context.setActiveObject(activeSelection);
    };
    /**
     * OBJECT POSITION
     */
    /**
     * Moves an object or a selection up in stack of drawn objects.
     */
    this.bringForward = () => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.bringForward(activeObject);
      }
    };
    /**
     * Moves an object or the objects of a multiple selection to the top of the stack of drawn objects
     */
    this.bringToFront = () => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.bringToFront(activeObject);
      }
    };
    /**
     * Moves an object or a selection down in stack of drawn objects.
     */
    this.sendBackwards = () => {
      const objects = this.canvas.getObjects();
      const activeObject = this.canvas.getActiveObject();
      const index = objects.findIndex((o) => o === activeObject);
      if (activeObject && index > 1) {
        this.canvas.sendBackwards(activeObject);
      }
    };
    /**
     * Moves an object to specified level in stack of drawn objects.
     */
    this.sendToBack = () => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        activeObject.moveTo(1);
      }
    };
    /**
     * ALIGNMENT TO FRAME OR GROUP
     */
    /**
     * Moves an object to the top of the frame. If multiple objects are selected, will move all objects to the top of the selection.
     */
    this.alignTop = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refTop = activeObject.top;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            currentObject.set("top", refTop);
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          currentObject.set("top", frame.top);
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * Moves an object to the middle of the frame. If multiple objects are selected, will move all objects to the middle of the selection.
     */
    this.alignMiddle = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refTop = activeObject.top;
          const refHeight = activeObject.height;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            const currentObjectHeight = currentObject.getScaledHeight();
            currentObject.set(
              "top",
              refTop + refHeight / 2 - currentObjectHeight / 2
            );
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          const currentObjectHeight = currentObject.getScaledHeight();
          currentObject.set(
            "top",
            frame.top + frame.height / 2 - currentObjectHeight / 2
          );
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * Moves an object to the bottom of the frame. If multiple objects are selected, will move all objects to the bottom of the selection.
     */
    this.alignBottom = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refTop = activeObject.top;
          const refHeight = activeObject.height;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            const currentObjectHeight = currentObject.getScaledHeight();
            currentObject.set("top", refTop + refHeight - currentObjectHeight);
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          const currentObjectHeight = currentObject.getScaledHeight();
          currentObject.set(
            "top",
            frame.top + frame.height - currentObjectHeight
          );
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * Moves an object to the left of the frame. If multiple objects are selected, will move all objects to the left of the selection.
     */
    this.alignLeft = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refLeft = activeObject.left;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            currentObject.set("left", refLeft);
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          currentObject.set("left", frame.left);
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * Moves an object to the center of the frame. If multiple objects are selected, will move all objects to the center of the selection.
     */
    this.alignCenter = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refLeft = activeObject.left;
          const refWidth = activeObject.width;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            const currentObjectWidth = currentObject.getScaledWidth();
            currentObject.set(
              "left",
              refLeft + refWidth / 2 - currentObjectWidth / 2
            );
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          const currentObjectWidth = currentObject.getScaledWidth();
          currentObject.set(
            "left",
            frame.left + frame.width / 2 - currentObjectWidth / 2
          );
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * Moves an object to the right of the frame. If multiple objects are selected, will move all objects to the right of the selection.
     */
    this.alignRight = () => {
      const activeObject = this.canvas.getActiveObject();
      const frame = this.handlers.pageHandler.getPage();
      if (activeObject) {
        if (activeObject instanceof fabric.Group) {
          const selectedObjects = activeObject._objects;
          const refLeft = activeObject.left;
          const refWidth = activeObject.width;
          this.canvas.discardActiveObject();
          selectedObjects.forEach((object) => {
            const currentObject = object;
            const currentObjectWidth = currentObject.getScaledWidth();
            currentObject.set("left", refLeft + refWidth - currentObjectWidth);
          });
          const selection = new fabric.ActiveSelection(selectedObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(selection);
        } else {
          const currentObject = activeObject;
          const currentObjectWidth = currentObject.getScaledWidth();
          currentObject.set(
            "left",
            frame.left + frame.width - currentObjectWidth
          );
        }
        this.canvas.requestRenderAll();
      }
    };
    /**
     * SHADOW
     */
    this.setShadow = (options) => {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject instanceof fabric.Group) {
        activeObject._objects.forEach((object) => {
          this.setObjectShadow(object, options);
        });
      } else {
        this.setObjectShadow(activeObject, options);
      }
      this.canvas.requestRenderAll();
      this.handlers.historyHandler.save("object:updated");
    };
    this.setObjectShadow = (object, options) => {
      if (options.enabled) {
        object.set("shadow", new fabric.Shadow(options));
      } else {
        object.set("shadow", null);
      }
    };
    this.group = () => {
      const frame = this.handlers.pageHandler.getPage();
      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }
      if (activeObject.type !== ObjectType.ACTIVE_SELECTION) {
        return;
      }
      if (activeObject instanceof fabric.Group) {
        activeObject._objects.forEach((object) => {
          object.clipPath = null;
        });
      }
      const group = activeObject.toGroup();
      group.clipPath = frame;
      this.canvas.renderAll();
      this.handlers.historyHandler.save("group");
    };
    this.ungroup = () => {
      const frame = this.handlers.pageHandler.getPage();
      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }
      if (activeObject.type !== ObjectType.GROUP) {
        return;
      }
      const activeSelection = activeObject.toActiveSelection();
      activeSelection._objects.forEach((object) => {
        object.clipPath = frame;
      });
      this.canvas.renderAll();
      this.context.setActiveObject(activeSelection);
      this.handlers.historyHandler.save("ungroup");
    };
    this.lock = () => {
      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }
      // @ts-ignore
      if (activeObject._objects) {
        // @ts-ignore
        activeObject._objects.forEach((object) => {
          object.set({
            hasControls: false,
            lockMovementY: true,
            lockMovementX: true,
            locked: true,
          });
        });
        activeObject.set({
          hasControls: false,
          lockMovementY: true,
          lockMovementX: true,
          locked: true,
        });
      } else {
        activeObject.set({
          hasControls: false,
          lockMovementY: true,
          lockMovementX: true,
          locked: true,
        });
      }
      this.canvas.renderAll();
      this.handlers.historyHandler.save("object:updated");
    };
    this.unlock = () => {
      const activeObject = this.canvas.getActiveObject();
      if (!activeObject) {
        return;
      }
      // @ts-ignore
      if (activeObject._objects) {
        // @ts-ignore
        activeObject._objects.forEach((object) => {
          object.set({
            hasControls: true,
            lockMovementY: false,
            lockMovementX: false,
            locked: false,
          });
        });
        // @ts-ignore
        activeObject.set({
          hasControls: true,
          lockMovementY: false,
          lockMovementX: false,
          locked: false,
        });
      } else {
        // @ts-ignore
        activeObject.set({
          hasControls: true,
          lockMovementY: false,
          lockMovementX: false,
          locked: false,
        });
      }
      this.canvas.renderAll();
      this.handlers.historyHandler.save("object:updated");
    };
    this.findByName = (name) => {
      return this.canvas.getObjects().filter((o) => o.name === name);
    };
    this.removeByName = (name) => {
      this.canvas.getObjects().forEach((o) => {
        if (o.name === name) {
          this.canvas.remove(o);
          this.handlers.historyHandler.save("object:removed");
        }
      });
      this.canvas.requestRenderAll();
    };
    this.findById = (id) => {
      return this.canvas.getObjects().filter((o) => o.id === id);
    };
    this.removeById = (id) => {
      this.canvas.getObjects().forEach((o) => {
        if (o.id === id) {
          this.canvas.remove(o);
          this.handlers.historyHandler.save("object:removed");
        }
      });
      this.canvas.requestRenderAll();
    };
  }
  duplicate(object, callback) {
    if (object instanceof fabric.Group) {
      const objects = object.getObjects();
      const duplicates = [];
      for (let i = 0; i < objects.length; i++) {
        this.duplicate(objects[i], (clones) => {
          duplicates.push(...clones);
          if (i == objects.length - 1) {
            callback(duplicates);
          }
        });
      }
    } else {
      object.clone(
        (clone) => {
          clone.set({
            left: object.left + 10,
            top: object.top + 10,
          });
          this.canvas.add(clone);
          callback([clone]);
        },
        ["keyValues", "src"]
      );
    }
  }
}
export default ObjectHandler;
