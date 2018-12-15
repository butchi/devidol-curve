window.licker = window.licker || {};
(function(ns) {
  function AudioPlayer($elm) {
    this.audioElm = $elm.get(0);
    this.$elm = $elm;
  }

  AudioPlayer.prototype.play = function() {
    this.audioElm.play();
    return this;
  };

  AudioPlayer.prototype.pause = function() {
    this.audioElm.pause();
    return this;
  };

  AudioPlayer.prototype.stop = function() {
    this.audioElm.pause();
    this.audioElm.currentTime = 0;
    return this;
  };

  ns.AudioPlayer = AudioPlayer;
}(window.licker));
