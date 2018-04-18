function sendData(firstName, lastName, userName, password){
  console.log("sendData fired")
  // var data = {
  //   "firstName": firstName,
  //   "lastName": lastName,
  //   "username": userName,
  //   "password": password
  // };
  var data = {
    "firstName": "Bob",
    "lastName": "Dohl",
    "username": "BobDohl",
    "password": "testing"
  };
  // data.username = userName;
  // data.password = password;
  // data.firstName = firstName;
  // data.lastName = lastName;
  console.log(data);
  $.ajax({
    type: 'POST',
    data: JSON.stringify(data),
      contentType: 'application/json',
      url: 'http://localhost:8080/api/users',
      success: function(data) {
        console.log("success");
        console.log(JSON.stringify(data));
      }
  });
}
function getFormValues(event){
  console.log("getFormValues fired");
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
    sendData(firstName, lastName, userName, password);
  }
  else {
    alert("password fields do not match");
    $(".js-password").val("");
    $(".js-repeat-password").val("");
    $(".js-password").focus();
    console.log("passwords don't match");
  }
}

function submitClicked(){
  $(".js-create-login").submit(event => {
    console.log("submit fired");
    console.log($(event.currentTarget).find(".js-user-name").val());
    // may not need event.preventDefault for this one...
    event.preventDefault();
    getFormValues(event);
  });
}

function startClient(){
  console.log("JQuery start!");
  submitClicked();
}

$(startClient);
