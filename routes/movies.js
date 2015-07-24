var express = require('express'),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    async = require('async'),
    debug = require('debug')('router'),
    dataManager = require('./dataManager');

var router = express.Router();
/*  router.use(bodyParser.urlencoded({ extended: true }));
    router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
    }));
*/

/*    router.route('/')
        //view all movies
        .get(function(req, res, next) {
          mongoose.model('Movie').find({}, function (err, movies) {
            if (err) {
              return console.error(err);
            } else {
              res.format({
                //HTML response will render the index.jade file in the views/movies folder. We are also setting "blobs" to be an accessible variable in our jade view
                html: function(){
                  res.render('movies/index', {
                    title: 'All my Movies',
                    "movies" : movies
                  });
                }
              });
            }
          });
        })

        //add new movie
        .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var year = req.body.year;
        var imdbID = req.body.imdbID;
        var image = req.body.image;

        //call the create function for our database
        mongoose.model('Movie').create({
          name : name,
          year : year,
          imdbID : imdbID,
          image : image
        }, function (err, movie) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Movie has been created
                  console.log('POST creating new movie: ' + movie);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("movies");
                        // And forward to success page
                        res.redirect("/");
                    }
                  });
              }
        });
      });


      router.get('/view', function(req, res) {
        //retrieve all blobs from Monogo
        mongoose.model('Movie').find({}, function (err, movies) {
          if (err) {
              return console.error(err);
          } else {
            //respond to HTML
            res.format({
              //HTML response will render the index.jade file in the views/movies folder. We are also setting "blobs" to be an accessible variable in our jade view
              html: function(){
                res.render('movies/index', {
                  title: 'All my Movies',
                  "movies" : movies
                });
              }
            });
          }
        });
      });

    //add new movie
    router.get('/new', function(req, res) {
      res.render('movies/new', { title: 'Add New Movie' });
    });
*/
    //get movies from SfCinema
    router.get('/refresh', function(req, res) {
      console.log("Request handler 'refresh' was called.");

      async.waterfall([
        dataManager.cleanDb,
        dataManager.getSfcinemaScheduleFromFile,
        dataManager.getMoviesInfo,
        dataManager.saveMoviesToFile,
        dataManager.saveMoviesToDb
      ], function (err){
        if (err) {
          res.send(err);
        } else {
          res.format({
            html: function(){
                // If it worked, set the header so the address bar doesn't still say /adduser
                res.location("movies");
                // And forward to success page
                res.redirect("/");
            }
          });
        };
      });
    });
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
