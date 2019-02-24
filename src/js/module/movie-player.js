import lodash from 'lodash';
import $ from 'jquery';

import ns from './ns';

export default class MoviePlayer {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize({ elm, animationPlayer, audioPlayer }) {
    this.elm = elm;

    this.animationPlayer = animationPlayer;
    this.audioPlayer = audioPlayer;

    this.frameRate = 12;

    this.isPause = true;

    this.$info = $(); // set default value before override

    $(_ => {
      this.$info = $('.info');
      this.$blockInfo = this.$info.find('.block-info');
    });

    audioPlayer.$elm.on('play', _ => {
      // console.log('play');
      this.play();
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), true);
        ns.ytPlayer.playVideo();
      } catch(_e) {
      }
    });

    audioPlayer.$elm.on('pause', _ => {
      // console.log('pause');
      this.pause();
      try {
        ns.ytPlayer.pauseVideo();
      } catch(_e) {
      }
    });

    audioPlayer.$elm.on('seeking', _ => {
      // console.log('seeking');

      this.animationPlayer.drawFrame(this.getFrame());
      this.updateInfo();
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), false);
      } catch(_e) {
      }
    });

    //Time format converter - 00:00
    const timeFormat = (seconds) => {
      var m = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
      var s = Math.floor(seconds - (m * 60)) < 10 ? "0" + Math.floor(seconds - (m * 60)) : Math.floor(seconds - (m * 60));

      return `${m}:${s}`;
    };

    //display current video play time
    audioPlayer.$elm.on('timeupdate', _ => {
      const currentPos = this.audioPlayer.elm.currentTime;
      const maxduration = this.audioPlayer.elm.duration;
      const perc = 100 * currentPos / maxduration;

      $('.timeBar').css('width', `${perc}%`);  
      $('.current').text(timeFormat(currentPos)); 
    });

    const playpause = _ => {
      const { elm } = this.audioPlayer;

      if(elm.paused || elm.ended) {
        $('.btnPlay').addClass('paused');
        $('.btnPlay').find('.icon-play').addClass('icon-pause').removeClass('icon-play');

        elm.play();
      }
      else {
        $('.btnPlay').removeClass('paused');
        $('.btnPlay').find('.icon-pause').removeClass('icon-pause').addClass('icon-play');
        elm.pause();
      }
    };

    $('.btnPlay').on('click', _ => {
      playpause();
    });


    //VIDEO PROGRESS BAR
    //when video timebar clicked

    const updatebar = x => {
      const { elm } = this.audioPlayer;
      const progress = $('.progress');

      //calculate drag position
      //and update video currenttime
      //as well as progress bar
      const maxduration = elm.duration;
      const position = x - progress.offset().left;
      let percentage = 100 * position / progress.width();

      if (percentage > 100) {
        percentage = 100;
      }

      if (percentage < 0) {
        percentage = 0;
      }

      $('.timeBar').css('width', `${percentage}%`);  
      elm.currentTime = maxduration * percentage / 100;
    };

    let timeDrag = false; /* check for drag event */
    $('.progress').on('mousedown', e => {
      timeDrag = true;
      updatebar(e.pageX);
    });
    $(document).on('mouseup', e => {
      if (timeDrag) {
        timeDrag = false;
        updatebar(e.pageX);
      }
    });
    $(document).on('mousemove', e => {
      if(timeDrag) {
        updatebar(e.pageX);
      }
    });
  }

  initVideo() {
    /*
    JS Modified from a tutorial found here: 
    http://www.inwebson.com/html5/custom-html5-video-controls-with-jquery/

    I really wanted to learn how to skin html5 video.
    */

    //INITIALIZE
    const elm = this.elm;
    const $video = $(elm).find('[data-elm="video"]');
    const videoElm = $video.get(0);
    this.videoElm = videoElm;
    
    //remove default control when JS loaded
    videoElm.removeAttribute("controls");
    $('.control').fadeIn(500);
    $('.caption').fadeIn(500);
   
    //before everything get started
    $video.on('loadedmetadata', function() {
        
      //set video properties
      $('.current').text(timeFormat(0));
      $('.duration').text(timeFormat(videoElm.duration));
      updateVolume(0, 0.7);
        
      //start to get video buffering data 
      setTimeout(startBuffer, 150);
        
      //bind video events
      $(this.elm)
        .hover(function() {
          $('.control').stop().fadeIn();
          $('.caption').stop().fadeIn();
        }, function() {
          if(!volumeDrag && !timeDrag){
            $('.control').stop().fadeOut();
            $('.caption').stop().fadeOut();
          }
        })
        .on('click', function() {
          $('.btnPlay').find('.icon-play').addClass('icon-pause').removeClass('icon-play');
          $(this).unbind('click');
          videoElm.play();
        })
      ;
    });
    
    //display video buffering bar
    var startBuffer = function() {
      var currentBuffer = videoElm.buffered.end(0);
      var maxduration = videoElm.duration;
      var perc = 100 * currentBuffer / maxduration;
      $('.bufferBar').css('width',perc+'%');
        
      if(currentBuffer < maxduration) {
        setTimeout(startBuffer, 500);
      }
    };  
    
    //display current video play time
    $video.on('timeupdate', function() {
      var currentPos = videoElm.currentTime;
      var maxduration = videoElm.duration;
      var perc = 100 * currentPos / maxduration;
      $('.timeBar').css('width',perc+'%');  
      $('.current').text(timeFormat(currentPos)); 
    });

    
    //CONTROLS EVENTS
    //video screen and play button clicked

    const playpause = _ => {
      if(videoElm.paused || videoElm.ended) {
        $('.btnPlay').addClass('paused');
        $('.btnPlay').find('.icon-play').addClass('icon-pause').removeClass('icon-play');
        videoElm.play();
      }
      else {
        $('.btnPlay').removeClass('paused');
        $('.btnPlay').find('.icon-pause').removeClass('icon-pause').addClass('icon-play');
        videoElm.pause();
      }
    };

    $video.on('click', _ => {
      playpause();
    });
    $('.btnPlay').on('click', _ => {
      playpause();
    });

    
    //fullscreen button clicked
    $('.btnFS').on('click', function() {
      if($.isFunction(videoElm.webkitEnterFullscreen)) {
        videoElm.webkitEnterFullscreen();
      } 
      else if ($.isFunction(videoElm.mozRequestFullScreen)) {
        videoElm.mozRequestFullScreen();
      }
      else {
        alert('Your browsers doesn\'t support fullscreen');
      }
    });
    
    //sound button clicked
    $('.sound').click(function() {
      videoElm.muted = !videoElm.muted;
      $(this).toggleClass('muted');
      if(videoElm.muted) {
        $('.volumeBar').css('width',0);
      }
      else{
        $('.volumeBar').css('width', videoElm.volume*100+'%');
      }
    });
    
    //VIDEO EVENTS
    //video canplay event
    $video.on('canplay', function() {
      $('.loading').fadeOut(100);
    });
    
    //video canplaythrough event
    //solve Chrome cache issue
    var completeloaded = false;
    $video.on('canplaythrough', function() {
      completeloaded = true;
    });
    
    //video ended event
    $video.on('ended', function() {
      $('.btnPlay').removeClass('paused');
      videoElm.pause();
    });

    //video seeking event
    $video.on('seeking', function() {
      //if video fully loaded, ignore loading screen
      if(!completeloaded) { 
        $('.loading').fadeIn(200);
      } 
    });
    
    //video seeked event
    $video.on('seeked', function() { });
    
    //video waiting for more data event
    $video.on('waiting', function() {
      $('.loading').fadeIn(200);
    });
    
    //VIDEO PROGRESS BAR
    //when video timebar clicked
    var timeDrag = false; /* check for drag event */
    $('.progress').on('mousedown', function(e) {
      timeDrag = true;
      updatebar(e.pageX);
    });
    $(document).on('mouseup', function(e) {
      if(timeDrag) {
        timeDrag = false;
        updatebar(e.pageX);
      }
    });
    $(document).on('mousemove', function(e) {
      if(timeDrag) {
        updatebar(e.pageX);
      }
    });
    var updatebar = function(x) {
      var progress = $('.progress');
      
      //calculate drag position
      //and update video currenttime
      //as well as progress bar
      var maxduration = videoElm.duration;
      var position = x - progress.offset().left;
      var percentage = 100 * position / progress.width();
      if(percentage > 100) {
        percentage = 100;
      }
      if(percentage < 0) {
        percentage = 0;
      }
      $('.timeBar').css('width',percentage+'%');  
      videoElm.currentTime = maxduration * percentage / 100;
    };

    //VOLUME BAR
    //volume bar event
    var volumeDrag = false;
    $('.volume').on('mousedown', function(e) {
      volumeDrag = true;
      videoElm.muted = false;
      $('.sound').removeClass('muted');
      updateVolume(e.pageX);
    });
    $(document).on('mouseup', function(e) {
      if(volumeDrag) {
        volumeDrag = false;
        updateVolume(e.pageX);
      }
    });
    $(document).on('mousemove', function(e) {
      if(volumeDrag) {
        updateVolume(e.pageX);
      }
    });
    var updateVolume = function(x, vol) {
      var volume = $('.volume');
      var percentage;
      //if only volume have specificed
      //then direct update volume
      if(vol) {
        percentage = vol * 100;
      }
      else {
        var position = x - volume.offset().left;
        percentage = 100 * position / volume.width();
      }
      
      if(percentage > 100) {
        percentage = 100;
      }
      if(percentage < 0) {
        percentage = 0;
      }
      
      //update volume bar and video volume
      $('.volumeBar').css('width',percentage+'%');  
      videoElm.volume = percentage / 100;
      
      //change sound icon based on volume
      if(videoElm.volume == 0){
        $('.sound').removeClass('sound2').addClass('muted');
      }
      else if(videoElm.volume > 0.5){
        $('.sound').removeClass('muted').addClass('sound2');
      }
      else{
        $('.sound').removeClass('muted').removeClass('sound2');
      }
      
    };

    //Time format converter - 00:00
    var timeFormat = function(seconds){
      var m = Math.floor(seconds/60)<10 ? "0"+Math.floor(seconds/60) : Math.floor(seconds/60);
      var s = Math.floor(seconds-(m*60))<10 ? "0"+Math.floor(seconds-(m*60)) : Math.floor(seconds-(m*60));
      return m+":"+s;
    };


    $video.on('play', _ => {
      // console.log('play');
      this.play();
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), true);
        ns.ytPlayer.playVideo();
      } catch(_e) {
      }
    });

    $video.on('pause', _ => {
      // console.log('pause');
      this.pause();
      try {
        ns.ytPlayer.pauseVideo();
      } catch(_e) {
      }
    });

    $video.on('seeking', _ => {
      // console.log('seeking');

      this.animationPlayer.drawFrame(this.getFrame());
      this.updateInfo();
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), false);
      } catch(_e) {
      }
    });
  }

  getFrame() {
    return Math.floor(this.audioPlayer.elm.currentTime * this.frameRate);
  }

  getCurrentTime() {
    return this.audioPlayer.elm.currentTime;
  }

  play() {
    this.audioPlayer.play();
    this.isPause = false;

    const loop = _ => {
      if(!this.isPause) {
        this.animationPlayer.drawFrame(this.getFrame());
        this.updateInfo();

        requestAnimationFrame(loop);
      }
    }

    requestAnimationFrame(loop);
  }

  pause() {
    this.isPause = true;
  }

  updateInfo() {
    const curveLi = this.animationPlayer.curveLi;
    const compile = lodash.template(`<ul><li>x<sub><%= index %></sub>(t) = <%= x %></li><li>y<sub><%= index %></sub>(t) = <%= y %></li></ul>`);
    this.$blockInfo.html('');

    if (ns.currentFrame < 100) {
      const initStr = `RESET;
HAN
SHM
AIR
RCT

AKB
ISL

ISL#f19f00
IDL
DVL IMETIME
LDA#LOADING
ECO INIMON

DE DE DEDEDE
DE DE DEDEDE.............`
      ;

      const len = Math.max(0, Math.floor((ns.currentFrame - 20) / 60 * initStr.length));

      const sliceStr = initStr.slice(0, len);

      this.$blockInfo.html(`<pre>${sliceStr}</pre>`);
    }

    Object.keys(curveLi).forEach(color => {
      const curveArr = curveLi[color];

      if(curveArr.length > 0) {
        const $blockColor = $(`<div></div>`);

        const $label = $(`<div></div>`)
        const $colorComponent = $('<div></div>');

        $blockColor.append($label);
        $blockColor.append($colorComponent);

        this.$blockInfo.append($blockColor);

        $label.text(`${color}:`);

        const $curveList = $(`<ol></ol>`);
        curveArr.forEach((curve, index) => {
          let htmlStr = '';

          const $curve = $('<li></li>');

          const expression = curve.toExpression();
          const {x, y} = expression;

          htmlStr += compile({index, x, y});

          $curve.html(htmlStr);
          $curveList.append($curve);
        });

        $colorComponent.append($curveList);
      }
    });
  }
}