import $ from 'jquery';
import lodash from 'lodash';

import ns from './module/ns';
import MoviePlayer from './module/movie-player';
import AnimationPlayer from './module/animation-player';
import AudioPlayer from './module/audio-player';

ns.movieData = {};
let moviePlayer;
let animationPlayer;
let audioPlayer;


const setBgColor = ({ color }) => {
  $('.area-movie').css({
    "background-color": color,
  });
};

const setCharacter = ({ character, target, value }) => {
  if (target === 'width') {
    $(`.svg-canvas .svg-canvas__main .${character}`).css({
      "stroke-width": value,
    });
  } else {
    const $radio = $(`.controller-color[data-character="${character}"][data-type="${target}"]`);

    const $target = $radio.find(`.mdl-radio[data-color="${value}"]`);

    if ($target.length > 0) {
      $target.get(0).MaterialRadio.check()
    } else {
      $radio.find('.mdl-radio').each((_i, elm) => {
        elm.MaterialRadio.uncheck();
      });
    }

    $(`.svg-canvas .svg-canvas__main .${character}`).css({
      [target]: value,
    });
  }
};

const setConfig = ({ bg, white, aira, shima, hana }) => {
  if (bg) {
    setBgColor({ color: bg });
  }

  const charaLi = { white, aira, shima, hana };

  Object.keys(charaLi).forEach(name => {
    const character = charaLi[name];
    if (character) {
      Object.keys(character).forEach(key => {
        setCharacter({
          character: name,
          target: key,
          value: character[key],
        });
      });
    }
  })
};

const resetConfig = (opts = {}) => {
  const { target } = opts;

  if (target == null) {
    setConfig({
      bg: 'black',
      white: {
        fill: 'white',
        stroke: 'transparent',
        width: 1,
      },
      aira: {
        fill: 'red',
        stroke: 'transparent',
        width: 1,
      },
      shima: {
        fill: 'blue',
        stroke: 'transparent',
        width: 1,
      },
      hana: {
        fill: 'yellow',
        stroke: 'transparent',
        width: 1,
      },
    });
  } else {
    if (target.includes('bg')) {
      setConfig({
        bg: 'black',
      });
    }

    if (target.includes('fill')) {
      setConfig({
        white: {
          fill: 'white',
        },
        aira: {
          fill: 'red',
        },
        shima: {
          fill: 'blue',
        },
        hana: {
          fill: 'yellow',
        },
      });
    }

    if (target.includes('stroke')) {
      setConfig({
        white: {
          stroke: 'transparent',
        },
        aira: {
          stroke: 'transparent',
        },
        shima: {
          stroke: 'transparent',
        },
        hana: {
          stroke: 'transparent',
        },
      });
    }

    if (target.includes('width')) {
      setConfig({
        white: {
          width: 1,
        },
        aira: {
          width: 1,
        },
        shima: {
          width: 1,
        },
        hana: {
          width: 1,
        },
      });
    }
  }
}


