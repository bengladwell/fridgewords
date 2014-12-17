(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    WordView = require('./Word');

  module.exports = Backbone.View.extend({

    className: 'available-words well',

    initialize: function () {
      this.wordViews = this.collection.map(function (m) {
        return new WordView({model: m});
      }, this);

      this.listenTo(this.collection, 'add', function (m) {
        var v = new WordView({model: m});
        this.wordViews.push(v);
        this.$el.append(v.render().el);
      });
    },

    render: function () {
      _.each(this.wordViews, function (v) {
        this.$el.append(v.render().el);
      }, this);
      return this;
    },

    remove: function () {
      _.each(this.wordViews, function (v) {
        v.remove();
      }, this);
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  });

}());
