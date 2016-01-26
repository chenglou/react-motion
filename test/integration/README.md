Simple folder for testing whether the release worked or not.

Please run this:
```
rm -rf bower_components
rm -rf node_modules
bower install
npm install
node -e 'console.log(require("react-motion"))'
```

Check that the output of that looks normal.

For Bower, please also open up bower.html
