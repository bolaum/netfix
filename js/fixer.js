const LOAD_WAIT_MS = 2000;
var SHAKTI_BUILD = "";
var LANG = "";

$(function () {
  // wait for content to load
  setTimeout(() => {
    main();
  }, LOAD_WAIT_MS);
});

function getVideoId(el) {
  // search for track content in children
  let eltc = $(el).find('.ptrack-content');
  if (eltc.length == 0) {
    // search for track content in parents
    eltc = $(el).parents('.slider-item').find('.ptrack-content');
  }

  let tc = eltc.attr('data-ui-tracking-context');
  if (tc) {
    // parse track content json
    let json = JSON.parse(unescape(tc));
    // add video id to array
    return parseInt(json.videoId);
  }
  return null;
}

function rateVisibleItems(el) {
  let base = $('.slider-item').add(el);

  base.filter((index, el) => {
    return $(el).attr('class').match(/slider-item-\d+/);
  }).each((index, el) => {
    rateSingleItem(el, '.ptrack-content');
  });
}

function rateSingleItem(el, insert_selector, check_visibility=true, rating_class='nf-rating') {
  shouldRender = !check_visibility || $(el).visible(true);

  if (shouldRender) {
    let id = getVideoId(el);

    card = CardFactory.new(id, (card) => {
      if (card) {
        card.getRating((rating) => {
          if (!isNaN(rating)) {
            // select parent to insert rating
            parent = $(el).find(insert_selector);
            // check if div was already inserted
            if ($(parent).find('.nf').length > 0) return;
            // insert div
            $(el).find(insert_selector).append(`<div class="nf ${rating_class}">${rating}</div>`);
          }
        });
      } else {
        console.warn(`ID '${id}' not found in Netflix DB!`);
      }
    });
  }
}

const debouncedRateAll = _.partial(_.debounce(rateVisibleItems, 1000), $('.mainView'));

function main() {
  SHAKTI_BUILD = $('script:contains("BUILD_IDENTIFIER")').text().match(/(?:"BUILD_IDENTIFIER":")(.*?)(?:")/)[1];
  LANG = $('#appMountPoint > div').attr('lang');

  console.clear();
  // debugger;


  rateVisibleItems($('.mainView'));


  $(window).resize(debouncedRateAll);
  $(window).scroll(debouncedRateAll);

  $('.sliderContent')
    .observe('added', '.slider-item', function(record) {
      // Observe if elements matching '.sliderContent .slider-item' have been added
      // $(this).observe({ attributes: true, attributeFilter: ['class'] }, function(record) {
        rateSingleItem(this, '.ptrack-content');
      // });
    })
    .observe('added', '.slider-item .bob-card', function(record) {
      rateSingleItem(this, '.bob-overlay', false, 'nf-rating nf-rating-big');
    })
}



