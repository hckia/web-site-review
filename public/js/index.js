//add a few global consts
var resultsEvent = false;

function showResults(){
  console.log(localStorage.getItem("sitRevAuth"));
  axios.get('http://localhost:8080/api/sites',{
  })
    .then(function(response) {
      //console.log(response.data[0])
      response.data.map(site => {
        $(".js-results").append("<div><h2>" + site.url +"</h2>");
        $(".js-results").append("<p>" + site.description +"</p></div>");
      })
      //$("div").text(JSON.stringify(response.data[1]));
      return response;
    })
    .then(err => {
      console.log(err);
      return err;
    })

  // const getDataSetting
}

function resultsButtonClicked(){
  console.log("js-results-button fired")
  $(".js-results-button").on("click", event => {
    if(!resultsEvent){
      resultsEvent = true;
      $(".js-results-button").text("Show more results");
    }
    $(".js-results").empty();
    showResults();
  })
}

function loggedIn(){
  if(localStorage.getItem("sitRevAuth") == null) {
    console.log("not logged in, returning false");
    return false;
  }
  console.log("logged in, returning true");
  return true;
}

function sendSignUpData(firstName, lastName, userName, password){
  console.log("sendSignUpData fired");
  console.log("firstName val " + firstName + "\n lastName val " + lastName + "\n userName val " + userName + "\n password val " + password);
  //user = userName;  
  axios({
    method: 'post',
    url: 'http://localhost:8080/api/users',
    data: {
      firstName: firstName,
      lastName: lastName,
      username: userName,
      password: password
    }
  })
    .then(function(response) {
      console.log("response from sendSignUpData " + JSON.stringify(response));
      sendLoginData(userName, password);
      //return response;
    })
    .catch(err => {
      console.log(err);
      alert("woops! Username must already exist, or the passwords don't match!");
      $(".js-first-name").val("");
      $(".js-last-name").val("");
      $(".js-user-name").val("");
      $(".js-password").val("");
      $(".js-repeat-password").val("");
      $(".js-first-name").focus();
     // user = '';
      return err;
    })
}

function sendLoginData(userName, password){
  console.log("axios fired");
  if(!loggedIn()){
    axios({
      method: 'post',
      url: 'http://localhost:8080/api/auth/login',
      data: {
        username: userName,
        password: password
      }
    })
      .then(function(response) {
        console.log(response);
        localStorage.setItem("username", userName);
        console.log("are we logged in? " + localStorage.getItem("username"));
        // console.log("Our user is " + user);
        const authToken = response.data.authToken;

        localStorage.setItem('sitRevAuth', authToken);
        axios.defaults.headers['Authorization'] = 'Bearer ' + localStorage.getItem('sitRevAuth');
        console.log(axios.defaults.headers['Authorization']);
        return response;
      })
      .then(response => {
        //remove when
        console.log("successfully logged in, here is the response " + JSON.stringify(response));
        window.location.href = "http://localhost:8080/dashboard";
        return response;
      })
      .catch(err => {
        console.log(err);
        return err;
      })
  }
  else {
      alert("You're already logged in!");
      window.location.href = "http://localhost:8080/dashboard";
  }
}

/* 

*/
function getSignUpFormValues(event){
  console.log("getSignUpFormValues fired");
  var firstName, lastName;
  var userName = $(event.currentTarget).find(".js-user-name").val();
  console.log($(".js-user-name").val());
  var password = $(event.currentTarget).find(".js-password").val();
  var passRep = $(event.currentTarget).find(".js-repeat-password").val();
  console.log("Password value " + password + "\n Password Repeat value " + passRep);
  if(password == passRep){
    console.log("passwords match");
    firstName = $(event.currentTarget).find(".js-first-name").val();
    lastName = $(event.currentTarget).find(".js-last-name").val();
    sendSignUpData(firstName, lastName, userName, password);
  }
  else {
    alert("password fields do not match");
    $(".js-password").val("");
    $(".js-repeat-password").val("");
    $(".js-password").focus();
    console.log("passwords don't match");
  }
}

