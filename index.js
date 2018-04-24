function sendSignUpData(firstName, lastName, userName, password){
  console.log("sendSignUpData fired");
  console.log("firstName val " + firstName + "\n lastName val " + lastName + "\n userName val " + userName + "\n password val " + password);  
  // var data = {
  //   "username": userName,
  //   "password": password,
  //   "firstName": firstName,
  //   "lastName": lastName
  // };
  // var data = {
  //   "firstName": "Bob",
  //   "lastName": "Dohl",
  //   "username": "BobDohl",
  //   "password": "testing"
  // };
  // data.username = userName;
  // data.password = password;
  // data.firstName = firstName;
  // data.lastName = lastName;
  // console.log(data);
  // $.ajax({
  //   url: 'http://localhost:8080/api/users',
  //   type: 'POST',
  //   data: JSON.stringify(data),
  //     contentType: 'application/json; charset=utf-8',
  //     success: function(data) {
  //       console.log("success");
  //       console.log(JSON.stringify(data));
  //     }
  // });

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
      console.log(response);
      return response;
    })
    .then(err => {
      console.log(err);
      return err;
    })

  // const getDataSettings = {
  //   url: 'http://localhost:8080/api/users',
  //   body: {
  //   firstName: firstName,
  //   lastName: lastName,
  //   username: userName,
  //   password: password
  // },
  //   dataType: 'application/json',
  //   type: 'POST',
  //   success: function(data) {
  //     console.log("GREAT SUCCESS! ");
  //     console.log(JSON.stringify(data));
  //   }
  // };
  // console.log(getDataSettings);
  // $.ajax(getDataSettings).fail(function (jqXHR, text) {
  //     console.log(JSON.stringify(jqXHR));
  //     console.log(text);
  // });
}

function sendLoginData(userName, password){
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
      return response;
    })
    .then(err => {
      console.log(err);
      return err;
    })
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

function submitClicked(){
  $(".js-login").submit(event => {
    console.log("submit fired");
    // console.log($(event.currentTarget).find(".js-user-name").val());
    console.log($(".js-user-name").val());
    // may not need event.preventDefault for this one...
    event.preventDefault();
    console.log("submit fired");
    // console.log($(event.currentTarget).find(".js-user-name").val());
    console.log($(".js-user-name").val());
    // may not need event.preventDefault for this one...
    console.log($(event.currentTarget).attr('id'))
    event.preventDefault();
    if($(event.currentTarget).attr('id') == 'signup') {
        getSignUpFormValues(event);
    }
    else if($(event.currentTarget).attr('id') == 'login'){
        //set up getLoginFormValues(event)
        getLoginFormValues(event);
    }
  });
}

function startClient(){
  console.log("JQuery start!");
  submitClicked();
}

$(startClient);