"use strict";
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var cons = require('consolidate');

var app = express();

const data = {
  title: "page",
  content: ["one", "2", "trois"]
}

const exts = {
  "jade": "jade",
  "ejs": "ejs"
}

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/:engine/:file", function(req, res) {
  console.log(req.params.engine, req.params.file);
  let filepath = path.join(__dirname, "views", req.params.engine,
                            req.params.file + "." + exts[req.params.engine]);

  let filesrc = fs.readFileSync(filepath);
  let local = Object.assign(data);
  local.src = filesrc.toString();
  let t = cons[req.params.engine](filepath, local);
  t.then(f => res.end(f));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
