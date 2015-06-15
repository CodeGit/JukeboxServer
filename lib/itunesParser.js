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
		
		var location = track.Location;
		var locationKey = "Location";
		//handle itunes location parsing bugs
		while(location == undefined && locationKey.length > 0) {
			locationKey = locationKey.substr(1, locationKey.length);
			console.log("Searching for Location with: " + locationKey);
			location = track[locationKey];
		}
		
		if (location != undefined) {
			var fileUrl = url.parse(location);
			itunes.findMusicByPath(fileUrl.pathname, track);
		 } else {
			console.log("Itunes track has no location: " + track.Artist + ": " + track.Album + ": " + track.Name);
			itunes.findMusicByFields(track);
		}
		
	});
	/*
	parser.on("artist", function(artist) {n
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
	console.log("Searching for " + track.Name + ": " + track.Artist + ": " + track.Album);
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
			if (hits.length === 0) {
				console.log("Failed to find " + track.Artist + " : " +  track.Title);
				itunes.attemptLocationMatch(track);
			} else {
				console.log("Found " + hits.length + " matches in DB")
				itunes.updateMusic(track);
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

itunes.attemptLocationMatch = function(trackData) {
	console.log("Attempting to find " + trackData.location);
};