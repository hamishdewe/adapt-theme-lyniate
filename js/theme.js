define([
  'core/js/adapt',
  './themePageView',
  './themeArticleView',
  './themeBlockView',
  './themeView'
], function(Adapt, ThemePageView, ThemeArticleView, ThemeBlockView, ThemeView) {
  
  function onPageView() {
    // Do PrismJS formatting for all non-excepted components
    var components = $('div.component:not(".no-prism"):not(".prism-preformatted")')
    $(components).each((idx, component) => {
      Prism.highlightAllUnder(component)
    });
    
    // Remove extraneous spaces from formatted code blocks
    var blocks = $('code[class*=language-]');
    for (var i = 0; i < blocks.length; i++) {
      blocks[i].innerHTML = blocks[i].innerHTML.replace(/\n\s{2,}?/g, '\n');
    }
    
    // Add comment links
    window.Adapt = window.Adapt || Adapt;
    if (!Adapt.course.attributes._lyniate._comments || !Adapt.course.attributes._lyniate._mailto || !Adapt.course.attributes._lyniate._editor) {
      return;
    }
    $($('div.page')).each((idx, item) => {
      addCommentLink(item, 'page');
    });
    $($('div.article')).each((idx, item) => {
      addCommentLink(item, 'article');
    });
    $($('div.block')).each((idx, item) => {
      addCommentLink(item, 'block');
    });
    $($('div.component')).each((idx, item) => {
      addCommentLink(item, 'component');
    });
  }
  
  function addCommentLink(el, type) {
    var courseId = Adapt.config.attributes._courseId;
    var itemId = el.attributes['data-adapt-id'].value;
    var titleEl = $(el).find(`.${type}__title .${type}__title-inner`)[0];
    if (!titleEl) {
      return;
    }
    var subject = encodeURI(`Comment on ${type} '${titleEl.innerText}'`);
    var body = encodeURI(`\r\n\r\nLink: ${Adapt.course.attributes._lyniate._editor}/#editor/${courseId}/${type}/${itemId}/edit`);
    $(`<a style="display:none" class="comment-link" title="Comment on ${type} '${titleEl.innerText}'" href="mailto:${Adapt.course.attributes._lyniate._mailto}?subject=${subject}&body=${body}"></a>`).insertAfter(titleEl);
  }

  function onDataReady() {
    // Add Prism
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js'></script>");
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js'></script>");
    //$('head').append("<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.min.css'>");
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
