var https = require('https');
var fs = require('fs');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var busboy = require('connect-busboy');
var apiRoutes = express.Router();
db = module.exports = pool = require(__dirname + '/config/db.js');
var config = require(__dirname + '/config/config');
var location = require(__dirname + "/api/server.js");

app.use(bodyParser.urlencoded({
    limit: '500mb',
    extended: true,
    parameterLimit: 50000
}));

// app.use(expressValidator());
app.use(express.json({ limit: '500mb' }));
app.use(bodyParser.json());
app.use(busboy());
app.use(express.static(__dirname + '/documents'));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/ls.shwetarewatkar.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/ls.shwetarewatkar.com/fullchain.pem")
};

app.use('/npm', express.static(__dirname + '/node_modules'));

apiRoutes.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ "code": 200, "status": "Error", "message": "Failed to authenticate token" });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.json({ "code": 200, "status": "Error", "message": "No token provided" });
    }
});

// will Use for authentication
app.use('/api', apiRoutes);

// ADD API
app.post('/location/add', location.addLocation);

https.createServer(options, app).listen(3000);