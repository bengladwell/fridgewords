(function () {
  "use strict";

  var $ = window.jQuery,
    Backbone = window.Backbone,
    LayoutView = require('./views/Layout'),
    AppRouter = require('./routers/App');

  $(function () {
    var layoutView = new LayoutView(),
      router = new AppRouter({
        layout: layoutView
      });
    if (!Backbone.history.start({pushState: true})) {
      router.navigate("", {trigger: true});
    }
  });

}());
