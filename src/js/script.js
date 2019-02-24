import $ from 'jquery';

import ns from './module/ns';
import MoviePlayer from './module/movie-player';
import AnimationPlayer from './module/animation-player';

ns.movieData = {};
let moviePlayer;
let animationPlayer;

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

    const $maxFreqSlidebar = $('.controller-max-freq [data-slidebar] input');
    const $maxFreqNumber = $('.controller-max-freq [data-number] input');
    $maxFreqSlidebar.on('input change', evt => {
      $maxFreqController.attr('data-value', $(evt.target).val());
      $maxFreqController.trigger('updatevalue');
    });
    $maxFreqNumber.on('input change', evt => {
      $maxFreqController.attr('data-value', $(evt.target).val());
      $maxFreqController.trigger('updatevalue');
    });

    const $canvas = $('.svg-canvas .svg-canvas__main');
    ns.$canvas = $canvas; // TODO: do not use global variable

    const $moviePlayer = $('.movie-player');
    const moviePlayerElm = $moviePlayer.get(0);

    animationPlayer = new AnimationPlayer();
    moviePlayer = new MoviePlayer({ elm: moviePlayerElm, animationPlayer });

    ns.moviePlayer = moviePlayer;
    ns.animationPlayer = animationPlayer;

    $maxFreqSlidebar.trigger('change');

    $('.controller-compare').on('change', evt => {
      const val = $(evt.target).val();

      const state = {
        NORMAL:  'normal',
        COMPARE: 'compare',
        OVERLAY: 'overlay',
      }

      if (false) {
      } else if (val === state.NORMAL) {
        $moviePlayer.attr('data-mode', state.NORMAL);
      } else if (val === state.COMPARE) {
        $moviePlayer.attr('data-mode', state.COMPARE);
      } else if (val === state.OVERLAY) {
        $('.controller-color--line [value="red"]').prop('checked', true).trigger('change');
        $moviePlayer.attr('data-mode', state.OVERLAY);
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
      const value = $elm.val();
      const $parent = $elm.closest('.controller-color');
      const character = $parent.attr('data-character');

      $parent.trigger('updatevalue', { value, character });
    });

    $('.controller-color input[type="color"]').on('change', evt => {
      const $elm = $(evt.target);
      const value = $elm.val();
      const $parent = $elm.closest('.controller-color');
      const character = $parent.attr('data-character');

      $parent.trigger('updatevalue', { value, character });
    });

    $('.controller-color').on('updatevalue', (evt, { value, character }) => {
      const $elm = $(evt.target);
      const color = value;

      const type = $elm.attr('data-type');

      $elm.attr('data-color', color);

      if (type == null) {
      } else if (type === 'bg') {
        $('.area-movie').css({
          "background-color": color,
        });
      } else if (type === 'fill') {
        $(`.svg-canvas .svg-canvas__main .${character}`).css({
          fill: color,
        });
      } else if (type === 'line') {
        $(`.svg-canvas .svg-canvas__main .${character}`).css({
          stroke: color,
        });
      }
    });

    const $thicknessController = $('.controller-thickness');
    $thicknessController.on('updatevalue', (evt, { value, character }) => {
      $('.svg-canvas .svg-canvas__main').css({
        "stroke-width": value,
      });
      $(`.controller-thickness[data-character=${character}] [data-slidebar] input`).val(value);
      $(`.controller-thickness[data-character=${character}] [data-number] input`).val(value);
    });

    const $thicknessSlidebar = $thicknessController.find('[data-slidebar] input');
    const $thicknessNumber = $thicknessController.find('[data-number] input');
    $thicknessSlidebar.on('input change', evt => {
      const $elm = $(evt.target);
      const value = $elm.val();

      const $parent = $elm.closest('.controller-thickness');
      const character = $parent.attr('data-character');

      $thicknessController.trigger('updatevalue', { value, character });
    });
    $thicknessNumber.on('input change', evt => {
      const value = $(evt.target).val();

      $thicknessController.trigger('updatevalue');
    });

    $thicknessSlidebar.trigger('change');
  });
}

window.onYouTubeIframeAPIReady = _ => {
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
