var mongoose = require('mongoose');
var connectionString = process.env.MONGOLAB_URI || 'mongodb://localhost/kinodb';
mongoose.connect(connectionString);
