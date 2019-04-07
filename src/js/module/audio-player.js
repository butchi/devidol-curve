import $ from 'jquery';

import ns from './ns';

const DURATION = 91;

let prev;

export default class AudioPlayer {
  constructor(opts = {}) {
    this.initialize(opts);
  }

  initialize({ $elm }) {
    this.$elm = $elm;

    this.duration = DURATION;

    this.cur = 0;

    this.paused = true;

    const loop = _ => {
      if (!this.paused) {
        const now = Date.now();

        if (prev) {
          this.cur += (now - prev) / 1000;
          this.$elm.trigger('timeupdate');
        }

        prev = now;

        if (this.cur >= this.duration) {
          this.stop();
        }
      }

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  play() {
    this.$elm.trigger('play');

    this.paused = false;
    this.ended = false;
  }

  pause() {
    this.paused = true;
    prev = null;
    this.$elm.trigger('pause');
  }

  stop() {
    this.ended = true;
    this.paused = true;
    prev = null;
    this.$elm.trigger('pause');
    this.cur = 0;
  }

  sync() {
    const currentTime = ns.ytPlayer.getCurrentTime();

    this.cur = currentTime;
  }

  get currentTime() {
    return this.cur;
  }

  set currentTime(t) {
    this.cur = t;
    this.$elm.trigger('seeking');
  }
}