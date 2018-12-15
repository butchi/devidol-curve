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
    ns.$canvas.children().remove();
    Object.keys(ns.movieData).forEach(color => {
      var curveArr = ns.movieData[color][frame];
      var c;
      this.curveArr = [];
      if(curveArr) {
        for(c = 0; c < curveArr.length; c++) {
          var curve = new Curve(curveArr[c], this.maxFreq);
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