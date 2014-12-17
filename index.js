"use strict";

var express = require('express'),
  serveStatic = require('serve-static'),
  hbs = require('express-hbs'),
  app = express();

app.engine('hbs', hbs.express3());
app.set('views', __dirname + '/server/views');
app.set('view engine', 'hbs');

app.use(serveStatic(__dirname + '/public'));

if (app.get('env') === 'development') {
  app.use(require('connect-livereload')());
}

app.get('/*', function (req, res, next) {
  res.render('app', {
    isDev: app.get('env') === 'development'
  });
});

app.listen(3000, 'localhost', function () {
  console.log('Listening at http://localhost:3000');
});
