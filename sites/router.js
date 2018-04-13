'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const stringify = require('json-stringify');

const {Site} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['url', 'description'];
	const missingField = requiredFields.find(field => !(field in req.body));

	if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

//  Site.findOrCreate(req.body); // related to static var in model.js
  console.log("In API: " + req.body.url);
  const urlInfo = Site.extractDomain(req.body.url);
  console.log("whew! made it out of extractDomain function. Testing value of urlInfo " + urlInfo);
  const extractedSite = urlInfo.domain;
  console.log("Returning "+ extractedSite);
  //try this - https://stackoverflow.com/questions/33470767/get-values-by-key-name-mongodb-node-js-driver?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  // console.log("Site.find results " + stringify(Site.find({url: extractedSite})));
  // console.log("Site.find results " + stringify(Site.find({extractedSite})));

  //use this anonymous function to get any value from the database if it exists. If it does, return True, if it doesn't return false
  var siteFound = function(extractedSite, callback){
    Site.find().where("url", extractedSite)
    .exec(function(err, sites) {
      console.log("Inside exec here's what we find..." + sites.url);
      //if it finds the site, return 422?
      //if sites finds something, we need to throw the 422 we found below...
      callback(err, sites);
    });
  }


  // siteFound(extractedSite, function(err, sites){
  //   if(err){
  //     console.log(err);
  //     return;
  //   }

  //   console.log("WE FOUND IT! " + sites);
  // });

  // console.log("This is what find will return when looking for the url" + Site.find().where("url", extractedSite));
  //console.log("Site.find results " + Site.find().where("url", extractedSite));
  return Site.find({extractedSite})
  .count()
  .then(count => {
    if (count > 0) {
      // There is an existing user with the same username
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Site already taken',
        location: 'url'
      });
    }
    // If there is no existing user, hash the password
    return extractedSite;
  })
  .then(site => {
    return Site.create({
      url: extractedSite,
      description: req.body.description
    });
  })
  .then(site => {
    return res.status(201).json(site.serialize());
  })
  .catch(err => {
    // Forward validation errors on to the client, otherwise give a 500
    // error because something unexpected has happened
    if (err.reason === 'ValidationError') {
      return res.status(err.code).json(err);
    }
    res.status(500).json({code: 500, message: 'Internal server error'});
  });
  // console.log("testing value of extractedSite: " + extractedSite);
  // if (!Site.find({url: extractedSite})) {
  //   console.log("condition met");
  // 	Site.create({
  // 		url: url,
  // 		description: req.body.description
  // 	});
  // }
  // else {
  //   console.log("condition not met");
  // }
});

module.exports = {router};