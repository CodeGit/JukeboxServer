'use strict';

/**
 * Config module
 */

var fs = require('fs');

var config = {};
module.exports = config;

config.loadConfig = function(file) {
	console.log("Loading config from " + file);
	config.settings = JSON.parse(fs.readFileSync(file, "utf8"));
};