export default class AudioPlayer {
  constructor($elm) {
    this.audioElm = $elm.get(0);
    this.$elm = $elm;
  }

  play() {
    this.audioElm.play();
  }

  pause() {
    this.audioElm.pause();
  }

  stop() {
    this.audioElm.pause();
    this.audioElm.currentTime = 0;
  }
}