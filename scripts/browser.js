'use strict';
const ipc = require('ipc');	


function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}


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
	/*try{
		const BrowserWindow = require('browser-window');
		const win = BrowserWindow.getAllWindows()[0];
		var session = win.webContents.session
		createCookie("beaker.session.i", "provv",30);
		console.log("ciao");
	}catch(e){
		console.log(e);
	}*/
	
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