"use strict";

var _gnosis = require("./helpers/gnosis.js");

var express = require("express");

require("dotenv").config();

var hbs = require('hbs');

require('@babel/core').transform('code', {
  presets: ['@babel/preset-env']
});

var path = require('path'); // custom imports


var app = express();
app.use(express["static"]('static'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
(0, _gnosis.main)().then(function () {//process.exit(0)
})["catch"](function (err) {
  console.log(err);
  process.exit(1);
});
app.get("/", function (req, res) {
  res.send("Hello World!");
});
app.listen(process.env.PORT, function () {
  console.log("Example app listening on http://localhost:".concat(process.env.PORT));
});