var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var async = require('async');
var fs = require('fs');
var moment = require('moment');


function cleanDb(callback) {
  mongoose.model('Movie').find({}).remove(function(err) {
    if (err) {
      callback(err);
    } else {
      console.log('collection removed');
      callback(null);
    }
  });
};

function getHeader(callback){
  var options = {
    host: 'www.whatismybrowser.com',
    path: '/developers/what-http-headers-is-my-browser-sending'
  };

  https.request(options, function(res) {
    var str = '';

    res.on('data', function (chunk) {
      str += chunk;
      //console.log(chunk);
    });

    res.on('end', function () {
      console.log(str);
      //callback();
    });
  }).end();


}

function getScheduleSfcinemaFromFile(callback){
      var movies = [];

      fs.readFile('./public/sfCinema.html', function(err, data) {
        if(err) {
          callback(err, null);
        } else {
          console.log("sfCinema.html was read");
          parseSfCinema(data);
          callback(null, movies);
        }
      });

      function parseSfCinema(str) {
        $ = cheerio.load(str);

        $("#tblShowTimes td").each(function(){
          switch ($(this).attr("class")) {
            case "PrintShowTimesFilm":
              movies.push({
                name: $(this).text(),
                dates: []
              });
              //console.log('movie processed: ' + $(this).text());
              break;
            case "PrintShowTimesDay":
              date = $(this).text().substring(4) + ' ';
              //console.log(date);
              break;
            case "PrintShowTimesSession":
              times = $(this).text().split(", ");
              //console.log(times);
              times.forEach(function(time) {
                movies[movies.length-1].dates.push( moment(date + time + " +0700", "DD MMM HH:mm Z") );
              });
              break;
            default: break;
          }
        });
        return;
      }
};

function getScheduleSfcinema(callback){
  //request schedule for Sfcinema
  var options = {
    host: 'booking.sfcinemacity.com',
    path: '/visPrintShowTimes.aspx?visLang=1&visCinemaId=9936&visMultiCinema=N'
  };

  http.request(options, function(res){
    var str = '';
    //var movies = [];

    res.on('data', function (chunk) {
      str += chunk;
      //console.log(str);
    });

    //the whole response has been recieved, so we put it into file
    res.on('end', function () {
      console.log(str);
      var movies = [];
      var date = '';
      var time = [];

      $ = cheerio.load(str);

      $("#tblShowTimes td").each(function(){
        switch ($(this).attr("class")) {
          case "PrintShowTimesFilm":
            movies.push({
              name: $(this).text(),
              dates: []
            });
            console.log('movie processed: ' + $(this).text());
            break;
          case "PrintShowTimesDay":
            date = $(this).text().substring(4) + ' ';
            console.log(date);
            break;
          case "PrintShowTimesSession":
            times = $(this).text().split(", ");
            console.log(times);
            times.forEach(function(time) {
              movies[movies.length-1].dates.push( moment(date + time + " +0700", "DD MMM HH:mm Z") );
            });

            break;
          default: break;
        }
      });

      console.log('HTML processed.');
      console.log(movies);
      callback(null, movies);
      console.log('headers: ' + JSON.stringify(this.headers));
      //console.log('user-agent: ' + JSON.stringify(this.headers[user-agent]));

    });
  }).end();

};

