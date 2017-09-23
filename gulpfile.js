'use strict';

//////////////////////////////
// Requires
//////////////////////////////
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const eyeglass = require('eyeglass');
const autoprefixer = require('gulp-autoprefixer');
const sasslint = require('gulp-sass-lint');
const imagemin = require('gulp-imagemin');
const cfenv = require('cfenv');
const gulpif = require('gulp-if');
const browserSync = require('browser-sync').create();

//////////////////////////////
// Variables
//////////////////////////////
const dirs = {
  js: {
    lint: [
      'index.js',
      'gulpfile.js',
      'lib/**/*.js',
      'src/**/*.js',
      '!src/**/*.min.js',
    ],
    uglify: [
      'src/js/**/*.js',
      '!src/js/**/*.min.js',
    ],
  },
  server: {
    main: 'index.js',
    watch: [
      'index.js',
      'lib',
      'views',
      'apis.js',
    ],
    extension: 'js html',
  },
  sass: 'src/sass/**/*.scss',
  images: 'src/images/**/*.*',
  public: 'public/',
};

const isCI = (typeof process.env.CI !== 'undefined') ? Boolean(process.env.CI) : false;

const sassOptions = {
  'outputStyle': isCI ? 'expanded' : 'compressed',
};

//////////////////////////////
// JavaScript Lint Tasks
//////////////////////////////
gulp.task('eslint', () => {
  return gulp.src(dirs.js.lint)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(gulpif(isCI, eslint.failOnError()));
});

gulp.task('uglify', () => {
  return gulp.src(dirs.js.uglify)
    .pipe(gulpif(!isCI, sourcemaps.init()))
      .pipe(uglify({
        'mangle': isCI,
      }))
    .pipe(gulpif(!isCI, sourcemaps.write('maps')))
    .pipe(gulp.dest(`${dirs.public}js`))
    .pipe(browserSync.stream());
});

gulp.task('eslint:watch', () => {
  return gulp.watch(dirs.js.lint, ['eslint']);
});

gulp.task('uglify:watch', () => {
  return gulp.watch(dirs.js.uglify, ['uglify']);
});

//////////////////////////////
// Sass Tasks
//////////////////////////////
gulp.task('sass', () => {
  return gulp.src(dirs.sass)
    .pipe(sasslint())
    .pipe(sasslint.format())
    .pipe(gulpif(isCI, sasslint.failOnError()))
    .pipe(gulpif(!isCI, sourcemaps.init()))
      .pipe(sass(eyeglass(sassOptions)))
      .pipe(autoprefixer())
    .pipe(gulpif(!isCI, sourcemaps.write('maps')))
    .pipe(gulp.dest(`${dirs.public}css`))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', () => {
  return gulp.watch(dirs.sass, ['sass']);
});

//////////////////////////////
// Image Tasks
//////////////////////////////
gulp.task('images', () => {
  return gulp.src(dirs.images)
    .pipe(imagemin({
      'progressive': true,
      'svgoPlugins': [
        { 'removeViewBox': false },
      ],
    }))
    .pipe(gulp.dest(`${dirs.public}/images`));
});

gulp.task('images:watch', () => {
  return gulp.watch(dirs.images, ['images']);
});

//////////////////////////////
// Nodemon Task
//////////////////////////////
gulp.task('nodemon', (cb) => {
  nodemon({
    script: dirs.server.main,
    watch: dirs.server.watch,
    env: {
      'NODE_ENV': 'development',
    },
    ext: dirs.server.extension,
  })
  .once('start', () => {
    cb();
  })
  .on('restart', () => {
    setTimeout(() => {
      browserSync.reload();
    }, 500);
  });
});

//////////////////////////////
// Browser Sync Task
//////////////////////////////
gulp.task('browser-sync', ['nodemon'], () => {
  const appEnv = cfenv.getAppEnv();

  browserSync.init({
    'proxy': appEnv.url,
  });
});

//////////////////////////////
// Running Tasks
//////////////////////////////
gulp.task('build', ['uglify', 'sass', 'images']);

gulp.task('test', ['build']);

gulp.task('watch', ['eslint:watch', 'uglify:watch', 'sass:watch', 'images:watch']);

gulp.task('default', ['browser-sync', 'build', 'watch']);
