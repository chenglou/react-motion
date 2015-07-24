// Just like Array.prototype.filter, but passes third argument as the first
// argument to the callback. This is to allocating an inline callback (that
// refers to something outside as a closure) in the filter call.
export default function filter(array, callback, argument) {
  const ret = [];
  let index = 0;

  // Don’t cache array.length since we want to iterate
  // over items that might be added during filtering.
  while (index < array.length) {
    if (callback(argument, array[index], index, array)) {
      ret.push(array[index]);
    }
    index++;
  }

  return ret;
}
