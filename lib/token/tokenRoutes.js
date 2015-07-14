"use strict";

/**
 * Created by maq on 14/07/2015.
 */

var express = require('express');

var router = express.Router();
module.exports = router;

router.get("/", function(req, res, next){
    res.send({
        tokens:req.session.tokens
    });
});