import { fabric } from "fabric";
import Typr from "./TyprModule.js";
import wordWrapper from "./WordWrap.js";

fabric.Typr = Typr;
fabric.fontArrayList = [];

fabric.getFont = (charStyle) => {
  charStyle = charStyle || {};
  let font = null;
  fabric.fontArrayList.forEach((f) => {
    if (f.FontName === charStyle.fontFamily) {
      font = f.fObject;
    }
  });
  if (!font && fabric.fontArrayList.length > 0)
    font = fabric.fontArrayList[0].fObject;
  return font;
};

let attributes = (text) => {
  let attributeList = {
    fontFamily: "string",
    fontStyle: "string",
    fontSize: "number",
    fill: "string",
    strokeColor: "string",
    strokeWidth: "number",
    tracking: "number",
    leading: "string",
    lineAlign: "string",
    underline: "bool",
  };

  let attibuteNoCase = {};
  Object.keys(attributeList).map((key) => {
    attibuteNoCase[key.toLowerCase()] = key;
  });

  const regexStr =
    "[\"']?(" +
    Object.keys(attibuteNoCase)
      .map((key) => {
        return key;
      })
      .join("|") +
    ")[\"']?\\s?=\\s?(([^\"'\\s]+)|[\"']([^\"']+)[\"'])";

  let parsedAttributes = {};
  const pattern = new RegExp(regexStr, "gi");
  let match, value, property;
  while ((match = pattern.exec(text))) {
    value = match[4] ? match[4] : match[3];
    property = attibuteNoCase[match[1].toLowerCase()];
    switch (attributeList[property]) {
      case "bool":
        value = value == "true";
        break;
      case "number":
        value = Number(value);
        break;
    }

    parsedAttributes[property] = value;
  }
  return parsedAttributes;
};

function computeMetrics(styles, text, start, end, width, wrapMode, textObject) {
  start = Math.max(0, start || 0);
  end = Math.min(end || text.length, text.length);
  width = wrapMode ? width || Infinity : Infinity;
  let pen = 0;
  let count = 0;
  let curWidth = 0;
  for (let i = start; i < end; i++) {
    let style = styles[i] ? styles[i] : textObject.cursorStyle;
    let char = text.charAt(i);
    if (char === "\n") break;
    let font = fabric.getFont(style);
    if (!font) continue;
    let glyph = Typr.U.shape(font, text[i])[0];

    let penWithoutTracking =
      pen + ((glyph.ax + glyph.dx) / font.head.unitsPerEm) * style.fontSize;
    pen +=
      ((style.tracking + glyph.ax + glyph.dx) / font.head.unitsPerEm) *
      style.fontSize;
    if (pen > width && penWithoutTracking > width) {
      break;
    }
    curWidth = pen;
    count++;
  }
  return {
    start: start,
    end: start + count,
    width: curWidth,
  };
}

