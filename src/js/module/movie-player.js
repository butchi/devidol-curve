import lodash from 'lodash';
import $ from 'jquery';

import ns from './ns';

export default class MoviePlayer {
  constructor(animationPlayer, audioPlayer) {
    this.animationPlayer = animationPlayer;
    this.audioPlayer = audioPlayer;

    this.frameRate = 12;

    this.isPause = true;

    this.$info = $(); // set default value before override

    $(() => {
      this.$info = $('.info--pause');
      this.$blockInfo = this.$info.find('.block-info');
    });

    audioPlayer.$elm.on('play', () => {
      // console.log('play');
      this.play();
      try {
        ns.ytPlayer.seekTo(this.getCurrentTime(), true);
        ns.ytPlayer.playVideo();
      } catch(_e) {
      }

      this.$info.hide();
    });

    audioPlayer.$elm.on('pause', () => {
      // console.log('pause');
      this.pause();
      try {
        ns.ytPlayer.pauseVideo();
      } catch(_e) {
      }

      this.showInfo();
    });

    audioPlayer.$elm.on('seeking', () => {
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
    return Math.floor(this.audioPlayer.audioElm.currentTime * this.frameRate);
  }

  getCurrentTime() {
    return this.audioPlayer.audioElm.currentTime;
  }

  play() {
    this.audioPlayer.play();
    this.isPause = false;

    const loop = () => {
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
    const API_URL = 'https://www.wolframcloud.com/objects/65f6ffb2-c5c4-4295-ac84-ab3d304bbbe2';
    const curveArr = this.animationPlayer.curveArr;
    const compile = lodash.template('<dl><dt>x(t) = </dt><dd><%= x %></dd><dt>y(t) = </dt><dd><%= y %></dd><dt>plot: </dt><dd><a href="<%= api_url %>?x=<%= encodeURIComponent(x) %>&y=<%= encodeURIComponent(y) %>" target="_blank">Open the link</a></dd></dl>');
    this.$blockInfo.html('');

    if(curveArr.length > 0) {
      const $curveList = $('<ol></ol>');
      curveArr.forEach(curve => {
        let htmlStr = '';
        const $curve = $('<li></li>');
        const expression = curve.toExpression();
        const param = {
          x: expression['x'],
          y: expression['y'],
          api_url: API_URL,
        };
        htmlStr += compile(param);
        $curve.html(htmlStr);
        $curveList.append($curve);
      });
      this.$blockInfo.append($curveList);
    }

    this.$info.show();
  }
}