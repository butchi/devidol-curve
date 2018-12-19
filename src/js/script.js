import $ from 'jquery';

import ns from './module/ns';
import MoviePlayer from './module/movie-player';
import AnimationPlayer from './module/animation-player';
import AudioPlayer from './module/audio-player';

ns.movieData = {};
var moviePlayer;
var animationPlayer;
var audioPlayer;

var totalBytesFirst = 58038364; // 低画質JSONのバイト数

fetch('data/fourier-array.json')
  .then(res => {
    return res.json();
  })
  .then(json => {
    init(json);
  })
  .catch(err => {
    alert(err);
  })
;


function init(data) {
  ns.movieData = data;
  ns.currentFrame = 0;

  $('body').one('mdl-componentupgraded', evt => {
    var $maxFreqController = $('.controller-max-freq');
    $maxFreqController.on('updatevalue', function(evt) {
      var val = $(this).attr('data-value');
      animationPlayer.maxFreq = val;
      $maxFreqSlidebar.val(val);
      $maxFreqNumber.val(val);
      animationPlayer.redraw();
      if((moviePlayer.getFrame() !== 0) && moviePlayer.isPause) {
        moviePlayer.showInfo();
      }
    });

    var $maxFreqSlidebar = $('.controller-max-freq__slidebar input');
    var $maxFreqNumber = $('.controller-max-freq__number input');
    $maxFreqSlidebar.on('input change', function() {
      $maxFreqController.attr('data-value', $(this).val());
      $maxFreqController.trigger('updatevalue');
    });
    $maxFreqNumber.on('input change', function() {
      $maxFreqController.attr('data-value', $(this).val());
      $maxFreqController.trigger('updatevalue');
    });

    var $canvas = $('.svg-canvas .svg-canvas__main');
    ns.$canvas = $canvas; // TODO: do not use global variable
    var $audio = $('.audio');

    audioPlayer = new AudioPlayer($audio);
    animationPlayer = new AnimationPlayer();
    moviePlayer = new MoviePlayer(animationPlayer, audioPlayer);

    ns.moviePlayer = moviePlayer;
    ns.animationPlayer = animationPlayer;
    ns.audioPlayer = audioPlayer;

    $maxFreqSlidebar.trigger('change');

    $('.controller-compare').on('change', evt => {
      const val = $(evt.target).val();

      const state = {
        NORMAL:  'normal',
        COMPARE: 'compare',
        OVERLAY: 'overlay',
      }

      const $movieArr = $('.array-movie');

      if (false) {
      } else if (val === state.NORMAL) {
        $movieArr.attr('data-mode', state.NORMAL);
      } else if (val === state.COMPARE) {
        $movieArr.attr('data-mode', state.COMPARE);
      } else if (val === state.OVERLAY) {
        $('.controller-color--line [value="red"]').prop('checked', true).trigger('change');
        $movieArr.attr('data-mode', state.OVERLAY);
      } else {
      }

      if (val === state.COMPARE || val === state.OVERLAY) {
        try {
          ns.ytPlayer.seekTo(moviePlayer.getCurrentTime(), true);
        } catch(_e) {
        }
      }
    }).find(':checked').trigger('change');

    $('.controller-color input[type="radio"]').on('change', function() {
      var val = $(this).val();
      var $parent = $(this).closest('.controller-color');

      $parent.trigger('updatevalue', val);
    });

    $('.controller-color input[type="color"]').on('change', function() {
      var val = $(this).val();
      var $parent = $(this).closest('.controller-color');

      $parent.trigger('updatevalue', val);
    });

    $('.controller-color').on('updatevalue', function(_evt, val) {
      var $this = $(this);
      var color = val;
      $this.attr('data-color', color);

      if($this.is('.controller-color--bg')) {
        $('body').css({
          "background-color": color,
        });
      }

      if($this.is('.controller-color--fill')) {
        $('.svg-canvas .svg-canvas__main').css({
          fill: color,
        });
      }

      if($this.is('.controller-color--line')) {
        $('.svg-canvas .svg-canvas__main').css({
          stroke: color,
        });
      }
    });

    var $thicknessController = $('.controller-thickness');
    $thicknessController.on('updatevalue', function(evt) {
      var val = $(this).attr('data-value');
      $('.svg-canvas .svg-canvas__main').css({
        "stroke-width": val,
      });
      $thicknessSlidebar.val(val);
      $thicknessNumber.val(val);
    });

    var $thicknessSlidebar = $('.controller-thickness__slidebar input');
    var $thicknessNumber = $('.controller-thickness__number input');
    $thicknessSlidebar.on('input change', function() {
      $thicknessController.attr('data-value', $(this).val());
      $thicknessController.trigger('updatevalue');
    });
    $thicknessNumber.on('input change', function() {
      $thicknessController.attr('data-value', $(this).val());
      $thicknessController.trigger('updatevalue');
    });

    $thicknessSlidebar.trigger('change');
  });
}

window.onYouTubeIframeAPIReady = () => {
  const ytPlayer = new YT.Player('original_movie', {
    width   : '640',
    height  : '360',
    videoId : 'gyDFoIbxB34',
    events  : {
      // プレイヤーの準備ができたときに実行されるコールバック関数
      onReady : onPlayerReady,
      onStateChange: onStateChange,
    },
    playerVars: {
      rel      : 0, // 関連動画
      showinfo : 0, // 動画情報
      controls : 0, // コントローラー
      wmode    : 'transparent', // z-indexを有効にする
    },
  });

  function onPlayerReady() {
    // if (moviePlayer && !moviePlayer.isPause) {
    //   ytPlayer.playVideo();
    // }
  }

  function onStateChange(state) {
    switch (state.data) {
    case window.YT.PlayerState.PAUSED:
      break;

    case window.YT.PlayerState.ENDED:
      break;

    case window.YT.PlayerState.PLAYING:
      moviePlayer.play();
      break;
    }
  }

  ns.ytPlayer = ytPlayer;
};
