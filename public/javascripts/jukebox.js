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

    context._newPage = function(path, newPage) {
        var url = path + "?page=" + newPage;
        console.log("previousPage URL: " + url);
        location.assign(url);
        return false;
    }

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

    }
})(Jukebox);
