// Just like Array.prototype.filter, but passes third argument as the first
// argument to the callback. This is to allocating an inline callback (that
// refers to something outside as a closure) in the filter call.
export default function filter(array, callback, argument) {
  const ret = [];
  const len = array.length;
  let index = 0;

  while (index < len) {
    if (callback(argument, array[index], index, array)) {
      ret.push(array[index]);
    }
    index++;
  }

  return ret;
}
