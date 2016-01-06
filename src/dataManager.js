var http = require('http');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var debug = require('debug')('DataManager');

var CINEMAS = ['MAYA', 'PROMENADA', 'AIRPORT', 'FESTIVAL'];

//for export
function getRawScheduleAll(cinema, callback) {
  if (cinema === 'ALL') {
    async.parallel([
      async.apply(getRawSchedule, 'MAYA'),
      async.apply(getRawSchedule, 'PROMENADA'),
      async.apply(getRawSchedule, 'AIRPORT'),
      async.apply(getRawSchedule, 'FESTIVAL')
    ], function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  } else {
    getRawSchedule(cinema, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
}

function clearMovieFile(callback) {
  fs.truncate('./public/movies.json', 0, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function updateScheduleAll(cinema, callback) {
  if (cinema === 'ALL') {
    async.parallel([
      async.apply(updateSchedule, 'MAYA'),
      async.apply(updateSchedule, 'PROMENADA'),
      async.apply(updateSchedule, 'AIRPORT'),
      async.apply(updateSchedule, 'FESTIVAL')
    ], function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  } else {
    updateSchedule(cinema, function (err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }
}


//helpers
function getRawSchedule(cinema, callback) {
  var path = '';
  var filename = cinema + '.html';

  switch (cinema) {
  case 'MAYA':
    path = process.env.CINEMA_MAYA || 'http://showtimes.everyday.in.th/api/v2/theater/4/showtimes/';
    break;
  case 'PROMENADA':
    path = process.env.CINEMA_PROMENADA || 'http://showtimes.everyday.in.th/api/v2/theater/29/showtimes/';
    break;
  case 'FESTIVAL':
    path = process.env.CINEMA_FESTIVAL || 'http://showtimes.everyday.in.th/api/v2/theater/83/showtimes/';
    break;
  case 'AIRPORT':
    path = process.env.CINEMA_AIRPORT || 'http://showtimes.everyday.in.th/api/v2/theater/82/showtimes/';
    break;
  }

  if (!path) {
    callback ('no such cinema');
    return;
  }

  http.get(path, function(res){
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      debug(cinema + ': Schedule data is received from web');
      fs.writeFile('./public/' + filename, str, function(err) {
        if(err) {
          callback(err);
        } else {
          debug(cinema + ': Movies from ' + cinema + ' are saved to ' + filename);
          callback(null);
        }
      });
    });
  })
  .on('error', function(err) {
    callback(err);
  })
  .end();
}

function updateSchedule(cinema, callback) {
  async.waterfall([
    async.apply(prepareJSON, cinema, cinema + '.html'),
    getMoviesInfo,
    saveMoviesToFile,
    mergeMoviesToFile
  ], function (err){
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
}

function prepareJSON(cinema, filename, callback) {
  fs.readFile('./public/' + filename, function(err, str) {
    if(err) {
      callback(err, null);
    } else if (!str.toString()) {
      callback(cinema + ': raw file is empty', null);
    } else {
      debug(cinema + ': Data is read from temp file');
      if (CINEMAS.indexOf(cinema) > -1) {
        callback(null, cinema, parseSchedule(cinema, str));
      } else {
        callback('no such cinema');
      }
    }
  });
}

function parseSchedule(cinema, str) {
  var movies = [];
  var result = [];
  var index = -1;

  movies = JSON.parse(str);

  movies = movies.filter(function (movie) {
    //we are looking only for English 2D films which are not first class(F)
    return (movie.cinema !== 'F' && movie.audio === 'en' && (movie.extra === '' || movie.extra === 'type-digital' || movie.extra === 'type-digital;KTB'));
  });

  movies.forEach(function(movie) {
    index = result.push({name: movie.movie_title, dates: {} }) - 1;
    var day = moment(movie.date + ' +0700', 'YYYY-MM-DD Z');
    result[index].dates[day] = {};
    var times = result[index].dates[day][cinema] = [];
    movie.showtimes.forEach(function (time) {
      times.push(moment(movie.date + ' ' + time + ' +0700', 'YYYY-MM-DD HH:mm Z').toString());
    });
  });
  debug(cinema + ': Raw data parsed');
  return result;
}

function getMoviesInfo(cinema, movies, callback) {
  var apikey = process.env.THEMOVIEDB_APIKEY || '428fdc467662925967d2cbea0ede7f76';
  var base_url = '';

  async.series([
    getDetails,
    getPathToImages,
    getImages
  ],function(err){
      if (err) {
        callback(err, null, null);
      } else {
        debug(cinema + ': Themoviedb info completely received');
        callback(null, cinema, movies);
      }
    });

  function getDetails(callback) {
    async.each(movies, getDetailsFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        debug(cinema + ': Details received from Themoviedb ');
        callback(null);
      }
    });

    function getDetailsFromThemoviedb(movie, callback) {
      var name = '';
      debug(cinema + ': ' + movie.name);
      if (movie.name.indexOf( '(' ) > -1){
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( '(' ) ) );
      } else if (movie.name.indexOf( '[' ) > -1) {
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( '[' ) ) );
      } else {
        name = encodeURI(movie.name);
      }

      http.get('http://api.themoviedb.org/3/search/movie?api_key=' + apikey + '&query=' + name, function(res){
        debug(cinema + 'http://api.themoviedb.org/3/search/movie?api_key=' + apikey + '&query=' + name);
        var str = '';

        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function(){
          if (!(res.headers['content-type'].indexOf('application/json') > -1) ) {
            callback('Themoviedb returned not JSON: ' + str);
          } else {
            var obj = JSON.parse(str);
            if (!obj.results) {
              callback('Movie not found or incorrect JSON: ' + str);
            } else {
              movie.year = obj.results[0].release_date;
              movie.imdbid = 'tt' + obj.results[0].id;
              movie.image = obj.results[0].poster_path;
              callback(null);
            }
          }
        });
      })
      .on('error', function(err) {
        callback(err);
      })
      .end();
    }
  }

  function getPathToImages(callback) {
    http.get('http://api.themoviedb.org/3/configuration?api_key=' + apikey, function(res){
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function(){
        if (!(res.headers['content-type'].indexOf('application/json') > -1) ) {
          callback('Themoviedb returned not JSON: ' + str);
        } else {
          var obj = JSON.parse(str);
          if (!obj.images.base_url) {
            callback('base_url is not presented or incorrect JSON: ' + str);
          } else {
            base_url = obj.images.base_url;
            debug(cinema + ': Themoviedb base_url is ' + base_url);
            callback(null);
          }
        }
      });
    })
    .on('error', function(err) {
      callback(err);
    })
    .end();
  }

  function getImages(callback) {
    async.each(movies, getImageFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        debug(cinema + ': Images received from Themoviedb');
        callback(null);
      }
    });

    function getImageFromThemoviedb(movie, callback){
      var file = fs.createWriteStream('./public/images/' + movie.imdbid + '.jpg');
      http.get(base_url + 'w342' + movie.image, function(response){
        response.on('data', function(data) {
            file.write(data);
          })
        .on('end', function() {
            file.end();
            callback(null);
          });
      })
      .on('error', function(err) {
        callback(err);
      });
    }
  }
}

