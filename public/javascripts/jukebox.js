/**
 * Created by maq on 06/07/2015.
 */

"use strict";

var Jukebox = {};
(function (context) {
    context.addMusicToQueue = function(path, musicId) {
        //setup the form
        var queueForm = new FormData();
        queueForm.append("music", musicId);
        //prepare ajax call
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("POST", path, true);
        xmlHttpReq.send(queueForm);
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
