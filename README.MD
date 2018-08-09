# Web Site Review App

This Application allows people to sign up and review Web sites. It also allows users to up/down vote peoples review's of these sites.

[Link to Live Site](https://web-site-review.herokuapp.com/)
^ updated through Travis CI

[Link to Demo login info](https://github.com/hckia/web-site-review/blob/master/will-smith.md)

## endpoints

### /api/users/

POST request at /api/users/ creates a new user as long as none of the four parameters (username, firstname, lastname, password) aren't an empty string or undefined.

GET request that returns users. only exists to test users manually in postman. commented out by default

### /api/auth/

used for generating auth access through passport and json web tokens.

#### /api/auth/login

login endpoint generates an authToken and sends it back to the client in json format

#### /api/auth/refresh

refreshes token for client.

## /api/sites/

endpoint for creating and retrieving sites

POST requests at /api/sites will take two arguments, url and description. Upon success a new Document will exist inside the Site collection containing url, description, author, and an empty Vote Array that users may vote on. Failure if any of the arguments are empty, or the logged in user has already posted an existing description for this specific url. The user must be logged in.

GET requests at /api/sites will bring back an array of objects and list out all sites. This can be utilitized whether the user is logged in or not.

GET requests with key value :url (/api/sites/:url) takes a url argument and returns an array of objects thatt includes the site, all of its descriptions, authors, and votes.

#### /api/sites/vote

POST request at /api/sites/vote allows the logged in user to vote on a particular site. They may vote up or down on a site, but it will only constitute a single vote. If the voter is not logged in, this will fail.


## Other notes
console.logs have been left even if commented to leave as a sort of comment.


## resources (not all listed)

https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

https://repl.it/@hckia/Form-Design

https://gist.github.com/lanxan/2550185

https://gist.github.com/diorahman/1520485