function saveMoviesToFile(cinema, movies, callback) {
  debug(cinema + ': Save movies to ' + cinema + '.json invoked');
  fs.writeFile('./public/'+ cinema + '.json', JSON.stringify(movies), function(err) {
    if(err) {
      callback(err, null, null);
    } else {
      debug(cinema + ': Movies are saved to ' + cinema + '.json');
      callback(null, cinema, movies);
    }
  });
}

function mergeMoviesToFile(cinema, newMovies, callback) {
  async.waterfall([
    async.apply(readCurrentMovies, newMovies),
    mergeMovies,
    saveToFile
  ], function (err){
    if (err) {
      callback(err);
    } else {
      debug(cinema + ': Movies are completely merged into common file');
      callback(null);
    }
  });

  function readCurrentMovies(newMovies, callback) {
    fs.readFile('./public/movies.json', function(err, currentMovies) {
      if(err) {
        callback(err, null, null);
      } else {
        debug(cinema + ': File movies.json is read');
        callback(null, newMovies, currentMovies.toString());
      }
    });
  }

  function mergeMovies(newMovies, currentMovies, callback) {
    debug(cinema + ': Merge movies into common file invoked');

    if (currentMovies === '') {
      currentMovies = '[]';
    }

    try {
      currentMovies = JSON.parse(currentMovies);
    } catch (err) {
      callback(err);
      return;
    }

    debug(cinema + ': File movies.json JSON read and parsed');

    newMovies.forEach(function (newMovie) {
      var curDates = '';
      currentMovies.forEach(function (curMovie, i) {
        if (curMovie.imdbid === newMovie.imdbid) {
          curDates = currentMovies[i].dates;
        }
      });
      if (!curDates) {
        currentMovies.push(newMovie);
      } else {
        for (var date in newMovie.dates) {
          if  (curDates.hasOwnProperty(date)) {
            curDates[date][cinema] = newMovie.dates[date][cinema];
          } else {
            curDates[date] = {};
            curDates[date][cinema] = newMovie.dates[date][cinema];
          }
        }
      }
    });

    callback(null, currentMovies);
    debug(cinema + ': Movies merged into common file');
  }

  function saveToFile(movies, callback) {
    debug(cinema + ': Save movies to movies.json invoked');
    fs.writeFile('./public/movies.json', JSON.stringify(movies), function(err) {
      if(err) {
        callback(err);
      } else {
        debug(cinema + ': Movies are saved into movies.json');
        callback(null);
      }
    });
  }

}


