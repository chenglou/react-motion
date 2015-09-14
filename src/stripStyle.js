// turn {x: {val: 1, config: [1, 2]}, y: 2} into {x: 1, y: 2}
export default function stripStyle(style) {
  let ret = {};
  for (let key in style) {
    if (!style.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = style[key].val == null ? style[key] : style[key].val;
  }
  return ret;
}
