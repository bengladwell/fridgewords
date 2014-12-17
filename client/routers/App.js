(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    GameView = require('../views/Game'),
    SettingsView = require('../views/Settings');

  module.exports = Backbone.Router.extend({

    initialize: function (options) {
      _.extend(this, _.pick(options, 'layout'));
    },

    routes: {
      "": "game",
      "settings": "settings"
    },

    game: function () {
      this.layout.setView(new GameView());
    },

    settings: function () {
      this.layout.setView(new SettingsView());
    }

  });

}());
