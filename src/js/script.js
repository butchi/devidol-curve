import $ from 'jquery';

import ns from './module/ns';
import MoviePlayer from './module/movie-player';
import AnimationPlayer from './module/animation-player';
import AudioPlayer from './module/audio-player';

ns.movieData = {};
let moviePlayer;
let animationPlayer;
let audioPlayer;

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
    const $maxFreqController = $('.controller-max-freq');
    $maxFreqController.on('updatevalue', function(evt) {
      const val = $(this).attr('data-value');
      animationPlayer.maxFreq = val;
      $maxFreqSlidebar.val(val);
      $maxFreqNumber.val(val);
      animationPlayer.redraw();
      if((moviePlayer.getFrame() !== 0) && moviePlayer.isPause) {
        moviePlayer.showInfo();
      }
    });

    const $maxFreqSlidebar = $('.controller-max-freq__slidebar input');
    const $maxFreqNumber = $('.controller-max-freq__number input');
    $maxFreqSlidebar.on('input change', function() {
      $maxFreqController.attr('data-value', $(this).val());
      $maxFreqController.trigger('updatevalue');
    });
    $maxFreqNumber.on('input change', function() {
      $maxFreqController.attr('data-value', $(this).val());
      $maxFreqController.trigger('updatevalue');
    });

    const $canvas = $('.svg-canvas .svg-canvas__main');
    ns.$canvas = $canvas; // TODO: do not use global variable
    const $audio = $('.audio');

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

    $('.controller-color input[type="radio"]').on('change', evt => {
      const $elm = $(evt.target);
      const val = $elm.val();
      const $parent = $elm.closest('.controller-color');

      $parent.trigger('updatevalue', val);
    });

    $('.controller-color input[type="color"]').on('change', evt => {
      const $elm = $(evt.target);
      const val = $elm.val();
      const $parent = $elm.closest('.controller-color');

      $parent.trigger('updatevalue', val);
    });

    $('.controller-color').on('updatevalue', (evt, val) => {
      var $elm = $(evt.target);
      var color = val;
      $elm.attr('data-color', color);

      if($elm.is('.controller-color--bg')) {
        $('body').css({
          "background-color": color,
        });
      }

      if($elm.is('.controller-color--fill')) {
        $('.svg-canvas .svg-canvas__main').css({
          fill: color,
        });
      }

      if($elm.is('.controller-color--line')) {
        $('.svg-canvas .svg-canvas__main').css({
          stroke: color,
        });
      }
    });

    const $thicknessController = $('.controller-thickness');
    $thicknessController.on('updatevalue', evt => {
      var val = $(evt.target).attr('data-value');
      $('.svg-canvas .svg-canvas__main').css({
        "stroke-width": val,
      });
      $thicknessSlidebar.val(val);
      $thicknessNumber.val(val);
    });

    const $thicknessSlidebar = $('.controller-thickness__slidebar input');
    const $thicknessNumber = $('.controller-thickness__number input');
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
      onStateChange: onStateChange,
    },
    playerVars: {
      rel      : 0, // 関連動画
      showinfo : 0, // 動画情報
      controls : 0, // コントローラー
      wmode    : 'transparent', // z-indexを有効にする
    },
  });

  function onStateChange(state) {
    switch (state.data) {
    case window.YT.PlayerState.PAUSED:
      break;

    case window.YT.PlayerState.ENDED:
      break;

    case window.YT.PlayerState.PLAYING:
      break;
    }
  }

  ns.ytPlayer = ytPlayer;
};
