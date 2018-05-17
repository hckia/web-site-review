'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { app, runServer, closeServer } = require('../server');
const { Site } = require('../sites');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Site endpoint', function(){
	const url = 'example.com'
	const description = 'sample description'
	const author ='aTestAuthor'

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
  	return Site.create({
  		url,
  		description,
  		author
  	})
  });

  afterEach(function () {
    return Site.remove({});
  });

  describe('/api/sites', function(){
  	it('Should reject requests with no parameters', function(){
  		return chai
  		.request(app)
  		.post('/api/sites')
  		.catch(err => {
  			if(err instanceof chai.AssertionError){
  				throw err;
  			}

  			const res = err.response;
          	expect(res).to.have.status(401);
  		})
  	})

  	it('Should reject with no url', function(){
  		return chai
  		.request(app)
  		.post('/api/sites')
  		.send({url: '', description, author})
  		.catch(err => {
  			if(err instanceof chai.AssertionError){
  				throw err;
  			}
  		})

  		const res = err.response;
  		expect(res).to.have.status(401);
  	})

	it('Should reject with no description', function(){
  		return chai
  		.request(app)
  		.post('/api/sites')
  		.send({url, description: '', author})
  		.catch(err => {
  			if(err instanceof chai.AssertionError){
  				throw err;
  			}
  		})

  		const res = err.response;
  		expect(res).to.have.status(401);
  	})
  });
});

describe('Vote endpoint', function(){

  const voter = 'exampleVoter';
  const voted = [-1,1];
  const castVote = {user: voter, value:voted[0]};
  const url = 'example.com'
  const description = 'sample description'
  const author ='aTestAuthor'
  const query = {url: url, author: author};

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function() {
  	return Site.create({
  		url,
  		description,
  		author
  	})
  });

  afterEach(function () {
    return Site.remove({});
  });

  it('Should reject with no voter parameter', function(){
  	return chai
  	.request(app)
  	.post('/api/sites/vote')
  	.send({voter: undefined, voted: voted[0]})
	.catch(err => {
		if(err instanceof chai.AssertionError){
			throw err;
		}
	})
  		const res = err.response;
  		expect(res).to.have.status(401);
  });

});