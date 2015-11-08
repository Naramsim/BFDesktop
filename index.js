'use strict';
const path = require('path');
const fs = require('fs');
const app = require('app');
const BrowserWindow = require('browser-window');
const shell = require('shell');
const Menu = require('menu');
const Tray = require('tray');
//const ipc = require('ipc');
const appMenu = require('./menu');
const appTray = require('./tray')

require('electron-debug')();
require('crash-reporter').start();

let mainWindow;

var tray = null;
var initPath = path.join(app.getDataPath(), "init.json");
var sessionPath = path.join(app.getDataPath(), "session.json");
var settings;
global.force_quit = false; //Change it

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
			// fails without this because of CommonJS script detection
			'node-integration': false,
			'preload': path.join(__dirname, 'scripts/browser.js')
			//'plugins': true
		}
	});
	win.loadUrl('http://battlelog.battlefield.com/bf' + settings.version);
	//win.on('closed', app.quit);
	//win.on('page-title-updated', (e, title) => updateBadge(title));

	win.webContents.on('did-finish-load', function() {
		var my_session = {
			url : "battlelog.battlefield.com",
			name: "ciao",
			value: "bello",
			path: "/",
			session: true
		}
		win.webContents.session.cookies.get({}, function(error, cookies) {
			if (error) throw error;
			//console.log(cookies);
		});
		/*win.webContents.session.cookies.set( {url : "http://battlelog.battlefield.com", name : "beaker.session.id", value : "edda016b162abb0929f8b7e55ff58b96", session: true, expirationDate: 1478554532},
		 function(error, cookies) {
			if (error) console.log(error);
			//console.log(cookies);
		});*/
	});
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

	return win;
}

app.on('window-all-closed', function(){
    app.quit();
});

app.on('ready', function() {
	Menu.setApplicationMenu(appMenu);

	mainWindow = createMainWindow();

	const page = mainWindow.webContents;

	tray = new Tray('media/bf4.png');
	tray.setToolTip('BFDesktop');
	tray.setContextMenu(appTray);
	tray.on('clicked', function() {
                mainWindow.show();
            });



	page.on('dom-ready', function() {
		page.insertCSS(fs.readFileSync(path.join(__dirname, 'stylesheets/browser.css'), 'utf8'));
		mainWindow.show();
	});

	page.on('new-window', function(e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
});