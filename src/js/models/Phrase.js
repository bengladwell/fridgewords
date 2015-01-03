"use strict";

var _ = window._,
  Backbone = window.Backbone;

module.exports = Backbone.Model.extend({

  constructor: function () {

    this.words = new Backbone.Collection();

    Backbone.Model.apply(this, arguments);

  },

  parse: function (data, options) {
    this.words.set(data.words, options);
    return _.omit(data, 'words');
  },

  toJSON: function () {
    return _.extend(Backbone.Model.prototype.toJSON.apply(this, arguments), {
      words: this.words.toJSON()
    });
  }

});
