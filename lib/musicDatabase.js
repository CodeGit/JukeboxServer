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
	
	db.musicSchema = new Schema({
		_id: {
			select: false //this prevents an annoying error when trying findOneAndUpdate on the model
		},
		path: {
			type: String,
			unique: true,
			index: true
		},
		//dir: String,
		//file: String,
		title: {
			type: String,
			index: true
		},
		artist: {
			type: String,
			index: true
		},
		track: Number,
		total: Number,
		album: {
			type: String,
			index: true
		},
		year: Number,
		genre: {
			type: String,
			index: true
		},
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
	}, {strict: true});
	
	db.Music = mongoose.model("Track", db.musicSchema);
	db.Playlist = mongoose.model("Playlist", db.playListSchema);
	
};


