'use strict';

/**
* DB api for application
*/

var config = require('lib/config');
var mongoose = require('mongoose');
var async = require("async");
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
	
	console.log("Initialising Music");
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
		sortArtist: {
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
	
	console.log("Initialising Playlist");
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
	
	console.log("Initialising User");
	db.UserSchema = new Schema({
		name: {
			type: String,
			index: true
		}, 
		password: {
			type: String,
			select: false
		}
	});
	db.User = mongoose.model("User", db.UserSchema);
	
	console.log("Initialising Artist");
	db.ArtistSchema = new Schema({
		artist: {
			type: String,
			unique: true,
			index: true
		},
		sortArtist: {
			type: String,
			index: true
		},
		tracks: {
			type:Number
		}
	});
	db.Artist = mongoose.model("Artist", db.ArtistSchema);
	
	console.log("Initialising Album");
	db.AlbumSchema = new Schema({
		album: {
			type: String,
			unique: true,
			index: true
		},
		tracks: {
			type: Number
		}
	});
	db.Album = mongoose.model("Album", db.AlbumSchema);
	
	console.log("Initialising PlaylistSummary");
	db.PlaylistSummarySchema = new Schema({
		playlist: {
			type: String,
			unique: true,
			index: true
		},
		tracks: {
			type: Number
		}
	});
	db.PlaylistSummary = mongoose.model("PlaylistSummary", db.PlaylistSummarySchema);
	
	console.log("Initialising Queue");
	db.QueueSchema = new Schema({
		ordinal: {
			type: Number
		}, 
		music: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Song"
		},
		votes: {
			type: Number
		}
	}, {strict:true});
	db.Queue = mongoose.model("Queue", db.QueueSchema);
};

db.updateMusic = function(data, createNew, callback) {
	console.log("Creating music: " + data.path);
	var music = new db.Music();
	music.path = data.path;
	music.file = data.file;
	music.title = data.title;
	music.artist = data.artist;
	music.sortArtist = (music.artist) ? music.artist.replace(/^The\s+/i, ""):music.artist;
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

db.updateSummaries = function(callback) {
	console.log("updateSummaries");
	var musicStream = db.Music.find().lean().stream();
	musicStream.on("data", function(hit) {
		async.waterfall([
             function(callback) {
            	 db.updateArtists(hit, callback);
             },
             function(callback){
            	 db.updateAlbums(hit, callback);
             }
		]);
	}).on("error", function(err) {
		callback(err);
	}).on("close", function (){
		console.log("Finished music summary");
	});
	/*
	db.Playlist.find(function(err, hits){
		if (err) {callback(err);}
		for(var i = 0; i < music.length; i++){
		
		}
	});
	*/
};

db.updateArtists = function(data, callback) {
	console.log("Adding " + data.artist + " to summary");
	var artist = {
			"artist": data.artist,
			"sortArtist": data.sortArtist
	};
	db.Artist.findOneAndUpdate({
		"artist": data.artist
		}, artist, {
			"upsert": true, 
			"new": true
		}, function(err, hit) {
			console.log("Hit = " + hit);
	});
};

db.updateAlbums = function(data, callback) {
	callback(null);
};

db.updatePlaylistSummary = function(data, callback) {
	callback(null);
};

db.updateQueue = function(data, callback) {
	
};

db._handleError = function(err) {
	console.log("DB Error: " + err);
	throw err;
};

