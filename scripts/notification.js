$(document).ready(function() {
	var gui = require('nw.gui');
	var win = gui.Window.get();
	var nt_width = 290;
	var nt_height = 100;

	process.mainModule.exports.all_notification = $("#notifications");
	process.mainModule.exports.notification = $("#nt_content");

	$("#closer").click(function() {
		win.hide();
		$("#nt_content").empty();
		win.height = nt_height;
		win.moveTo(screen.width - nt_width*1.1, -nt_height);
	});
});