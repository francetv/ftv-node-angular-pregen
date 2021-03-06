/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 France Télévisions
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sequence = require('run-sequence');
var concat = require('gulp-concat');
var bower = require('gulp-bower');
var template = require('gulp-angular-templatecache');
var htmlmin = require('gulp-htmlmin');

var js = {
    dest: './demo/static',
    'app': {
        name: 'app.js',
        files: [
            'demo/app.js',
        ]
    },
    'required-pregen-lib': {
        name: 'required-pregen-lib.js',
        files: [
            "./demo/bower_components/angular/angular.min.js",
            "./demo/bower_components/angular-route/angular-route.min.js"
        ]
    },
    templates: {
        name: 'templates.js',
        files: [
            'demo/static/**/*.html'
        ]
    },
};

gulp.task('js-lint', function() {
    return gulp.src([
        'angular-pregen.js',
        'angular-context.js',
        'ngoverrides.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('js-required-pregen', function() {
    return gulp.src(js['required-pregen-lib'].files)
        .pipe(concat(js['required-pregen-lib'].name))
        .pipe(gulp.dest(js.dest));
});

gulp.task('js-template', function () {
    return gulp.src(js.templates.files)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(template(js.templates.name, { module:'templatescache', standalone:true }))
        .pipe(gulp.dest(js.dest));
});

gulp.task('js-app', function() {
    var files = js.app.files;
    files.push(js.dest + '/' + js.templates.name);

    return gulp.src(files)
        .pipe(concat(js.app.name))
        .pipe(gulp.dest(js.dest));
});

gulp.task('angular-route-map', function() {
    return gulp.src('./demo/bower_components/angular-route/angular-route.min.js.map')
        .pipe(gulp.dest(js.dest));
});

gulp.task('demo', function(callback) {
    sequence('bower', 'js-required-pregen', 'angular-route-map', 'js-template', 'js-app', callback);
});

gulp.task('bower', function() {
    return bower();
});