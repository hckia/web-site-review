'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const stringify = require('json-stringify');
const passport = require('passport');

const {Site} = require('./models');

const router = express.Router();

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');

const jsonParser = bodyParser.json();
const jwtAuth = passport.authenticate('jwt', { session: false });
const numOfSites = 10;
var skips = 0;

router.get('/:url',(req, res) => {
  //test this by adding this to your browser... http://websitereviewdomain.com/api/sites/google.com
  console.log("url get fired");
  console.log(req.params.url);
  const urlInfo = Site.extractDomain(req.params.url);
  const extractedSite = urlInfo.domain;

  function siteList(sites){
    console.log("siteList function activated. url sample here: " + sites[0].url)
    console.log("The length of the sites found is... "+sites.length)
    let sitePayload = {};
    for(let i = 0; i < sites.length; i++){
      const key = sites[i].url;
      if(key in sitePayload){
        //console.log("Key exists in site payload");
        // console.log("New description for "+ sites[i] + "/n Description: " +newDescription[i]);
        //console.log("Site Votes:  " + sites.votes[i]);
        var descriptionValue = {author: sites[i].author,description: sites[i].description}
        sitePayload[key].push(descriptionValue);
        console.log("new description added to site " + sitePayload[key]);
        console.log("Inside Votes Index "+  sitePayload[key]);
        var descriptions = sitePayload[key];
        descriptions.forEach(description =>{
          description.votes && description.votes.map(vote => {
            //console.log("Value: " + vote.value);
          })
        })
      }
      else{
        sitePayload[key] = [sites[i]];
        //console.log("Adding new site: " + sitePayload[key]);
      }
    }
    console.log("Done. ")
    //console.log(sites);
    return sitePayload;
  }

  //will require res.render("someejs") for this to not allow the browser to hang.
  return Site.find({url: extractedSite})
  .then(sites => {
    sites = siteList(sites);
    //console.log("Inside Promise, here's the site value found " + JSON.stringify(sites));
    if(sites == null){
      console.log("condition met site is null")
      // There is an existing user with the same username
      return res.status(422).json({message: "Validation error: Site does not exist"});
    }
    // If there is no existing user, hash the password
    console.log("before next part of Promise here's the value of site " + sites);
    return sites;
  })
  .then(sites => {
    console.log("201 value of site " + sites)
    return res.status(201).json(sites);
  })
  .catch(err => res.status(404).json({message: 'site not found'}));
})

router.get('/',jsonParser, (req,res) => {

   function siteList(sites){
    console.log("siteList function activated. url sample here: " + sites[0].url)
    console.log("The length of the sites found is... "+sites.length)
    let sitePayload = {};
    for(let i = 0; i < sites.length; i++){
      const key = sites[i].url;
      if(key in sitePayload){
        console.log("Key exists in site payload");
        // console.log("New description for "+ sites[i] + "/n Description: " +newDescription[i]);
        //console.log("Values of sites in search of votes "+ sites)
        var descriptionValue = {author: sites[i].author,description: sites[i].description, votes: sites[i].votes}
        sitePayload[key].push(descriptionValue);
        //console.log("Site added with new description " + sitePayload[key]);
        //console.log("new description added to site " + sitePayload[key]);
        //console.log("Inside Votes Index "+  sitePayload[key]);
        var descriptions = sitePayload[key];
        descriptions.forEach(description =>{
          description.votes && description.votes.map(vote => {
            //console.log("Value: " + vote.value);
          })
        })
      }
      else{
        sitePayload[key] = [sites[i]];
        //console.log("Adding new site: " + sitePayload[key]);
      }
    }
    console.log("Done. ")
    //console.log(sites);
    return sitePayload;
  }

  return Site.find()
    .then(sites => {
      sites = siteList(sites);
      //console.log("SITE PAYLOADDD " + JSON.stringify(sites));
      //console.log("Users first name: " + req.user.firstName);
      return res.status(201).json(sites);
    });

});

router.post('/vote/',jwtAuth, jsonParser,(req, res) => {
  //this would be when we require...
  //req.param.value --> yep or nope.
  //req.body.value <-- if in payload and if body-parser (jsonParser var) is defined
  //req.user.firstName <-- if from server.
  //console.log(req.body);
  console.log("Voter: " + req.user.username);
  console.log("Vote: " + req.body.vote);
  console.log("url: " + req.body.url);
  console.log("author: " + req.body.author);
  console.log("Vote: " + req.body.vote);
  //console.log(Site.find().where('url', 'thisisatest.com'));
  var voter = req.user.username;
  var voted = req.body.vote;
  var castVote = {user: voter, value:voted};
  var url = req.body.url;
  console.log("var url: "+ url)
  var author = req.body.author;

  var query = {url: url, author: author};

  return Site.findOne(query).then(site => {
        console.log("SITES: "+site);
        console.log("voter: "+ voter);
        //console.log("first voter " + site.votes[0]);
        let voteIndex = site.votes.findIndex(vote => vote.user == voter);
        console.log("Site index " + voteIndex);
        if(voteIndex >= 0 ){
            site.votes[voteIndex] = castVote;
            console.log(site.votes[voteIndex]);
        } else {
            site.votes.push(castVote);
            console.log(site.votes[voteIndex]);
        }
        //console.log("After array push sites value is... " + site);
        return site.save();
    })
  .then(savedSite => {
    return res.status(201).json({code: 201, message: 'voted'});
  })
   .catch(err => {
    console.log(err);
    return res.status(401).json({code: 401, message: err});
   })
})

router.post('/', jwtAuth, jsonParser, (req, res) => {

	const requiredFields = ['url', 'description'];
	const missingField = requiredFields.find(field => !(field in req.body));
  console.log("Users username "+req.user.username);
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
  const extractedSite = urlInfo.domain.toLowerCase();
  console.log("Returning "+ extractedSite);
  
  return Site.findOne({url: extractedSite, author: req.user.username})
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
    console.log(req.user.username);
    return Site.create({
      url: extractedSite,
      description: req.body.description,
      author: req.user.username
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
    res.status(500).json({code: 500, message: err});
  });
});

module.exports = {router};
