import lodash from 'lodash';
import $ from 'jquery';

import ns from './ns';

export default class MoviePlayer {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize({ animationPlayer, audioPlayer }) {
    this.animationPlayer = animationPlayer;
    this.audioPlayer = audioPlayer;

    this.frameRate = 12;

    this.isPause = true;

    this.$info = $(); // set default value before override

    $(_ => {
      this.$info = $('.info--pause');
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

      this.$info.hide();
    });

    audioPlayer.$elm.on('pause', _ => {
      // console.log('pause');
      this.pause();
      try {
        ns.ytPlayer.pauseVideo();
      } catch(_e) {
      }

      this.showInfo();
    });

    audioPlayer.$elm.on('seeking', _ => {
      // console.log('seeking');

      this.animationPlayer.drawFrame(this.getFrame());
      this.showInfo();
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

        requestAnimationFrame(loop);
      }
    }

    requestAnimationFrame(loop);
  }

  pause() {
    this.isPause = true;
  }

  showInfo() {
    const curveArr = this.animationPlayer.curveArr;
    const compile = lodash.template(`<ul><li>x(t) = <%= x %></li><li>y(t) = <%= y %></li></ul>`);
    this.$blockInfo.html('');

    if(curveArr.length > 0) {
      const $curveList = $('<ol></ol>');
      curveArr.forEach(curve => {
        let htmlStr = '';

        const $curve = $('<li></li>');

        const expression = curve.toExpression();
        const {x, y} = expression;

        htmlStr += compile({x, y});

        $curve.html(htmlStr);
        $curveList.append($curve);
      });
      this.$blockInfo.append($curveList);
    }

    this.$info.show();
  }
}