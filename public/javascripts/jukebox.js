/**
 * Created by maq on 06/07/2015.
 */

"use strict";

var Jukebox = {};
(function (context) {
    context.addMusicToQueue = function(path, musicId) {
        var queueForm = document.createElement("form");
        queueForm.setAttribute("method", "POST");
        queueForm.setAttribute("action", path);
        var musicField = document.createElement("input");
        musicField.setAttribute("type", "hidden");
        musicField.setAttribute("name", "music");
        musicField.setAttribute("value", musicId);
        queueForm.appendChild(musicField)
        document.body.appendChild(queueForm);
        queueForm.submit();
        return false;
    };


    context.previousPage = function(path, page, total) {

    };

    context.nextPage = function(path, page, total) {

    };
})(Jukebox);
