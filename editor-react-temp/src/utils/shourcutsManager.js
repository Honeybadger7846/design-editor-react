class ShortcutManager {
  //delete
  isDelete(event) {
      return event.key === 'Delete';
  }
  // save or update template
  isCtrlS(event) {
      return event.ctrlKey && event.code === 'KeyS';
  }
  // select all
  isCtrlA(event) {
      return event.ctrlKey && event.code === 'KeyA';
  }
  // copy
  isCtrlC(event) {
      return event.ctrlKey && event.code === 'KeyC';
  }
  // paste
  isCtrlV(event) {
      return event.ctrlKey && event.code === 'KeyV';
  }
  // redo
  isCtrlY(event) {
      return event.ctrlKey && event.code === 'KeyY';
  }
  // cut
  isCtrlX(event) {
      return event.ctrlKey && event.code === 'KeyX';
  }
  // nudge
  isArrowUp(event) {
      return event.code === 'ArrowUp';
  }
  // nudge
  isArrowDown(event) {
      return event.code === 'ArrowDown';
  }
  // nudge
  isArrowLeft(event) {
      return event.code === 'ArrowLeft';
  }
  // nudge
  isArrowRight(event) {
      return event.code === 'ArrowRight';
  }
  // modifier
  isShift(event) {
      return event.shiftKey;
  }
  // lineHeight--
  isAltDown(event) {
      return event.altKey && event.code === 'ArrowDown';
  }
  // lineHeight++
  isAltUp(event) {
      return event.altKey && event.code === 'ArrowUp';
  }
  // charSpacing++
  isAltRight(event) {
      return event.altKey && event.code === 'ArrowRight';
  }
  // charSpacing--
  isAltLeft(event) {
      return event.altKey && event.code === 'ArrowLeft';
  }
  // redo
  isCtrlShiftZ(event) {
      return event.ctrlKey && event.shiftKey && event.code === 'KeyZ';
  }
  // undo
  isCtrlZ(event) {
      return event.ctrlKey && !event.shiftKey && event.code === 'KeyZ';
  }
  // zoom reset
  isCtrlOne(event) {
      return event.ctrlKey && event.key === '1';
  }
  // zoom in
  isCtrlMinus(event) {
      return event.ctrlKey && event.key === '-';
  }
  // zoom out
  isCtrlEqual(event) {
      return event.ctrlKey && event.key === '=';
  }
  // zoom to fit
  isCtrlZero(event) {
      return event.ctrlKey && event.key === '0';
  }
}
export default new ShortcutManager();