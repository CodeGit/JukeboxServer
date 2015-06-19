'use strict';

/**
* DB api for application
*/

var config = require('lib/config');
var mongoose = require('mongoose');
var path = require("path");
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
		file: {
			type: String,
			index: true
		},
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
		size: Number,
		samplerate: Number,
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
	
	db.Music = mongoose.model("Song", db.musicSchema);
	db.Playlist = mongoose.model("Playlist", db.playListSchema);
	
};

db.updateMusic = function(data, createNew) {
	//console.log("Creating music: " + file);
	var music = new db.Music();
	music.path = data.path;
	music.file = data.file;
	music.name = data.title;
	music.artist = data.artist;
	music.track = data.track;
	music.total = data.total;
	music.album = data.album;
	music.year = data.year;
	music.genre = data.genre;
	music.image = data.image;
	
	db.Music.findOneAndUpdate({"path": music.path}, music, {upsert: createNew}, function (err, result){
		if (err) {
			console.log("MongoDB music error");
			db._handleError(err);
		}
		console.log("Updated " + music.name + " to db: createNew = " + createNew);
	});
	/*
	length: Number,
	startSilence: Number,
	endSilence: Number,
	comments: String,
	image: String
	*/
};

db._handleError = function(err) {
	console.log("DB Error: " + err);
	throw err;
};

