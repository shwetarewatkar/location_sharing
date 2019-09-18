var mongoUrl = "mongodb+srv://user:bk6NJL1Z2v2IsmQ8@cluster0-nmkja.mongodb.net/locationsharing?retryWrites=true&w=majority";
// var mongoUrl = "mongodb://locationsharing:mYvb73VAcnyYTe@localhost:27017/locationsharing";
if (!mongoUrl) {
    console.log('PLease export mongoUrl');
    console.log('Use following commmand');
    console.log('*********');
    console.log('export MONGODB_URI=YOUR_MONGO_URL');
}

var mongoose = require('mongoose');
mongoose.connect(mongoUrl);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log("Connected to DB");
});

module.exports = db;
