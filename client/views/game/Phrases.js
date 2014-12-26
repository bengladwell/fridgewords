(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    PhraseView = require('./phrases/Phrase');

  module.exports = Backbone.View.extend({

    className: 'phrases',

    views: [],

    initialize: function () {
      if (!this.collection.length || this.collection.last().words.length) {
        this.collection.add({});
      }
      this.listenTo(this.collection, 'destroy', function (phrase) {
        var v = _.findWhere(this.views, {model: phrase});
        if (v) {
          v.remove();
        }
      });
    },

    render: function () {
      this.collection.each(function (m) {

        // add a new empty phrase if there are none left
        this.listenTo(m.words, 'add', function () {
          if (m.words.length === 1 && this.collection.every(function (phrase) { return phrase.words.length; })) {
            var v = new PhraseView({
              model: this.collection.add({})
            });
            this.views.push(v);
            this.$el.append(v.render().el);
          }
        });

        var phraseView = new PhraseView({
          model: m
        });
        this.views.push(phraseView);
        this.$el.append(phraseView.render().el);
      }, this);

      return this;
    },

    remove: function () {
      _.each(this.views, function (view) {
        view.remove();
      }, this);
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  });

}());
