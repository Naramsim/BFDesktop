'use strict';
const os = require('os');
const app = require('app');
const Menu = require('menu');
const BrowserWindow = require('browser-window');
const shell = require('shell');
const Tray = require('tray');

const appName = app.getName();

function maximize() {
	const win = BrowserWindow.getAllWindows()[0];
	win.show();
	win.focus();
}

function sendAction(action) {
	const win = BrowserWindow.getAllWindows()[0];

	if (process.platform === 'darwin') {
		win.restore();
	}

	win.webContents.send(action);
}

function quit() {
	global.force_quit = true;
	app.quit();
}

var trayMenu = [
    { label: 'Running', type: 'normal', sublabel:'BFDesktop', click: function() { quit(); } },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Exit', type: 'normal', click: function () { quit(); } }
  ];



module.exports = Menu.buildFromTemplate(trayMenu);