/**
 * Created by maq on 06/07/2015.
 */

"use strict";

var Jukebox = {};
(function (context) {
    context.addMusicToQueue = function(path, musicId) {
        //setup the form
        var parameters = "music=" + musicId;
        //prepare ajax call
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", path, true);
        xmlHttpReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlHttpReq.send(parameters);
        xmlHttpReq.onload = function () {
            //using bootstrap jquery
            var element = $("#alertBox");
            element.collapse('show');
            var response = JSON.parse(xmlHttpReq.responseText);
            element.text(response.message);
            console.log(response.message);
            Jukebox.updateTokens();
        };
        return false;
    };


    context.previousPage = function(path, page, total, resultsPerPage) {
        var newPage = (page - 1);
        if (newPage > -1) {
            this._newPage(path, newPage);
        }
    };

    context.nextPage = function(path, page, total, resultsPerPage) {
        var newPage = ((page * 1) + 1);
        if ((newPage * resultsPerPage) < total) {
            this._newPage(path, newPage);
        }

    };

    context._newPage = function(path,  newPage) {
        var uri = new URI(path);
        uri.removeSearch("page");
        uri.addSearch("page", newPage);
        console.log("Going to URL: " + uri.toString());
        location.assign(uri.toString());
        return false;
    };

    context.player = function(command) {
        console.log("Got player command " + command);
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("GET", "/player/" + command, true);
        xmlHttpReq.send();
        xmlHttpReq.onload = function () {
            var element = $("#alertBox");
            element.collapse('show');
            var response = JSON.parse(xmlHttpReq.responseText);
            element.text(response.message);
            console.log(response.message);
        };
    };

    context.hideAlertBox = function() {
        var element = $("#alertBox");
        element.collapse('hide');
    };

    context.removeEntryFromQueue = function(queueId) {
        var parameters = "queue=" + queueId;
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", "/queue/remove", true);
        xmlHttpReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlHttpReq.send(parameters);
        xmlHttpReq.onload = function () {
            //using bootstrap jquery
            var element = $("#alertBox");
            element.collapse('show');
            var response = JSON.parse(xmlHttpReq.responseText);
            //TODO add err message handling
            element.text(response.message);
            console.log(response.message);
            Jukebox.updateTokens();
            location.reload();
        };
    };

    context.moveEntryUpQueue = function(queueId) {
        var parameters = "queue=" + queueId;
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", "/queue/up", true);
        xmlHttpReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlHttpReq.send(parameters);
        xmlHttpReq.onload = function () {
            //using bootstrap jquery
            var element = $("#alertBox");
            element.collapse('show');
            var response = JSON.parse(xmlHttpReq.responseText);
            //TODO add err message handling
            element.text(response.message);
            console.log(response.message);
            Jukebox.updateTokens();
            location.reload();
        };
    };

    context.moveEntryDownQueue = function(queueId) {
        var parameters = "queue=" + queueId;
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", "/queue/down", true);
        xmlHttpReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlHttpReq.send(parameters);
        xmlHttpReq.onload = function () {
            //using bootstrap jquery
            var element = $("#alertBox");
            element.collapse('show');
            var response = JSON.parse(xmlHttpReq.responseText);
            element.text(response.message);
            console.log(response.message);
            Jukebox.updateTokens();
            location.reload();
        };

    };

    context.updateTokens = function() {
        var element = $("#tokens");
        if (element != null) {
            console.log("updating tokens");
            var xmlHttpReq = new XMLHttpRequest();
            xmlHttpReq.open("GET", "/tokens", true);
            xmlHttpReq.send();
            xmlHttpReq.onload = function () {
                var response = JSON.parse(xmlHttpReq.responseText);
                var element = $("#tokens");
                element.text(response.tokens);
            }
        }
    };

    context.search = function(path) {
        var searchElement = $("#search");
        var searchString = searchElement.val();
        if (searchString !== "") {
            var uri = new URI(path);
            uri.removeSearch("search");
            uri.addSearch("search", searchString);
            var pathName = uri.path();
            if (!pathName.match(/\/filter/)) {
                var searchPath = uri.path() + "/filter";
                uri.path(searchPath);
            }
            location.assign(uri.toString());
        }
        return false;
    }


    context.searchFieldOnKeyDown = function(path) {
        console.log("On key = " + event.keyCode);
        if(event.keyCode === 13) {
            context.search(path);
        }
        return false;
    };
})(Jukebox);
