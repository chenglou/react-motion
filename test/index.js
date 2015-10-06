import prettyMatcher from './prettyMatcher';

beforeEach(() => jasmine.addMatchers({toEqual: prettyMatcher}));

const testsContext = require.context('./', true, /\-test\.js$/);

testsContext.keys().forEach(testsContext);
