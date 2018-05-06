'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const stringify = require('json-stringify');
const passport = require('passport');

const {Site} = require('./models');

const router = express.Router();

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');

const jsonParser = bodyParser.json();
//https://jwt.io/ <-- may ened this later for grabbing username
const jwtAuth = passport.authenticate('jwt', { session: false });
var siteNum = 0;
const numOfSites = 10;
var skips = 0;

function siteCounter() {
  Site.count()
  .exec(function(err, sites){
    siteNum = sites;
  })
  console.log("Number of sites outside exec " + JSON.stringify(siteNum));
}

siteCounter();

// see this on pagination - https://evdokimovm.github.io/javascript/nodejs/mongodb/pagination/expressjs/ejs/bootstrap/2017/08/20/create-pagination-with-nodejs-mongodb-express-and-ejs-step-by-step-from-scratch.html
// https://www.hacksparrow.com/mongodb-pagination-using-skip.html


router.get('/:url',(req, res) => {
  //test this by adding this to your browser... http://localhost:8080/api/sites/google.com
  console.log("url get fired");
  console.log(req.params.url);
  const urlInfo = Site.extractDomain(req.params.url);
  const extractedSite = urlInfo.domain;
  //will require res.render("someejs") for this to not allow the browser to hang.
  return Site.findOne({url: extractedSite})
  .then(site => {
    console.log("Inside Promise, here's the site found " + site);
    if(!site){
      // There is an existing user with the same username
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Site already taken',
        location: 'url'
      });
    }
    // If there is no existing user, hash the password
    console.log("before next part of Promise here's the value of site " + site);
    return site;
  })
  .then(site => {
    console.log("201 value of site " + site)
    return res.status(201).json(site);
  })
  .catch(err => res.status(404).json({message: 'not found'})); //should be a 500
})

router.get('/',/*jwtAuth,*/jsonParser, (req,res) => {
  // console.log(req.query.url);
  //req.query.limit would be via query string (?limit=10)
  //req.body.limit if we were to include it in payload

  //pagination below
  console.log("Number of sites outside exec " + JSON.stringify(siteNum));
  if(siteNum-skips > 10){
    console.log("Number of sites outside exec " + JSON.stringify(siteNum));
    skips = skips + numOfSites;
    console.log("Skips value " + skips);
  }
  else if(siteNum-skips < 10){
    console.log("siteNum-skips is less than 10. Value at " + JSON.stringify(siteNum-skips));
    skips = skips + (siteNum-skips);
  }
  if(siteNum <= skips){
    console.log("Resetting sentinel...");
    skips = 0;
  }
  return Site.find().skip(skips).limit(numOfSites)
    .then(sites => res.json(sites.map(site => site.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/:url/:username',jwtAuth,(req, res) => {
  //this would be when we require...
  //req.body.vote <-- if in payload
  //req.user.firstName <-- if from server.
})

router.post('/', jwtAuth, jsonParser, (req, res) => {

	const requiredFields = ['url', 'description'];
	const missingField = requiredFields.find(field => !(field in req.body));
  console.log(req.user.firstName);
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
  console.log("checking description value --> " + req.body.description);
  const urlInfo = Site.extractDomain(req.body.url);
  console.log("whew! made it out of extractDomain function. Testing value of urlInfo " + JSON.stringify(urlInfo));
  const extractedSite = urlInfo.domain;
  console.log("Returning "+ extractedSite);

  // var siteFound = true;
  // //use this anonymous function to get any value from the database if it exists. If it does, return True, if it doesn't return false
  // function siteFinder(extractedSite/*, callback*/){
  //   Site.find().where("url", extractedSite)
  //   .exec(function(err, sites) {
  //     if(sites.length > 0) {
  //       console.log("A matching site has been found boolian stays as " + siteFound);
  //       for(var i=0; i < sites.length; i++){
  //         var site = sites[i].url;
  //         console.log("inside exec here's what we find for site " + i + " " +site);
  //       };
  //     }
  //     else {
  //       siteFound = false;
  //       console.log("No matching site was found switching boolian to " + siteFound);
  //     }
  //     // console.log("INSIDE exec we use the count function on sites to get... " + sites.length);
  //     // for(var i=0; i < sites.length; i++){
  //     //     var site = sites[i].url;
  //     //     console.log("inside exec here's what we find for site " + i + " " +site);
  //     // };
  //   });
  //   return siteFound;
  // }
  // siteFinder(extractedSite);
  
  return Site.findOne({url: extractedSite})
  .then(site => {
    console.log("Inside Promise, here's the site found " + site);
    if(site){
      // There is an existing user with the same username
      return Promise.reject({
        code: 422,
        reason: 'ValidationError',
        message: 'Site already taken',
        location: 'url'
      });
    }
    // If there is no existing user, hash the password
    console.log("before next part of Promise here's the value of site " + site);
    return extractedSite;
  })
  .then(site => {
    return Site.create({
      url: extractedSite,
      description: req.body.description
    });
  })
  .then(site => {
    console.log("201 value of site " + site)
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
