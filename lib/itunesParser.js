"use strict";

/**
 * Updates songs and playlists from itunes playlist xml file
 */

var fs = require("fs");
var url = require("url");
var itunesReader = require("itunes-data");
var db = require('lib/musicDatabase');	
var musicSCanner = require("lib/musicScanner");

var itunes = {};
module.exports = itunes;
itunes.musicIdentifierMap = {};

itunes.createPlaylists = function(file) {
	console.log("Opening: " + file);
	var parser = itunesReader.parser();
	var stream = fs.createReadStream(file);
	
	
	parser.on("track", function(track) {
		console.log("Track: " + track.Name);
		itunes.musicIdentifierMap[track["Track ID"]] = track;
		//var location = track.Location;
		//handle itunes location parsing bugs
		var location = track.Location || itunes._fixLocationBug(track.Location, track);
		
		if (location != undefined) {
			var fileUrl = url.parse(location);
			itunes.findMusicByPath(fileUrl.pathname, track);
		 } else {
			console.warn("Itunes track has no location: " + track.Artist + ": " + track.Album + ": " + track.Name);
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
		console.log("Processing playlist: ", playlist.Name, " items = ", playlist["Playlist Items"].length);
		for(var i = 0; i < playlist["Playlist Items"].length; i++) {
			var item = playlist["Playlist Items"][i];
			var trackData = itunes.musicIdentifierMap[item["Track ID"]];
			if (trackData == undefined) {
				throw("Failed to find data matching ID: ",item["Track ID"]);
			}
			itunes.addMusicToPlaylist(playlist.Name, trackData);
			
		}
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
				console.log("No match to path found in db");
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
		title: track.Name,
		artist: track.Artist,
		album: track.Album
	}); //there probably shouldn't be more than one hit but there may be duplicates
	var promise = query.exec();
	promise.addBack(function(err, hits){
		if (err) {
			throw err;
		} else { 
			if (hits.length === 0) {
				console.log("Failed to find " + track.Artist + " : " +  track.Name);
				itunes.attemptFilenameMatch(track);
			} else {
				console.log("Found " + hits.length + " matches in DB");
				if (hits.length > 1) {
					console.warn("Got more than one hit for Name = " + track.Name + " Artist = " + track.Artist + " Album = " + track.Album);
				}
				for(var i=0; i < hits.length; i++) {
					itunes.updateMusic(hits[i], track);
				}
			}
		}
	});
};

itunes.createMusic = function(itunesData) {
	console.log("Creating music");
	var path = itunesData.Location;
	var data = {};
	data.path = path;
	data.file = path.basename(path);
	data.title = itunesData.Name;
	data.artist = itunesData.Artist;
	data.album = itunesData.Album;
	data.rating = itunesData.Rating;
	data.track = itunesData["Track Number"];
	data.year = itunesData.Year;
	//data.genre = itunesData.Genre;
	data.size = itunesData.Size;
	data.samplerate = itunesData["Sample Rate"];
	data.length = itunesData["Total Time"];
	data.type = itunesData.Kind;
	db.updateMusic(data, true);
};

itunes.updateMusic = function(music, itunesData) {
	console.log("Updating music");
	music.title = itunesData.Name;
	music.artist = itunesData.Artist;
	music.album = itunesData.Album;
	music.rating = itunesData.Rating;
	music.track = itunesData["Track Number"];
	music.year = itunesData.Year;
	//music.genre = itunesData.Genre;
	music.size = itunesData.Size;
	music.samplerate = itunesData["Sample Rate"];
	music.length = itunesData["Total Time"];
	music.type = itunesData.Kind;
	music.save(function(err, result){
		if (err) {
			throw err;
		} else {
			console.log("Update: " + music.file);
		}
	});
};

itunes.attemptFilenameMatch = function(trackData) {
	console.log("Attempting to find " + trackData.Location);
};

itunes._fixLocationBug = function(location, track) {
	var locationKey = "Location";
	while(location == undefined && locationKey.length > 0) {
		locationKey = locationKey.substr(1, locationKey.length);
		console.log("Searching for Location with: " + locationKey);
		location = track[locationKey];
	}
	return location;
};

itunes.addMusicToPlaylist = function(playlistName, itunesData) {
	console.log("Playlist: ", playlistName, " adding ", itunesData.Name);
	var query = db.Music.find({
		title: itunesData.Name,
		artist: itunesData.Artist,
		album: itunesData.Album
	}); //there probably shouldn't be more than one hit but there may be duplicates
	var promise = query.exec();
	promise.addBack(function(err, hits){
		if (err) {
			throw err;
		} else { 
			if (hits.length === 0) {
				throw("Failed to find " + itunesData.Artist + " : " +  itunesData.Name);
			} else {
				console.log("Found " + hits.length + " matches in DB");
				if (hits.length > 1) {
					console.warn("Got more than one hit for Name = " + itunesData.Name + " Artist = " + itunesData.Artist + " Album = " + itunesData.Album);
				}
				for(var i=0; i < hits.length; i++) {
					db.updatePlaylist(playlistName, hits[i].path);
				}
			}
		}
	});
	
};