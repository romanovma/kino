var mongoose = require('mongoose');

/*
var scheduleSchema = new mongoose.Schema( {
  date: Date,
  time: [String]
})
*/

var movieSchema = new mongoose.Schema( {
  name: String,
  year: String,
  imdbid: String,
  image: String,
  schedule: [Date]
});

mongoose.model('Movie', movieSchema);