const initIframeApi = _ => {
  const tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

initIframeApi();


fetch('data/fourier-array.json')
  .then(res => {
    return res.json();
  })
  .then(json => {
    initMovie(json);
  })
  .catch(err => {
    alert(err);
  })
;

function initMovie(data) {
  ns.movieData = data;
  ns.currentFrame = 0;
}


const initDevidolCurve = _ => {
  const $maxFreqController = $('.controller-max-freq');
  $maxFreqController.on('updatevalue', function(evt) {
    const val = $(this).attr('data-value');
    animationPlayer.maxFreq = val;
    $maxFreqSlidebar.val(val);
    $maxFreqNumber.val(val);
    animationPlayer.redraw();
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

  const $audio = $moviePlayer.find('[data-elm="audio"]');

  animationPlayer = new AnimationPlayer();
  audioPlayer = new AudioPlayer({ $elm: $({}) });
  moviePlayer = new MoviePlayer({ elm: moviePlayerElm, animationPlayer, audioPlayer });

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
    $(`.svg-canvas .svg-canvas__main .${character}`).css({
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
    const $elm = $(evt.target);
    const value = $(evt.target).val();

    const $parent = $elm.closest('.controller-thickness');
    const character = $parent.attr('data-character');

    $thicknessController.trigger('updatevalue', { value, character });
  });

  $thicknessSlidebar.trigger('change');

  $('.controller-preset input[type="radio"]').on('change', evt => {
    const $elm = $(evt.target);
    const value = $elm.val();

    if (value === null) {
    } else if (value === 'default') {
      resetConfig();
    } else if (value === 'mono') {
      resetConfig();
      setConfig({
        bg: 'black',
        white: {
          fill: 'white',
        },
        aira: {
          fill: 'white',
        },
        shima: {
          fill: 'white',
        },
        hana: {
          fill: 'white',
        },
      });
    } else if (value === 'nega') {
      resetConfig();
      setConfig({
        bg: 'white',
        white: {
          fill: 'black',
        },
        aira: {
          fill: '#00ffff',
        },
        shima: {
          fill: 'yellow',
        },
        hana: {
          fill: 'blue',
        },
      });
    } else if (value === 'oscillo') {
      resetConfig();
      setConfig({
        bg: 'black',
        white: {
          fill: 'transparent',
          stroke: '#00ff00',
          width: 1,
        },
        aira: {
          fill: 'transparent',
          stroke: '#00ff00',
          width: 1,
        },
        shima: {
          fill: 'transparent',
          stroke: '#00ff00',
          width: 1,
        },
        hana: {
          fill: 'transparent',
          stroke: '#00ff00',
          width: 1,
        },
      });
    } else if (value === 'bios') {
      resetConfig();
      setConfig({
        bg: 'blue',
        white: {
          fill: 'yellow',
        },
        aira: {
          fill: 'white',
        },
        shima: {
          fill: 'white',
        },
        hana: {
          fill: 'white',
        },
      });
    } else if (value === 'medetai') {
      resetConfig();
      setConfig({
        bg: 'white',
        white: {
          fill: '#c18e33',
        },
        aira: {
          fill: '#e83530',
        },
        shima: {
          fill: '#e83530',
        },
        hana: {
          fill: '#e83530',
        },
      });
    } else if (value === 'rocket') {
      resetConfig();
      setConfig({
        aira: {
          fill: 'green',
        },
        shima: {
          fill: 'green',
        },
        hana: {
          fill: 'green',
        },
      });
    } else if (value === 'psychedelic') {
      resetConfig();
      setConfig({
        white: {
          fill: 'orange',
          stroke: 'lime',
          width: 14,
        },
        aira: {
          stroke: 'cyan',
          width: 14,
        },
        shima: {
          stroke: 'magenta',
          width: 14,
        },
        hana: {
          stroke: 'maroon',
          width: 14,
        },
      });
    } else if (value === 'reiwa') {
      resetConfig();
      setConfig({
        bg: 'white',
        white: {
          fill: 'black',
        },
        aira: {
          fill: '#e3a9b8',
        },
        shima: {
          fill: '#524362',
        },
        hana: {
          fill: 'f7dade',
        },
      });
    }
  });


  $('.shuffle-button').on('click', _evt => {
    const [ aira, shima, hana ] = lodash.shuffle(['red', 'blue', 'yellow']);

    setConfig({
      aira: {
        fill: aira,
      },
      shima: {
        fill: shima,
      },
      hana: {
        fill: hana,
      },
    });
  });


  let starTimer;
  let colorArr = ['red', 'blue', 'yellow'];

  $('input[name="star"]').on('change', evt => {
    if ($(evt.target).prop('checked')) {
      starTimer = setInterval(_ => {
        colorArr.push(colorArr.shift());

        const [ aira, shima, hana ] = colorArr;

        setConfig({
          aira: {
            fill: aira,
          },
          shima: {
            fill: shima,
          },
          hana: {
            fill: hana,
          },
        });
      }, 100);
    } else {
      clearTimeout(starTimer);
    }
  });


  $('.switch-equation input[type="checkbox"]').on('change', evt => {
    const $elm = $(evt.target);

    if ($elm.prop('checked')) {
      $('.info').show();
    } else {
      $('.info').hide();
    }
  });

  const mouseenterHandler = _evt => {
    ns.moviePlayer.showController();
  };

  const mouseleaveHandler = _evt => {
    ns.moviePlayer.hideController();
  };

  $('.area-movie').on('mouseenter', mouseenterHandler);
  $('.area-movie').on('mouseover', _evt => {
    clearTimeout(ns.moviePlayer.hideTimer);
  });
  $('.area-movie').on('mouseleave', mouseleaveHandler);
  $('.area-movie').on('click', mouseenterHandler);
  $('.wrapper').on('click', evt => {
    mouseleaveHandler(evt);
  });
  $('.area-movie').on('click', evt => {
    evt.stopPropagation();
  });
  $('.controller-card').on('click', evt => {
    evt.stopPropagation();
  });
  $('.area-movie .cover').on('click', evt => {
    evt.stopPropagation();
  });
}

$('body').one('mdl-componentupgraded', _evt => {
  initDevidolCurve();
});


window.onYouTubeIframeAPIReady = _ => {
  const onStateChange = state => {
    switch (state.data) {
      case window.YT.PlayerState.PAUSED:
        break
      ;

      case window.YT.PlayerState.ENDED:
        break
      ;

      case window.YT.PlayerState.PLAYING:
        break
      ;
    }
  }

  const ytPlayer = new YT.Player('original_movie', {
    width   : '640',
    height  : '360',
    videoId : 'gyDFoIbxB34',
    events  : {
      // プレイヤーの準備ができたときに実行されるコールバック関数
      onStateChange,
    },
    playerVars: {
      rel      : 0, // 関連動画
      showinfo : 0, // 動画情報
      controls : 0, // コントローラー
      wmode    : 'transparent', // z-indexを有効にする
      playsinline: 1, // iOSでインライン再生する 
      origin: location.protocol + '//' + location.hostname + "/", // http://chobugyo.hatenablog.com/entry/2018/07/09/112445
    },
  });

  ns.ytPlayer = ytPlayer;
};


$(window).on('resize', _evt => {
  const w = $(window).width();

  const $moviePlayer = $('.movie-player');

  if (w < 640) {
    $moviePlayer.css({
      "transform": `scale(${w / 640})`,
    });
  } else {
    $moviePlayer.css({
      "transform": '',
    });
  }
}).trigger('resize');
