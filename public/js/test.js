//const axios = require('axios');

function testAxios(){
	console.log(localStorage.getItem("goat_milk"));
	axios.get('http://localhost:8080/api/sites',{
    //method: 'get',
    headers: { Authorization: `Bearer ${localStorage.getItem("goat_milk")}`}
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

function buttonAxios(){
	console.log("buttonAxios fired")
	$("button").on("click", event => {
    $(".js-results").empty();
		testAxios();
	})
}
$(buttonAxios);

