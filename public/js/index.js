//add global consts
var resultsEvent = false;

function sendVoteData(author, url, vote){
  //console.log("sendVoteData fired. Author: " + author + " url: " + url + " vote " + vote);
  axios.defaults.headers['Authorization'] = 'Bearer ' + localStorage.getItem('sitRevAuth');
  //console.log(axios.defaults.headers['Authorization']);
  axios({
    method: 'post',
    url: '/api/sites/vote/',
    data: {
      author: author,
      url: url,
      vote: vote
    }
  })
    .then(function(response) {
      //console.log("response from sendVoteData " + JSON.stringify(response));
      console.log(response);
      showResults();
      //return response;
    })
    .catch(err => {
      console.log(err);
      //maybe we can use match to check for the 422 generated by this error to be more specific?
      alert('You\'re not logged in! Login in or sign up for web site review!');
     // user = '';
      return err;
    })
}

function votesButtonClicked(){
  //console.log("votesButton activated");
  //example of delegation
  let authorVote;
  let urlVote;
  let vote;
  $(".js-results").on("click",".js-vote", event =>{
    const $target = $(event.currentTarget);
    authorVote = $target.closest("li").find(".author").text();//"beep";
    // console.log("auth value "+ auth);
    // console.log("authid value " + authid)
    urlVote = $target.closest("ul").prev("h2").text();
    if($target.hasClass("js-upvote")){
      vote = 1;
      //console.log("UPVOTE " + vote + " For author: " + authorVote);
      //console.log("url " + urlVote);
    }
    else if($target.hasClass("js-downvote")){
      vote = -1;
      //console.log("DOWNVOTE " + vote + " For author: "  + authorVote);
      //console.log("url " + urlVote);
    }
    sendVoteData(authorVote, urlVote, vote);
  })
}

function renderSiteDescription(site){
  //console.log("in renderSiteDescription site.votes value is... " + JSON.stringify(site.votes));
  const reducer = (accumulator, currentValue) => accumulator + currentValue.value;
  const totalVotes = site.votes ? site.votes.reduce(reducer, 0):0;
  //console.log("totalVotes value " + totalVotes);
  //console.log("current author in renderSiteDescriptiond " + site.author);
  return `<label class='describe' for='description-by-${site.author}'>${site.author}'s take... </label></br><br>
  <span class='description' id='description-by-${site.author}' aria-label='A site description for ${site.url}'>"${site.description}"</span>
  <span class='author'>${site.author}</span>
  </br></br><label for='score-for-${site.author}-on-${site.url}'>Score: </label>
  <span class='score' id='score-for-${site.author}-on-${site.url}'>${totalVotes}</span></br></br><button class="js-vote js-upvote" role='button'>upvote</button>
  <button class="js-vote js-downvote" role='button'>downvote</button></br></br>`
}

function renderSite(sites){
    let url;
    let descriptions = sites.map(site => {
      if(site.url){
        url = site.url;
      }
      return `<li>${renderSiteDescription(site)}</li>`
    }).join("\n")
/* 
return `<div class='results'><h2>${url}</h2>
    <ul>${descriptions}</ul></div>`
*/
    return `<h2><a href='https://${url}' target='_blank'>${url}</a></h2>
    <ul>${descriptions}</ul>`
}

function showResults(){
  $('.js-results').empty();
  //console.log(localStorage.getItem("sitRevAuth"));
  axios.get('/api/sites',{
  })
    .then(function(response) {
      // console.log(response.data);
      var urls = Object.keys(response.data);
      var numberOfObjects;

      urls.forEach(url => {
        const sites = response.data[url];
        //console.log("Sites information returned "+ JSON.stringify(sites));
        $('.js-results').append(renderSite(sites));
      })
      return response;
    })
    .catch(err => {
      console.log(err);
      return err;
    })

  // const getDataSetting
}

function resultsButtonClicked(){
  //console.log("js-results-button fired")
  $(".js-results-button").on("click", event => {
    if(!resultsEvent){
      resultsEvent = true;
      $(".js-results-button").text("Show more results");
    }
    showResults();
  })
}

function loggedIn(){
  if(localStorage.getItem("sitRevAuth") == null) {
    //console.log("not logged in, returning false");
    return false;
  }
  //console.log("logged in, returning true");
  return true;
}

