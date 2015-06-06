'use strict';

/**
* DB api for application
*/

var config = require('lib/config');
var mongoose = require('mongoose');

var setup = function() {
	console.log("Setting up schema and model");
	var Schema = mongoose.Schema;
	var schema = new Schema({
		path: String,
		title: String,
		artist: String,
		track: String,
		album: String,
		year: String,
		genre: String,
		length: Number,
		startSilence: Number,
		endSilence: Number,
		comments: String
	});
};


setup();

