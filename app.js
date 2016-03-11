"use strict";
const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs');

var cons = require('consolidate');

var app = express();

const data = {
  title: "page",
  content: ["one", "2", "trois"]
}

const exts = {
  "jade": "jade",
  "ejs": "ejs",
  "sideburns": "sb",
  "haml": "haml",
  "twig": "twig"
}

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", require("./routes/main"));

app.get("/:engine/:file", function(req, res) {
  const engine = req.params.engine,
        file = req.params.file;
  var filepath,
      filesrc,
      local,
      t;
  filepath = path.join(__dirname, "views", engine, file + "." + exts[engine]);
  filesrc = fs.readFileSync(filepath);
  local = Object.assign(data);
  local.src = filesrc.toString();
  if(engine === "sideburns") {

  } else {
    t = cons[engine](filepath, local);
  }
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
