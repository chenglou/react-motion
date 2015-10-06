import isEqual from 'lodash.isequal';
import {diffLines} from 'diff';
import {green, red, grey} from 'colors-mini';


const noCircularReplacer = obj => {
  const cache = [];

  const noCircular = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found
        return '[*RECURSION*]';
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  };

  return JSON.parse(JSON.stringify(obj, noCircular));
};


const json = obj => JSON.stringify(noCircularReplacer(obj), null, '  ');


const prettyMatcher = () => ({
  compare: (actual, expected) => {
    const result = {
      pass: isEqual(actual, expected),
    };

    const diff = diffLines(json(actual), json(expected));

    const strExpected = diff.map(part =>
      part.added ? '' : (part.removed ? green(part.value) : grey(part.value))).join('');

    const strActual = diff.map(part =>
      part.added ? red(part.value) : (part.removed ? '' : grey(part.value))).join('');

    if (result.pass) {
      result.message = `Expected ${strExpected} not to equal ${strActual}`;
    } else {
      result.message = `Expected ${strExpected} to equal ${strActual}`;
    }

    return result;
  },
});

export default prettyMatcher;
