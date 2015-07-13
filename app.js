'use strict';

/**
 * Module dependencies.
 */

require('rootpath')();

var DEFAULT_CONFIG_FILE = "config/default.json";

var express = require('express'),
    routes = require('./routes'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    favicon = require("serve-favicon"),
    logger = require("morgan"),
    errorHandler = require("errorhandler"),
    path = require('path'),
    fs = require('fs'),
    async = require("async"),
    config = require('lib/config'),
    user = require('./routes/user'),
    music = require("lib/music/musicRoutes"),
    queue = require("lib/queue/queueRoutes"),
    player = require("lib/player/playerRoutes"),
    groove = require("groove"),
    db = require("lib/database"),
    scanner = require("lib/utils/musicScanner");

var app = express();
app.locals.groove = groove;
module.exports = app;

var program = require("commander");
program.version("0.5.0")
    .usage("node app.js <music-dir(s)>")
    .option('-p, --port <port>', "server will listen on this port", parseInt)
    .option('-c, --config <file>', "server config file")
//.option('-i, --itunes <file>', "itunes library xml file")
    .option('-m, --m3u <file>', "a comma separated list of m3u playlists")
    .option('-d, --directory <dir>', "directory of m3u playlists")
    .option('-u, --update', "update database with summary information")
    .option('-v, --development', "run in dev mode for more output");

/*
var readItunes = function(itunes) {
    if (itunes !== undefined) {
        console.log("Reading itunes");
        var itunesReader = require("lib/utils/playlistsFromItunes");
        itunesReader.createPlaylists(itunes);
    }
};
*/

var readPlaylists = function(dir, playlistsString, callback) {
    var playlistReader = require("lib/utils/playlistsFromM3u");
    if (dir == null && playlistsString == null){
        callback();
    }
    if (dir !== undefined) {
        playlistReader.readPlaylistDirectory(dir, callback);
    }
    if (playlistsString !== undefined) {
        var playlists = playlistsString.split(",");
        playlistReader.readPlaylists(playlists, callback);
    }
};

var updateDatabaseSummaries = function(update, callback) {
    if (update) {
        db.updateSummaries(callback);
    } else {
        callback();
    }
};

var startServer = function () {
    console.log("Starting server");

    // all environments
    app.set('port', program.port || 3000);
    app.set('view engine', "jade");

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(logger('dev'));
    app.use(bodyParser.raw());
    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    var tomorrow = new Date(new Date().getTime() + (240 * 60 * 60 * 1000));
    app.use(session({
        secret: 'jukebox',
        name: 'jukebox:session',
        expires: tomorrow,
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            mongooseConnection: db.connection
        })
    }));
    app.use(favicon(config.settings.favicon));
    app.use(methodOverride());
    app.use(express.static(path.join(__dirname, 'public')));

    // development only
    if (program.development) {
        console.log("Starting in dev mode");
        app.use(errorHandler());
    }

    app.all("/*", function(req, res, next){
        console.log("Add user/cookie/credit processing here");
        console.log("Session ID = " + req.sessionID);
        if (!req.session.tokens) {
            console.log("Handing out initial tokens");
            req.session.tokens = config.settings.tokens.initial;
        } else {
            console.log("Has tokens = " + req.session.tokens);
        }
        next();
    });

    app.get('/', function (req, res, next) {
        res.redirect("/music");
    });
    app.use('/music', music);
    app.use('/queue', queue);
    app.use('/player', player);

    var server = app.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
};

//initialisation
async.waterfall([
    function (callback) {
        program.parse(process.argv);
        config.loadConfig(program.config || DEFAULT_CONFIG_FILE);
        db.initialise();
        callback();
    },
    function (callback) {
        if (program.args.length > 0) {
            scanner.scanDirectories(program.args, callback);
        } else {
            callback();
        }
    },
    function (callback) {
        readPlaylists(program.directory, program.m3u, callback);
    },
    function (callback) {
        updateDatabaseSummaries(program.update, callback);
    }

], function (err) {
    if (err) {throw err; }
    startServer();
});




