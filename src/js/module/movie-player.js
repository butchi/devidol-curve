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

    this.isMute = false;

    this.$info = $(); // set default value before override

    $(_ => {
      this.$info = $('.info');
      this.$blockInfo = this.$info.find('.block-info');
    });

    audioPlayer.$elm.on('play', _ => {
      // console.log('play');
      this.play();
      $('.btnPlay').removeClass('paused');
      $('.btnPlay').find('.icon-play').addClass('icon-pause').removeClass('icon-play');
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), true);
        ns.ytPlayer.playVideo();
      } catch(_e) {
      }
    });

    audioPlayer.$elm.on('pause', _ => {
      // console.log('pause');
      this.pause();
      $('.btnPlay').addClass('paused');
      $('.btnPlay').find('.icon-pause').removeClass('icon-pause').addClass('icon-play');
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
        ns.ytPlayer.seekTo(this.getCurrentTime(), true);
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
      const currentPos = this.audioPlayer.currentTime;
      const maxduration = this.audioPlayer.duration;
      const perc = 100 * currentPos / maxduration;

      $('.timeBar').css('width', `${perc}%`);  
      $('.current').text(timeFormat(currentPos)); 
    });

    const playpause = _ => {
      if (audioPlayer.paused || audioPlayer.ended) {
        audioPlayer.play();
      }
      else {
        audioPlayer.pause();
      }
    };

    $('.btnPlay').on('click', _evt => {
      playpause();
    });
    $('.area-movie .cover').on('click', _evt => {
      $('.original-movie').attr('data-show', true);

      $('.area-movie .cover').hide();

      setTimeout(_ => {
        this.hideController();
      }, 3000);

      playpause();
    });


    $('.sound.btn').on('click', evt => {
      if (this.isMute) {
        ns.ytPlayer.unMute();

        $(evt.target).closest('.btn').removeClass('muted');

        this.isMute = false;
      } else {
        ns.ytPlayer.mute();

        $(evt.target).closest('.btn').addClass('muted');

        this.isMute = true;
      }
    })


    //VIDEO PROGRESS BAR
    //when video timebar clicked

    const updatebar = x => {
      const progress = $('.progress');

      //calculate drag position
      //and update video currenttime
      //as well as progress bar
      const maxduration = this.audioPlayer.duration;
      const position = x - progress.offset().left;
      let percentage = 100 * position / progress.width();

      if (percentage > 100) {
        percentage = 100;
      }

      if (percentage < 0) {
        percentage = 0;
      }

      $('.timeBar').css('width', `${percentage}%`);  
      this.audioPlayer.currentTime = maxduration * percentage / 100;
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

  getFrame() {
    return Math.floor(this.audioPlayer.currentTime * this.frameRate);
  }

  getCurrentTime() {
    return this.audioPlayer.currentTime;
  }

  play() {
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

  showController() {
    $('.group-controller').attr('data-is-hidden', false);
  }

  hideController() {
    $('.group-controller').attr('data-is-hidden', true);
  }
}