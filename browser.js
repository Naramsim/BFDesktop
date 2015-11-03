'use strict';
const ipc = require('ipc');

ipc.on('goHome', () => {
	// create the menu for the below
	console.log("e")
	document.location.href = "http://battlelog.battlefield.com/bf4";
});

ipc.on('goProfile', () => {
	document.querySelector('.tools-item .profile>a').click();
});

ipc.on('goServers', () => {
	document.location.href = "http://battlelog.battlefield.com/bf4/servers/";
});

ipc.on('logOut', () => {
	document.querySelector('.tools-item .signout>a').click();
});