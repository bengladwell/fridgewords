(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    AddWordView = require('./game/AddWord'),
    AvailableWordsView = require('./game/AvailableWords');

  module.exports = Backbone.View.extend({

    className: 'game',

    initialize: function (options) {
      _.extend(this, _.pick(options, 'available'));

      this.addWordView = new AddWordView({
        collection: this.available
      });

      this.availableWordsView = new AvailableWordsView({
        collection: this.available
      });
    },

    render: function () {
      this.$el.append(this.addWordView.render().el)
        .append(this.availableWordsView.render().el);
      return this;
    },

    remove: function () {
      this.addWordView.remove();
      this.availableWordsView.remove();
      Backbone.View.prototype.remove.apply(this, arguments);
    }

  });

}());
