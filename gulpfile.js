"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  mbf = require('main-bower-files'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  browserify = require('gulp-browserify'),
  handlebars = require('gulp-handlebars'),
  wrap = require('gulp-wrap');

gulp.task('templates', function () {
  return gulp.src('templates/**/*.hbs')
    .pipe(handlebars())
    .pipe(wrap('module.exports = Handlebars.template(<%= contents %>);'))
    .pipe(gulp.dest('client/templates/'));
});

gulp.task('browserify', ['templates'], function () {
  return gulp.src(['client/app.js'])
    .pipe(browserify({
      debug: true
    }))
    .pipe(gulp.dest('public/js/'));
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
  cb();
});

gulp.task('bower', ['vendor'], function () {
  gulp.src(mbf().filter(function (f) { return f.substr(-2) === 'js'; }))
    .pipe(concat(process.env.NODE_ENV === 'development' ? 'vendor.js' : 'vendor.min.js'))
    .pipe(gulp.dest('public/js/'));
});