function sendSignUpData(firstName, lastName, userName, password){
  //console.log("sendSignUpData fired");
  //console.log("firstName val " + firstName + "\n lastName val " + lastName + "\n userName val " + userName + "\n password val " + password);
  axios({
    method: 'post',
    url: '/api/users',
    data: {
      firstName: firstName,
      lastName: lastName,
      username: userName,
      password: password
    }
  })
    .then(function(response) {
      //console.log("response from sendSignUpData " + JSON.stringify(response));
      sendLoginData(userName, password);
      //return response;
    })
    .catch(err => {
      console.log(err);
      //maybe we can use match to check for the 422 generated by this error to be more specific?
      // alert("woops! Username must already exist, or the passwords don't match!");
      $("#dialog-validation-err").dialog({
         autoOpen: false, 
         hide: "puff",
         show : "slide",
         modal: true,
         buttons: {
            OK: function() {$(this).dialog("close");}
         },
      });
      $("#dialog-validation-err").dialog("open");
      $(".js-first-name").val("");
      $(".js-last-name").val("");
      $(".js-user-name").val("");
      $(".js-password").val("");
      $(".js-repeat-password").val("");
      $(".js-first-name").focus();
      return err;
    })
}

function sendLoginData(userName, password){
  //console.log("axios fired");
  if(!loggedIn()){
    axios({
      method: 'post',
      url: '/api/auth/login',
      data: {
        username: userName,
        password: password
      }
    })
      .then(function(response) {
        //console.log(response);
        //localStorage.setItem("username", userName);
        //console.log("are we logged in? " + localStorage.getItem("username"));
        // console.log("Our user is " + user);
        const authToken = response.data.authToken;

        localStorage.setItem('sitRevAuth', authToken);
        axios.defaults.headers['Authorization'] = 'Bearer ' + localStorage.getItem('sitRevAuth');
        //console.log(axios.defaults.headers['Authorization']);
        return response;
      })
      .then(response => {
        //remove when
        //console.log("successfully logged in, here is the response " + JSON.stringify(response));
        window.location.href = "/dashboard";
        return response;
      })
      .catch(err => {
        console.log(err);
        $("#dialog-username-password").dialog({
           autoOpen: false, 
           hide: "puff",
           show : "slide",
           modal: true,
           buttons: {
              OK: function() {$(this).dialog("close");}
           },
        });
        $("#dialog-username-password").dialog("open");
        return err;
      })
  }
  else {
      alert("You're already logged in!");
      window.location.href = "/dashboard";
  }
}

/* 

*/
function getSignUpFormValues(event){
  //console.log("getSignUpFormValues fired");
  var firstName, lastName;
  var userName = $(event.currentTarget).find(".js-user-name").val();
  //console.log($(".js-user-name").val());
  var password = $(event.currentTarget).find(".js-password").val();
  var passRep = $(event.currentTarget).find(".js-repeat-password").val();
  //console.log("Password value " + password + "\n Password Repeat value " + passRep);
  if(password == passRep){
    //console.log("passwords match");
    firstName = $(event.currentTarget).find(".js-first-name").val();
    lastName = $(event.currentTarget).find(".js-last-name").val();
    sendSignUpData(firstName, lastName, userName, password);
  }
  else {
    alert("password fields do not match");
    $(".js-password").val("");
    $(".js-repeat-password").val("");
    $(".js-password").focus();
    //console.log("passwords don't match");
  }
}

function getLoginFormValues(event){
  console.log("getLoginFormValues fired");
  var userName = $(event.currentTarget).find(".js-user-name").val();
  //console.log($(".js-user-name").val());
  var password = $(event.currentTarget).find(".js-password").val();
  if(userName !== '' && password !== ''){
    sendLoginData(userName, password);
  }
  else {
    $("#dialog-username-password").dialog({
           autoOpen: false, 
           hide: "puff",
           show : "slide",
           modal: true,
           buttons: {
              OK: function() {$(this).dialog("close");}
           },
        });
    $("#dialog-username-password").dialog("open");
  }
}

