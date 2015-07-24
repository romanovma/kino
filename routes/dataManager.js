var http = require('http');
    https = require('https'),
    cheerio = require('cheerio'),
    mongoose = require('mongoose'),
    async = require('async'),
    fs = require('fs'),
    moment = require('moment'),
    debug = require('debug')('DataManager');


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

//screen scraping from SfCinema
function parseSfCinemaData(str) {
  var movies = [];
  var date = '';
  var times = [];
  var $ = cheerio.load(str);

  debug('SfCinema data is loaded into cheerio');
  $("#tblShowTimes td").each(function(){
    switch ($(this).attr("class")) {
      case "PrintShowTimesFilm":
        movies.push({
          name: $(this).text(),
          dates: []
        });
        break;
      case "PrintShowTimesDay":
        date = $(this).text().substring(4) + ' ';
        break;
      case "PrintShowTimesSession":
        times = $(this).text().split(", ");
        times.forEach(function(time) {
          movies[movies.length-1].dates.push( moment(date + time + " +0700", "DD MMM HH:mm Z") );
        });
        break;
      default: break;
    }
  });
  debug('SfCinema data is parsed');

  return movies;
}


function getSfcinemaScheduleFromFile(callback){
  //if screen scrape is not working load from file
  fs.readFile('./public/sfCinema.html', function(err, str) {
    if(err) {
      callback(err, null);
    } else {
      debug('SfCinema data is read from file');
      callback(null, parseSfCinemaData(str));
    }
  });
}


function getSfcinemaScheduleFromWeb(callback){
  //screen scrape from SfCinema
  var path = process.env.SFCINEMA_MAYA || 'http://booking.sfcinemacity.com/visPrintShowTimes.aspx?visLang=1&visCinemaId=9936&visMultiCinema=N';

  http.get(path, function(res){
    var str = '';
    res.on('data', function (chunk) {
      str += chunk;
    });
    res.on('end', function () {
      debug('SfCinema data is received from web');
      callback(null, parseSfCinemaData(str));
    });
  })
  .on('error', function(err) {
    callback(err, null);
  })
  .end();
}


function getMoviesInfo(movies, callback){

  var apikey = process.env.THEMOVIEDB_APIKEY || '428fdc467662925967d2cbea0ede7f76';
  var base_url = '';

  async.series([
    getDetails,
    getPathToImages,
    getImages
  ],function(err){
      if (err) {
        callback(err, null);
      } else {
        debug('Movies info(details, images) received from Themoviedb')
        callback(null, movies);
      }
  });

  //get movie details
  function getDetails(callback) {
    async.each(movies, getDetailsFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        debug('Movies details received from Themoviedb ')
        callback(null);
      }
    });

    function getDetailsFromThemoviedb(movie, callback) {
      var name = '';

      if (movie.name.indexOf( "(" ) > -1){
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( "(" ) ) );
      } else if (movie.name.indexOf( "[" ) > -1) {
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( "[" ) ) );
      } else {
        name = encodeURI(movie.name);
      };

      http.get('http://api.themoviedb.org/3/search/movie?api_key=' + apikey + '&query=' + name, function(res){
        var str = '';

        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function(){
          if (!(res.headers["content-type"].indexOf("application/json") > -1) ) {
            callback('Themoviedb returned not JSON: ' + str);
          } else {
            obj = JSON.parse(str);
            if (!obj.results) {
              callback('Movie not found or incorrect JSON: ' + str);
            } else {
              movie.year = obj.results[0].release_date;
              movie.imdbid = 'tt' + obj.results[0].id;
              movie.image = obj.results[0].poster_path;
              callback(null);
            }
          }
        })
      })
      .on('error', function(err) {
        callback(err);
      })
      .end();
    }
  }

  //get path to the images
  function getPathToImages(callback) {
    http.get('http://api.themoviedb.org/3/configuration?api_key=' + apikey, function(res){
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function(){
        if (!(res.headers["content-type"].indexOf("application/json") > -1) ) {
          callback('Themoviedb returned not JSON: ' + str);
        } else {
          obj = JSON.parse(str);
          if (!obj.images.base_url) {
            callback('base_url is not presented or incorrect JSON: ' + str);
          } else {
            base_url = obj.images.base_url;
            debug('Themoviedb base_url is ' + base_url);
            callback(null);
          }
        }
      })
    })
    .on('error', function(err) {
      callback(err);
    })
    .end();
  }

  //update movie images
  function getImages(callback) {
    async.each(movies, getImageFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        debug('Movies images received from Themoviedb');
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
      })
    };
  }
}


function saveMoviesToFile(movies, callback){
  debug('Save movies to movies.json invoked');
  fs.writeFile('./public/movies.json', JSON.stringify(movies), function(err) {
    if(err) {
      callback(err, null);
    } else {
      debug("Movies are saved to movies.json");
      callback(null, movies);
    }
  });
};


function saveMoviesToDb(movies, callback) {
  debug('saveMoviesToDb invoked');

  function insertMovieIntoDb(movie, callback) {
    mongoose.model('Movie').create({
        name: movie.name,
        year: movie.year,
        imdbid: movie.imdbid,
        image: movie.image,
        schedule: movie.dates,

    }, function (err, movie) {
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
  })
};


exports.cleanDb = cleanDb;
exports.getSfcinemaScheduleFromWeb = getSfcinemaScheduleFromWeb;
exports.getSfcinemaScheduleFromFile = getSfcinemaScheduleFromFile;
exports.getMoviesInfo = getMoviesInfo;
exports.saveMoviesToFile = saveMoviesToFile;
exports.saveMoviesToDb = saveMoviesToDb;
