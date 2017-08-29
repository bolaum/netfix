var TMDBAPI = (function() {
  const url_base = "https://api.themoviedb.org/3/";
  const key = "ef45eea5293ebc5248230c576527820f";
  const movie_search = "search/movie";
  const tv_search = "search/tv";
  const multi_search = "search/multi";

  function getInfo (type, title, year, cb) {
    let search_type = '';
    switch(type) {
      case 'movie':
        search_type = movie_search;
        break;
      case 'tv':
        search_type = tv_search;
        break;
      default:
        search_type = multi_search;
    }
    let api_url = url_base + search_type
    let data = {
      api_key: key,
      language: LANG,
      query: title,
      year: year
    };

    Utils.ajaxJson(api_url, 'GET', data, cb);
  }

  const _throttledGetInfo = _.rateLimit(getInfo, 500, true);
  const _throttledHiPriorityGetInfo = _.rateLimit(getInfo, 50, true);

  function getInfoPriority(type, title, year, cb, priority=false) {
    if (priority) _throttledHiPriorityGetInfo(type, title, year, cb)
    else _throttledGetInfo(type, title, year, cb);
  }

  return {
    getMovie: _.partial(getInfoPriority, 'movie', _, _, _, _),
    getShow: _.partial(getInfoPriority, 'tv', _, _, _, _),
    getInfo: _.partial(getInfoPriority, '', _, _, _, _)
  };
})();
