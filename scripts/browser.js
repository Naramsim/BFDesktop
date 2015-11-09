'use strict';
const ipc = require('ipc');	
var idOriginIndicator = "#gamemanager-indicator";
var originLibPath = "origin2://library/open";
var originPing = "http://127.0.0.1:3215/ping";
var battleLogUrl = "http://battlelog.battlefield.com/bf";

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
	  if( startOrigin() ){
	  	setTimeout(function () {
			document.querySelector(idOriginIndicator).style.display = "none";
		},500);
	  }
	};
	xhr.send(null);
}

function startOrigin () {
	var origin = document.createElement("a");
	origin.href = originLibPath;
	origin.click();
	return true;
}

document.addEventListener('DOMContentLoaded', function() {
	httpGetAsync(originPing, 1);
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

ipc.on('switchBF', function(version){
	document.location.href = battleLogUrl + version;
});
