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
		image: String,
		rating: Number,
		type: String
	}, {strict: true});
	db.Music = mongoose.model("Song", db.musicSchema);
	
	db.playListSchema = new Schema({
		name: {
			type: String,
			index: true
		},
		music: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Song"
		},
		image: String
	}, {strict: true});
	db.playListSchema.index({name: 1, music: 1}, {unique: true});
	db.Playlist = mongoose.model("Playlist", db.playListSchema);
};

db.updateMusic = function(data, createNew, callback) {
	console.log("Creating music: " + data.path);
	var music = new db.Music();
	music.path = data.path;
	music.file = data.file;
	music.title = data.title;
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
		console.log("Updated " + music.title + " (" + music.file + ") to db: createNew = " + createNew);
		if (callback != null) {	callback();}
	});
	/*
	length: Number,
	startSilence: Number,
	endSilence: Number,
	comments: String,
	image: String
	*/
};

db.updatePlaylist = function(playlistName, dbMusic, callback) {
	if (playlistName !== null && dbMusic !== null) {
		//before creating an entry check it isn't already in db
		var query = db.Playlist.findOne({
			name: playlistName,
			music: dbMusic
		});
		var promise = query.exec();
		promise.addBack(function(err, hit){
			if(err) { throw err; } 
			if (hit === null || hit === undefined) {
				db.createPlaylistEntry(playlistName, dbMusic, callback);
			} else {
				console.log("Skipping duplicate: " + playlistName + " music " + dbMusic.title);
				if (callback != null) {	callback();}
			}
		});
	}
	else {
		console.warn("Null values supplied: " + playlistName + " music " + dbMusic);
	}
};

db.createPlaylistEntry = function(playlistName, dbMusic, callback) {
	var playlist = new db.Playlist();
	playlist.name = playlistName;
	playlist.music = dbMusic;
	playlist.save(playlist, function (err){
		if (err) {
			console.log("MongoDB playlist error");
			db._handleError(err);
		}
		console.log("Created: ", playlistName, " with: ", dbMusic);
		if (callback != null) {	callback();}
	});
};


db._handleError = function(err) {
	console.log("DB Error: " + err);
	throw err;
};

