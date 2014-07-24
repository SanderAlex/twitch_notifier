var gui = require('nw.gui');
var win = gui.Window.get();
var tray = new gui.Tray({ icon: 'img/twitch.png' });
var tray_menu = new gui.Menu();

var nt;
var win_width = 600;
var win_height = 375;
var nt_width = 290;
var nt_height = 100;

var user_name = window.location.search.split('=')[1];
var follows = [];

$(document).ready(function() {
	programInterface();
  	getUser();
});