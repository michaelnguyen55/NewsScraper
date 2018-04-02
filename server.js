var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var request = require("request");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use body-parser for handling form submissions
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

mongoose.connect("mongodb://localhost/newsdb");

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
var htmlRoutes = require("./routes/html-routes.js");
var apiArticles = require("./routes/articles.js");

app.use("/", htmlRoutes);
app.use("/api", apiArticles)

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
