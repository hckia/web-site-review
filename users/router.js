'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  console.log(req.body);
  // res.send({
  //   response: "hey you"
  // })

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

  // const stringFields = ['username', 'password', 'firstName', 'lastName'];
  var nonStringField; //= stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
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
  // else if(typeof req.body.password !== "string"){
  //   nonStringField = req.body.password;
  // }

  console.log(nonStringField);

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // // If the username and password aren't trimmed we give an error.  Users might
  // // expect that these will work without trimming (i.e. they want the password
  // // "foobar ", including the space at the end).  We need to reject such values
  // // explicitly so the users know what's happening, rather than silently
  // // trimming them and expecting the user to understand.
  // // We'll silently trim the other fields, because they aren't credentials used
  // // to log in, so it's less of a problem.
  // const explicityTrimmedFields = ['username', 'password'];
  // const nonTrimmedField = explicityTrimmedFields.find(
  //   field => req.body[field].trim() !== req.body[field]
  // );

  // if (nonTrimmedField) {
  //   return res.status(422).json({
  //     code: 422,
  //     reason: 'ValidationError',
  //     message: 'Cannot start or end with whitespace',
  //     location: nonTrimmedField
  //   });
  // }

  // const sizedFields = {
  //   username: {
  //     min: 1
  //   },
  //   password: {
  //     min: 10,
  //     // bcrypt truncates after 72 characters, so let's not give the illusion
  //     // of security by storing extra (unused) info
  //     max: 72
  //   }
  // };
  // const tooSmallField = Object.keys(sizedFields).find(
  //   field =>
  //     'min' in sizedFields[field] &&
  //           req.body[field].trim().length < sizedFields[field].min
  // );
  // const tooLargeField = Object.keys(sizedFields).find(
  //   field =>
  //     'max' in sizedFields[field] &&
  //           req.body[field].trim().length > sizedFields[field].max
  // );

  // if (tooSmallField || tooLargeField) {
  //   return res.status(422).json({
  //     code: 422,
  //     reason: 'ValidationError',
  //     message: tooSmallField
  //       ? `Must be at least ${sizedFields[tooSmallField]
  //         .min} characters long`
  //       : `Must be at most ${sizedFields[tooLargeField]
  //         .max} characters long`,
  //     location: tooSmallField || tooLargeField
  //   });
  // }

  let {username, password, firstName = '', lastName = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  // firstName = firstName.trim();
  // lastName = lastName.trim();

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

/*

https://github.com/axios/axios

User.findOne({username}, (user, err) => {
  if (user) {
    return Promise.reject({
      code: 422,
      reason: 'ValidationError',
      message: 'Username already taken',
      location: 'username'
    });
  } else {
    return User.create({
      username,
      password: hash,
      firstName,
      lastName
    });
  }
  if (err) {
    if (err.reason === 'ValidationError') {
      return res.status(err.code).json(err);
    }
    res.status(500).json({code: 500, message: 'Internal server error'});
  }
})


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
*/

module.exports = {router};
