var NetflixAPI = (function() {
  const url_base = 'https://www.netflix.com/';
  var debouncedFuncs = new Map();

  function _getVideoInfo(ids, types, cb) {
    let api_url = url_base + `api/shakti/${SHAKTI_BUILD}/` +
    'pathEvaluator?withSize=true&materialize=true&searchAPIV2=false';
    let data = JSON.stringify({
      paths: [['videos', ids, types]]
    });

    Utils.ajaxJson(api_url, 'POST', data, cb);
  }

  const _getVideoInfoLimited = _.rateLimit(_getVideoInfo, 100);

  function _accVideoIds(id, types, cb) {
    // types indexer
    let typesHash = types.sort().join('');
    // recover all items for type
    let datafortype = debouncedFuncs.get(typesHash);
    if (!datafortype) {
      // create new object to contain request debounced function, and callbacks buffer
      datafortype = {
        getInfo: _.partial(_.debounce(_getVideoInfoLimited, 300), _, types, _),
        cbbuffer: new Map()
      };
      debouncedFuncs.set(typesHash, datafortype);
    }
    // get current callback buffer
    let cbbuffer = datafortype.cbbuffer;

    if (!cbbuffer.get(id)) {
      cbbuffer.set(id, []);
    }
    cbbuffer.get(id).push(cb);

    datafortype.getInfo(Array.from(cbbuffer.keys()), (data) => {
      let hash = data.paths[0][2].sort().join('');
      let d = debouncedFuncs.get(hash);

      Object.keys(data.value.videos).forEach((id) => {
        let nid = parseInt(id);
        let cbs = d.cbbuffer.get(nid) || [];
        cbs.forEach((cb) => {
          cb(data.value.videos[id]);
        });
        d.cbbuffer.delete(nid);
      });
    });
  }

  return {
    getVideoInfo: _getVideoInfoLimited,
    getSingleVideoInfo: _accVideoIds
  };
}());
