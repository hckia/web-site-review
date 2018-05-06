function logout(){
	localStorage.clear();
	window.location.href = "http://localhost:8080/login";
}

logout();