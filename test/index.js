require('@babel/polyfill');

const testsContext = require.context('./', true, /-test\.js$/);

testsContext.keys().forEach(testsContext);
