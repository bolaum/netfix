var CardFactory = (function() {
  const site_base = "https://www.themoviedb.org/";

  class Card {
    constructor(id) {
      this.id = id;
      this.rating = 'notfetched';
      this.data = 'notfetched';
      this.dataReadyCbCache = [];
      this.ratingsCbCache = [];
      this.objid = Utils.makeid(10);
      this.priorityFetchCalled = false;
    }

    onDataReady(cb) {
      this.dataReadyCbCache.push(cb);
      this._fetchNfData()
    }

    getDetails(cb, priority=false) {
      if (this.rating == 'notfetched') {
        // get function for movie or show
        let tmdbfunc = this.isShow ? TMDBAPI.getShow : TMDBAPI.getMovie;
        // store callback in cache
        this.ratingsCbCache.push(cb);
        // check if call was already done
        if (this.priorityFetchCalled || (this.ratingsCbCache.length > 1 && !priority)) return;
        // if (priority) console.debug('PRIORITY CALL FOR', this.title);
        this.priorityFetchCalled = priority;
        // get info
        tmdbfunc(this.title, this.year, (data) => {
          if (data.results.length > 0) {
            data.results.sort((a, b) => {
              return b.vote_count - a.vote_count;
            });
            this.rating = data.results[0].vote_average;
            this.tmdb_id = data.results[0].id;
            this.url = site_base + (this.isShow ? 'tv' : 'movie') +'/' + this.tmdb_id
          } else {
            this.rating = NaN;
            this.tmdb_id = NaN;
            this.url = NaN;
            console.warn(`Data not found in TMDB (${this.id}): ${this.title} (${this.year})`);
          }
          // return rating
          for (let i = 0, len = this.ratingsCbCache.length; i < len; i++) {
            this.ratingsCbCache.shift()(this.rating, this.url)
          }
        }, priority);
      } else {
        // return cached rating
        cb(this.rating, this.url);
      }
    }

    // PRIVATE

    _runOnDataCbs() {
      for(let i = 0, len = this.dataReadyCbCache.length; i < len; i++) {
        this.dataReadyCbCache.shift()(this.data == null ? null : this);
      }
    }

    _fetchNfData() {
      if (this.data == 'notfetched') {
        this.data = 'fetching';
        NetflixAPI.getSingleVideoInfo(this.id, ['title', 'releaseYear', 'episodeCount'], (data) => {
          // console.debug(data)
          if (data) {
            this.data = data;
            this.title = data.title;
            this.year = data.releaseYear;
            this.isShow = Number.isInteger(data.episodeCount);
          } else {
            this.data = null;
            console.warn(`NetflixAPI returned null value for ${this.id}!`);
          }
          this._runOnDataCbs();
        });
        return;
      }

      if (this.data == 'fetching') return;

      this._runOnDataCbs();
    }
  }

  var cardsCache = new Map();

  function create(videoId, cb) {
    let card = null;
    // return null if id empty
    if (!videoId) cb(null);
    // check cards cache
    if (!(card = cardsCache.get(videoId))) {
      // create card, which will call 'cb' when data is ready
      card = new Card(videoId);
      cardsCache.set(videoId, card)
    }
    card.onDataReady(cb);
  }

  return {
    new: create
  };
})();
