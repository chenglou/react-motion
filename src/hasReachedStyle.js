/* @flow */
export default function hasReachedStyle(currentStyle: Object,
                                        style: Object): boolean {
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    const currentValue = currentStyle[key];
    const destValue = style[key];
    if (destValue == null || !destValue.config) {
      // not a spring config
      continue;
    }
    if (currentValue.config && currentValue.val !== destValue.val) {
      return false;
    }
    if (!currentValue.config && currentValue !== destValue.val) {
      return false;
    }
  }

  return true;
}
