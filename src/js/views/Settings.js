"use strict";

var _ = window._,
  Backbone = window.Backbone,
  template = require('../templates/settings'),
  AvailableWordsCollection = require('../collections/AvailableWords'),
  View;

View = Backbone.View.extend({

  tagName: 'form',

  className: 'settings',

  events: {
    submit: function (e) {
      e.preventDefault();

      var words = new AvailableWordsCollection(_.map(this.$('textarea').val().split(/\n/), function (token) {
        return { label: token.trim() };
      }));

      Backbone.$.when(words.map(function (word) {
        word.save();
      })).then(function () {
        Backbone.history.navigate("", {trigger: true});
      });
    }
  },

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
