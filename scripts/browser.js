'use strict';
const ipc = require('ipc');	




function httpGetAsync(theUrl, callback) {
    var xhr = new XMLHttpRequest();
	xhr.open("GET", theUrl, true);
	xhr.onload = function (e) {
	  if (xhr.readyState === 4) {
	    if (xhr.status === 200) {
	      console.log(xhr.responseText);
	    }
	  }
	};
	xhr.onerror = function (e) {
	  startOrigin();
	};
	xhr.send(null);
}

function startOrigin () {
	var origin = document.createElement("a");
	origin.href = "origin2://library/open";
	origin.click();
}

document.addEventListener('DOMContentLoaded', function() {
	httpGetAsync("http://127.0.0.1:3215/ping", 1);
})

ipc.on('goHome', function(){
	// create the menu for the below
	console.log("e")
	document.location.href = "http://battlelog.battlefield.com/bf4";
});

ipc.on('goProfile', function(){
	document.querySelector('.tools-item .profile>a').click();
});

ipc.on('goServers', function(){
	document.location.href = "http://battlelog.battlefield.com/bf4/servers/";
});

ipc.on('logOut', function(){
	document.querySelector('.tools-item .signout>a').click();
});

ipc.on('switchBF', function(event, arg){
	switch(event){ //?? api wrong?
		case 3:
			document.location.href = "http://battlelog.battlefield.com/bf3";
			break;
		case 4:
			document.location.href = "http://battlelog.battlefield.com/bf4";
			break;
		case 5:
			document.location.href = "http://battlelog.battlefield.com/bfh";
			break;
	}
})