"use strict";

/**
 * New node file
 */

var fs = require("fs");
var url = require("url");
var itunesReader = require("itunes-data");
var db = require('lib/musicDatabase');	

var itunes = {};
module.exports = itunes;

itunes.createPlaylists = function(file) {
	console.log("Opening: " + file)
	var parser = itunesReader.parser();
	var stream = fs.createReadStream(file);
	
	
	parser.on("track", function(track) {
		console.log("Track: " + track.Name);
		var fileUrl = url.parse(track.Location);
		itunes.findMusicByPath(fileUrl.pathname, track);
	});
	/*
	parser.on("artist", function(artist) {
		console.log("artist: " + artist);
	});
	parser.on("album", function(album) {
		console.log("album: " + album);
	});
	*/
	parser.on("playlist", function(playlist) {
		console.log("playlist: " + playlist);
	});
	
	stream.pipe(parser);
};

itunes.findMusicByPath = function(path, track) {
	var query = db.Music.findOne({path: path});//music paths are unique
	var promise = query.exec();
	promise.addBack(function(err, hit){
		if(err) {
			throw err;
		} else {
			if (hit == undefined) {
				//no database match on location 
				console.log("No match found in db");
				if (fs.exists(path)) {
					//if file exists on disk add it to the db
					itunes.createMusic(track);
				} else {
					//otherwise search using artist,album and title
					itunes.findMusicByFields(track);
				}
			} else {
				//update existing metadata for file in db
				itunes.updateMusic(hit, track);
			}
		}
	});
};

itunes.findMusicByFields = function (track) {
	console.log("Searching for name, album, artist");
	var query = db.Music.find({
		name: track.Name,
		artist: track.Artist,
		album: track.Album
	}); //there probably shouldn't be more than one hit but there may be duplicates
	var promise = query.exec();
	promise.addBack(function(err, hits){
		if (err) {
			throw err;
		} else { 
			if (hits == undefined) {
				console.log("Failed to find " + track.Artist + " : " +  track.Title);
				
			} else {
				itunes.updateMusic(hits, track);
			}
		}
	});
};

itunes.createMusic = function(trackData) {
	console.log("Creating music");
};

itunes.updateMusic = function(music) {
	console.log("Updating music");
};