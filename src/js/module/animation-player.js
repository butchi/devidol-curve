import Curve from './curve';

import ns from './ns';

export default class AnimationPlayer {
  constructor(opts = {}) {
    this.currentFrame = 0;
    this.curveLi = {};
  }

  play() {
  }

  drawFrame(frame) {
    const curveLi = this.curveLi;

    Object.keys(ns.movieData).forEach(color => {
      const $elm = ns.$canvas.find(`.${color}`);
      const elm = $elm.get(0);

      $elm.children().remove();

      const frameData = ns.movieData[color][frame];

      const curveArr = [];
      curveLi[color] = curveArr;

      if (frameData) {
        for (let c = 0; c < frameData.length; c++) {
          const curve = new Curve({
            elm,
            components: frameData[c],
            maxFreqOpt: this.maxFreq,
          });

          curveArr.push(curve);

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