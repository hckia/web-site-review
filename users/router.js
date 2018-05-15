'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  //console.log(req.body);
  const requiredFields = ['firstName','lastName','username', 'password'];
  var missingField;
  console.log("First Name value " + req.body.firstName + " and its data type is " + typeof req.body.firstName);
  console.log("First Name value " + req.body.lastName + " and its data type is " + typeof req.body.lastName);
  console.log("First Name value " + req.body.username + " and its data type is " + typeof req.body.username);
  console.log("First Name value " + req.body.password + " and its data type is " + typeof req.body.password);

  if(req.body.firstName == ''){
    missingField = req.body.firstName;
  }
  else if(req.body.lastName == ''){
    missingField = req.body.lastName;
  }
  else if(req.body.username == ''){
    missingField = req.body.username;
  }
  else if(req.body.password == ''){
    missingField = req.body.password;
  }

  console.log(missingField);

  if (missingField == '') {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  var nonStringField;
  if(Number(req.body.firstName)){
    console.log("inside if statement for firstName and the data type is... " + typeof req.body.firstName);
    nonStringField = Number(req.body.firstName);
  }
  else if(Number(req.body.lastName)){
    console.log("inside if statement for lastName and the data type is...  " + typeof req.body.lastName);
    nonStringField = Number(req.body.lastName);    
  }
  else if(Number(req.body.username)){
    console.log("inside if statement for username and the data type is...  " + typeof req.body.username);
    nonStringField = Number(req.body.username);
  }

  console.log(nonStringField);

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  let {username, password, firstName = '', lastName = ''} = req.body;

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

// Never expose all your users like below in a prod application
// we're just doing this so we have a quick way to see
// if we're creating users. keep in mind, you can also
// verify this in the Mongo shell.
router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = {router};
