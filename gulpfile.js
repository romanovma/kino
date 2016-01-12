var cjsx = require('gulp-cjsx');
var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var spawn = require('child_process').spawn;
var node;
var del = require('del');
var fs = require('fs');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var buildDir = './public/';

// // Compile Coffeescript jsx files
// gulp.task('cjsx', function() {
//   gulp.src('./src/**/*.cjsx')
//     .pipe(cjsx({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest(buildDir));
// });
//
// // Compile Coffeescript
// gulp.task('coffee', function() {
//   gulp.src('./src/**/*.coffee')
//     .pipe(coffee({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest(buildDir));
// });
//
// gulp.task('jade', function() {
//   gulp.src('./src/**/*.jade')
//     .pipe(gulp.dest(buildDir));
// });
//
// gulp.task('js', function() {
//   gulp.src('./src/**/*.js')
//     .pipe(gulp.dest(buildDir));
// });
//

gulp.task('cjsx', function() {
  gulp.src('./src/app/components/Welcome.cjsx')
    .pipe(cjsx({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./src/app/components/'));
});

gulp.task('scss', function () {
  gulp.src('./src/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(buildDir+'css'));
});

// gulp.task('browserify', function() {
//   return browserify('./build/app/index.js')
//   .bundle()
//   .pipe(source('bundle.js'))
//   .pipe(gulp.dest('./build/app/'));
// });

gulp.task('browserify', function() {
  return browserify('./src/app/index.cjsx')
  .bundle()
  .pipe(source('bundle.js'))
  .pipe(gulp.dest(buildDir + 'js'));
});

gulp.task('build',['browserify', 'scss', 'cjsx']);

// Start the server in ./build
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

// Reloads the server
// gulp.task('reload', function(){
//   if (node) {
//     console.log('Reloading Server');
//     gulp.start('server');
//   }
// });

// Watches for file changes
// gulp.task('watch', function(){
//   gulp.watch('./src/**/*.cjsx', ['browserify', 'js', 'reload']);
//   gulp.watch('./src/**/*.coffee', ['coffee','reload']);
//   gulp.watch('./src/**/*.jade', ['jade','reload']);
//   gulp.watch('./src/scss/*.scss', ['scss', 'reload']);
//   gulp.watch('./src/.env.yml', ['env','reload']);
// });
//
// gulp.task('develop', ['build', 'server', 'watch']);

gulp.task('clean', function () {
  del([
    './public'
  ]);
});

gulp.task('start_server', ['build', 'server']);

// kill the node process on exit
process.on('exit', function() {
  if (node) node.kill();
});