function searchSite(event){
  //console.log("searchSite fired");
  var searchParam = $(event.currentTarget).find(".js-search-box").val();
  //console.log(searchParam);
  if(searchParam == ''){
    // alert("Please enter a value");
    $("#dialog-no-val").dialog({
       autoOpen: false, 
       hide: "puff",
       show : "slide",
       modal: true,
       buttons: {
          OK: function() {$(this).dialog("close");}
       },
    });
    $("#dialog-no-val").dialog("open");
  }
  else{
    let matches = searchParam.match(/(https?:\/\/)?(([a-zA-Z0-9]+\.)+)?([a-zA-Z0-9]+\.[a-zA-Z0-9]+)(\/|\?|$)/i);
    //console.log("matches[0]" + matches[0]);
    //console.log("matches[1]" + matches[1]);
    //console.log("matches[2]" + matches[2]);
    //console.log("matches[3]" + matches[3]);
    //console.log("matches[4]" + matches[4]);
    //console.log("matches[5]" + matches[5]);
    try {
    searchParam = matches[4];
    //console.log("searchParam After regex is " + searchParam);
    axios.get('/api/sites/' + searchParam,{
    })
      .then(sites => {
        $(".js-results").empty();
        //console.log("this is what the server returned in SearchSite function " + JSON.stringify(sites.data));

        const urls = Object.keys(sites.data)

        urls.forEach(url => {
          const siteUrlData = sites.data[url];
          $(".js-results").append(renderSite(siteUrlData));
          //console.log(renderSite(siteUrlData));
          //console.log(site);
        })
        $(".js-search-box").val("");
        return sites;
      })
      .catch(err => {
        //console.log("ERROR thrown at end of request " +err);
        //alert("The site wasn't found! If the site is real, why don't you create it? ");
        $("#dialog-404").dialog({
           autoOpen: false, 
           hide: "puff",
           show : "slide",
           modal: true,
           buttons: {
              OK: function() {$(this).dialog("close");}
           },
        });
        $("#dialog-404").dialog("open");
        $(".js-search-box").val("");
        return err;
      })
    }
    catch(err) {
        $("#dialog-404-bad").dialog({
           autoOpen: false, 
           hide: "puff",
           show : "slide",
           modal: true,
           buttons: {
              OK: function() {$(this).dialog("close");}
           },
        });
        $("#dialog-404-bad").dialog("open");
        $(".js-search-box").val("");
    }
  }
}

function addSite(event){
  //console.log("addSite fired");
  var siteName = $(event.currentTarget).find(".js-site-name").val();
  var siteDescription = $(event.currentTarget).find(".js-site-description").val();
  if(siteName !== '' || siteDescription !== ''){
    //console.log("axios fired");
    //console.log("Are we logged in? " + loggedIn);
    axios.defaults.headers['Authorization'] = 'Bearer ' + localStorage.getItem('sitRevAuth');
      axios({
        method: 'post',
        url: '/api/sites',
        data: {
          url: siteName,
          description: siteDescription
        }
      })
      .then(function(response) {
        //console.log(response);
        alert(`${siteName} added!` )//grapesofwrath.com
        $(".js-site-name").val('');
        $(".js-site-description").val('');
        return response;
      })
      .catch(err => {
        console.log(err);
        alert(`You've already added ${siteName}`)
        return err;
      })
  }
  else {
    //alert('Please enter a site and/or Description!');
    $("#dialog-no-add-val").dialog({
       autoOpen: false, 
       hide: "puff",
       show : "slide",
       modal: true,
       buttons: {
          OK: function() {$(this).dialog("close");}
       },
    });
    $("#dialog-no-add-val").dialog("open");
  }
}

function submitClicked(){
  //begin login, signup
  $(".js-submit").submit(event => {
    event.preventDefault();
    //console.log("submit fired");
    // console.log($(event.currentTarget).find(".js-user-name").val());
    // console.log($(".js-user-name").val());
    // console.log($(event.currentTarget).find(".js-user-name").val());
    //console.log($(event.currentTarget).attr('id'))
    if($(event.currentTarget).attr('id') == 'signup') {
        getSignUpFormValues(event);
    }
    else if($(event.currentTarget).attr('id') == 'login'){
        //set up getLoginFormValues(event)
        getLoginFormValues(event);
    }
    else if($(event.currentTarget).attr('id') == 'addSite'){
      addSite(event);
    }
    else if($(event.currentTarget).attr('id') == 'search'){
      searchSite(event);
    }
  });
}

function loginCheck(){
    //console.log("loginCheck fired");
    if(loggedIn()){
      if($('.welcomePage').attr('id') == 'welcome' || $('.js-submit').attr('id') == 'login' || $('.js-submit').attr('id') == 'signup'){
        window.location.href = "/dashboard";
      }
      $("#js-login-logout").replaceWith("<a href='/logout' id='js-login-logout'>Logout</a>")
    }
    else if($('.dashboard').attr('id') == 'dashboard'){
      alert("Please sign in ");
      window.location.href = "/login";
    }
}

function hideDialogs(){
  $("#dialog-404").hide();
  $("#dialog-validation-err").hide();
  $("#dialog-no-val").hide();
  $("#dialog-username-password").hide();
  $("#dialog-no-add-val").hide();
  $("#dialog-404-bad").hide();
}

function startClient(){
  //console.log("JQuery start!");
  hideDialogs();
  loginCheck();
  submitClicked();
  resultsButtonClicked();
  votesButtonClicked();
}

$(startClient);
