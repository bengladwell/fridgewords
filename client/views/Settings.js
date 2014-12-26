(function () {
  "use strict";

  var Backbone = window.Backbone,
    template = require('../templates/settings'),
    View;

  View = Backbone.View.extend({

    className: 'settings',

    render: function () {
      this.$el.html(template());
      return this;
    }

  });

  View.linkTo = {
    href: "",
    text: "Game"
  };

  module.exports = View;

}());
