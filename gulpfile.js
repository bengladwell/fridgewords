"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  mbf = require('main-bower-files'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  browserify = require('gulp-browserify'),
  handlebars = require('gulp-handlebars'),
  wrap = require('gulp-wrap'),
  less = require('gulp-less'),
  livereload = require('gulp-livereload'),
  jshint = require('gulp-jshint');

gulp.task('jshint', function () {
  return gulp.src(['src/js/**/*.js', '!src/js/templates/**/*.js'])
    .pipe(jshint(process.env.NODE_ENV === 'development' ? {devel: true, debug: true} : {}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('less', function () {
  return gulp.src('src/less/app.less')
    .pipe(less({
      paths: [ 'bower_components/bootstrap/less/' ]
    }))
    .pipe(gulp.dest('public/css/'));
});

gulp.task('templates', function () {
  return gulp.src('src/hbs/**/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('module.exports = Handlebars.template(<%= contents %>);'))
    .pipe(gulp.dest('src/js/templates/'));
});

gulp.task('browserify', ['jshint', 'templates'], function () {
  if (process.env.NODE_ENV === 'development') {
    return gulp.src(['src/js/app.js'])
      .pipe(browserify({
        debug: true
      }))
      .pipe(gulp.dest('public/js/'));
  }

  // else not development
  return gulp.src(['src/js/app.js'])
    .pipe(browserify())
    .pipe(gulp.dest('public/js/'));
});

gulp.task('browserify-no-templates', ['jshint'], function () {
  return gulp.src(['src/js/app.js'])
    .pipe(browserify({
      debug: true
    }))
    .pipe(gulp.dest('public/js/'));
});

gulp.task('tests', function () {
  return gulp.src([ 'src/js/tests/**/*.js' ])
    .pipe(jshint({devel: true, debug: true}))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    // putting all of our tests together in a single file like this prevents dependency duplication when browserified;
    // it also messes up require(...) relative paths; all paths assumed to begin from src/js/tests/
    .pipe(concat('tests.js'))
    .pipe(wrap('var expect = window.chai.expect; <%= contents %>'))
    .pipe(browserify({
      debug: true
    }))
    .pipe(gulp.dest('tmp/'));
});

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
  gulp.src(mbf().filter(function (f) { return f.substr(-2) === 'js'; }))
    .pipe(concat(process.env.NODE_ENV === 'development' ? 'vendor.js' : 'vendor.min.js'))
    .pipe(gulp.dest('public/js/'));
});

gulp.task('watch', ['browserify', 'less', 'tests'], function () {
  gulp.watch(['src/js/**/*.js', '!src/js/tests/**/*.js'], [ 'browserify-no-templates', 'tests' ]);
  gulp.watch('src/js/tests/**/*.js', [ 'tests' ]);
  gulp.watch('src/less/**/*.less', [ 'less' ]);
  gulp.watch('src/hbs/**/*.hbs', [ 'templates' ]);
  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);
});

gulp.task('default', ['bower', 'browserify', 'less']);
