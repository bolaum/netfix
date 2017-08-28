var CardFactory = (function() {
  class Card {
    constructor(id, title, year, isShow) {
      this.id = id;
      this.title = title;
      this.year = year;
      this.isShow = isShow;
      this.rating = 'notfetched';
    }

    getRating(cb) {
      if (this.rating == 'notfetched') {
        // get function for movie or show
        let tmdbfunc = this.isShow ? TMDBAPI.getShow : TMDBAPI.getMovie;
        // get info
        tmdbfunc(this.title, this.year, (data) => {
          if (data.results.length > 0) {
            this.rating = data.results[0].vote_average;
          } else {
            this.rating = NaN;
            console.warn(`Data not found in TMDB (${this.id}): ${this.title} (${this.year})`);
          }
          // return rating
          cb(this.rating);
        });
      } else {
        // return cached rating
        cb(this.rating);
      }
    }
  }

  var cardsCache = new Map();

  function create(videoId, cb) {
    if (!videoId) cb(null);

    let card = cardsCache.get(videoId);
    if (card) {
      cb(card);
    } else {
      NetflixAPI.getSingleVideoInfo(videoId, ['title', 'releaseYear', 'episodeCount'], (data) => {
        card = null;
        if (data) {
          card = new Card(videoId, data.title, data.releaseYear, Number.isInteger(data.episodeCount));
        } else {
          console.debug('NetflixAPI returned null value!');
        }
        cardsCache.set(videoId, card);
        cb(card);
      });
    }
  }

  return {
    new: create
  };
})();



