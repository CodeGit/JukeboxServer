'use strict';

/**
* DB api for application
*/

var config = require('lib/config');
var mongoose = require('mongoose');
var db = {};
module.exports = db;

db.initialise = function() {
	console.log("creating connection");
	mongoose.connect("mongodb://" + 
			config.settings.mongo.host + 
			"/" + config.settings.mongo.db);
	db.connection = mongoose.connection;
	console.log("Setting up schema and model");
	var Schema = mongoose.Schema;
	
	db.trackSchema = new Schema({
		dir: String,
		file: String,
		title: String,
		artist: String,
		track: String,
		album: String,
		year: String,
		genre: String,
		length: Number,
		startSilence: Number,
		endSilence: Number,
		comments: String,
		image: String
	}, {strict: true});
	
	db.playListSchema = new Schema({
		name: String,
		path: String,
		image: String
	});
	
	db.Track = mongoose.model("Track", db.trackSchema);
	db.Playlist = mongoose.model("Playlist", db.playListSchema);
	
};


