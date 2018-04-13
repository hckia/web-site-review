'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
/* 
We need to update this with an example of uuid...
https://www.npmjs.com/package/uuid
blog-api/model.js has an example...
const uuid = require('uuid');
...
const BlogPosts = {
  create: function(title, content, author, publishDate) {
    const post = {
      id: uuid.v4(),
      title: title,
      content: content,
      author: author,
      publishDate: publishDate || Date.now()
    };
    this.posts.push(post);
    return post;
  }

Actually, it may be beter to add this to Schema...

    _id: { type: String, default: function genUUID() {
        uuid.v4()
    }}

https://stackoverflow.com/questions/27438882/using-uuids-in-mongoose-for-objectid-references
*/

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''}
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};
