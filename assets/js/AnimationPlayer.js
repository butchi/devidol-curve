window.licker = window.licker || {};
(function(ns) {
  function AnimationPlayer() {
    this.currentFrame = 0;
    this.curveArr = [];
  }

  AnimationPlayer.prototype.play = function() {
  };

  AnimationPlayer.prototype.drawFrame = function(frame) {
    ns.$canvas.children().remove();
    Object.keys(ns.movieData).forEach(color => {
      var curveArr = ns.movieData[color][frame];
      var c;
      this.curveArr = [];
      if(curveArr) {
        for(c = 0; c < curveArr.length; c++) {
          var curve = new ns.Curve(curveArr[c], this.maxFreq);
          this.curveArr.push(curve);
          curve.draw();
        }
      }
    });

    this.currentFrame = frame;
  };

  AnimationPlayer.prototype.redraw = function() {
    this.drawFrame(this.currentFrame);
  };

  // AnimationPlayer.prototype.drawNextFrame = function() {
  //   this.drawFrame(ns.currentFrame);
  //   if(ns.currentFrame < ns.movieData.length - 1) {
  //     ns.currentFrame++;
  //     var _self = this;
  //     window.setTimeout(function() {
  //       _self.drawNextFrame();
  //     }, 1000/30);
  //   }
  // };

  ns.AnimationPlayer = AnimationPlayer;
}(window.licker));
