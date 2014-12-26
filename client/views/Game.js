(function () {
  "use strict";

  var Backbone = window.Backbone,
    AddWordView = require('./game/AddWord'),
    AvailableWordsView = require('./game/AvailableWords'),
    PhrasesView = require('./game/Phrases');

  module.exports = Backbone.View.extend({

    className: 'game',

    initialize: function (options) {

      this.addWordView = new AddWordView({
        collection: options.available
      });

      this.availableWordsView = new AvailableWordsView({
        collection: options.available
      });

      this.phrasesView = new PhrasesView({
        collection: options.phrases,
        available: options.available
      });
    },

    render: function () {
      this.$el.append(this.addWordView.render().el)
        .append(this.availableWordsView.render().el)
        .append(this.phrasesView.render().el);
      return this;
    },

    remove: function () {
      this.addWordView.remove();
      this.availableWordsView.remove();
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  });

}());
