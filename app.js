"use strict";
const express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    fs = require('fs'),

    uuid = require("node-uuid"),
    mongoose = require("mongoose"),
    microtime = require("microtime"),
    q = require("q"),

    cons = require('consolidate'),
    sb = require('./local_modules/sideburns'),
    pregen = require("./local_modules/pregen");

var app = express();

const data = {
  title: "Templator",
  content: ["one", "2", "trois"],
  languages: [
    {
      name: "Jade",
      description: "Differs from the norm with a minimal style that re-invents how HTML is written. Uses barewords and single braces to insert data depending on context. HTML is written in a jade-specific manner, with escaping determined by insertion method used.",
      preview: "/jade/example",
      colour: "teal"
    },
    {
      name: "Sideburns",
      description: "Developed by Louis Capitanchik for a web based coursework, focuses on declarative sectioning and logic statements. Uses square brackets for content. Content written in the standard native manner, is not escaped, but can be escaped in a configurable manner with directives.",
      preview: "/sideburns/example",
      colour: "light-blue"
    },
    {
      name: "EJS",
      description: "A templating language that allows for the insertion of arbitrary javascript into the rendering logic by including it within tags, in a similar manner to standard PHP. Escaping depends on type of tag used, otherwise HTML is written in a standards compliant manner.",
      preview: "/ejs/example",
      colour: "amber"
    },
    {
      name: "Twig",
      description: "Twig was originally a PHP templating language, but has recieved ports to other languages. Uses braces for content tags and brace/percentage delimiters for logic statements. Content is escaped by use of filters, and HTML is written in a standards comliant manner.",
      preview: "/twig/example",
      colour: "red"
    },
    {
      name: "Mustache",
      description: "Mustache itself is more of a standard for templating languages than a language itself, making the reference implementation a good choice for comparisons. Tags are based on braces and are html-escaped by default. HTML is written in a standards compliant manner.",
      preview: "/mustache/example",
      colour: "purple"
    }
  ],
  books: [
    "Harry Potter And The Half-Blood Prince; J.K.Rowling",
    "The Final Empire; Brandon Sanderson",
    "The Colour Of Magic; Terry Pratchet",
    "Moon Over Soho; Ben Aaronovitch"
  ],
  likes: {
    animal: "Sloths",
    food: "Spinach",
    sport: "Rowing"
  },
  dislikes: {
    animal: "Mole Rats",
    food: "Pineapple",
    sport: "Jai-alai"
  }
}

const exts = {
  "jade": "jade",
  "ejs": "ejs",
  "sideburns": "sb",
  "haml": "haml",
  "twig": "twig",
  "mustache" : "mustache"
}

mongoose.connect("mongodb://user:P4ssw0rd@ds013589.mlab.com:13589/templator");

var TestModel = mongoose.model("Test", {
    engine: String,
    file: String,
    ident: String,
    time: Number
});

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
  let local = data,
      func = (name) => {
        let def = q.defer();
        TestModel.aggregate([
          {$match: {engine: name}},
          {$group: {_id: "$engine", average: {$avg: "$time"}}}
        ], (err, docs) => {
          if(err) {
            def.reject(err);
          } else {
            def.resolve(docs[0] || {_id: name, average: 0});
          }
        });
        return def.promise;
      };
  q.all([func("ejs"), func("twig"), func("mustache"), func("sideburns"), func("jade")]).done(docs => {
    for(let i = 0; i < docs.length; i += 1) {
      for(let j = 0; j < local.languages.length; j += 1) {
          if (local.languages[j].name.toLowerCase() === docs[i]._id.toLowerCase()) {
          local.languages[j].average = (docs[i].average / 1000).toFixed(4);
        }
      }
    }
    res.render("index", local);
  });
});

app.get("/benchmark/:id", (req, res) => {
  TestModel.findOne({ident: req.params.id}, (err, data) => {
    if(err) {
      console.log(err);
      res.json({code: 500, message: err});
    } else {
      res.json(data);
    }
  });
});

app.get("/:engine/:file", function(req, res) {
  const engine = req.params.engine,
        file = req.params.file;
  var filepath,
      filesrc,
      local,
      language,
      templator,
      reqId = uuid.v1(),
      benchmark = {
        engine: engine,
        file: file,
        time: 0
      };
  console.log(reqId);
  benchmark.ident = reqId;
  benchmark.time = microtime.now();

  filepath = path.join(__dirname, "views", engine, file + "." + exts[engine]);
  filesrc = fs.readFileSync(filepath);
  local = Object.assign(data);

  for(let i = 0; i < local.languages.length; i += 1) {
    if(local.languages[i].name.toLowerCase() == engine.toLowerCase()) {
      language = local.languages[i];
    }
  }

  local.src = filesrc.toString();
  local.lang = engine;
  local.languagenames = Object.keys(local.languages);
  local.languagenames = local.languagenames.map(i => local.languages[i].name.toLowerCase());
  local.id = reqId;
  local.page = file;
  local.language = language;
  local.colour = language.colour;

  let pre = pregen(local);
  local.pregen = pre;

  if(engine === "sideburns") {
    templator = sb;
  } else {
    templator = cons[engine];
  }

  templator(filepath, local).then(f => res.end(f));
  benchmark.time = microtime.now() - benchmark.time;
  var t = new TestModel(benchmark);
  t.save((err) => {
    if(err){
      console.log(err);
    } else {
      console.log(t);
    }
  })
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
