/**
 * Config module test
 */

require('rootpath')();

var expect = require("chai").expect;
var sinon = require("sinon");
var assert = require("assert");

describe("config test", function() {
	before(function(){});
	it("", function(){
		var config = require("lib/config");
		assert(config != undefined, "Config instantiated");
		config.loadConfig("test/data/default.json");
		assert(config.settings !== undefined, "Config settings instantiated");
	});
});


