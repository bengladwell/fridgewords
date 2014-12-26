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
  livereload = require('gulp-livereload');

gulp.task('less', function () {
  return gulp.src('less/app.less')
    .pipe(less({
      paths: [ 'bower_components/bootstrap/less/' ]
    }))
    .pipe(gulp.dest('public/css/'));
});

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

gulp.task('watch', ['browserify', 'less'], function () {
  gulp.watch(['client/**/*.js'], [ 'browserify' ]);
  gulp.watch('less/**/*.less', [ 'less' ]);
  gulp.watch('templates/**/*.hbs', [ 'templates' ]);
  livereload.listen();
  gulp.watch('public/**').on('change', livereload.changed);
});
