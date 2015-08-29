var express = require('express');
//var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'); //parses information from POST
//var methodOverride = require('method-override'); //used to manipulate POST
var async = require('async');
var debug = require('debug')('router');
var dataManager = require('./dataManager');
var fs = require('fs');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/getSchedule', function(req, res) {
  if (req.query.cinema === 'ALL') {
    async.parallel([
      async.apply(dataManager.getRawSchedule, 'MAYA'),
      async.apply(dataManager.getRawSchedule, 'PROMENADA'),
      async.apply(dataManager.getRawSchedule, 'AIRPORT'),
      async.apply(dataManager.getRawSchedule, 'FESTIVAL')
    ], function (err, message) {
      if (err) {
        res.send(err);
      } else {
        res.send(message);
      }
    });
  } else {
    dataManager.getRawSchedule(req.query.cinema, function (err, message) {
      if (err) {
        res.send(err);
      } else {
        res.send(message);
      }
    });
  }
});

router.get('/clear', function(req, res) {
  fs.truncate('./public/movies.json', 0, function(err) {
    if (err) {
      res.send(err);
    } else {
      res.send('file cleared');
    }
  });
});

router.get('/parseSchedule', function(req, res) {
  debug('Request handler parseSchedule was called.');

  if (req.query.cinema === 'ALL') {
    async.parallel([
      async.apply(dataManager.updateSchedule, 'MAYA'),
      async.apply(dataManager.updateSchedule, 'PROMENADA'),
      async.apply(dataManager.updateSchedule, 'AIRPORT'),
      async.apply(dataManager.updateSchedule, 'FESTIVAL')
    ], function (err) {
      if (err) {
        res.send(err);
      } else {
        res.format({
          html: function(){
            res.location('movies');
            res.redirect('/');
          }
        });
      }
    });
  } else {
    dataManager.updateSchedule(req.query.cinema, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.format({
          html: function(){
            res.location('movies');
            res.redirect('/');
          }
        });
      }
    });
  }
});


/*router.param('id', function(req, res, next) {
  console.log('page was not found');
  res.status(404);
  var err = new Error('Not Found');
  err.status = 404;
  res.format({
      html: function(){
          next(err);
        }
    });
});*/

/*
    // route middleware to validate :id
    router.param('id', function(req, res, next, id) {
      //find the ID in the Database
      mongoose.model('Movie').findById(id, function (err, movie) {
        //if it isn't found, we are going to respond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
      });
    });

    router.route('/:id')
      .get(function(req, res) {
        mongoose.model('Movie').findById(req.id, function (err, movie) {
          if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
          } else {
            console.log('GET Retrieving ID: ' + movie._id);
            res.format({
              html: function(){
                  res.render('movies/show', {
                    "movie" : movie,
                    "dates": movie.schedule
                  });
              }
            });
          }
        });
      });
*/
module.exports = router;
