'use strict';
const path = require('path');
const fs = require('fs');
const app = require('app');
const BrowserWindow = require('browser-window');
const shell = require('shell');
const Menu = require('menu');
const appMenu = require('./menu');

require('electron-debug')();
require('crash-reporter').start();

let mainWindow;

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

	win.loadUrl('http://battlelog.battlefield.com/bf4');
	win.on('closed', app.quit);
	//win.on('page-title-updated', (e, title) => updateBadge(title));

	return win;
}

app.on('ready', function() {
	Menu.setApplicationMenu(appMenu);

	mainWindow = createMainWindow();

	const page = mainWindow.webContents;

	page.on('dom-ready', function() {
		page.insertCSS(fs.readFileSync(path.join(__dirname, 'stylesheets/browser.css'), 'utf8'));
		mainWindow.show();
	});

	page.on('new-window', function(e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
});