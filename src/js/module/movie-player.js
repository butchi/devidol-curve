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

    console.log(ns.currentFrame);

    if (ns.currentFrame < 100) {
      const initStr =`RESET;
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

      const len = Math.floor(ns.currentFrame / 80 * initStr.length);

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