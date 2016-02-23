var spawn = require('child_process').spawn;
var node;
var del = require('del');
var fs = require('fs');
var source = require('vinyl-source-stream');

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();

var buildDir = './build/';


gulp.task('start_server', ['build', 'server']);

gulp.task('build',['browserify', 'js', 'sass', 'css', 'fonts']);

gulp.task('browserify', function() {
  return browserify('./src/app/index.cjsx')
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(buildDir + 'js'))
  .pipe(browserSync.stream());
});

gulp.task('sass', function () {
  gulp.src('./src/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass()).on('error', sass.logError)
    .pipe(sourcemaps.write())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(buildDir + 'css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('css', function() {
  gulp.src('./src/scss/*.css')
    .pipe(gulp.dest(buildDir + 'css'));
});

gulp.task('js', function() {
  gulp.src('./src/app/*.js')
    .pipe(gulp.dest(buildDir + 'js'));
});

gulp.task('fonts', function() {
  gulp.src('./src/font/**/*.*')
    .pipe(gulp.dest(buildDir + 'font'));
});

gulp.task('server', function() {
  if (node) node.kill();
  if(!fs.existsSync('./src/www.coffee')){
    console.log('www.coffee not found, retrying...');
    return;
  }
  node = spawn('coffee', ['./src/www.coffee'], {stdio: 'inherit'});
  node.on('close', function (code) {
    if (code === 8) {
      console.log('Error detected, waiting for changes...');
    }
  });
});

gulp.task('clean', function() {
  del([buildDir]);
});


gulp.task('watch', ['browserify', 'js', 'sass'], function() {
  browserSync.init({
    proxy: 'http://localhost:8888/',
    reloadDelay: 2000
  });
  gulp.watch('./src/scss/**/*.scss', ['sass']);
  gulp.watch('./src/app/*.js', ['js']);
  gulp.watch('./src/app/**/*.cjsx', ['browserify']).on('change', browserSync.reload);
});


process.on('exit', function() {
  if (node) node.kill();
});