fabric.StaticText = fabric.util.createClass(fabric.Object, {
  type: "StaticText",
  width: 10,
  height: 10,
  text: "",
  wrapMode: false,
  objectCaching: false, // legacy
  fill: null,
  cursorStyle: {},
  _styleMap: [],
  _fallbackStyles: {
    fontFamily: "OpenSans-Regular",
    fontStyle: "Regular",
    fill: "#000000",
    strokeColor: null,
    strokeWidth: 0,
    fontSize: 40,
    tracking: 0,
    leading: "auto",
    lineAlign: "left",
    underline: false,
    bgColor: null,
  },
  gradient: null, // it's per entire text, not per glyph
  verticalAlign: "top",
  _layout: null,
  hiddenTextarea: null,
  isEditing: false,
  lockEditing: false,
  fonts: null,
  _selectionStart: 0,
  _selectionEnd: 0,
  cursorPosition: 0,
  __drawCursorNow: false,
  __drawCursorTime: Math.floor(Date.now() / 500),
  markSelection: false,
  autoResize: 0,
  initialize: function (options) {
    //DO NOT REMOVE.
    //this._fallbackStyles.fontSize = fabric.util.parseUnit(`20pt`)
    //this.cursorStyle = this._fallbackStyles
    this._styleMap = [];
    this.fonts = [];
    this.text = "";

    options = options || {};
    this.callSuper("initialize", options);
    this.cursorStyle = this._fallbackStyles;
    this.setControlsVisibility({
      mb: false,
      ml: false,
      mr: false,
      mt: false,
    });

    if (this.textMarkup) {
      this.transformTextMarkup();
    }
    this.computeLayout();
    this.on("selected", () => {
      this._selected = true;
    });
    this.on("mousedown", (options) => {
      options = options || {};
      if (options.e) {
        this.__newCursorPosition = this.getClosestCharIndexToMousePointer(
          options.e
        );
        let cursorMoved =
          this.__newCursorPosition !== this.getCursorPosition() ? true : false;
        this.setCursorPosition(this.__newCursorPosition);
        if (this.canvas) {
          if (this.isEditing) {
            this.hiddenTextarea.focus();
            if (cursorMoved) this.setCursorStyles();
            this.setMarkSelection(true);
          } else {
            if (!this._selected) this._mouseDownEvent = true;
          }
          this.canvas.requestRenderAll();
        }
      }
    });
    this.on("mousemove", (options) => {
      if (this._mouseDownEvent) delete this._mouseDownEvent;
      if (this.canvas) {
        if (this.isEditing && this.isMarkSelection()) {
          this.setCursorPosition(
            this.getClosestCharIndexToMousePointer(options.e)
          );
          let cursorMoved =
            this.__newCursorPosition !== this.getCursorPosition()
              ? true
              : false;
          this.__newCursorPosition = this.getCursorPosition();
          if (this.canvas && cursorMoved) {
            this.canvas.requestRenderAll();
            this.canvas.fire("text:selection:changed", {
              target: this,
            });
          }
        }
      }
    });
    this.on("mouseup", (options) => {
      if (this.canvas) {
        if (this.isEditing) {
          this.hiddenTextarea.focus();
          this.setMarkSelection(false);
          if (options.e.detail === 2) {
            this.selectWord();
          }
        } else if (this._mouseDownEvent) {
          this.enterEditing();
          delete this._mouseDownEvent;
        }
        this.canvas.requestRenderAll();
        if (this._mouseDownEvent) delete this._mouseDownEvent;
      }
      if (this._selected) delete this._selected;
    });
    /*
    this.on("mousedblclick", () => {
      if (!this.isEditing) {
        this.enterEditing();
      }
    });
    */
    this.on("deselected", () => {
      this.exitEditing();
    });
    /*
		this.on('scaled', () => {
			this._styleMap.forEach(style => {
				style.fontSize *= this.scaleX
			})
			this.scaleX = 1
			this.scaleY = 1
			this.computeLayout()
			this.setCoords()
		})
		*/

    this.setCursorStyles();

    if (this.isEditing) {
      this.enterEditing();
    }
  },
  clearContextTop() {},
  initTextarea() {
    this.hiddenTextarea = fabric.document.createElement("textarea");
    this.hiddenTextarea.setAttribute("autocapitalize", "off");
    this.hiddenTextarea.setAttribute("autocorrect", "off");
    this.hiddenTextarea.setAttribute("autocomplete", "off");
    this.hiddenTextarea.setAttribute("spellcheck", "false");
    this.hiddenTextarea.setAttribute("data-fabric-hiddentextarea", "");
    this.hiddenTextarea.setAttribute("wrap", "off");
    this.hiddenTextarea.style.cssText =
      "position: absolute; left:0; top:0; z-index: -999; opacity: 0; width: 1px; height: 1px;";
    fabric.document.body.appendChild(this.hiddenTextarea);
    fabric.util.addListener(
      this.hiddenTextarea,
      "input",
      this.onInput.bind(this)
    );
    fabric.util.addListener(
      this.hiddenTextarea,
      "keyup",
      this.onKeyUp.bind(this)
    );
    fabric.util.addListener(
      this.hiddenTextarea,
      "keydown",
      this.onKeyDown.bind(this)
    );
    fabric.util.addListener(
      this.hiddenTextarea,
      "keypress",
      this.onKeyPress.bind(this)
    );
    fabric.util.addListener(
      this.hiddenTextarea,
      "focusout",
      this.onFocusOut.bind(this)
    );
    this.hiddenTextarea.value = this.text || this.textMarkup;
    this.hiddenTextarea.setSelectionRange(
      this.getSelectionStart(),
      this.getSelectionEnd()
    );
    this.hiddenTextarea.focus();
  },
  destroyTextarea() {
    if (this.hiddenTextarea) {
      this.hiddenTextarea.blur && this.hiddenTextarea.blur();
      this.hiddenTextarea.parentNode &&
        this.hiddenTextarea.parentNode.removeChild(this.hiddenTextarea);
    }
    this.hiddenTextarea = null;
  },
  zoomIn() {
    if (
      this.canvas &&
      document &&
      document.body &&
      document.body.clientWidth < 800
    ) {
      this._canvasViewportTransform = [...this.canvas.viewportTransform];
      this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      this.canvas.absolutePan({
        x: this.getCenterPoint().x - this.canvas.width / 2,
        y: this.top,
      });
      const center = this.canvas.getCenter();
      this.canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        this.canvas.width / (this.width * 2)
      );
      this.canvas.requestRenderAll();
    }
  },
  zoomOut() {
    if (this._canvasViewportTransform && this.canvas) {
      this.canvas.setViewportTransform(this._canvasViewportTransform);
      delete this._canvasViewportTransform;
      this.canvas.requestRenderAll();
    }
  },
  enterEditing() {
    if (this.lockEditing) return;
    this.isEditing = true;

    this.hoverCursor = "text";
    console.log("HAPPENING");
    // this._lockMovementX = this.lockMovementX;
    // this._lockMovementY = this.lockMovementY;
    this.locked = true;
    //this.lockMovementX = true;
    //this.lockMovementY = true;
    this.fire("editing:entered");
    this.setControlsVisibility({
      bl: false,
      br: false,
      tl: false,
      tr: false,
      mtr: false,
    });
    this.__borderColor = this.__borderColor
      ? this.__borderColor
      : this.borderColor;
    this.borderColor = "rgba(0,0,0,0)";

    this.initTextarea();
    if (!this.canvas) {
      return this;
    }

    this.canvas.fire("text:editing:entered", {
      target: this,
    });
    this.zoomIn();
  },
  exitEditing() {
    this.isEditing = false;
    this.hoverCursor = "all-scroll";
    this.locked = false;
    //this.lockMovementX = this._lockMovementX;
    //this.lockMovementY = this._lockMovementY;
    this.setControlsVisibility({
      bl: true,
      br: true,
      tl: true,
      tr: true,
      mtr: true,
    });
    if (this.__borderColor) {
      this.borderColor = this.__borderColor;
      delete this.__borderColor;
    }
    this.destroyTextarea();
    this._styleMap.forEach((style) => {
      style.fontSize *= this.scaleX;
    });
    this.scaleX = 1;
    this.scaleY = 1;
    this.computeLayout();
    if (this.autoResize > 0 && this.autoResize < this.width) {
      this.autoResize = this.width;
    }
    this.setCoords();
    this.fire("editing:exited");
    if (this.canvas) {
      this.canvas.fire("text:editing:exited", {
        target: this,
      });
      this.zoomOut();
      this.canvas.requestRenderAll();
    }
  },
  onFocusOut() {},
  insertChar(char) {
    if (this.getSelectionStart() === this.getSelectionEnd()) {
      this.onInputUpdateStyleMap(this.getCursorPosition(), 1, "add");
      this.text =
        this.text.substr(0, this.getSelectionStart()) +
        char +
        this.text.substr(this.getSelectionStart());
      this.hiddenTextarea.value = this.text;
      this.setCursorPosition(this.getSelectionStart() + 1);
      this.hiddenTextarea.selectionStart = this.getSelectionStart();
      this.hiddenTextarea.selectionEnd = this.getSelectionEnd();
    }
    if (Math.abs(this.getSelectionStart() - this.getSelectionEnd()) === 1) {
      this.text =
        this.text.substr(0, this.getSelectionStart()) +
        char +
        this.text.substr(this.getSelectionStart() + 1);
      this.hiddenTextarea.value = this.text;
      this.hiddenTextarea.selectionStart = this.getSelectionStart();
      this.hiddenTextarea.selectionEnd = this.getSelectionEnd();
    }
    if (this.isEditing) {
      this.enterEditing();
    }
    this.computeLayout();
  },
  searchWordBoundary: function (selectionStart, direction) {
    let _reSpace = /\s|\n/;
    let index = _reSpace.test(this.text[selectionStart])
        ? selectionStart - 1
        : selectionStart,
      reNonWord = /[ \n\.,;!\?\-]/;

    while (
      index + direction >= 0 &&
      index + direction < this.getTextLength() &&
      !reNonWord.test(this.text[index + direction])
    ) {
      index += direction;
    }
    index += direction === 1 ? direction : 0;

    return index;
  },
  selectWord: function (position) {
    position = position || this.getCursorPosition();
    let newSelectionStart = this.searchWordBoundary(position, -1),
      newSelectionEnd = this.searchWordBoundary(position, 1);

    this.setMarkSelection(false)
      .setCursorPosition(newSelectionStart)
      .setMarkSelection(true)
      .setCursorPosition(newSelectionEnd)
      .setMarkSelection(false);
  },
  focus() {
    if (this.hiddenTextarea) {
      this.enterEditing();
      this.hiddenTextarea.focus();
      if (this.canvas) {
        this.canvas.requestRenderAll();
      }
    }
  },
  isSelection() {
    if (this._selectionStart === this._selectionEnd) return false;
    return true;
  },
  isSelectionBackward() {
    if (this.cursorPosition === this._selectionStart) return true;
    return false;
  },
  setCursorPosition(newCursorPosition) {
    newCursorPosition = newCursorPosition < 0 ? 0 : newCursorPosition;
    newCursorPosition =
      newCursorPosition > this.getTextLength()
        ? this.getTextLength()
        : newCursorPosition;

    if (this.markSelection) {
      if (this.isSelectionBackward()) {
        this._selectionStart = Math.min(newCursorPosition, this._selectionEnd);
        this._selectionEnd = Math.max(newCursorPosition, this._selectionEnd);
      } else {
        this._selectionEnd = Math.max(this._selectionStart, newCursorPosition);
        this._selectionStart = Math.min(
          newCursorPosition,
          this._selectionStart
        );
      }
      this.cursorPosition = newCursorPosition;
    } else {
      this.cursorPosition =
        this._selectionStart =
        this._selectionEnd =
          newCursorPosition;
    }
    if (this.hiddenTextarea) {
      this.hiddenTextarea.setSelectionRange(
        this.getSelectionStart(),
        this.getSelectionEnd()
      );
    }
    this.__drawCursorNow = true;
    this.__drawCursorTime = Math.floor(Date.now() / 500);
    return this;
  },
  getCursorPosition() {
    return this.cursorPosition;
  },
  getSelectionEnd() {
    return this._selectionEnd;
  },
  getSelectionStart() {
    return this._selectionStart;
  },
  setSelectionEnd(selectionEnd) {
    this._selectionEnd = selectionEnd;
    return this;
  },
  setSelectionStart(selectionStart) {
    this._selectionStart = selectionStart;
    return this;
  },
  isMarkSelection() {
    return this.markSelection;
  },
  setMarkSelection(markSelection) {
    this.markSelection = markSelection;
    return this;
  },
  getTextLength() {
    return this.text.length;
  },
  onInput: function (e) {
    if (!this.isEditing) return;
    if (e) {
      e.stopPropagation();
      let lengthDifference =
        this.getTextLength() - this.hiddenTextarea.value.length;
      let absLengthDifference = Math.abs(lengthDifference);
      let inputType = e.inputType;
      if (this.isSelection()) {
        inputType = "replaceText";
      }
      // need to handle inputyTpe HistoryUndo HistoryRedo
      if (inputType === "replaceText" && absLengthDifference !== 0) {
        let selectionLength = this.getSelectionEnd() - this.getSelectionStart();
        let replaceTextLength = selectionLength - lengthDifference;
        this.setCursorStyles();
        this.onInputUpdateStyleMap(
          this.getSelectionStart(),
          selectionLength,
          "remove"
        );
        this.onInputUpdateStyleMap(
          this.getSelectionStart(),
          replaceTextLength,
          "add"
        );
      }
      if (
        (inputType === "insertText" ||
          inputType === "insertFromPaste" ||
          inputType === "insertLineBreak") &&
        absLengthDifference !== 0
      ) {
        this.onInputUpdateStyleMap(
          this.getCursorPosition(),
          absLengthDifference,
          "add"
        );
      }
      if (inputType === "deleteContentBackward" && absLengthDifference !== 0) {
        this.setCursorStyles();
        this.onInputUpdateStyleMap(
          this.getSelectionStart() - absLengthDifference,
          absLengthDifference,
          "remove"
        );
      }
      if (inputType === "deleteContentForward" && absLengthDifference !== 0) {
        this.onInputUpdateStyleMap(
          this.getSelectionStart(),
          absLengthDifference,
          "remove"
        );
      }
      this.text = this.hiddenTextarea.value;

      this.setCursorPosition(this.hiddenTextarea.selectionStart)
        .setSelectionStart(this.hiddenTextarea.selectionStart)
        .setSelectionEnd(this.hiddenTextarea.selectionEnd);
      this.computeLayout();

      if (this.canvas) {
        this.canvas.requestRenderAll();
        /*
				this.canvas.fire('object:modified', {
				    target: this,
				    action: 'textboxInputText',
				    undoDelay: 500
				})
				
				this.fire('modified')
				*/
      }
    }
  },
  onKeyPress: function (e) {},
  onKeyDown: function (e) {
    if (this.canvas) {
      if (e && this.isEditing) {
        let key = e.which || e.keyCode;

        if (key === 16 || e.shiftKey) {
          this.setMarkSelection(true);
        }
        if (key === 9) {
          this.fire("tabEvent");
          //e.preventDefault()
        }
        if (key === 27) {
          this.fire("deselected");
          this.fire("escapeEvent");
          //e.preventDefault()
        }

        if (
          key === 37 ||
          key === 37 ||
          key === 39 ||
          key === 40 ||
          key === 38 ||
          (key === 65 && (e.ctrlKey || e.metaKey))
        ) {
          if (key === 40) {
            //down arrow key
            if (this.isSelection() && !this.isMarkSelection()) {
              this.setCursorPosition(this.getSelectionEnd());
            } else {
              this.setCursorPosition(
                this.getClosestCharIndexBelowByCharIndex(
                  this.getCursorPosition()
                )
              );
            }
          } else if (key === 38) {
            //up arrow key
            if (this.isSelection() && !this.isMarkSelection()) {
              this.setCursorPosition(this.getSelectionStart());
            } else {
              this.setCursorPosition(
                this.getClosestCharIndexAboveByCharIndex(
                  this.getCursorPosition()
                )
              );
            }
          } else if (key === 37) {
            //left arrow key
            if (this.isSelection() && !this.isMarkSelection()) {
              this.setCursorPosition(this.getSelectionStart());
            } else {
              this.setCursorPosition(this.getCursorPosition() - 1);
            }
          } else if (key === 39) {
            //right arrow key
            if (this.isSelection() && !this.isMarkSelection()) {
              this.setCursorPosition(this.getSelectionEnd());
            } else {
              this.setCursorPosition(this.getCursorPosition() + 1);
            }
          } else if (key === 65 && (e.ctrlKey || e.metaKey)) {
            this.setCursorPosition(0)
              .setMarkSelection(true)
              .setCursorPosition(this.getTextLength())
              .setMarkSelection(false);
          }

          this.setCursorStyles();

          if (this.canvas) {
            this.canvas.requestRenderAll();
            this.canvas.fire("text:selection:changed", {
              target: this,
            });
          }
        } else if (key !== 16) {
          this.setMarkSelection(false);
        }
      }
    }
  },
  onKeyUp: function (e) {
    // used only to prevent keyup events outside of textbox
    if (e && this.isEditing) {
      let key = e.which || e.keyCode;

      //allow propagation if ctrl r/z so document can handle undo redo
      if (!((key === 82 || key === 90) && (e.ctrlKey || e.metaKey))) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }

      if (key === 16) {
        this.setMarkSelection(false);
      }
      if (this.hiddenTextarea) {
        this.hiddenTextarea.setSelectionRange(
          this.getSelectionStart(),
          this.getSelectionEnd()
        );
      }
    }
  },
  onInputUpdateStyleMap(start, length, action) {
    if (action === "add") {
      let cursorStyle = Object.assign({}, this.cursorStyle);
      let newStyleBlock = [];
      for (let i = 0; i < length; i++) {
        newStyleBlock.push(Object.assign({}, cursorStyle));
      }

      this._styleMap.splice(start, 0, ...newStyleBlock);
    } else if (action === "remove") {
      this._styleMap.splice(start, length);
    }
  },
  setCursorStyles() {
    let start = this.getSelectionStart();

    if (
      start > 0 &&
      (start === this.getTextLength() ||
        this._layout.lines[
          this._layout.glyphs[this._layout.layoutToGlyph[start]].row
        ].textLine ===
          this._layout.lines[
            this._layout.glyphs[this._layout.layoutToGlyph[start - 1]].row
          ].textLine)
    ) {
      start -= 1;
    }

    let style = this._styleMap[start]
      ? this._styleMap[start]
      : this._fallbackStyles;
    this.cursorStyle = Object.assign({}, style);
  },
  findStartEndOfTextAreaLineFromSelection(start, end) {
    if (this._layout) {
      let startLayoutLine =
        this._layout.glyphs[this._layout.layoutToGlyph[start]].row;
      let endLayoutLine =
        this._layout.glyphs[this._layout.layoutToGlyph[end]].row;
      let startTextLine = this._layout.lines[startLayoutLine].textLine;
      let endTextLine = this._layout.lines[endLayoutLine].textLine;

      for (; startLayoutLine > 0; startLayoutLine--) {
        if (this._layout.lines[startLayoutLine - 1].textLine !== startTextLine)
          break;
      }
      for (; endLayoutLine < this._layout.lines.length - 1; endLayoutLine++) {
        if (this._layout.lines[endLayoutLine + 1].textLine !== endTextLine)
          break;
      }

      (start = this._layout.lines[startLayoutLine].start),
        (end = this._layout.lines[endLayoutLine].end);
    }

    return {
      start: start,
      end: end,
    };
  },
  set: function (key, value) {
    if (typeof key === "object") {
      this._setObject(key);
    } else {
      if (typeof value === "function" && key !== "clipTo") {
        this._set(key, value(this.get(key)));
      } else {
        this._set(key, value);
      }
    }
    return this;
  },

  _set: function (key, value) {
    if (key === "textAlign") {
      if (value === "Justify") {
        value = "center";
      }
      this.setStyles({
        lineAlign: value,
      });
    } else if (key === "fontFamily") {
      this.setStyles({
        fontFamily: value,
      });
      if (this.canvas && this.canvas.getMissingFonts().length > 0) {
        this.canvas.fire("missing:fonts", this.canvas.getMissingFonts());
      }
    } else if (key === "fontSize") {
      this.setStyles({
        fontSize: value,
      });
    } else if (key === "leading") {
      this.setStyles({
        leading: value,
      });
    } else if (key === "tracking") {
      this.setStyles({
        tracking: value,
      });
    } else if (key === "underline") {
      this.setStyles({
        underline: value,
      });
    } else if (key === "stroke") {
      this.setStyles({
        strokeColor: value,
      });
    } else if (key === "strokeWidth") {
      this.setStyles({
        strokeWidth: value,
      });
    } else if (key === "fill") {
      if (typeof value == "object") {
        // we expect it's gradient
        this.fill = value;
      } else {
        this.fill = null;
        this.setStyles({
          fill: value,
        });
      }
    } else {
      this[key] = value;
    }
  },
  setStyles(styles) {
    //if (!this.hiddenTextarea) return;
    let styleAll =
      !this.isEditing && this.getSelectionEnd() === this.getSelectionStart();
    let start = this.isEditing ? this.getSelectionStart() : 0;
    let end = this.isEditing ? this.getSelectionEnd() : this.getTextLength();
    if (start === end && !styleAll && this.isEditing) {
      start = start === 0 ? start : start - 1;
    }
    let charStyles = Object.assign({}, styles);
    let filterStyles = [
      "fontFamily",
      "fontStyle",
      "fill",
      "strokeColor",
      "strokeWidth",
      "fontSize",
      "tracking",
      "leading",
      "underline",
      "bgColor",
      "lineAlign",
    ];
    Object.keys(charStyles).forEach(
      (key) => filterStyles.includes(key) || delete charStyles[key]
    );
    if (charStyles.lineAlign) {
      // lineAlign
      let startAlign = 0,
        endAlign = this._styleMap.length;

      if (this.isEditing) {
        let textAreaLineStartEnd = this.findStartEndOfTextAreaLineFromSelection(
          start,
          end
        );

        (startAlign = textAreaLineStartEnd.start),
          (endAlign = textAreaLineStartEnd.end);
      }

      for (let i = startAlign; i <= endAlign; i++) {
        if (this._styleMap[i]) {
          this._styleMap[i] = {
            ...this._styleMap[i],
            ...{
              lineAlign: charStyles.lineAlign,
            },
          };
        }
      }
    }
    if (styleAll) {
      this.cursorStyle = {
        ...this.cursorStyle,
        ...charStyles,
      };
      if (charStyles.tracking) {
        this.cursorStyle = {
          ...this.cursorStyle,
          ...{
            tracking: Number(charStyles.tracking),
          },
        };
      }
      if (charStyles.fontSize) {
        this.cursorStyle = {
          ...this.cursorStyle,
          ...{
            fontSize: charStyles.fontSize,
          },
        };
      }
      if (charStyles.strokeWidth) {
        this.cursorStyle = {
          ...this.cursorStyle,
          ...{
            strokeWidth: charStyles.strokeWidth,
          },
        };
      }
      if (charStyles.leading) {
        this.cursorStyle = {
          ...this.cursorStyle,
          ...{
            leading:
              charStyles.leading === "auto"
                ? charStyles.leading
                : charStyles.leading,
          },
        };
      }
      if (charStyles.fontFamily) {
        this.cursorStyle = {
          ...this.cursorStyle,
          ...{
            fontFamily: charStyles.fontFamily,
          },
        };
      }
    }
    for (let i = start; i < end; i++) {
      if (this._styleMap[i]) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...charStyles,
        };
      }
      if (this._styleMap[i] && charStyles.tracking) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...{
            tracking: Number(charStyles.tracking),
          },
        };
      }
      if (this._styleMap[i] && charStyles.fontSize) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...{
            fontSize: charStyles.fontSize,
          },
        };
      }
      if (this._styleMap[i] && charStyles.strokeWidth) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...{
            strokeWidth: charStyles.strokeWidth,
          },
        };
      }
      if (this._styleMap[i] && charStyles.leading) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...{
            leading:
              charStyles.leading === "auto"
                ? charStyles.leading
                : charStyles.leading,
          },
        };
      }
      if (this._styleMap[i] && charStyles.fontFamily) {
        this._styleMap[i] = {
          ...this._styleMap[i],
          ...{
            fontFamily: charStyles.fontFamily,
          },
        };
      }
    }
    this.computeLayout();

    if (this.canvas && this.group == undefined) {
      this.canvas.requestRenderAll();
      //this.canvas.fire('object:modified', {
      //  target: this
      // })
      // this.fire('modified')

      // if (this.isEditing) {
      //   this.hiddenTextarea.focus()
      // }
    }
  },
  getClosestCharIndexAboveByCharIndex: function (charIndex) {
    return this.getClosestVCharIndexByOffsetLine(charIndex, -1);
  },
  getClosestCharIndexBelowByCharIndex: function (charIndex) {
    return this.getClosestVCharIndexByOffsetLine(charIndex, 1);
  },
  getClosestVCharIndexByOffsetLine: function (charIndex, offsetLine) {
    if (this._layout) {
      let glyph = this._layout.glyphs[this._layout.layoutToGlyph[charIndex]];

      if (!glyph) return null;

      if (offsetLine === 0) return charIndex;
      if (offsetLine < 0 && !this._layout.lines[glyph.row + offsetLine])
        return this._layout.lines[0].start;
      if (offsetLine > 0 && !this._layout.lines[glyph.row + offsetLine])
        return this._layout.lines[this._layout.lines.length - 1].end;

      let isRightSide = false;
      if (
        this._layout.lines[glyph.row].end !==
          this._layout.lines[glyph.row].start &&
        this._layout.lines[glyph.row].end === charIndex
      )
        isRightSide = true;

      charIndex = this.getClosestCharIndexToXY(
        glyph.x,
        this._layout.lines[glyph.row + offsetLine].y +
          this._layout.lines[glyph.row + offsetLine].lineHeight / 2
      );
      let charRow =
        this._layout.lines[
          this._layout.glyphs[this._layout.layoutToGlyph[charIndex]].row
        ];
      if (isRightSide && charIndex < charRow.end) charIndex++;

      return charIndex;
    }
    return null;
  },
  getClosestCharIndexToMousePointer: function (e) {
    let mousePosition = this.getLocalPointer(e);
    mousePosition.x = this.flipX
      ? this.width * this.scaleX - mousePosition.x
      : mousePosition.x;
    mousePosition.y = this.flipY
      ? this.height * this.scaleY - mousePosition.y
      : mousePosition.y;
    return this.getClosestCharIndexToXY(
      mousePosition.x / this.scaleX,
      mousePosition.y / this.scaleY
    );
  },
  getClosestCharIndexToXY: function (x, y) {
    if (this.getTextLength() === 0) {
      return 0;
    }

    if (this._layout) {
      let findLine = null;
      this._layout.lines.some((line) => {
        if (y <= line.y + line.lineHeight && y >= line.y) {
          findLine = line;
          return true;
        }
      });
      if (findLine) {
        for (let i = findLine.start; i < findLine.end; i++) {
          let currentChar = this._layout.glyphs[this._layout.layoutToGlyph[i]];
          if (!currentChar) continue;

          if (x < currentChar.x + currentChar.width / 2) {
            return currentChar.index;
          }
        }
        return findLine.end;
      } else {
        return y < this._layout.lines[0].y
          ? this._layout.lines[0].start
          : this._layout.lines[this._layout.lines.length - 1].end;
      }
    }
  },
  _computeLayout() {
    let styleMap =
      this._styleMap.length > 0 ? this._styleMap : this.cursorStyle;

    let measure = (text, start, end, width) => {
      return computeMetrics(
        styleMap,
        text,
        start,
        end,
        width,
        this.wrapMode,
        this
      );
    };

    const lines = wordWrapper.lines(this.text, {
      measure: measure,
      width: this.width,
    });

    let offset = {
      x: 0,
      y: 0,
    };
    // glyphs to render
    let glyphs = [];

    if (lines.length === 0) {
      lines.push({
        start: this.getTextLength(),
        end: this.getTextLength(),
        width: 10,
      });
    }
    this._adjustSize(lines);

    let layoutToGlyph = [];
    let yMin = null,
      yMax = null;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let line = lines[lineIndex];
      let start = line.start;
      let end = line.end;
      let lineAlign = "left";
      let lineGlyphs = [];
      let maxLineLeading = 0; // value in pt units
      let glyphWithMaxFontSize = null; // glyph object
      let lineAlignOffset = 0;

      // handle new line case
      if (start === end) {
        line.width = 10;
        let styles = styleMap[start] ? styleMap[start] : this.cursorStyle;
        let font = fabric.getFont(styles);
        if (!font) continue;
        // lineHeight in px
        lineAlign = styles.lineAlign || "left";

        if (lineAlign === "center") {
          lineAlignOffset = (this.width - line.width) / 2;
        } else if (lineAlign === "right") {
          lineAlignOffset = this.width - line.width;
        }
        line.lineHeight =
          (Math.abs(font.hhea.ascender - font.hhea.descender) /
            font.head.unitsPerEm) *
          styles.fontSize;

        line.baseLine =
          (Math.abs(font.hhea.ascender) / font.head.unitsPerEm) *
          styles.fontSize;

        let leading =
          styles.leading === "auto" ? line.lineHeight : styles.leading;

        offset.y +=
          lineIndex === 0
            ? (Math.abs(font.hhea.ascender) / font.head.unitsPerEm) *
              styles.fontSize
            : leading;
        line.y =
          offset.y -
          (Math.abs(font.hhea.ascender) / font.head.unitsPerEm) *
            styles.fontSize;

        let glyph = {
          x: lineAlignOffset,
          y: offset.y,
          lineHeight: line.lineHeight,
          baseLine: line.baseLine,
          index: start,
          row: lineIndex,
          tracking: (0 / font.head.unitsPerEm) * styles.fontSize,
          advanceWidth: 0,
          isNewLine: true,
          width: 10, // advanceWidth in px
          height:
            (Math.abs(font.hhea.descender) / font.head.unitsPerEm) *
            styles.fontSize,
          heightDetection:
            (Math.abs(font["OS/2"].sCapHeight) / font.head.unitsPerEm) *
            styles.fontSize,
          glyphWithMaxFontSize: {
            font: font,
            styles: styles,
          },
          path: null,
          styles: Object.assign({}, styles),
        };

        glyphs.push(glyph);

        yMin = Math.min(yMin, line.y);
        yMax = Math.max(yMax, offset.y);

        layoutToGlyph[start] = glyphs.length - 1;
      } else {
        for (let i = start; i < end; i++) {
          let typrGlyph = Typr.U.shape(
            fabric.getFont(this._styleMap[i]),
            this.text[i]
          )[0] || {
            g: undefined,
            cl: i,
            ax: 0,
            ay: 0,
            dx: 0,
            dy: 0,
          };
          //if (!glyph) continue
          typrGlyph.font = fabric.getFont(this._styleMap[i]);
          typrGlyph.styles = Object.assign({}, this._styleMap[i]);

          let glyph = {
            font: typrGlyph.font,
            data: typrGlyph,
            styles: Object.assign({}, this._styleMap[i]),
          };
          glyph.data.advanceWidth = typrGlyph.ax;

          // get maxFontSize / maxLeading / lineAlign
          if (
            !glyphWithMaxFontSize ||
            (Math.abs(
              glyphWithMaxFontSize.font.hhea.ascender -
                glyphWithMaxFontSize.font.hhea.descender
            ) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
              glyphWithMaxFontSize.styles.fontSize <
              (Math.abs(glyph.font.hhea.ascender - glyph.font.hhea.descender) /
                glyph.font.head.unitsPerEm) *
                glyph.styles.fontSize
          ) {
            glyphWithMaxFontSize = glyph;
          }

          lineGlyphs.push(glyph);
        }

        // lineHeight in px
        line.lineHeight =
          (Math.abs(
            glyphWithMaxFontSize.font.hhea.ascender -
              glyphWithMaxFontSize.font.hhea.descender
          ) /
            glyphWithMaxFontSize.font.head.unitsPerEm) *
          glyphWithMaxFontSize.styles.fontSize;

        line.baseLine =
          (Math.abs(glyphWithMaxFontSize.font.hhea.ascender) /
            glyphWithMaxFontSize.font.head.unitsPerEm) *
          glyphWithMaxFontSize.styles.fontSize;

        for (let i = 0; i < lineGlyphs.length; i++) {
          let currentLeading =
            lineGlyphs[i].styles.leading === "auto"
              ? line.lineHeight
              : lineGlyphs[i].styles.leading;
          maxLineLeading = Math.max(maxLineLeading, currentLeading);
          lineAlign = lineGlyphs[i].styles.lineAlign || "left";
        }
        line.lineAlign = lineAlign;

        // line offset Y from previous one
        offset.y +=
          lineIndex === 0
            ? (Math.abs(glyphWithMaxFontSize.font.hhea.ascender) /
                glyphWithMaxFontSize.font.head.unitsPerEm) *
              glyphWithMaxFontSize.styles.fontSize
            : maxLineLeading;

        // line top position in px
        line.y =
          offset.y -
          (Math.abs(glyphWithMaxFontSize.font.hhea.ascender) /
            glyphWithMaxFontSize.font.head.unitsPerEm) *
            glyphWithMaxFontSize.styles.fontSize;

        lineAlignOffset = 0;
        if (lineAlign === "center") {
          lineAlignOffset = (this.width - line.width) / 2;
        } else if (lineAlign === "right") {
          lineAlignOffset = this.width - line.width;
        }
        // set position and sizes for each glyph
        for (let i = 0, glyph = lineGlyphs; i < glyph.length; i++) {
          let glyphTracking =
            i === glyph.length - 1 ? 0 : glyph[i].styles.tracking;

          layoutToGlyph[start + i] = glyphs.length + i;

          glyph[i].x = offset.x + lineAlignOffset;
          glyph[i].y = offset.y;
          // glyph[i].y = -this.height / 2 + offset.y this is old, it works for verticalAlign
          glyph[i].offsetX = offset.x;
          glyph[i].lineHeight = line.lineHeight;
          glyph[i].baseLine = line.baseLine;
          glyph[i].index = start + i;
          glyph[i].row = lineIndex;
          glyph[i].isNewLine = false;
          glyph[i].heightDetection =
            (Math.abs(glyphWithMaxFontSize.font["OS/2"].sCapHeight) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
            glyphWithMaxFontSize.styles.fontSize;
          glyph[i].maxFontSize = glyphWithMaxFontSize.styles.fontSize; // temp, need to remove
          glyph[i].glyphWithMaxFontSize = glyphWithMaxFontSize;
          glyph[i].fontSize = glyph[i].styles.fontSize; // temp, need to remove
          glyph[i].width =
            (glyph[i].data.advanceWidth / glyph[i].font.head.unitsPerEm) *
            glyph[i].styles.fontSize;
          glyph[i].height =
            (Math.abs(glyph[i].font.hhea.descender) /
              glyph[i].font.head.unitsPerEm) *
            glyph[i].styles.fontSize;
          glyph[i].tracking =
            (glyphTracking / glyph[i].font.head.unitsPerEm) *
            glyph[i].styles.fontSize;
          glyph[i].path = true;
          offset.x +=
            ((glyphTracking + glyph[i].data.advanceWidth) /
              glyph[i].font.head.unitsPerEm) *
            glyph[i].styles.fontSize;
        }
        //add position for newline that points to last glyph
        layoutToGlyph[start + lineGlyphs.length] =
          layoutToGlyph[start + lineGlyphs.length - 1];

        yMin = Math.min(yMin, line.y);
        yMax = Math.max(yMax, offset.y);

        glyphs.push(...lineGlyphs);
      }
      // old functionality
      // handle regular cases
      offset.x = 0;
    }

    // update width, height
    this.height = 0;
    lines.forEach((line) => {
      this.height += line.lineHeight;
    });
    this.setCoords();

    let totalHeight = Math.abs(yMax - yMin);
    let verticalAlign = 0;
    switch (this.verticalAlign) {
      case "middle":
        totalHeight = Math.abs(yMax);
        verticalAlign =
          this.height >= totalHeight ? this.height / 2 - totalHeight / 2 : 0;
        break;
      case "bottom":
        verticalAlign =
          this.height >= totalHeight ? this.height - totalHeight : 0;
        break;
      default:
        verticalAlign = 0;
        break;
    }

    lines.forEach((line) => {
      line.y += verticalAlign;
    });

    glyphs.forEach((glyph) => {
      glyph.y += verticalAlign;
      if (glyph.path) {
        glyph.path = Typr.U.shapeToPath(
          glyph.font,
          [glyph.data],
          null,
          glyph,
          this
        );
      }
    });

    this._layout = {
      layoutToGlyph: layoutToGlyph,
      lines: lines,
      glyphs: glyphs,
    };
  },
  computeLayout: function () {
    this._computeLayout();
    if (this.canvas) {
      this.canvas.requestRenderAll();
    }
  },
  _adjustSize(lines) {
    let maxLineWidth = 0;
    let totalLinesHeight = 0;
    if (lines) {
      lines.forEach((line) => {
        maxLineWidth = Math.max(maxLineWidth, line.width);
      });
      this.width = maxLineWidth;

      // auto resize feature

      if (
        this.autoResize > 0 &&
        this.width * this.scaleX > this.autoResize &&
        this.isEditing
      ) {
        this._autoResizeScaleFactor =
          (this.width * this.scaleX) / this.autoResize;
        this.scaleX = this.scaleX / this._autoResizeScaleFactor;
        this.scaleY = this.scaleY / this._autoResizeScaleFactor;
        this.width = this.autoResize;
      }
    }
    if (this._layout) {
      this._layout.lines.forEach((line) => {
        totalLinesHeight += line.lineHeight;
      });
      this.height = totalLinesHeight;
    }
    this.setCoords();
  },
  drawSelection(ctx) {
    if (this.isSelection() && this.isEditing) {
      for (
        let i = this.getSelectionStart(), lastGlyphIndex = null;
        i < this.getSelectionEnd();
        i++
      ) {
        let glyphIndex = this._layout.layoutToGlyph[i];

        if (glyphIndex === lastGlyphIndex) continue;

        lastGlyphIndex = glyphIndex;
        let glyph = this._layout.glyphs[glyphIndex];

        if (
          i === this.getSelectionStart() &&
          this._layout.lines[glyph.row].end === i
        )
          continue;

        //if (Math.floor(glyph.y) > Math.floor(this.height / 2)) continue

        ctx.save();
        ctx.fillStyle = "#4FA9DD";
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        let glyphWithMaxFontSize = glyph.glyphWithMaxFontSize;
        let safeRoundXCompensator = this.getSelectionEnd() > i + 1 ? 1 : 0;
        let selectionBoundaries = {
          left: glyph.x - this.width / 2,
          top:
            glyph.y -
            (Math.abs(glyphWithMaxFontSize.font.hhea.ascender) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
              glyphWithMaxFontSize.styles.fontSize -
            this.height / 2,
          width: glyph.width + glyph.tracking + safeRoundXCompensator,
          height:
            (Math.abs(
              glyphWithMaxFontSize.font.hhea.ascender -
                glyphWithMaxFontSize.font.hhea.descender
            ) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
            glyphWithMaxFontSize.styles.fontSize,
        };
        ctx.fillRect(
          selectionBoundaries.left,
          selectionBoundaries.top,
          selectionBoundaries.width,
          selectionBoundaries.height
        );
        ctx.restore();
      }
    }
  },
  drawPathGlyph(glyph, ctx) {
    if (glyph.path) {
      if (glyph.path.crds.length > 0 || glyph.path.cmds.length > 0) {
        if (!this.fill) {
          ctx.fillStyle = glyph.styles.fill;
        }
        ctx.save();
        ctx.beginPath();
        // make sure that glyph have latest information about text size
        glyph.textSize = {
          width: this.width,
          height: this.height,
        };
        glyph.textOpacity = this.opacity;
        let usedFillCmd = Typr.U.pathToContext(glyph, ctx);
        ctx.closePath();
        ctx.restore();
        if (!usedFillCmd) {
          ctx.fill();
        }
      } else {
        if (glyph.data && glyph.font) {
          if ((glyph.font.bitmapTable || {})[glyph.data.g]) {
            (glyph.font.bitmapTable || {})[glyph.data.g].forEach((image) => {
              ctx.save();
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              ctx.globalAlpha = image.opacity;
              let x =
                glyph.x -
                this.width / 2 +
                (image.translateX / glyph.font.head.unitsPerEm) *
                  glyph.styles.fontSize;
              let y =
                glyph.y -
                this.height / 2 +
                (image.translateY / glyph.font.head.unitsPerEm) *
                  glyph.styles.fontSize;
              ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                x,
                y,
                (image.width / glyph.font.head.unitsPerEm) *
                  glyph.styles.fontSize,
                (image.height / glyph.font.head.unitsPerEm) *
                  glyph.styles.fontSize
              );
              ctx.restore();
            });
          }
        }
      }
    }
  },
  drawCursor(ctx) {
    if (this.isEditing && this.canvas) {
      let cursorIsAtEndOfLine = false;
      let glyph =
        this._layout.glyphs[
          this._layout.layoutToGlyph[this.getCursorPosition()]
        ];
      if (glyph && !this.isSelection()) {
        if (this._layout.lines[glyph.row].end === this.getCursorPosition()) {
          cursorIsAtEndOfLine = true;
        }

        ctx.save();
        ctx.fillStyle =
          Math.floor(Date.now() / 500) % 2 || this.__drawCursorNow
            ? "rgba(0,0,0,1)"
            : "transparent";
        ctx.shadowColor = "rgba(0,0,0,0)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        let glyphWithMaxFontSize = glyph.glyphWithMaxFontSize;
        let width = cursorIsAtEndOfLine && !glyph.isNewLine ? glyph.width : 0;
        let cursorPos = {
          left: glyph.x + width - this.width / 2,
          top:
            glyph.y -
            (Math.abs(glyphWithMaxFontSize.font.hhea.ascender) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
              glyphWithMaxFontSize.styles.fontSize -
            this.height / 2,
          width: 1 / this.canvas.getZoom() / Math.max(this.scaleX, this.scaleY),
          height:
            (Math.abs(
              glyphWithMaxFontSize.font.hhea.ascender -
                glyphWithMaxFontSize.font.hhea.descender
            ) /
              glyphWithMaxFontSize.font.head.unitsPerEm) *
            glyphWithMaxFontSize.styles.fontSize,
        };
        ctx.fillRect(
          cursorPos.left,
          cursorPos.top,
          cursorPos.width,
          cursorPos.height
        );
        ctx.restore();
      }
    }
    if (
      this.__drawCursorNow &&
      this.__drawCursorTime < Math.floor(Date.now() / 500)
    ) {
      this.__drawCursorNow = false;
    }
  },
  _drawAutoResizeOutline: function (ctx) {
    let isActiveObject = this.canvas && this.canvas._activeObject === this;
    if (
      ((this.autoResize > 0 && this.isEditing) ||
        this.autoResize > this.width * this.scaleX) &&
      isActiveObject
    ) {
      ctx.save();
      ctx.setLineDash([5, 15]);
      ctx.strokeStyle = "#3a86ff";
      ctx.strokeRect(
        -this.width / 2,
        -this.height / 2,
        this.autoResize / this.scaleX,
        this.height
      );
      ctx.restore();
    }
  },
  _render: function (ctx) {
    ctx.save();
    if (this._layout) {
      this.drawSelection(ctx);
      for (
        let i = 0, glyph = this._layout.glyphs;
        i < this._layout.glyphs.length;
        i++
      ) {
        this.drawPathGlyph(glyph[i], ctx);
      }
      this.drawCursor(ctx);
      this._drawAutoResizeOutline(ctx);
    }
    ctx.restore();
  },
  _toSVG: function () {
    let svgString = "";
    if (this._layout) {
      let globalGradient =
        this.fill && typeof this.fill === "object"
          ? new fabric.Gradient(this.fill.toObject())
          : null;
      let pathJoin = {
        opacity: this.opacity,
        d: "",
      };
      if (globalGradient) {
        globalGradient.coords.x1 = 0;
        globalGradient.coords.x2 = this.width;
        //globalGradient.coords.y1 = '0%'
        //globalGradient.coords.y2 = '0%'
        svgString += globalGradient.toSVG(this);
        pathJoin.fill = `url(#SVGID_${globalGradient.id})`;
      }
      for (let i = 0, glyph = this._layout.glyphs; i < glyph.length; i++) {
        if (glyph[i].path) {
          let scale =
            (1 / glyph[i].font.head.unitsPerEm) * glyph[i].styles.fontSize;
          let position = {
            x: -this.width / 2 + glyph[i].x,
            y: -this.height / 2 + glyph[i].y,
          };
          if (glyph[i].path.crds.length > 0 || glyph[i].path.cmds.length > 0) {
            let pathData = Typr.U.pathToSVG(
              glyph[i].path,
              5,
              Typr.U.pathToSVG(glyph[i].path).join("").search("X") < 0 &&
                globalGradient,
              {
                x: position.x,
                y: position.y,
                scaleX: 1 * scale,
                scaleY: -1 * scale,
              }
            );
            let pathGroup = `<g transform="translate(${position.x}, ${
              position.y
            }) scale(${1 * scale}, ${-1 * scale})">`;
            // we expect it's color path
            if (pathData.join("").search("X") > -1) {
              let paths = [];
              let d = "",
                fill,
                gradients = [];
              pathData.forEach((cmd) => {
                if (typeof cmd == "object") {
                  fill = cmd;
                } else if (cmd == "X") {
                  paths.push({
                    d: d,
                    style: fill,
                  });
                  d = "";
                  fill = null;
                } else {
                  d = d.concat(" ", cmd);
                }
              });
              paths.forEach((path) => {
                let fill =
                  typeof path.style.fill == "object"
                    ? `url(#${path.style.fill.id}path${i})`
                    : path.style.fill;
                if (typeof path.style.fill == "object") {
                  if (
                    !gradients.some(
                      (gradient) =>
                        gradient.id == `${path.style.fill.id}path${i}`
                    )
                  ) {
                    path.style.fill.id = `${path.style.fill.id}path${i}`;
                    gradients.push(path.style.fill);
                  }
                }
                pathGroup += `<path fill-opacity="${path.style.opacity}" d="${path.d}" fill="${fill}" />`;
              });
              gradients.forEach((gradient) => {
                if (gradient.type == "linearGradient") {
                  let coords = {
                    x1:
                      parseFloat(gradient.x1) * gradient.gradientTransform[0] +
                      gradient.gradientTransform[4],
                    y1:
                      -parseFloat(gradient.y1) * gradient.gradientTransform[3] -
                      gradient.gradientTransform[5],
                    x2:
                      parseFloat(gradient.x2) * gradient.gradientTransform[0] +
                      gradient.gradientTransform[4],
                    y2:
                      -parseFloat(gradient.y2) * gradient.gradientTransform[3] -
                      gradient.gradientTransform[5],
                  };
                  let gradientString = `<linearGradient id="${gradient.id}" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" gradientUnits="userSpaceOnUse" > \n`;
                  gradient.stops.forEach((stop) => {
                    gradientString += `<stop offset="${stop["offset"]}" stop-color="${stop["stop-color"]}" stop-opacity="${stop["stop-opacity"]}" />`;
                  });
                  gradientString += `</linearGradient>`;
                  pathGroup += gradientString; // pathGroup.replace(/^/, gradientString)
                } else if (gradient.type == "radialGradient") {
                  let coords = {
                    fx:
                      parseFloat(gradient.fx) * gradient.gradientTransform[0] +
                      gradient.gradientTransform[4],
                    fy:
                      -parseFloat(gradient.fy) * gradient.gradientTransform[3] -
                      gradient.gradientTransform[5],
                    fr: parseFloat(gradient.fr),
                    cx:
                      parseFloat(gradient.cx) * gradient.gradientTransform[0] +
                      gradient.gradientTransform[4],
                    cy:
                      -parseFloat(gradient.cy) * gradient.gradientTransform[3] -
                      gradient.gradientTransform[5],
                    r: parseFloat(gradient.r),
                  };
                  let gradientString = `<radialGradient id="${gradient.id}" fx="${coords.fx}" fy="${coords.fy}" fr="${coords.fr}" cx="${coords.cx}" cy="${coords.cy}" r="${coords.r}" gradientUnits="userSpaceOnUse" > \n`;
                  gradient.stops.forEach((stop) => {
                    gradientString += `<stop offset="${stop["offset"]}" stop-color="${stop["stop-color"]}" stop-opacity="${stop["stop-opacity"]}" />`;
                  });
                  gradientString += `</radialGradient>`;
                  pathGroup += gradientString;
                }
              });
            } else {
              // we expect it's simple path
              if (globalGradient) {
                pathJoin.d += pathData.join("");
              } else {
                pathGroup += `<path opacity="${
                  this.opacity
                }" d="${pathData.join("")}" fill="${
                  globalGradient
                    ? `url(#SVGID_${globalGradient.id})`
                    : glyph[i].styles.fill || "none"
                }" />`;
              }
            }
            pathGroup += "</g>";
            svgString += pathGroup;
          } else {
            // we expect it's bitmap
            if (glyph[i].data && glyph[i].font) {
              if ((glyph[i].font.bitmapTable || {})[glyph[i].data.g]) {
                (glyph[i].font.bitmapTable || {})[glyph[i].data.g].forEach(
                  (image) => {
                    let x =
                      glyph[i].x -
                      this.width / 2 +
                      (image.translateX / glyph[i].font.head.unitsPerEm) *
                        glyph[i].styles.fontSize;
                    let y =
                      glyph[i].y -
                      this.height / 2 +
                      (image.translateY / glyph[i].font.head.unitsPerEm) *
                        glyph[i].styles.fontSize;
                    svgString += `<image opacity="${
                      image.opacity
                    }" x="${x}" y="${y}" width="${
                      (image.width / glyph[i].font.head.unitsPerEm) *
                      glyph[i].styles.fontSize
                    }" height="${
                      (image.height / glyph[i].font.head.unitsPerEm) *
                      glyph[i].styles.fontSize
                    }" xlink:href="${image.src}" />`;
                  }
                );
              }
            }
          }
        }
      }
      if (globalGradient) {
        svgString += `<path opacity="${pathJoin.opacity}" d="${pathJoin.d}" fill="${pathJoin.fill}" />`;
      }
    }
    return [svgString];
  },
  toObject: function (propertiesToInclude, makeAbsoluteCoordinates = false) {
    return {
      type: this.type,
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      verticalAlign: this.verticalAlign,
      ui: this.ui || {},
      lockEditing: this.lockEditing,
      lockMovementX: this.lockMovementX,
      lockMovementY: this.lockMovementY,
      lockScalingX: this.lockScalingX,
      lockScalingY: this.lockScalingY,
      lockRotation: this.lockRotation,
      autoResize: this.autoResize,
      //_styleMap: this._styleMap,
      text: this.text,
      fill: this.fill && this.fill.toObject(),
      scaleX: this.scaleX,
      scaleY: this.scaleY,
      textMarkup: this.getTextMarkup(),
      angle: this.angle,
      opacity: this.opacity,
      shadow: this.shadow,
      isEditing: this.isEditing,
      cursorPosition: this.cursorPosition,
    };
  },
  getTextMarkup: function () {
    let lastUsedStyles = Object.assign({}, this._fallbackStyles);
    let tagString = "";

    for (let i = 0; i < this.getTextLength(); i++) {
      let charStyle = Object.assign({}, this._styleMap[i]);
      let stylesDiff = [];
      let stylesString = "";
      if (charStyle) {
        Object.keys(lastUsedStyles).forEach((key) => {
          if (lastUsedStyles[key] !== charStyle[key]) {
            lastUsedStyles[key] = charStyle[key];
            stylesDiff.push(key);
          }
        });
      }
      if (stylesDiff.length > 0) {
        let tagStyles = [];
        stylesDiff.forEach((style) => {
          if (
            (style === "fontSize" ||
              style === "strokeWidth" ||
              style === "leading") &&
            (typeof charStyle[style] !== "string" ||
              charStyle[style].toLowerCase() !== "auto")
          ) {
            tagStyles.push(`${style}="${Number(charStyle[style])}"`);
          } else {
            tagStyles.push(`${style}="${charStyle[style]}"`);
          }
        });
        stylesString += "<" + tagStyles.join(" ") + ">";
      }
      // fabric.window.encodeURI(this._text[i])
      // temp placeholder
      let charToAdd = /<|>/g.test(this.text[i]) ? "" : this.text[i]; // dirty hack, need to replace
      tagString += `${stylesString}${charToAdd}`;
    }
    return tagString;
  },
  transformTextMarkup() {
    this.textMarkup = this.textMarkup || "";
    this.text = this.textMarkup.replace(/\<.*?\>/g, "");
    let styleRegex = /<|>/g;
    let styleRegexMatch;
    let segments = [];
    let styleBlocks = [];
    let actualCharIndex = 0;
    while ((styleRegexMatch = styleRegex.exec(this.textMarkup))) {
      segments.push(styleRegexMatch.index);
    }
    for (let i = 0; i < segments.length; i += 2) {
      actualCharIndex +=
        i === 0 ? segments[i] : segments[i] - (segments[i - 1] + 1);
      //let styleString = this.textMarkup.substring(segments[i] + 1, segments[i + 1])
      let styleAttributes = attributes(
        this.textMarkup.substring(segments[i] + 1, segments[i + 1])
      );
      Object.keys(styleAttributes).forEach((key) => {
        if (key === "fontSize" || key === "strokeWidth" || key === "leading") {
          styleAttributes[key] =
            typeof styleAttributes[key] === "string" &&
            styleAttributes[key].toLowerCase() === "auto"
              ? styleAttributes[key]
              : styleAttributes[key];
        }
      });
      styleBlocks.push({
        styles: styleAttributes,
        index: actualCharIndex,
      });
    }
    // generate new _styleMap
    this._styleMap = [];
    let cursorStyle = Object.assign({}, this._fallbackStyles);
    for (let i = 0; i < this.getTextLength(); i++) {
      styleBlocks.forEach((block) => {
        if (block.index === i) {
          cursorStyle = {
            ...cursorStyle,
            ...block.styles,
          };
        }
      });
      this._styleMap.push(Object.assign({}, cursorStyle));
    }
  },
  getCompleteStyle: function (styleName) {
    let startIndex = this.isEditing ? this.getSelectionStart() : 0;
    let endIndex = this.isEditing
      ? this.getSelectionEnd()
      : this.getTextLength();

    if (startIndex === endIndex) return this.cursorStyle[styleName] || false;

    let firstStyleOfSelection = this._styleMap[startIndex]
      ? this._styleMap[startIndex][styleName]
      : "Mixed";
    for (let i = startIndex; i < endIndex; i++) {
      let currentStyleOfSelection = this._styleMap[i]
        ? this._styleMap[i][styleName]
        : "Mixed";
      if (firstStyleOfSelection !== currentStyleOfSelection) {
        return "Mixed";
      }
    }
    return firstStyleOfSelection;
  },
  getSelectedText() {
    return this.text.slice(this.getSelectionStart(), this.getSelectionEnd());
  },
  getUIStyles: function () {
    return {
      type: this.type,
      shadow: this.shadow || {},
      verticalAlign: this.verticalAlign,
      lockUniResizing: this.lockUniResizing,
      fontFamily: this.getCompleteStyle("fontFamily"),
      fontStyle: this.getCompleteStyle("fontStyle"),
      fontSize:
        typeof this.getCompleteStyle("fontSize") === "string"
          ? this.getCompleteStyle("fontSize")
          : this.getCompleteStyle("fontSize"),
      fill:
        this.getCompleteStyle("fill") === "Mixed"
          ? "#000000"
          : this.getCompleteStyle("fill"),
      strokeColor: this.getCompleteStyle("strokeColor"),
      strokeWidth:
        typeof this.getCompleteStyle("strokeWidth") === "string"
          ? this.getCompleteStyle("strokeWidth")
          : Number(this.getCompleteStyle("strokeWidth")),
      tracking:
        this.getCompleteStyle("tracking") === false
          ? 0
          : this.getCompleteStyle("tracking") === "Mixed"
          ? 0
          : this.getCompleteStyle("tracking"),
      leading:
        typeof this.getCompleteStyle("leading") === "string"
          ? this.getCompleteStyle("leading")
          : Number(this.getCompleteStyle("leading")),
      lineAlign: this.getCompleteStyle("lineAlign"),
      underline: this.getCompleteStyle("underline"),
      opacity: this.opacity,
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
    };
  },
});
fabric.StaticText.fromObject = function (object, callback) {
  return fabric.Object._fromObject("StaticText", object, callback);
};
export default fabric.StaticText;
