var Utils = (function() {
  return {
    ajaxJson(url, type, data, cb) {
      $.ajax ({
        url: url,
        type: type,
        data: data,
        dataType: "json",
        contentType: "application/json"
      })

      .done(function (data, status, xhr) {
        // console.debug(xhr);
        console.debug(`AJAX request to '${url}' done.`);
        cb(data);
      })

      .fail(function (xhr, status, e) {
        console.error(`AJAX request failed: ${status}`);
        console.error(`Response: \n${xhr.responseText}`);
        console.error(e);
      });
    }
  }
})();
