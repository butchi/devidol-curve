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
    res.json()
      .then(json => {
        init(json);
      })
    ;
  })
  .catch(err => {
    alert(err);
  })
;


function init(data) {
  ns.movieData = data;
  ns.currentFrame = 0;

  $(function() {
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

    $('[class^="controller-quality__button--"]').on('click', function() {
      var $this = $(this);
      var targetClassLi = {
        lq: 'controller-quality__button--lq',
        mq: 'controller-quality__button--mq',
        hq: 'controller-quality__button--hq',
      }

      ns.quality = 'lq';

      _.each(targetClassLi, function(elm, key) {
        if($this.hasClass(targetClassLi[key])) {
          ns.quality = key;
        }
      });

      if(false) {
      } else if(ns.quality === 'mq') {
        $('.' + targetClassLi.mq).attr('disabled', true);

        $maxFreqController.attr('data-value', 50).trigger('updatevalue');
      } else if(ns.quality === 'hq') {
        $('.' + targetClassLi.mq).attr('disabled', true);
        $('.' + targetClassLi.hq).attr('disabled', true);

        $maxFreqController.attr('data-value', 100).trigger('updatevalue');
      }

      $.getJSON('assets/data/fourier_arr_' + ns.quality + '.json', function(data) {
        ns.movieData = data;
      });
    });

    $('.controller-compare').on('change', function() {
      var state = {
        NORMAL:  'normal',
        COMPARE: 'compare',
        OVERLAY: 'overlay',
      }

      var $movieArr = $('.array-movie');

      if(false) {
      } else if($(this).val() === state.NORMAL) {
        $movieArr.attr('data-mode', state.NORMAL);
      } else if($(this).val() === state.COMPARE) {
        $movieArr.attr('data-mode', state.COMPARE);
      } else if($(this).val() === state.OVERLAY) {
        $('.controller-color--line [value="red"]').prop('checked', true).trigger('change');
        $movieArr.attr('data-mode', state.OVERLAY);
      } else {
      }

      if($(this).val() === state.COMPARE || $(this).val() === state.OVERLAY) {
        try {
          ns.ytPlayer.seekTo(moviePlayer.getCurrentTime(), true);
        } catch(_e) {
        }
      }
    });

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

    moviePlayer.play();
  });
}
