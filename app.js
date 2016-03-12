"use strict";
const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs'),

    cons = require('consolidate'),
    sb = require('./local_modules/sideburns'),
    pregen = require("./local_modules/pregen");

var app = express();

const data = {
  title: "page",
  content: ["one", "2", "trois"],
  languages: [
    {
      name: "Jade",
      description: "This is jade. Write some stuff here.",
      preview: "/jade/example"
    },
    {
      name: "Sideburns",
      description: "I made this one :D Sideburns",
      preview: "/sideburns/example"
    },
    {
      name: "EJS",
      description: "This is EJS. Write some stuff here.",
      preview: "/ejs/example"
    },
    {
      name: "Twig",
      description: "This is twig. Write some stuff here",
      preview: "/twig/example"
    },
    {
      name: "Mustache",
      description: "This one is a mustache template that there is some more writing for. How interesting!",
      preview: "/mustache/example"
    }
  ]
}

const exts = {
  "jade": "jade",
  "ejs": "ejs",
  "sideburns": "sb",
  "haml": "haml",
  "twig": "twig",
  "mustache" : "mustache"
}

app.set('view engine', 'twig');
app.set('views', __dirname + '/views');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.render("index", data);
});

app.get("/:engine/:file", function(req, res) {
  const engine = req.params.engine,
        file = req.params.file;
  var filepath,
      filesrc,
      local,
      templator;

  filepath = path.join(__dirname, "views", engine, file + "." + exts[engine]);
  filesrc = fs.readFileSync(filepath);
  local = Object.assign(data);

  local.src = filesrc.toString();
  local.lang = engine;
  local.languagenames = Object.keys(local.languages);
  local.languagenames = local.languagenames.map(i => local.languages[i].name.toLowerCase());

  let pre = pregen(local);
  local.pregen = pre;
  local.pregen.src = "<code><pre>" + local.src + "</pre></code>";

  if(engine === "sideburns") {
    templator = sb;
  } else {
    templator = cons[engine];
  }

  templator(filepath, local).then(f => res.end(f));
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
