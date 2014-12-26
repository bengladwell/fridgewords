(function () {
  "use strict";

  var _ = window._,
    Backbone = window.Backbone,
    WordView = require('../Word');

  module.exports = Backbone.View.extend({

    className: 'phrase well',

    events: {
      'click .close': function (e) {
        e.preventDefault();
        this.model.destroy();
      }
    },

    render: function () {
      this.$el.append('<a href="#" class="close"><span class="pull-right glyphicon glyphicon-remove-circle"></span></a>');
      if (!this.model.words.length) {
        this.addNewText();
      }
      this.model.words.each(function (m) {
        // we're not keeping references to the WordViews for remove/cleanup;
        // assuming there will be no need to unbind listeners and such; probably a mistake :)
        this.$el.append(new WordView({model: m}).render().el);
      }, this);

      this.$el.sortable({
        connectWith: '.available-words,.phrase',
        update: _.bind(function () {
          if (!this.model.words.length) {
            this.$('.new').remove();
          }
          this.model.words.reset(_.map(this.$('.word'), function (el) {
            return {
              label: el.innerText
            };
          }, this));
          this.model.save();
        }, this),
        remove: _.bind(function () {
          if (!this.model.words.length) {
            this.addNewText();
          }
        }, this)
      });

      return this;
    },

    addNewText: function () {
      this.$el.prepend('<span class="new">Drag words here to start a new phrase</span>');
    }

  });

}());
