//const axios = require('axios');

function showResults(){
	console.log(localStorage.getItem("sitRevAuth"));
	axios.get('/api/sites',{
    //method: 'get',
    headers: { Authorization: `Bearer ${localStorage.getItem("sitRevAuth")}`}
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
	console.log("buttonAxios fired")
	$("button").on("click", event => {
    $(".js-results").empty();
		testAxios();
	})
}
$(buttonAxios);

