export default function hasReachedStyle(currentStyle, style) {
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    if (style[key].config) {
      if (currentStyle[key].val !== style[key].val) {
        return false;
      }
    }
  }

  return true;
}
