import Curve from './curve';

import ns from './ns';

export default class AnimationPlayer {
  constructor(opts = {}) {
    this.currentFrame = 0;
    this.curveArr = [];
  }

  play() {
  }

  drawFrame(frame) {
    Object.keys(ns.movieData).forEach(color => {
      const $elm = ns.$canvas.find(`.${color}`);
      const elm = $elm.get(0);

      $elm.children().remove();

      const curveArr = ns.movieData[color][frame];
      this.curveArr = [];

      if (curveArr) {
        for (let c = 0; c < curveArr.length; c++) {
          const curve = new Curve({
            elm,
            components: curveArr[c],
            maxFreqOpt: this.maxFreq,
          });
          this.curveArr.push(curve);
          curve.draw();
        }
      }
    });

    this.currentFrame = frame;
  }

  redraw() {
    this.drawFrame(this.currentFrame);
  };
}