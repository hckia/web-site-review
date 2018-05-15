'use strict';
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.Promise = global.Promise;
/*

Site schema
https://repl.it/@hckia/URL-RegEx-Extractions-1
we'll need this for extracting the url. still need to figure out how to do the schema and statics.
use users/router.js and users/model.js as a template
*/

const SiteSchema = mongoose.Schema({
	url: {type: String, required: true},
	description: {type: String, required: true},
  author: {type: String, required: true},
  votes: [{user: {type: String, required: true}, value: {type: Number, required: true}}]
});

SiteSchema.methods.serialize = function() {
  return {
    url: this.url || '',
    description: this.description || ''
  };
};

// www.database.lookup.yahoo.com?foo=bar
// https://www.debuggex.com/cheatsheet/regex/javascript


SiteSchema.statics.extractDomain = function(url){
  console.log("in static: " + url);
  let matches = url.match(/(https?:\/\/)?(([a-zA-Z0-9]+\.)+)?([a-zA-Z0-9]+\.[a-zA-Z0-9]+)(\/|\?|$)/i);
  //question mark makes the preceding token optional, for example (https?) means the s is not required.
  // matches[0] == full string matched by regex
  // matches[1] == first capture group (protocol)
  console.log("testing protocol regex for http and https: "+url.match(/(https?)/i));
  // matches[2] == second capture group (all subdomains)
  console.log("testing  regex for ALL sub and apex domain: "+url.match(/(([a-zA-Z0-9]+\.)+)?([a-zA-Z0-9]+\.[a-zA-Z0-9]+)($)/i));
  // matches[3] == third capture group (last subdomain)
  // matches[4] == fourth capture group (domain and extension)
  console.log("testing regex for apex: "+url.match(/([a-zA-Z0-9]+\.[a-zA-Z0-9]+)($)/i));
  // matches[5] == fifth capture group (trailing slash or EOL)

  /*
Example of https://google.com/
matches[0]https://google.com/
matches[1]https
matches[2]undefined
matches[3]undefined
matches[4]google.com
matches[5]/
  */

  console.log("matches[0]" + matches[0]);
  console.log("matches[1]" + matches[1]);
  console.log("matches[2]" + matches[2]);
  console.log("matches[3]" + matches[3]);
  console.log("matches[4]" + matches[4]);
  console.log("matches[5]" + matches[5]);
  return {
    protocol: matches[1],
    subdomains: matches[2] && matches[2].slice(0, -1),
    subdomain: matches[3] && matches[2].slice(0, -1),
    domain: matches[4],
    rest: matches[5],
    matchedURL: matches[0],
    TLD: matches[4] && matches[4].split('.')[1]
  };
};

const Site = mongoose.model('Site', SiteSchema);

module.exports = {Site};