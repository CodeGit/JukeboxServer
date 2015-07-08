/**
 * Created by maq on 06/07/2015.
 */

"use strict";

var Jukebox = {};
(function (context) {
    context.addMusicToQueue = function(path, musicId, title) {
        //setup the form
        var parameters = "music=" + musicId + "&title=" + title;
        //prepare ajax call
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", path, true);
        xmlHttpReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        xmlHttpReq.send(parameters);
        xmlHttpReq.onload = function () {
            alert("Response " + xmlHttpReq.responseText);
        };
        return false;
    };


    context.previousPage = function(path, page, total) {

    };

    context.nextPage = function(path, page, total) {

    };
})(Jukebox);
