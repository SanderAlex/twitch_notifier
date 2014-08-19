function programInterface() {
  $("#minimizeButton").click(hideProgram);

  tray_menu.append(new gui.MenuItem({ label: 'Show' }));
  tray_menu.append(new gui.MenuItem({ label: 'Exit' }));
  tray_menu.items[0].click = function() { 
    win.show();
  };
  tray_menu.items[1].click = closeProgram;

  tray.on('click', function() {
    win.show();
  });

  tray.menu = tray_menu;
}

function getUser() {
  function getFollows() {
    $.ajax({
      type: "POST",
      url: "https://api.twitch.tv/kraken/users/" + user_name + "/follows/channels?limit=" + limit + "&offset=" + offset,
      success: function(response) {
        if(response['error'] !== undefined) {
          document.location.href = "index.html?invalid=1";
          return;
        }  
        else {
          $.each(response['follows'], function(key, item) {
            follows.push(item);
          });
          
          if(response['follows'].length == limit) {
            offset += limit;
            getFollows();            
          }
          else
            startObservation();
        }  
      },
      dataType: "jsonp"
    });
  }
  var limit = 100;
  var offset = 0;
  clearInterval(followsInterval);
  follows = [];
  getFollows();
}

function pageLoaded() {
  win.width = win_width;
  win.height = win_height;
  win.setMinimumSize(win_width, win_height);
  win.setResizable(true);

  $("#loader").remove();
  $("#content").css("visibility", "visible");
  $("#head").css("visibility", "visible");
  $("#win_ul").append("<li><a href='#' id='maximizeButton'></a></li>");

  $("#user_link").html(user_name);

  page_is_loaded = true;

  addEvents();

  /*$("#user_link").click(function() {
    $("#user_menu").toggle();
  });*/

  nt = gui.Window.open(
  'notifications.html', {
      show_in_taskbar: false,
      frame: false,
      toolbar: false,
      width: nt_width,
      height: nt_height,
      show: false,
      'always-on-top': true,
      resizable: false
    }
  );
  nt.moveTo(screen.width - nt_width*1.1, -nt_height);
}

function startObservation() {
  if(!page_is_loaded)
    pageLoaded();

  $("#follows").empty();
  $.each(follows, followItem);

  followsInterval = setInterval(function() {
    $.each(follows, function(key, item) {
      isOnline(key, item['channel']['name'], false);
    });
  }, 60000);
  /*setInterval(function() {
    notification('http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png', "dasdas", "just went live!");
  }, 3000);*/
}

function addEvents() {
  $("#maximizeButton").click(maximizeProgram);
  $("#refreshBt").click(getUser);
  $("#twitch_img").click(function() {
    gui.Shell.openExternal('http://www.twitch.tv/');
  });
  $("#user_link").click(function() {
    gui.Shell.openExternal('http://www.twitch.tv/' + user_name + '/profile');
  });
}

function minimizeProgram() {
  win.minimize();
}

function hideProgram() {
  win.hide();
}

function maximizeProgram() {
  if(win.isMaximized)
    win.unmaximize();
  else
    win.maximize();
}

function closeProgram() {
  if(tray != null)
    tray.remove();
  if(nt != null)
    nt.close();
  win.close();
  gui.App.quit();
}

function followItem(key, item) {
  var follow = "<div class='follow' id='" + key + "'>";
  if(item['channel']['logo'])
    follow += "<img src=" + item['channel']['logo'] + ">";
  else
    follow += "<img src='http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png'>";
  follow += "<div class='channel_name'><a>" + item['channel']['display_name'] + "</a></div>";
  follow += "<div></div>";
  follow += "</div>";
  $("#follows").append(follow);

  isOnline(key, item['channel']['name'], true);
}

function isOnline(key, channel, first_check) {
  var logo;
  $.ajax({
    type: "POST",
    url: "https://api.twitch.tv/kraken/streams/" + channel,
    success: function(response) {
      if(response['stream'] == null) {
        $("#" + key + " div:last-child").removeClass("statusOnline"); 
        $("#" + key + " div:last-child").addClass("statusOffline");        
        $("#" + key + " div:last-child").html("offline");
      }
      else {
        if($("#" + key + " div:last-child").hasClass("statusOffline") && !first_check) {
          $("#" + key + " div:last-child").removeClass("statusOffline"); 
          notification(response, "just went live!");
        }
        $("#" + key + " div:last-child").addClass("statusOnline");
        $("#" + key + " div:last-child").html("<img src='img/viewer.png'><span>" + accounting.formatNumber(response['stream']['viewers']) + "</span>Live");
      }
    },
    dataType: "jsonp"
  }); 
}

function notification(stream_obj, text) {

  function toggleNot(){
    setTimeout(function(){
      if(y <= 0 ){
        nt.moveTo(x, y);
        y += 10;
        toggleNot();
      }
    }, 30);
  }

  function resizeNot(count){
    setTimeout(function(){
      if(h <= nt_height*count && $(process.mainModule.exports.notification).children().length != 0){
        nt.height = h;
        h += 10;
        resizeNot(count);
      }
    }, 30);
  }

  if($(process.mainModule.exports.notification).children($("#" + stream_obj['stream']['channel']['name'])).length == 1)
    return;

  var x = screen.width - nt_width*1.1;
  var y = -nt_height;
  var h = nt.height;
  var not = "<div class='notification' id='" + stream_obj['stream']['channel']['name'] + "'>";

  if(!nt.isShow)
    nt.show(true);

  if(stream_obj['stream']['channel']['logo'])
    not += "<img src='" + stream_obj['stream']['channel']['logo'] +"'>";
  else
    not += "<img src='http://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_150x150.png'>";
  not += "<div>";
  not += "<a>" + stream_obj['stream']['channel']['display_name'] + "</a>";
  not += "<p>" + text + "</p>";
  not += "</div></div>";

  $(process.mainModule.exports.notification).prepend(not);

  if($(process.mainModule.exports.notification).children().length == 1)
    toggleNot();
  else
    resizeNot($(process.mainModule.exports.notification).children().length);
}