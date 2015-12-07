var express = require('express');
var app = express();

var http = require('http');
var fs = require('fs');
var url = require('url');

var mongoose = require('mongoose');
require('mongoose-types-ext')(mongoose);

var session = require('express-session');

var bodyParser = require('body-parser');

var uuid = require('uuid');

app.mongoose = mongoose;

//To connect to MongoDB's database
//mongoose.connect('mongodb://heroku_9g2w3hbk:beoftgpg361fiht6a0tsnqb7qu@ds041924.mongolab.com:41924/heroku_9g2w3hbk');

//To connect locally
mongoose.connect('mongodb://localhost/bazahmed', {
    user: '',
    pass: ''
});

//check the status of this connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('Connected to MongoDB');
});

app.use(bodyParser.json({limit:'10mb'}));       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(session({
    genid: function(req) {
        return uuid.v4(); // use UUIDs for session IDs
    },
    resave: true,
    saveUninitialized: true,
    secret: 'csc309a4secret'
}));

//Setup modules
require('./setup-models')(app);

//Setup helpers
var ActivityLogger = require('./helpers/ActivityLogger');
app.activityLogger = new ActivityLogger(app);

//Setup routes
require('./routes')(app);

//To connect to heroku online app
//app.set('port', (process.env.PORT || 3000));
//app.listen(app.get('port'), function() {
//    console.log('Node app is running on port', app.get('port'));
//});

//To connect locally
app.listen(3000,'0.0.0.0');

console.log('Server running at http://127.0.0.1:3000/');

module.exports = app;
