// When a click on a modal window's dimmed backdrop should close it (used by src/scripts/sheet.ts).
//
// A click on the backdrop is reported with the <dialog> element itself as its target, but so are clicks on empty space
// inside the window, and so is any press that starts in one place and ends in another (selecting text and letting go
// outside the window). Closing on all of those made modals shut while people were working in them. The window closes
// only when the press began on the backdrop and the click ended on the backdrop.

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** True when the point is beyond the window's box. The box's own edge counts as inside. */
export const isOutside = (box: Box, x: number, y: number): boolean => x < box.left || x > box.right || y < box.top || y > box.bottom;

export interface BackdropClick {
  pressedOutside: boolean; // the pointer went down outside the window's box
  onDialogItself: boolean; // the click's target is the dialog element, not something inside it
  box: Box;
  x: number;
  y: number;
}

export const closesOnBackdrop = ({ pressedOutside, onDialogItself, box, x, y }: BackdropClick): boolean =>
  pressedOutside && onDialogItself && isOutside(box, x, y);
