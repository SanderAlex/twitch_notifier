var gui = require('nw.gui');
var win = gui.Window.get();
var tray = new gui.Tray({ icon: 'img/twitch1.png' });
var tray_menu = new gui.Menu();

var page_is_loaded = false;
var followsInterval;

var nt;
var win_width = 600;
var win_height = 375;
var nt_width = 290;
var nt_height = 100;

var user_name = window.location.search.split('=')[1];
var follows = [];
var online = {};

var limit = 100;
var offset = 0;

win.on('maximize', function(){
    win.isMaximized = true;
});

win.on('unmaximize', function(){
    win.isMaximized = false;
});

win.on('resize', function(){
    $("#content").height(win.height - $("header").height());
});

$(document).ready(function() {
	programInterface();
	getUser();
  	setInterval(getUser, 900000);
});