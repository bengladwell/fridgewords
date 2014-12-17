(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone;

  module.exports = Backbone.Router.extend({

    initialize: function (options) {
      _.extend(this, options);
    }

  });

}());
