fridgewords
===========
A project created for [CodeMash 2014](http://www.codemash.org/) to demostrate frontend organization with gulp.js.

Install and run
------------
If you don't have bower and gulp installed globally, install those:
```bash
npm install -g bower
npm install -g gulp
```

Install dependencies
```bash
npm install
bower install
```

Compile assets
```bash
gulp
```

Run the node server
```bash
node index.js
```

Both `gulp` and `node index.js` respect the NODE_ENV environment variable. Setting it to development will produce unminified assets and source maps.
