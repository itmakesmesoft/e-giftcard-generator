export const clearTextSelection = () => {
  window.getSelection()?.removeAllRanges();
};
