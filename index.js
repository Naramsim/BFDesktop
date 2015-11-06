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
var settings;
global.force_quit = false; //Change it

try {
	settings = JSON.parse(fs.readFileSync(initPath, 'utf8'));
}catch(e) {
	console.log(e);
	settings = {"version": 4};
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