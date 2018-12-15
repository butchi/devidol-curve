window.licker = window.licker || {};
(function(ns) {
  function MoviePlayer(animationPlayer, audioPlayer) {
    this.animationPlayer = animationPlayer;
    this.audioPlayer = audioPlayer;

    this.frameRate = 12;

    this.isPause = true;

    this.$info = $(); // set default value before override

    var _self = this;

    $(function() {
      _self.$info = $('.info--pause');
      _self.$blockInfo = _self.$info.find('.block-info');
    });

    audioPlayer.$elm.on('play', function() {
      // console.log('play');
      _self.play();
      try {
        ns.ytPlayer.seekTo(_self.getCurrentTime(), true);
        ns.ytPlayer.playVideo();
      } catch(_e) {
      }

      _self.$info.hide();
    });

    audioPlayer.$elm.on('pause', function() {
      // console.log('pause');
      _self.pause();
      try {
        ns.ytPlayer.pauseVideo();
      } catch(_e) {
      }

      _self.showInfo();
    });

    audioPlayer.$elm.on('seeking', function() {
      // console.log('seeking');

      _self.animationPlayer.drawFrame(_self.getFrame());
      _self.showInfo();
      try {
        ns.ytPlayer.seekTo(_self.getCurrentTime(), false);
      } catch(_e) {
      }
    });
  }

  MoviePlayer.prototype.getFrame = function() {
    return Math.floor(this.audioPlayer.audioElm.currentTime * this.frameRate);
  };

  MoviePlayer.prototype.getCurrentTime = function() {
    return this.audioPlayer.audioElm.currentTime;
  };

  MoviePlayer.prototype.play = function() {
    this.audioPlayer.play();
    this.isPause = false;

    var _self = this;
    requestAnimationFrame(loop);

    function loop() {
      var frame;
      if(!_self.isPause) {
        _self.animationPlayer.drawFrame(_self.getFrame());

        requestAnimationFrame(loop);
      }
    }
  };

  MoviePlayer.prototype.pause = function() {
    this.isPause = true;
  };

  MoviePlayer.prototype.showInfo = function() {
    _self = this;

    var API_URL = 'https://www.wolframcloud.com/objects/65f6ffb2-c5c4-4295-ac84-ab3d304bbbe2';
    var curveArr = _self.animationPlayer.curveArr;
    var compile = _.template('<dl><dt>x(t) = </dt><dd><%= x %></dd><dt>y(t) = </dt><dd><%= y %></dd><dt>plot: </dt><dd><a href="<%= api_url %>?x=<%= encodeURIComponent(x) %>&y=<%= encodeURIComponent(y) %>" target="_blank">Open the link</a></dd></dl>');
    _self.$blockInfo.html('');

    if(curveArr.length > 0) {
      var $curveList = $('<ol></ol>');
      curveArr.forEach(function(curve) {
        var htmlStr = '';
        var $curve = $('<li></li>');
        var expression = curve.toExpression();
        var param = {
          x: expression['x'],
          y: expression['y'],
          api_url: API_URL,
        };
        htmlStr += compile(param);
        $curve.html(htmlStr);
        $curveList.append($curve);
      });
      _self.$blockInfo.append($curveList);
    }

    _self.$info.show();
  };

  ns.MoviePlayer = MoviePlayer;
}(window.licker));
