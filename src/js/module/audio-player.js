import $ from 'jquery';

export default class AudioPlayer {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize({ elm }) {
    this.elm = elm;
    this.$elm = $(elm);
  }

  play() {
    this.elm.play();
  }

  pause() {
    this.elm.pause();
  }

  stop() {
    this.elm.pause();
    this.elm.currentTime = 0;
  }
}