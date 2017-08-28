var TMDBAPI = (function() {
  const url_base = "https://api.themoviedb.org/3/";
  const key = "API-KEY";
  const movie_search = "search/movie";
  const tv_search = "search/tv";
  const multi_search = "search/multi";

  function _getInfo (type, title, year, cb) {
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

  const _throttledGetInfo = _.rateLimit(_getInfo, 200);

  return {
    getMovie: _.partial(_throttledGetInfo, 'movie', _, _, _),
    getShow: _.partial(_throttledGetInfo, 'tv', _, _, _),
    getInfo: _.partial(_throttledGetInfo, '', _, _, _)
  };
})();
