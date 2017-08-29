var Utils = (function() {
  return {
    ajaxJson(url, type, data, cb) {
      var fullurl = "";

      $.ajax ({
        url: url,
        type: type,
        data: data,
        dataType: "json",
        contentType: "application/json",
        beforeSend: function(jqXHR, settings) {
          // regex to avoid exposing key that easily ;)
          fullurl = settings.url.replace(/api_key=([0-9a-fA-F]+)*/, 'api_key=API_KEY');
        }
      })

      .done(function (data, status, xhr) {
        console.debug(`AJAX request to '${fullurl}' done.`);
        cb(data);
      })

      .fail(function (xhr, status, e) {
        console.error(`AJAX request to '${fullurl}' failed (${status})!`);
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
