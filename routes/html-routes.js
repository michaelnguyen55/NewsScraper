var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
	res.render("index");
});

router.get("/hello", function(req, res) {
	res.send("hello");
});

module.exports = router;