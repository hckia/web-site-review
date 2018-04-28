//const axios = require('axios');

function testAxios(){
	console.log(localStorage.getItem("goat_milk"));
	axios({
    method: 'get',
    url: 'http://localhost:8080/api/sites',
    Authorization: "Bearer " + localStorage.getItem("goat_milk")
  })
    .then(function(response) {
      //console.log(response.data[0])
      $("div").text(JSON.stringify(response.data[0]));
      return response;
    })
    .then(err => {
      console.log(err);
      return err;
    })

  // const getDataSetting
}

function buttonAxios(){
	console.log("buttonAxios fired")
	$("button").on("click", event => {
		testAxios();
	})
}
$(buttonAxios);

