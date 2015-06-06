'use strict';

/**
* DB api for application
*/

var config = require('lib/config');
console.log(config);
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
	db.schema = new Schema({
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
	}, {strict: true});
	
	db.model = mongoose.model(config.settings.mongo.model, db.schema);
};