//not used
//parseSfcData can be used to get schedule for the whole week but for some reason SFC has banned me
function parseSfcData(cinema, str) {
  var movies = [];
  var lastMovie = -1;
  var date = '';
  var day = '';
  var times = [];
  var $ = cheerio.load(str);

  debug(cinema + ': Data is loaded into cheerio');
  $('#tblShowTimes td').each(function(){
    switch ($(this).attr('class')) {
    case 'PrintShowTimesFilm':
      lastMovie = movies.push({
        name: $(this).text(),
        dates: {}
      }) - 1 ;
      //movies[lastMovie].dates[cinema] = {};
      break;
    case 'PrintShowTimesDay':
      date = $(this).text().substring(4);
      day = moment(date + ' +0700', 'DD MMM Z');
      movies[lastMovie].dates[day] = {};
      movies[lastMovie].dates[day][cinema] = [];
      break;
    case 'PrintShowTimesSession':
      times = $(this).text().split(', ');
      times.forEach(function(time) {
        movies[lastMovie].dates[day][cinema].push(moment(date + ' ' + time + ' +0700', 'DD MMM HH:mm Z').toString());
      });
      break;
    default: break;
    }
  });
  debug(cinema + ': SfCinema data is parsed');

  return movies.filter ( function (movie) {
    return (movie.name.search(/\(E/i) > -1) || (movie.name.search(/\(/) < 0);
  });
}
//I used to use mongodb for storing but currently I use file system
function cleanDb(callback) {
  mongoose.model('Movie').find({}).remove(function(err) {
    if (err) {
      callback(err);
    } else {
      debug('Movie collection successfully removed from database');
      callback(null);
    }
  });
}

function saveMoviesToDb(movies, callback) {
  debug('saveMoviesToDb invoked');

  function insertMovieIntoDb(movie, callback) {
    mongoose.model('Movie').create({
        name: movie.name,
        year: movie.year,
        imdbid: movie.imdbid,
        image: movie.image,
        schedule: movie.dates

      }, function (err) {
          if (err) {
            callback(err);
          } else {
            callback();
          }
        });
  }

  //save movies to DB
  async.each(movies, insertMovieIntoDb, function(err) {
    if (err) {
      callback(err, null);
    } else {
      debug('Movies are saved to database');
      callback(null);
    }
  });
}


//exports
exports.getRawScheduleAll = getRawScheduleAll;
exports.updateScheduleAll = updateScheduleAll;
exports.clearMovieFile = clearMovieFile;
