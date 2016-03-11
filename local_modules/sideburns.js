"use strict";
const fs = require("fs"),
      q = require("q"),
      sb = require("bp-sideburns");
module.exports = function sideburns(path, data) {
  let def = q.defer();
  fs.readFile(path, (err, buffer) => {
    if(err) {
      def.reject(err);
    } else {
      let file = buffer.toString();
      def.resolve(sb(file, data));
    }
  });
  console.dir(def.promise);
  return def.promise;
}
