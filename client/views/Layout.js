(function () {
  "use strict";

  var Backbone = window.Backbone;

  module.exports = Backbone.View.extend({

    setView: function (view) {
      if (this._view) {
        this._view.remove();
      }
      this._view = view;
      this.$('.outlet').html(view.render().el);
    }

  });

}());
