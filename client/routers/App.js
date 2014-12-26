(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    GameView = require('../views/Game'),
    SettingsView = require('../views/Settings'),
    AvailableWordsCollection = require('../collections/AvailableWords'),
    PhrasesCollection = require('../collections/Phrases');

  module.exports = Backbone.Router.extend({

    initialize: function (options) {
      _.extend(this, _.pick(options, 'layout'));
    },

    routes: {
      "": "game",
      "settings": "settings"
    },

    game: function () {
      var availableWordsCollection = new AvailableWordsCollection(),
        phrasesCollection = new PhrasesCollection();

      availableWordsCollection.fetch();
      phrasesCollection.fetch();

      this.layout.setView(new GameView({
        available: availableWordsCollection,
        phrases: phrasesCollection
      }), { linkTo: GameView.linkTo });

    },

    settings: function () {
      this.layout.setView(new SettingsView(), { linkTo: SettingsView.linkTo });
    }

  });

}());