function getLoginFormValues(event){
  console.log("getLoginFormValues fired");
  var userName = $(event.currentTarget).find(".js-user-name").val();
  console.log($(".js-user-name").val());
  var password = $(event.currentTarget).find(".js-password").val();
  if(userName !== '' || password !== ''){
    sendLoginData(userName, password);
  }
  else {
    alert('Please enter valid credentials');
  }
}

function searchSite(event){
  console.log("searchSite fired");
  var searchParam = $(event.currentTarget).find(".js-search-box").val();
  console.log(searchParam);
  if(searchParam == ''){
    alert("Please enter a value");
  }
  else{
    let matches = searchParam.match(/(https?:\/\/)?(([a-zA-Z0-9]+\.)+)?([a-zA-Z0-9]+\.[a-zA-Z0-9]+)(\/|\?|$)/i);
    console.log("matches[0]" + matches[0]);
    console.log("matches[1]" + matches[1]);
    console.log("matches[2]" + matches[2]);
    console.log("matches[3]" + matches[3]);
    console.log("matches[4]" + matches[4]);
    console.log("matches[5]" + matches[5]);
    searchParam = matches[4];
    console.log("searchParam After regex is " + searchParam);
    axios.get('http://localhost:8080/api/sites/' + searchParam,{
    })
      .then(site => {
        $(".js-results").empty();
        console.log("this is what the server reaturned in SearchSite function " + JSON.stringify(site.data.url));
          $(".js-results").append("<div><h2>" + JSON.stringify(site.data.url) +"</h2>");
          $(".js-results").append("<p>" + JSON.stringify(site.data.description) +"</p></div>");
          $(".js-search-box").val("");
        //$("div").text(JSON.stringify(response.data[1]));
        return site;
      })
      .catch(err => {
        console.log("ERROR thrown at end of request " +err);
        alert("The site wasn't found! If the site is real, why don't you create it? ");
        $(".js-search-box").val("");
        return err;
      })
  }
}

function addSite(event){
  console.log("addSite fired");
  var siteName = $(event.currentTarget).find(".js-site-name").val();
  var siteDescription = $(event.currentTarget).find(".js-site-description").val();
  if(siteName !== '' || siteDescription !== ''){
    console.log("axios fired");
    // axios.post('http://localhost:8080/api/sites/',{
    //   headers: { Authorization: `Bearer ${localStorage.getItem("sitRevAuth")}`},
    //   data: {
    //     url: siteName,
    //     description: siteDescription
    //   }
    // })
//    console.log("Are we logged in? " + loggedIn);
    axios.defaults.headers['Authorization'] = 'Bearer ' + localStorage.getItem('sitRevAuth');
      axios({
        method: 'post',
        url: 'http://localhost:8080/api/sites',
        //auth: { Authorization: `Bearer ${localStorage.getItem("sitRevAuth")}`},
        data: {
          url: siteName,
          description: siteDescription
        }
      })
      .then(function(response) {
        console.log(response);
        return response;
      })
      .then(err => {
        console.log(err);
        return err;
      })
  }
  else {
    alert('Please enter a site and/or Description!');
  }
}

function submitClicked(){
  //begin login, signup
  $(".js-submit").submit(event => {
    event.preventDefault();
    console.log("submit fired");
    // console.log($(event.currentTarget).find(".js-user-name").val());
    // console.log($(".js-user-name").val());
    // may not need event.preventDefault for this one...
    // console.log($(event.currentTarget).find(".js-user-name").val());
    // may not need event.preventDefault for this one...
    console.log($(event.currentTarget).attr('id'))
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
    console.log("loginCheck fired");
    if(loggedIn()){
      // event.preventDefault();
      //there has to be a more elecgant way to do this.
      if($('.welcomePage').attr('id') == 'welcome' || $('.js-submit').attr('id') == 'login' || $('.js-submit').attr('id') == 'signup'){
        window.location.href = "http://localhost:8080/dashboard";
      }
      $("#js-login-logout").replaceWith("<a href='/logout' id='js-login-logout'>Logout</a>")
    }
    else if($('.dashboard').attr('id') == 'dashboard'){
      alert("Please sign in ");
      window.location.href = "http://localhost:8080/login";
    }
}

function startClient(){
  console.log("JQuery start!");
  loginCheck();
  submitClicked();
  resultsButtonClicked();
}

$(startClient);