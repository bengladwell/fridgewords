/*jshint node:true*/
"use strict";

var _ = require('underscore'),
  path = require('path'),
  gulp = require('gulp'),
  concat = require('gulp-concat'),

  // used to get a list of the "main" files listed in each bower component's
  // bower.json file
  mbf = require('main-bower-files'),

  // minification
  uglify = require('gulp-uglify'),

  rename = require('gulp-rename'),

  // no longer using the gulp-browserify plugin; it is deprecated :(
  browserify = require('browserify'),
  transform = require('vinyl-transform'),

  // gulp-wrap used to wrap compiled handlebars templates in CommonJS module.exports
  handlebars = require('gulp-handlebars'),
  wrap = require('gulp-wrap'),

  less = require('gulp-less'),

  livereload = require('gulp-livereload'),

  jshint = require('gulp-jshint'),

  // keep stream error events from killing our watch task
  plumber = require('gulp-plumber'),

  // stuff needed for our watchify task
  map = require('map-stream'),
  source = require('vinyl-source-stream'),
  glob = require('glob'),

  util = require('gulp-util');

gulp.task('jshint', function () {
  return gulp.src(['src/js/**/*.js', '!src/js/templates/**/*.js'])
    .pipe(plumber())
    // allow console.log / debugger statements by using NODE_ENV=development
    .pipe(jshint(process.env.NODE_ENV === 'development' ? {devel: true, debug: true} : {}))
    // jshint-stylish not `require`d above, but has been installed with `npm install --save-dev jshint-stylish`
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('less', function () {
  return gulp.src('src/less/app.less')
    .pipe(plumber())
    .pipe(less({
      // look in bootstrap's less directory when processing @import statements
      paths: [ 'bower_components/bootstrap/less/' ]
    }))
    .pipe(gulp.dest('public/css/'));
});

gulp.task('templates', function () {
  return gulp.src('src/hbs/**/*.hbs')
    .pipe(plumber())
    .pipe(handlebars())
    .pipe(wrap('module.exports = Handlebars.template(<%= contents %>);'))
    .pipe(gulp.dest('src/js/templates/'));
});

gulp.task('browserify', ['jshint', 'templates'], function () {
  var isDev = process.env.NODE_ENV === 'development';

  // for NODE_ENV=development, add sourcemaps, don't minify
  return gulp.src(['src/js/app.js'])
    .pipe(plumber())
    .pipe(transform(function (f) {
      return browserify({
        entries: f,
        // sourcemaps for free!
        debug: isDev
      }).bundle();
    }))
    .pipe(isDev ? util.noop() : uglify()) // util.noop() simply passes through whatever is sent to it
    .pipe(gulp.dest('public/js/'));

});

// this is a duplicate of the browserify task above (development version), simply without the templates dependency;
// we're doing this to avoid running the templates task twice every time an hbs file changes in the watch task;
// it seems like there should be a better way to handle this :)
gulp.task('browserify-no-templates', ['jshint'], function () {
  return gulp.src(['src/js/app.js'])
    .pipe(plumber())
    .pipe(transform(function (f) {
      return browserify({
        entries: f,
        debug: true
      }).bundle();
    }))
    .pipe(gulp.dest('public/js/'));
});

// browserify each test file;
// destination is tmp/ because only our test runner needs access to those files
gulp.task('tests', function () {
  return gulp.src([ 'src/js/tests/**/*.js' ])
    .pipe(plumber())
    .pipe(jshint({devel: true, debug: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(transform(function (f) {
      return browserify({
        entries: f,
        debug: true
      }).bundle();
    }))
    .pipe(gulp.dest('tmp/'));
});

// create/cp some assets that we need
// the bower task runs this task first
gulp.task('vendor', function (cb) {

  // create missing minified ashkenas scripts
  gulp.src('bower_components/underscore/underscore.js')
    .pipe(uglify())
    .pipe(rename('underscore.min.js'))
    .pipe(gulp.dest('bower_components/underscore/'));
  gulp.src('bower_components/backbone/backbone.js')
    .pipe(uglify())
    .pipe(rename('backbone.min.js'))
    .pipe(gulp.dest('bower_components/backbone/'));

  // bootstrap fonts
  gulp.src('bower_components/bootstrap/fonts/*')
    .pipe(gulp.dest('public/fonts/vendor/bootstrap/'));

  cb();
});

gulp.task('bower', ['vendor'], function () {
  // use main-bower-files to get a list of "main" files from each bower_component's bower.json file;
  // filter to only include .js files;
  // main-bower-files will use the NODE_ENV environment variable in conjunction with the overrides in
  // bower.json to determine which main file to use;
  // bower.json has been setup with overrides to use the minified version for production, non-minified
  // for development (see bower.json)
  gulp.src(mbf().filter(function (f) { return f.substr(-2) === 'js'; }))
    .pipe(concat(process.env.NODE_ENV === 'development' ? 'vendor.js' : 'vendor.min.js'))
    .pipe(gulp.dest('public/js/'));
});

gulp.task('watch', ['browserify', 'less', 'tests'], function () {
  // rebuild tests as well as our app.js browserified asset; changed js code means the tests need re-assembled
  gulp.watch(['src/js/**/*.js', '!src/js/tests/**/*.js'], [ 'browserify-no-templates', 'tests' ]);
  gulp.watch('src/js/tests/**/*.js', [ 'tests' ]);
  gulp.watch('src/less/**/*.less', [ 'less' ]);
  gulp.watch('src/hbs/**/*.hbs', [ 'templates' ]);
  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);
});

// a much faster and much more complicated approach to auto rebuild and live reload using watchify;
// only those test files that actually have changed dependencies will be rebuilt and reloaded;
// Note: builds are not actually interrupted on jshint errors
gulp.task('watchify', ['templates', 'less', 'jshint'], function () {
  var watchify = require('watchify'),
    lintFiles = function (files) {
      gulp.src(files)
        .pipe(map(function (file, cb) {
          if (file.path.match(/src\/js\/templates\//)) {
            cb();
          } else {
            cb(null, file);
          }
        }))
        .pipe(jshint({devel: true, debug: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(map(function (file, cb) {
          if (!file.jshint.success) {
            util.beep();
          }
          cb(null, file);
        }));
    };

  gulp.watch('src/less/**/*.less', [ 'less' ]);
  gulp.watch('src/hbs/**/*.hbs', [ 'templates' ]);

  _.each(['src/js/app.js'], function (entry) {
    var bundler = watchify(browserify({
      entries: path.join(__dirname, entry),
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true
    })),
      update = function (files) {
        if (files) {
          lintFiles(files);
        }
        util.log(util.colors.blue(entry) + ' was bundled.');
        return bundler.bundle()
          .on('error', util.log.bind(util, 'Browserify Error'))
          .pipe(source(path.basename(entry)))
          .pipe(gulp.dest('public/js/'));
      };
    bundler.on('update', update);
    update();
  });

  _.each(glob.sync('src/js/tests/unit/**/*.js'), function (entry) {
    var bundler = watchify(browserify({
      entries: path.join(__dirname, entry),
      debug: true,
      cache: {},
      packageCache: {},
      fullPaths: true
    })),
      update = function (files) {
        var f = entry.match(/^src\/js\/tests\/unit\/(.+)$/);
        if (files) {
          lintFiles(files);
        }
        util.log(util.colors.blue('src/js/tests/unit/' + f[1]) + ' was bundled.');
        return bundler.bundle()
          .on('error', util.log.bind(util, 'Browserify Error'))
          .pipe(source(f[1]))
          .pipe(gulp.dest('tmp/'));
      };
    bundler.on('update', update);
    update();
  });

  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);

});

// the tasks below have dependent tasks; these three parent tasks should kick off everything we need to build
// the project
gulp.task('default', ['bower', 'browserify', 'less']);
