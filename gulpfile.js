'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var argv = require('yargs').argv;

var isDist = argv.dist;
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
  sass: 'src/style/**/*.scss',
  templates: 'src/templates/**/*.jade',
  assets: [
    'src/assets/**/*.*',
    'vendor/angular-material/angular-material.min.css',
    'vendor/angular-chart.js/dist/angular-chart.min.css',
    'vendor/iframe-resizer/js/iframeResizer.min.js'],
  app: 'src/app/**/*.ts',
  // karma typescript preprocessor generates a bunch of .ktp.ts which gets picked
  // up by the watch, rinse and repeat
  appWithDefinitions: ['src/**/*.ts', '!src/**/*.ktp.*'],
  index: 'src/index.jade'
};

var destinations = {
  css: outputFolder + "/style",
  js: outputFolder + "/src",
  libs: outputFolder + "/vendor",
  assets: outputFolder + "/assets",
  index: outputFolder
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = [
  'vendor/angular/angular.js',
  'vendor/angular-aria/angular-aria.js',
  'vendor/angular-animate/angular-animate.js',
  'vendor/angular-material/angular-material.js',
  'vendor/Chart.js/Chart.js',
  'vendor/angular-chart.js/dist/angular-chart.js',
  'vendor/iframe-resizer/js/iframeResizer.contentWindow.js'
];

// Will be filled automatically
var vendoredLibsMin = [];

var injectLibsPaths = {
  dev: [],
  dist: []
};

var injectPaths = {
  dev: [],
  dist: []
};

vendoredLibs.forEach(function(lib) {
  // take the filename
  var splittedPath = lib.split('/');
  var filename = splittedPath[splittedPath.length -1];
  injectLibsPaths.dev.push(destinations.libs + '/' + filename);
  // And get the minified version
  filename = filename.replace(/\.[^/.]+$/, "") + '.min.js';
  splittedPath[splittedPath.length - 1] = filename;
  vendoredLibsMin.push(splittedPath.join('/'));
  injectLibsPaths.dist.push(destinations.libs + '/' + filename);
});

['dev', 'dist'].forEach(function (env) {
  injectPaths[env] = injectLibsPaths[env].concat([
    destinations.js + "/app/**/module.js",
    isDist ? destinations.js + '/app.js' : destinations.js + "/app/**/*.js",
    destinations.js + "/templates.js",
    destinations.css + "/*.css"
  ]);
});

var tsProject = $.typescript.createProject({
  declarationFiles: true,
  noExternalResolve: true
});


gulp.task('sass', function () {
  return gulp.src(globs.sass)
    .pipe($.sass({style: 'compressed'}).on('error', $.sass.logError))
    .pipe($.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
    .pipe(gulp.dest(destinations.css))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('ts-lint', function () {
  return gulp.src(globs.app)
    .pipe($.tslint())
    .pipe($.tslint.report('prose', {emitError: false}));
});

gulp.task('ts-compile', function () {
  var tsResult = gulp.src(globs.appWithDefinitions)
    .pipe($.typescript(tsProject));

  return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
    .pipe($.ngAnnotate({gulpWarnings: false}))
    .pipe(isDist ? $.uglify() : $.util.noop())
    .pipe($.wrap('(function(){<%= contents %>}());'))
    .pipe(gulp.dest(destinations.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('templates', function () {
  return gulp.src(globs.templates)
    .pipe($.jade())
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({moduleName: 'templates'}))
    .pipe($.concat('templates.js'))
    .pipe(isDist ? $.uglify() : $.util.noop())
    .pipe(gulp.dest(destinations.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', function (cb) {
  del(['dist/**', '!dist', '!dist/.git', 'build'], cb);
});

gulp.task('browser-sync', function () {
  return browserSync({
    open: false,
    server: {
      baseDir: "./" + outputFolder
    },
    watchOptions: {
      debounceDelay: 1000
    }
  });
});

gulp.task('copy-vendor', function () {
  return gulp.src(isDist ? vendoredLibsMin : vendoredLibs)
    .pipe(gulp.dest(destinations.libs));
});

gulp.task('copy-assets', function () {
  return gulp.src(globs.assets)
    .pipe(gulp.dest(destinations.assets));
});

gulp.task('index', function () {
  var target = gulp.src(globs.index);
  var _injectPaths = isDist ? injectPaths.dist : injectPaths.dev;

  return target
    .pipe($.jade())
    .pipe(
      $.inject(gulp.src(_injectPaths, {read: false}), {
        ignorePath: outputFolder,
        addRootSlash: false
      })
    )
    .pipe(gulp.dest(destinations.index))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', function() {
  gulp.watch(globs.sass, gulp.series('sass'));
  gulp.watch('tslint.json', gulp.series('ts-lint'));
  gulp.watch(globs.appWithDefinitions, gulp.series('ts-lint', 'ts-compile'));
  gulp.watch(globs.templates, gulp.series('templates'));
  gulp.watch(globs.index, gulp.series('index'));
  gulp.watch(globs.assets, gulp.series('copy-assets'));
  // When working on this file, use the following shell command:
  // while true; do gulp; done;
  gulp.watch('gulpfile.js', process.exit);
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    gulp.parallel('sass', 'copy-assets', 'ts-lint', 'ts-compile', 'templates', 'copy-vendor'),
    'index'
  )
);

gulp.task(
  'default',
  gulp.series('build', gulp.parallel('browser-sync', 'watch'))
);
