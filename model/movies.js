var mongoose = require('mongoose');

/*
var scheduleSchema = new mongoose.Schema( {
  date: Date,
  time: [String]
})
*/
var daySchema = new mongoose.Schema({
  day: String,
  time: Date
});

var movieSchema = new mongoose.Schema( {
  name: String,
  year: String,
  imdbid: String,
  image: String,
  schedule: [daySchema]
});



mongoose.model('Movie', movieSchema);
