(function () {
  "use strict";

  var Backbone = window.Backbone,
    template = require('../templates/layout');

  module.exports = Backbone.View.extend({

    className: 'layout',

    setView: function (view) {
      if (this._view) {
        this._view.remove();
      }
      this._view = view;
      this.$('.outlet').html(view.render().el);
    },

    render: function () {
      this.$el.html(template());
      return this;
    }

  });

}());
