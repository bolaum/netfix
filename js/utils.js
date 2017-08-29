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
    },

    makeid(length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for(var i=0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }
  }
})();
