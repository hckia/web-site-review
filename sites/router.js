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
  //test this by adding this to your browser... http://websitereviewdomain.com/api/sites/google.com
  console.log("url get fired");
  console.log(req.params.url);
  const urlInfo = Site.extractDomain(req.params.url);
  const extractedSite = urlInfo.domain;

  function siteList(sites){
    console.log("siteList function activated. url sample here: " + sites[0].url)
    console.log("The length of the sites found is... "+sites.length)
    // i'm stuck at this point. if I do sitePayload as an array the first if statement inside my for returns "(node:8115) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'url' of undefined"
    // if I do sitePayload as an object I get "(node:8155) UnhandledPromiseRejectionWarning: TypeError: sitePayload.push is not a function"
    // If I do sitePayload as an object, but get rid of using a push function I also get (node:8247) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'url' of undefined.
    let sitePayload = {};
    for(let i = 0; i < sites.length; i++){
      const key = sites[i].url;
      if(key in sitePayload){
        console.log("CONDITION MET!");
      //instead of sites[i].description can we use this.description?
        // newDescription[i] = sites[i].description;
        // console.log("New description for "+ sites[i] + "/n Description: " +newDescription[i]);
        // sitePayload[sites[i].newDescription[i]];
        //console.log("Site Votes:  " + sites.votes[i]);
        var descriptionValue = {author: sites[i].author,description: sites[i].description}
        sitePayload[key].push(descriptionValue);
        console.log("new description added to site " + sitePayload[key]);
        // var votesKey = "votes";
        console.log("Inside Votes Index "+  sitePayload[key]);
        var descriptions = sitePayload[key];
        descriptions.forEach(description =>{
          description.votes && description.votes.map(vote => {
            console.log("Value: " + vote.value);
          })
        })
      }
      else{
        sitePayload[key] = [sites[i]];
        console.log("Adding new site: " + sitePayload[key]);
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
    console.log("Inside Promise, here's the site value found " + JSON.stringify(sites)); //null
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
  .catch(err => res.status(500).json({message: 'gateway error'})); //should be a 500
})

router.get('/',/*jwtAuth,*/jsonParser, (req,res) => {

   function siteList(sites){
    console.log("siteList function activated. url sample here: " + sites[0].url)
    console.log("The length of the sites found is... "+sites.length)
    // i'm stuck at this point. if I do sitePayload as an array the first if statement inside my for returns "(node:8115) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'url' of undefined"
    // if I do sitePayload as an object I get "(node:8155) UnhandledPromiseRejectionWarning: TypeError: sitePayload.push is not a function"
    // If I do sitePayload as an object, but get rid of using a push function I also get (node:8247) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'url' of undefined.
    let sitePayload = {};
    for(let i = 0; i < sites.length; i++){
      const key = sites[i].url;
      if(key in sitePayload){
        console.log("CONDITION MET!");
      //instead of sites[i].description can we use this.description?
        // newDescription[i] = sites[i].description;
        // console.log("New description for "+ sites[i] + "/n Description: " +newDescription[i]);
        // sitePayload[sites[i].newDescription[i]];
        //console.log("Values of sites in search of votes "+ sites)
        // sites.forEach(site => {
        //   site.votes?console.log("Site votes "+site.votes):console.log("nothing...");
        // })
        var descriptionValue = {author: sites[i].author,description: sites[i].description, votes: sites[i].votes}
        sitePayload[key].push(descriptionValue);
        console.log("Site added with new description " + sitePayload[key]);
        console.log("new description added to site " + sitePayload[key]);
        // var votesKey = "votes";
        console.log("Inside Votes Index "+  sitePayload[key]);
        var descriptions = sitePayload[key];
        descriptions.forEach(description =>{
          description.votes && description.votes.map(vote => {
            console.log("Value: " + vote.value);
          })
        })
      }
      else{
        sitePayload[key] = [sites[i]];
        console.log("Adding new site: " + sitePayload[key]);
      }
    }
    console.log("Done. ")
    //console.log(sites);
    return sitePayload;
  }

  return Site.find()
    .then(sites => {
      sites = siteList(sites);
      console.log("SITE PAYLOADDD " + JSON.stringify(sites));
      //console.log("Users first name: " + req.user.firstName);
      //commented out response says sites.map is not a function, current 201 shows on client side response.data.map is not a function.
      return res.status(201).json(sites);// res.json(sites.map(site => site.serialize()))
    });
/* 

{ _id: 5ad28d27d522cd34bbec1edd,
    url: 'google.com',
    description: 'flipflapp',
    __v: 0 },
  { _id: 5ad28ef52b3edf34de520fbc,
    url: 'googly.com',
    description: 'flipflapp',
    __v: 0 },
  { _id: 5ad28ef72b3edf34de520fbd,
    url: 'googly.com',
    description: 'flipflapp',
    __v: 0 },
*/

  // return Site.find().skip(skips).limit(numOfSites)
  //   .then(sites => res.json(sites.map(site => site.serialize())))
  //   .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.post('/vote/',jwtAuth, jsonParser,(req, res) => {
  //this would be when we require...
  //req.param.value --> yep or nope.
  //req.body.value <-- if in payload and if body-parser (jsonParser var) is defined
  //req.user.firstName <-- if from server.
  console.log(req.body);
  console.log("Voter: " + req.user.username);
  console.log("Vote: " + req.body.vote);
  console.log("url: " + req.body.url);
  console.log("author: " + req.body.author);
  /* 
  console.log("Vote: " + req.body.vote);
  Site.updateOne({url: 'thisisatest.com', author: 'billaybobbillybob'}, [0].votes[Number(req.body.vote)], function (err, res){
    if(err) throw err;
    console.log(res);
  })
  */
  //var urlToUpdate = "thisisatest.com";//req.body.url;
  //console.log(Site.find().where('url', 'thisisatest.com'));
  var voter = req.user.username;
  var voted = req.body.vote;
  var castVote = {user: voter, value:voted};
  var url = req.body.url;
  console.log("var url: "+ url)
  var author = req.body.author;

  var query = {url: url, author: author};
 // var paramToUpdate = {$push: {votes: castVote}};


  return Site.findOne(query).then(site => {
        console.log("SITES "+site);
        console.log("voter "+ voter);
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
        console.log("After array push sites value is... " + site);
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
