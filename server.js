/**
 * server.js - NodeJS Restful API for PostgreSQL
 * 2017, by Ruben Costa Martinez @rubenbase
 *
 **/
// ******************************************
//			Import configurations
// ******************************************
var config = require("./config.json");
// ******************************************
//		Install NodeJS Dependencies
// ******************************************
// Express
var express = require("express");
// Serve-Static
var serveStatic = require("serve-static");
// Body-Parser
var bodyParser = require("body-parser");
// Multer
var multer = require("multer");
// PostgreSQL
var massive = require("massive");
var connectionString =
  "postgres://" +
  config.postgres.user +
  ":" +
  config.postgres.password +
  "@" +
  config.postgres.host +
  "/" +
  config.postgres.db;
var massiveInstance = massive.connectSync({
  connectionString: connectionString
});
var db;
// ******************************************
//					Initialize
// ******************************************
var app = express();
var startExpress = function () {
  app.listen(config.express.port);
  db = app.get("db");
  console.log("_____________________");
  console.log("HTTP and API server online");
  console.log("Listening on port " + config.express.port);
  console.log("_____________________");
};
var initialize = function () {
  startExpress();
};
// ******************************************
//					API
// ******************************************
// ------------------------------------------
//			Send back a 500 error
// ------------------------------------------
var handleError = function (res) {
  return function (err) {
    console.log(err);
    res.send(500, { error: err.message });
  };
};
// ------------------------------------------
//			Initialize demo table
// ------------------------------------------
var loadDemoData = function () {
  console.log("_____________________");
  console.log("Initialize demo table");
  var newDoc = {
    data: [
      {
        row: "Read documentation"
      },
      {
        row: "Go to the beach"
      },
      {
        row: "Create a robot"
      },
      {
        row: "Write a novel"
      }
    ]
  };
  db.saveDoc("steps", newDoc, function (err, response) {
    // "steps" table is created on the fly
    if (err) {
      handleError(res);
    }
    console.log(response);
  });
};
// ------------------------------------------
//				Retrieve all elements
// ------------------------------------------
var list = function (request, res, next) {
  console.log("_____________________");
  console.log("API - list/list");
  if (!db.steps) {
    loadDemoData();
    return;
  }
  db.steps.findDoc(1, function (err, doc) {
    if (err) {
      handleError(res);
    }
    console.log(doc.data);
    res.json({ data: doc.data });
  });
};
// ------------------------------------------
//	Insert an element on an existing object
// ------------------------------------------
var update = function (request, res, next) {
  console.log("_____________________");
  console.log("API - list/update");
  var newDoc = request.body.data;
  //	console.log(newDoc)
  db.steps.saveDoc({ id: 1, data: newDoc }, function (err, response) {
    if (err) {
      handleError(res);
    }
    console.log(response);
    res.json({ data: response });
  });
  //	console.log(object)
};
// ******************************************
//				Express Setup
// ******************************************
// Data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
// Define API routes
app.route("/api/list").get(list);
app.route("/api/update").post(update);
app.route("/api/initialize").post(loadDemoData);
// Static files server
app.use(serveStatic("./public"));
// Set a reference to the massive instance on Express' app:
app.set("db", massiveInstance);
initialize();
