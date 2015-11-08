'use strict';
const os = require('os');
const app = require('app');
const Menu = require('menu');
const BrowserWindow = require('browser-window');
const shell = require('shell');
const appName = app.getName();
const path = require("path");
const fs = require("fs");
var initPath = path.join(app.getDataPath(), "init.json");
var sessionPath = path.join(app.getDataPath(), "session.json");
var settings;
var session = {};
var BFUsed = [false,false,false];
var isAutoLogin = false;

try {
	settings = JSON.parse(fs.readFileSync(initPath, 'utf8'));
	BFUsed[settings.id] = true;
}catch(e) {
	console.log("Creating init file");
	BFUsed[1] = true; //BF4 default
	settings = {version: 4};
	fs.writeFileSync(initPath, JSON.stringify( {version: 4, id: 1} ));
}

try {
	session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
}catch(e) {
	console.log("Creating session file");
	session.autoLogin = false;
	fs.writeFileSync(sessionPath, JSON.stringify( {autoLogin:false} ));
}

function autoLogin (check) {
	if(check) {
		const win = BrowserWindow.getAllWindows()[0];
		win.webContents.session.cookies.get({url : "http://battlelog.battlefield.com", name : "beaker.session.id"}, function(error, cookies) {
			if (error) throw error;
			//console.log(cookies[0].value)
			var userSessionId = cookies[0].value;
			win.webContents.session.cookies.set( {url : "http://battlelog.battlefield.com", name : "beaker.session.id", value : userSessionId, session: true, expirationDate: 1478554532},
				function(error, cookies) {
				if (error) {
					console.log(error);
				}else{
					var toSave = {autoLogin:true};
					fs.writeFileSync(sessionPath, JSON.stringify(toSave));
				}
			});
		});
	}else{
		const win = BrowserWindow.getAllWindows()[0];
		win.webContents.session.cookies.get({url : "http://battlelog.battlefield.com", name : "beaker.session.id"}, function(error, cookies) {
			if (error) throw error;
			//console.log(cookies[0].value)
			var userSessionId = cookies[0].value;
			win.webContents.session.cookies.set( {url : "http://battlelog.battlefield.com", name : "beaker.session.id", value : userSessionId, session: true},
				function(error, cookies) {
				if (error) {
					console.log(error);
				}else{
					var toSave = {autoLogin:false};
					fs.writeFileSync(sessionPath, JSON.stringify(toSave));
				}
			});
		});
	}
}


function sendAction(action, param) {
	const win = BrowserWindow.getAllWindows()[0];
	if (process.platform === 'darwin') {
		win.restore();
	}
	win.webContents.send(action, param);
}

function storeVersion(id, name) {
	//0->bf3 1->bf4 2->bfh
	var toSave = {
		id: id,
		version: name
	};
	fs.writeFileSync(initPath, JSON.stringify(toSave));
}

const linuxTpl = [
	{
		label: 'Browse',
		submenu: [
			{
				label: 'Home',
				accelerator: 'CmdOrCtrl+H',
				click() {
					sendAction('goHome');
				}
			},
			{
				label: 'Profile',
				accelerator: 'CmdOrCtrl+P',
				click() {
					sendAction('goProfile');
				}
			},
			{
				label: 'Servers',
				accelerator: 'CmdOrCtrl+S',
				click() {
					sendAction('goServers');
				}
			},
			{
				type: 'separator'
			},
			{
				label: 'Log Out',
				click() {
					sendAction('logOut');
				}
			}
		]
	},
	{
		label: 'BF?',
		submenu: [
			{
				label: 'BF3', type: 'radio', checked: BFUsed[0], click: function() { sendAction('switchBF', 3); storeVersion(0,3); }
			},
			{
				label: 'BF4', type: 'radio', checked: BFUsed[1], click: function() { sendAction('switchBF', 4); storeVersion(1,4); }
			},
			{
				label: 'BFH', type: 'radio', checked: BFUsed[2], click: function() { sendAction('switchBF', 5); storeVersion(2,'h'); }
			}
		]
	},
	{
		label: 'Auto-Login',
		submenu: [
			{
				label: 'On', type: 'radio', checked: session.autoLogin, click: function() { autoLogin(true); }
			},
			{
				label: 'Off', type: 'radio', checked: (!session.autoLogin), click: function() { autoLogin(false); }
			}
		]
	}
];

const helpSubmenu = [
	{
		label: `${appName} Website...`,
		click() {
			shell.openExternal('https://github.com/sindresorhus/caprine');
		}
	},
	{
		label: 'Report an Issue...',
		click() {
			const body = `
**Please succinctly describe your issue and steps to reproduce it.**

-

${app.getName()} ${app.getVersion()}
${process.platform} ${process.arch} ${os.release()}`;

			shell.openExternal(`https://github.com/sindresorhus/caprine/issues/new?body=${encodeURIComponent(body)}`);
		}
	}
];

let tpl;

if (process.platform === 'darwin') {
	tpl = darwinTpl;
} else {
	tpl = linuxTpl;
}

//tpl[tpl.length - 1].submenu = helpSubmenu;

module.exports = Menu.buildFromTemplate(tpl);