define([
  'core/js/adapt',
  './themePageView',
  './themeArticleView',
  './themeBlockView',
  './themeView'
], function(Adapt, ThemePageView, ThemeArticleView, ThemeBlockView, ThemeView) {
  
  function onPageView() {
    // Register lineNumbers 
    PrismLineNumbers();
    // Do PrismJS formatting for all non-excepted components
    if (Adapt.config.attributes._logging._isEnabled) {
      Prism.hooks.add('before-highlight', (env) => {
        console.log('before-highlight', env);
      });
      Prism.hooks.add('before-insert', (env) => {
        console.log('before-insert', env);
      });
      Prism.hooks.add('after-highlight', (env) => {
        console.log("after-highlight", env);
      });
    }
    Prism.hooks.add('after-highlight', (env) => {
      // env.element - get last span where named line-numbers etc.
      // var lineNumbersRows = $(env.element).find('.line-numbers-rows');
      // // do the replace
      env.element.innerHTML = env.element.innerHTML.replace(/\n\s{2,}?/g, '\n');
      if (Adapt.config.attributes._logging._isEnabled) {
        console.log('after-highlight after replace', env);
      }
      // return the span
      // if (lineNumbersRows.length > 0) {
      //   //env.element.appendChild(lineNumbersRows[0]);
      //   //Prism.hooks.run('line-numbers', env);
      // }
    });
    var components = $('div.component:not(".no-prism"):not(".prism-preformatted")');
    $(components).each((idx, component) => {
      Prism.highlightAllUnder(component, false, );
    });
    
    // Remove extraneous spaces from formatted code blocks
    // var blocks = $('pre:not(.line-numbers) code[class*=language-]');
    // for (var i = 0; i < blocks.length; i++) {
    //   blocks[i].innerHTML = blocks[i].innerHTML.replace(/\n\s{2,}?/g, '\n');
    // }
    
    // Add comment links
    window.Adapt = window.Adapt || Adapt;
    if (Adapt.course.attributes._lyniate._comments._enabled && Adapt.course.attributes._lyniate._comments._mailto && Adapt.course.attributes._lyniate._comments._editor) {
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
      
      // Populate Fancybox
      $(document).ready(function () {
        $().fancybox({
            selector: 'figure, :not(figure) > img, .lightbox',
            arrows: false,
            infobar: false,
            toolbar: false
        });
      });
    }
  }
  
  function PrismLineNumbers() {
    // This function takes code from https://prismjs.com/plugins/line-numbers/
    // and changes the behaviour to count newlines in env.element.innerHTML instead of env.code
  	if (typeof Prism === 'undefined' || typeof document === 'undefined') {
  		return;
  	}

  	/**
  	 * Plugin name which is used as a class name for <pre> which is activating the plugin
  	 * @type {String}
  	 */
  	var PLUGIN_NAME = 'line-numbers';

  	/**
  	 * Regular expression used for determining line breaks
  	 * @type {RegExp}
  	 */
  	var NEW_LINE_EXP = /\n(?!$)/g;


  	/**
  	 * Global exports
  	 */
  	var config = Prism.plugins.lineNumbers = {
  		/**
  		 * Get node for provided line number
  		 * @param {Element} element pre element
  		 * @param {Number} number line number
  		 * @return {Element|undefined}
  		 */
  		getLine: function (element, number) {
  			if (element.tagName !== 'PRE' || !element.classList.contains(PLUGIN_NAME)) {
  				return;
  			}

  			var lineNumberRows = element.querySelector('.line-numbers-rows');
  			if (!lineNumberRows) {
  				return;
  			}
  			var lineNumberStart = parseInt(element.getAttribute('data-start'), 10) || 1;
  			var lineNumberEnd = lineNumberStart + (lineNumberRows.children.length - 1);

  			if (number < lineNumberStart) {
  				number = lineNumberStart;
  			}
  			if (number > lineNumberEnd) {
  				number = lineNumberEnd;
  			}

  			var lineIndex = number - lineNumberStart;

  			return lineNumberRows.children[lineIndex];
  		},

  		/**
  		 * Resizes the line numbers of the given element.
  		 *
  		 * This function will not add line numbers. It will only resize existing ones.
  		 * @param {HTMLElement} element A `<pre>` element with line numbers.
  		 * @returns {void}
  		 */
  		resize: function (element) {
  			resizeElements([element]);
  		},

  		/**
  		 * Whether the plugin can assume that the units font sizes and margins are not depended on the size of
  		 * the current viewport.
  		 *
  		 * Setting this to `true` will allow the plugin to do certain optimizations for better performance.
  		 *
  		 * Set this to `false` if you use any of the following CSS units: `vh`, `vw`, `vmin`, `vmax`.
  		 *
  		 * @type {boolean}
  		 */
  		assumeViewportIndependence: true
  	};

  	/**
  	 * Resizes the given elements.
  	 *
  	 * @param {HTMLElement[]} elements
  	 */
  	function resizeElements(elements) {
  		elements = elements.filter(function (e) {
  			var codeStyles = getStyles(e);
  			var whiteSpace = codeStyles['white-space'];
  			return whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line';
  		});

  		if (elements.length == 0) {
  			return;
  		}

  		var infos = elements.map(function (element) {
  			var codeElement = element.querySelector('code');
  			var lineNumbersWrapper = element.querySelector('.line-numbers-rows');
  			if (!codeElement || !lineNumbersWrapper) {
  				return undefined;
  			}

  			/** @type {HTMLElement} */
  			var lineNumberSizer = element.querySelector('.line-numbers-sizer');
  			var codeLines = codeElement.textContent.split(NEW_LINE_EXP);

  			if (!lineNumberSizer) {
  				lineNumberSizer = document.createElement('span');
  				lineNumberSizer.className = 'line-numbers-sizer';

  				codeElement.appendChild(lineNumberSizer);
  			}

  			lineNumberSizer.innerHTML = '0';
  			lineNumberSizer.style.display = 'block';

  			var oneLinerHeight = lineNumberSizer.getBoundingClientRect().height;
  			lineNumberSizer.innerHTML = '';

  			return {
  				element: element,
  				lines: codeLines,
  				lineHeights: [],
  				oneLinerHeight: oneLinerHeight,
  				sizer: lineNumberSizer,
  			};
  		}).filter(Boolean);

  		infos.forEach(function (info) {
  			var lineNumberSizer = info.sizer;
  			var lines = info.lines;
  			var lineHeights = info.lineHeights;
  			var oneLinerHeight = info.oneLinerHeight;

  			lineHeights[lines.length - 1] = undefined;
  			lines.forEach(function (line, index) {
  				if (line && line.length > 1) {
  					var e = lineNumberSizer.appendChild(document.createElement('span'));
  					e.style.display = 'block';
  					e.textContent = line;
  				} else {
  					lineHeights[index] = oneLinerHeight;
  				}
  			});
  		});

  		infos.forEach(function (info) {
  			var lineNumberSizer = info.sizer;
  			var lineHeights = info.lineHeights;

  			var childIndex = 0;
  			for (var i = 0; i < lineHeights.length; i++) {
  				if (lineHeights[i] === undefined) {
  					lineHeights[i] = lineNumberSizer.children[childIndex++].getBoundingClientRect().height;
  				}
  			}
  		});

  		infos.forEach(function (info) {
  			var lineNumberSizer = info.sizer;
  			var wrapper = info.element.querySelector('.line-numbers-rows');

  			lineNumberSizer.style.display = 'none';
  			lineNumberSizer.innerHTML = '';

  			info.lineHeights.forEach(function (height, lineNumber) {
  				wrapper.children[lineNumber].style.height = height + 'px';
  			});
  		});
  	}

  	/**
  	 * Returns style declarations for the element
  	 * @param {Element} element
  	 */
  	var getStyles = function (element) {
  		if (!element) {
  			return null;
  		}

  		return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
  	};

  	var lastWidth = undefined;
  	window.addEventListener('resize', function () {
  		if (config.assumeViewportIndependence && lastWidth === window.innerWidth) {
  			return;
  		}
  		lastWidth = window.innerWidth;

  		resizeElements(Array.prototype.slice.call(document.querySelectorAll('pre.' + PLUGIN_NAME)));
  	});

  	Prism.hooks.add('complete', function (env) {
  		if (!env.code) {
  			return;
  		}

  		var code = /** @type {Element} */ (env.element);
  		var pre = /** @type {HTMLElement} */ (code.parentNode);

  		// works only for <code> wrapped inside <pre> (not inline)
  		if (!pre || !/pre/i.test(pre.nodeName)) {
  			return;
  		}

  		// Abort if line numbers already exists
  		if (code.querySelector('.line-numbers-rows')) {
  			return;
  		}

  		// only add line numbers if <code> or one of its ancestors has the `line-numbers` class
  		if (!Prism.util.isActive(code, PLUGIN_NAME)) {
  			return;
  		}

  		// Remove the class 'line-numbers' from the <code>
  		code.classList.remove(PLUGIN_NAME);
  		// Add the class 'line-numbers' to the <pre>
  		pre.classList.add(PLUGIN_NAME);

  		var match = env.element.innerHTML.match(NEW_LINE_EXP); //var match = env.code.match(NEW_LINE_EXP);
  		var linesNum = match ? match.length + 1 : 1;
  		var lineNumbersWrapper;

  		var lines = new Array(linesNum + 1).join('<span></span>');

  		lineNumbersWrapper = document.createElement('span');
  		lineNumbersWrapper.setAttribute('aria-hidden', 'true');
  		lineNumbersWrapper.className = 'line-numbers-rows';
  		lineNumbersWrapper.innerHTML = lines;

  		if (pre.hasAttribute('data-start')) {
  			pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
  		}

  		env.element.appendChild(lineNumbersWrapper);

  		resizeElements([pre]);

  		Prism.hooks.run('line-numbers', env);
  	});

  	Prism.hooks.add('line-numbers', function (env) {
  		env.plugins = env.plugins || {};
  		env.plugins.lineNumbers = true;
  	});

  };
  
  function addCommentLink(el, type) {
    var courseId = Adapt.config.attributes._courseId;
    var itemId = el.attributes['data-adapt-id'].value;
    var titleEl = $(el).find(`.${type}__title .${type}__title-inner`)[0];
    if (!titleEl) {
      return;
    }
    var subject = parsePlaceholders(Adapt.course.attributes._lyniate._comments._subject, itemId, type, titleEl.innerText);
    var body = 
      parsePlaceholders(Adapt.course.attributes._lyniate._comments._body) + 
      parsePlaceholders(`
        
Link: [[editor]]/#editor/[[course.id]]/[[type]]/[[id]]/edit
        
Device: [[device]]`, itemId, type, titleEl.innerText);
    $(`<a style="display:none" class="comment-link" title="${subject}" href="mailto:${Adapt.course.attributes._lyniate._comments._mailto}?subject=${encodeURI(subject)}&body=${encodeURI(body)}"></a>`).insertAfter(titleEl);
  }
  
  function parsePlaceholders(text, id, type, title) {
    text = text.replace(/\[\[editor\]\]/g, Adapt.course.attributes._lyniate._comments._editor);
    text = text.replace(/\[\[type\]\]/g, type); 
    text = text.replace(/\[\[title\]\]/g, title);
    text = text.replace(/\[\[id\]\]/g, id);
    text = text.replace(/\[\[course.id\]\]/g, Adapt.config.attributes._courseId);
    text = text.replace(/\[\[course.title\]\]/g, Adapt.course.attributes.title);
    text = text.replace(/\[\[course.displayTitle\]\]/g, Adapt.course.attributes.displayTitle);
    text = text.replace(/\[\[device\]\]/g, `
OS: ${Adapt.device.OS} 
browser: ${Adapt.device.browser} 
osVersion: ${Adapt.device.osVersion} 
renderingEngine: ${Adapt.device.renderingEngine} 
screenHeight: ${Adapt.device.screenHeight} 
screenSize: ${Adapt.device.screenSize} 
screenWidth: ${Adapt.device.screenWidth} 
touch: ${Adapt.device.touch} 
version: ${Adapt.device.version}`);
    return text;
  }
  
  function onDataReady() {
    // Add Prism for code snippets
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js'></script>");
    $('head').append("<script src='https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js'></script>");
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.css" integrity="sha512-cbQXwDFK7lj2Fqfkuxbo5iD1dSbLlJGXGpfTDqbggqjHJeyzx88I3rfwjS38WJag/ihH7lzuGlGHpDBymLirZQ==" crossorigin="anonymous" />');
    // Add Fancybox for lightboxing images: https://github.com/fancyapps/fancyBox
    $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css" />');
    $('head').append('<script src="https://cdn.jsdelivr.net/gh/fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>');
    // Add FontAwesome for styling
    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" integrity="sha512-iBBXm8fW90+nuLcSKlbmrPcLa0OT92xO1BIsZ+ywDWZCvqsWgccV3gFoRBv0z+8dLJgyAHIhR35VZc2oM/gI1w==" crossorigin="anonymous" />');
    
    $('html').addClass(Adapt.course.get('_courseStyle'));
    
    if (Adapt.course.attributes._lyniate._completion._enabled && Adapt.course.attributes._lyniate._completion._title && Adapt.course.attributes._lyniate._completion._body) {
      Adapt.listenTo(Adapt.course, "change:_isComplete", onCourseComplete);
    }
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
  
  function onCourseComplete() {
    Adapt.trigger("notify:popup", {
        title: Adapt.course.attributes._lyniate._completion._title,
        body: Adapt.course.attributes._lyniate._completion._body
    });
  }

  Adapt.on({
    'app:dataReady': onDataReady,
    'pageView:postRender articleView:postRender blockView:postRender': onPostRender,
    'pageView:ready': onPageView
  });
  
});
