var express = require('express');
var bodyParser = require('body-parser');
var debug = require('debug')('router');
var dataManager = require('./dataManager');


var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/clear', function(req, res) {
  debug('Request handler //clear was called.');

  dataManager.clearMovieFile(function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send('file cleared');
    }
  });
});

router.get('/getSchedule', function(req, res) {
  debug('Request handler //getSchedule was called.');

  dataManager.getRawScheduleAll(req.query.cinema, function (err) {
    if (err) {
      res.send(err);
    } else {
      res.send('see html files created');
    }
  });
});

router.get('/updateSchedule', function(req, res) {
  debug('Request handler //updateSchedule was called.');

  dataManager.updateScheduleAll(req.query.cinema, function (err) {
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
});

router.param('/:id', function(req, res, next) {
  console.log('page was not found');
  res.status(404);
  var err = new Error('Not Found');
  err.status = 404;
  res.format({
      html: function(){
          next(err);
        }
    });
});

module.exports = router;
