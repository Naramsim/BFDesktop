'use strict';
const path = require('path');
const fs = require('fs');
const app = require('app');
const BrowserWindow = require('browser-window');
const shell = require('shell');
const Menu = require('menu');
const Tray = require('tray');
const appMenu = require('./menu');
const appTray = require('./tray')

try{
	require('electron-debug')();
}catch(e){}

require('crash-reporter').start();

let mainWindow;
var tray = null;
var initPath = path.join(app.getPath("userData"), "init.json");
var sessionPath = path.join(app.getPath("userData"), "session.json");
var settings;
global.force_quit = false; //Change it
var loadGA = " (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga'); ga('create', 'UA-70113531-1', 'auto'); ga('send', 'pageview'); console.log('load');"

try {
	settings = JSON.parse(fs.readFileSync(initPath, 'utf8'));
}catch(e) {
	console.log("Creating init file");
	settings = {version: 4};
	fs.writeFileSync(initPath, JSON.stringify( {version: 4, id: 1} ));
}

try {
	var session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
}catch(e) {
	console.log("Creating session file");
	fs.writeFileSync(sessionPath, JSON.stringify( {autoLogin:false} ));
}

console.log(settings);

function updateBadge(title) {
	if (!app.dock) {
		return;
	}

	if (title.indexOf('Messenger') === -1) {
		return;
	}

	const messageCount = (/\(([0-9]+)\)/).exec(title);
	app.dock.setBadge(messageCount ? messageCount[1] : '');
}

function createMainWindow() {
	const win = new BrowserWindow({
		'title': "Bf4",
		'show': false,
		'width': 1300,
		'height': 700,
		'icon': path.join(__dirname, 'media', 'frost.png'),
		'min-width': 400,
		'min-height': 200,
		'title-bar-style': 'hidden-inset',
		'web-preferences': {
			'javascript': true,
			'node-integration': false,
			'preload': path.join(__dirname, 'scripts/browser.js')
			//'plugins': true
		}
	});
	win.loadURL('http://battlelog.battlefield.com/bf' + settings.version);
	//win.on('page-title-updated', (e, title) => updateBadge(title));

	win.on('close', function(e){
		if(!force_quit){
			e.preventDefault();
			win.hide();
		}
	});
	win.on('before-quit', function (e) {
		// Handle menu-item or keyboard shortcut quit here
		if(!force_quit){
			e.preventDefault();
			win.hide();
		}
	});
	win.on('activate-with-no-open-windows', function(){
		win.show();
	});
	win.on('will-quit', function () {
		// This is a good place to add tests insuring the app is still
		// responsive and all windows are closed.
		console.log("will-quit");
		win = null;
	});

	win.changeTrayIcon = function(version){
		var trayImage =  __dirname + '\\media\\bf' + version + '.ico';
		tray.setImage( trayImage);
	}

	return win;
}

app.on('window-all-closed', function(){
	app.quit();
});

app.on('ready', function() {
	Menu.setApplicationMenu(appMenu);

	mainWindow = createMainWindow();
	mainWindow.show();
	const page = mainWindow.webContents;
	var trayImage =  __dirname + '\\media\\bf' + settings.version + '.ico';
	tray = new Tray(trayImage);
	tray.setImage(trayImage);
	tray.setToolTip('BFDesktop');
	tray.setContextMenu(appTray);
	tray.on('clicked', function() {
		mainWindow.show();
	});

	page.on('dom-ready', function() {
		page.insertCSS(fs.readFileSync(path.join(__dirname, 'stylesheets/browser.css'), 'utf8'));
		setTimeout(function() {
			console.log(page.getURL());
			//session.autoLogin = false;
			//TODO: set load page to /gate
		}, 2000);
		page.executeJavaScript(loadGA);
	});

	page.on('new-window', function(e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
});