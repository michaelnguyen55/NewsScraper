// Requiring our models
var db = require("../models");
var request = require("request");
var cheerio = require("cheerio");
var express = require("express");
var router = express.Router();

// Routes
// A GET route for scraping the nytimes website
router.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.nytimes.com", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Save an empty results array
    var results = [];
    // Now, we grab every story-heading within and h2 tag, and do the following:
    $("article").each(function(i, element) {
      // Add the title and href of every link, and save them as properties of an object that is pushed into the results array
      var title = $(element).children("h2.story-heading").children().text().trim();
      var link = $(element).children("h2.story-heading").children().attr("href");
      var summary = $(element).children("p.summary").text().trim();

      if(title && link && summary && title !== undefined && link !== undefined && summary !== undefined) {
      	results.push({
	        title: title,
	        link: link,
	        summary: summary
      	});
      }
      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(results, function(error, articles) {
        if(error) {
          console.log(error)
        }
        else {
          console.log(results)
        };
      });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
router.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({}).sort({_id:-1})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

module.exports = router;