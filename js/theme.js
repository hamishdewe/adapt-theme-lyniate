define([
  'core/js/adapt',
  './themePageView',
  './themeArticleView',
  './themeBlockView',
  './themeView'
], function(Adapt, ThemePageView, ThemeArticleView, ThemeBlockView, ThemeView) {
  
  function onPageView() {
    Prism.highlightAll(); 
    
    var blocks = $('code[class*=language-]');
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].innerHTML = blocks[i].innerHTML.replace(/\n\s{2,}?/g, '\n');
    }
    
  }

  function onDataReady() {
    // Add Prism
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js'></script>");
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js'></script>");
    $('head').append("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.min.css'>");
    $('html').addClass(Adapt.course.get('_courseStyle'));
  }

  function onPostRender(view) {
    var model = view.model;
    var theme = model.get('_lyniate');

    if (!theme) return;

    switch (model.get('_type')) {
      case 'page':
        new ThemePageView({ model: new Backbone.Model(theme), el: view.$el });
        break;
      case 'article':
        new ThemeArticleView({ model: new Backbone.Model(theme), el: view.$el });
        break;
      case 'block':
        new ThemeBlockView({ model: new Backbone.Model(theme), el: view.$el });
        break;
      default:
        new ThemeView({ model: new Backbone.Model(theme), el: view.$el });
    }
    
  }

  Adapt.on({
    'app:dataReady': onDataReady,
    'pageView:postRender articleView:postRender blockView:postRender': onPostRender,
    'pageView:ready': onPageView
  });
});