function getMovieInfo(movies, callback){
  console.log('getInfo invoked');
  //apikey shall be put into config
  var apikey = '428fdc467662925967d2cbea0ede7f76';
  var base_url = '';

  function getInfo(callback) {

    function getInfoFromThemoviedb(movie, callback) {

      var str = '';
      if (movie.name.indexOf( "(" ) > -1){
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( "(" ) ) );
      } else if (movie.name.indexOf( "[" ) > -1) {
        name = encodeURI( movie.name.substring(0, movie.name.indexOf( "[" ) ) );
      } else {
        name = encodeURI(movie.name);
      };

      //console.log(name);

      options = {
        host: 'api.themoviedb.org',
        path: '/3/search/movie?api_key=' + apikey + '&query=' + name
      };

      var req = http.request(options, function(res){
        //str = '';
        res.on('data', function (chunk) {
          str += chunk;
        });

        res.on('end', function(){
          if (!(res.headers["content-type"].indexOf("application/json") > -1) ) {
            console.log('not JSON: ' + str);
            callback(str);
          } else {
            obj = JSON.parse(str);
            if (!obj.results) {
              //this shall be rewritten
              callback('wrong JSON' + str);
            } else {
              movie.year = obj.results[0].release_date;
              movie.imdbid = 'tt' + obj.results[0].id;
              movie.image = obj.results[0].poster_path;
              callback(null);
            }
          }
        })
      });

      req.on('error', function(err) {
        console.log('request to omdbapi error: ' + err);
        callback(err);
      })

      req.end();
    }

    async.each(movies, getInfoFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        console.log('Movie info from Themoviedb successfully received');
        callback(null);
      }
    });
  }

  function getConfig(callback) {

    options = {
      host: 'api.themoviedb.org',
      path: '/3/configuration?api_key=' + apikey
    };

    var req = http.request(options, function(res){
      str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      res.on('end', function(){

        if (!(res.headers["content-type"].indexOf("application/json") > -1) ) {
          console.log('not JSON: ' + str);
          callback(str);
        } else {
          obj = JSON.parse(str);
          //console.log('obj: ' + JSON.stringify(obj));
          if (!obj.images.base_url) {
            //this shall be rewritten
            console.log('themoviedb doesnt return base_url');
            callback(str);
          } else {
            base_url = obj.images.base_url;
            console.log(base_url);
            callback(null);
          }
        }
      })
    });

    req.on('error', function(err) {
      console.log('request to themoviedb error: ' + err);
      callback(err);
    })

    req.end();
  }

  function getImages(callback) {

    function getImageFromThemoviedb(movie, callback){

      var file = fs.createWriteStream('./public/images/' + movie.imdbid + '.jpg');

      var req = http.get(base_url + 'w342' + movie.image, function(response){
        //console.log('image for: ' + movie.name);
        //response.pipe(file)
        response.on('data', function(data) {
            file.write(data);
          })
        .on('end', function() {
            file.end();
            //console.log(movie.imdbid + ' downloaded');
            callback(null);
        });
      });

      req.on('error', function(err) {
        console.log('themoviedb image request error: ' + err);
        callback(err);
      })

    };

    async.each(movies, getImageFromThemoviedb, function(err) {
      if (err) {
        callback(err);
      } else {
        console.log('Movie images from Themoviedb successfully received');
        callback(null);
      }
    });
  }

  async.waterfall([
    //update movie info except images
    getInfo,
    //get path to the images
    getConfig,
    //update movie images
    getImages
  ],function(err){
      if (err) {
        callback(err, null);
      } else {
        console.log('Movie info completely received');
        callback(null, movies);
      }
  });

}

function saveToFile(movies, callback){
  console.log('save to file invoked');
  var moviesJSON = JSON.stringify(movies);
  //console.log(movies);
  //console.log(moviesJSON);
  fs.writeFile('./public/movies.json', moviesJSON, function(err) {
    if(err) {
      callback(err, null);
    } else {
      console.log("movies.json saved");
      callback(null, movies);
    }
  });
};

function saveToDb(movies, callback) {
  console.log('saveToDb invoked');

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
        //console.log('1: ' + movie.id);
        callback();
      }
    });
  }

  //save movies to DB
  async.each(movies, insertMovieIntoDb, function(err) {
    if (err) {
      callback(err, null);
    } else {
      console.log('successfully saved to database');
      callback(null);
    }
  })
};


exports.cleanDb = cleanDb;
exports.getScheduleSfcinema = getScheduleSfcinema;
exports.getScheduleSfcinemaFromFile = getScheduleSfcinemaFromFile;
exports.getMovieInfo = getMovieInfo;
exports.saveToFile = saveToFile;
exports.saveToDb = saveToDb;
exports.getHeader = getHeader;
