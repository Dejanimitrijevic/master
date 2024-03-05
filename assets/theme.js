function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {_defineProperty(target, key, source[key]);}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}(function ($) {
  var $ = jQuery = $;

  var cc = {
    sections: [] };


  theme.Shopify = {
    formatMoney: function formatMoney(t, r) {
      function e(t, r) {
        return void 0 === t ? r : t;
      }
      function a(t, r, a, o) {
        if (r = e(r, 2),
        a = e(a, ","),
        o = e(o, "."),
        isNaN(t) || null == t)
        return 0;
        t = (t / 100).toFixed(r);
        var n = t.split(".");
        return n[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + a) + (n[1] ? o + n[1] : "");
      }
      "string" == typeof t && (t = t.replace(".", ""));
      var o = "",
      n = /\{\{\s*(\w+)\s*\}\}/,
      i = r || this.money_format;
      switch (i.match(n)[1]) {
        case "amount":
          o = a(t, 2);
          break;
        case "amount_no_decimals":
          o = a(t, 0);
          break;
        case "amount_with_comma_separator":
          o = a(t, 2, ".", ",");
          break;
        case "amount_with_space_separator":
          o = a(t, 2, " ", ",");
          break;
        case "amount_with_period_and_space_separator":
          o = a(t, 2, " ", ".");
          break;
        case "amount_no_decimals_with_comma_separator":
          o = a(t, 0, ".", ",");
          break;
        case "amount_no_decimals_with_space_separator":
          o = a(t, 0, " ", "");
          break;
        case "amount_with_apostrophe_separator":
          o = a(t, 2, "'", ".");
          break;
        case "amount_with_decimal_separator":
          o = a(t, 2, ".", ".");}

      return i.replace(n, o);
    },
    formatImage: function formatImage(originalImageUrl, format) {
      return originalImageUrl ? originalImageUrl.replace(/^(.*)\.([^\.]*)$/g, '$1_' + format + '.$2') : '';
    },
    Image: {
      imageSize: function imageSize(t) {
        var e = t.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);
        return null !== e ? e[1] : null;
      },
      getSizedImageUrl: function getSizedImageUrl(t, e) {
        if (null == e)
        return t;
        if ("master" == e)
        return this.removeProtocol(t);
        var o = t.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);
        if (null != o) {
          var i = t.split(o[0]),
          r = o[0];
          return this.removeProtocol(i[0] + "_" + e + r);
        }
        return null;
      },
      removeProtocol: function removeProtocol(t) {
        return t.replace(/http(s)?:/, "");
      } } };


  class ccComponent {
    constructor(name) {var cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".cc-".concat(name);
      var _this = this;
      this.instances = [];

      // Initialise any instance of this component within a section
      $(document).on('cc:component:load', function (event, component, target) {
        if (component === name) {
          $(target).find("".concat(cssSelector, ":not(.cc-initialized)")).each(function () {
            _this.init(this);
          });
        }
      });

      // Destroy any instance of this component within a section
      $(document).on('cc:component:unload', function (event, component, target) {
        if (component === name) {
          $(target).find(cssSelector).each(function () {
            _this.destroy(this);
          });
        }
      });

      // Initialise any instance of this component
      $(cssSelector).each(function () {
        _this.init(this);
      });
    }

    init(container) {
      $(container).addClass('cc-initialized');
    }

    destroy(container) {
      $(container).removeClass('cc-initialized');
    }

    registerInstance(container, instance) {
      this.instances.push({
        container,
        instance });

    }

    destroyInstance(container) {
      this.instances = this.instances.filter((item) => {
        if (item.container === container) {
          if (typeof item.instance.destroy === 'function') {
            item.instance.destroy();
          }

          return item.container !== container;
        }
      });
    }}

  // requires: throttled-scroll, debouncedresize

  /*
    Define a section by creating a new function object and registering it with the section handler.
    The section handler manages:
      Instantiation for all sections on the current page
      Theme editor lifecycle events
      Deferred initialisation
      Event cleanup

    There are two ways to register a section.
    In a theme:
      theme.Sections.register('slideshow', theme.SlideshowSection);
      theme.Sections.register('header', theme.HeaderSection, { deferredLoad: false });
      theme.Sections.register('background-video', theme.VideoManager, { deferredLoadViewportExcess: 800 });

    As a component:
      cc.sections.push({ name: 'faq', section: theme.Faq });

    Assign any of these to receive Shopify section lifecycle events:
      this.onSectionLoad
      this.afterSectionLoadCallback
      this.onSectionSelect
      this.onSectionDeselect
      this.onBlockSelect
      this.onBlockDeselect
      this.onSectionUnload
      this.afterSectionUnloadCallback
      this.onSectionReorder

    If you add any events using the manager's registerEventListener,
    e.g. this.registerEventListener(element, 'click', this.functions.handleClick.bind(this)),
    these will be automatically cleaned up after onSectionUnload.
   */

  theme.Sections = new function () {
    var _ = this;

    _._instances = [];
    _._deferredSectionTargets = [];
    _._sections = [];
    _._deferredLoadViewportExcess = 300; // load defferred sections within this many px of viewport
    _._deferredWatcherRunning = false;

    _.init = function () {
      $(document).on('shopify:section:load', function (e) {
        // load a new section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionLoad(target);
        }
      }).on('shopify:section:unload', function (e) {
        // unload existing section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionUnload(target);
        }
      }).on('shopify:section:reorder', function (e) {
        // unload existing section
        var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
        if (target) {
          _.sectionReorder(target);
        }
      });
      $(window).on('throttled-scroll.themeSectionDeferredLoader debouncedresize.themeSectionDeferredLoader', _._processDeferredSections);
      _._deferredWatcherRunning = true;
    };

    // register a type of section
    _.register = function (type, section, options) {
      _._sections.push({
        type: type,
        section: section,
        afterSectionLoadCallback: options ? options.afterLoad : null,
        afterSectionUnloadCallback: options ? options.afterUnload : null });


      // load now
      $('[data-section-type="' + type + '"]').each(function () {
        if (Shopify.designMode || options && options.deferredLoad === false || !_._deferredWatcherRunning) {
          _.sectionLoad(this);
        } else {
          _.sectionDeferredLoad(this, options);
        }
      });
    };

    // prepare a section to load later
    _.sectionDeferredLoad = function (target, options) {
      _._deferredSectionTargets.push({
        target: target,
        deferredLoadViewportExcess: options && options.deferredLoadViewportExcess ? options.deferredLoadViewportExcess : _._deferredLoadViewportExcess });

      _._processDeferredSections(true);
    };

    // load deferred sections if in/near viewport
    _._processDeferredSections = function (firstRunCheck) {
      if (_._deferredSectionTargets.length) {
        var viewportTop = $(window).scrollTop(),
        viewportBottom = viewportTop + $(window).height(),
        loopStart = firstRunCheck === true ? _._deferredSectionTargets.length - 1 : 0;
        for (var i = loopStart; i < _._deferredSectionTargets.length; i++) {
          var target = _._deferredSectionTargets[i].target,
          viewportExcess = _._deferredSectionTargets[i].deferredLoadViewportExcess,
          sectionTop = $(target).offset().top - viewportExcess,
          doLoad = sectionTop > viewportTop && sectionTop < viewportBottom;
          if (!doLoad) {
            var sectionBottom = sectionTop + $(target).outerHeight() + viewportExcess * 2;
            doLoad = sectionBottom > viewportTop && sectionBottom < viewportBottom;
          }
          if (doLoad || sectionTop < viewportTop && sectionBottom > viewportBottom) {
            // in viewport, load
            _.sectionLoad(target);
            // remove from deferred queue and resume checks
            _._deferredSectionTargets.splice(i, 1);
            i--;
          }
        }
      }

      // remove event if no more deferred targets left, if not on first run
      if (firstRunCheck !== true && _._deferredSectionTargets.length === 0) {
        _._deferredWatcherRunning = false;
        $(window).off('.themeSectionDeferredLoader');
      }
    };

    // load in a section
    _.sectionLoad = function (target) {
      var target = target,
      sectionObj = _._sectionForTarget(target),
      section = false;

      if (sectionObj.section) {
        section = sectionObj.section;
      } else {
        section = sectionObj;
      }

      if (section !== false) {
        var instance = {
          target: target,
          section: section,
          $shopifySectionContainer: $(target).closest('.shopify-section'),
          thisContext: {
            functions: section.functions,
            registeredEventListeners: [] } };


        instance.thisContext.registerEventListener = _._registerEventListener.bind(instance.thisContext);
        _._instances.push(instance);

        //Initialise any components
        if ($(target).data('components')) {
          //Init each component
          var components = $(target).data('components').split(',');
          components.forEach((component) => {
            $(document).trigger('cc:component:load', [component, target]);
          });
        }

        _._callSectionWith(section, 'onSectionLoad', target, instance.thisContext);
        _._callSectionWith(section, 'afterSectionLoadCallback', target, instance.thisContext);

        // attach additional UI events if defined
        if (section.onSectionSelect) {
          instance.$shopifySectionContainer.on('shopify:section:select', function (e) {
            _._callSectionWith(section, 'onSectionSelect', e.target, instance.thisContext);
          });
        }
        if (section.onSectionDeselect) {
          instance.$shopifySectionContainer.on('shopify:section:deselect', function (e) {
            _._callSectionWith(section, 'onSectionDeselect', e.target, instance.thisContext);
          });
        }
        if (section.onBlockSelect) {
          $(target).on('shopify:block:select', function (e) {
            _._callSectionWith(section, 'onBlockSelect', e.target, instance.thisContext);
          });
        }
        if (section.onBlockDeselect) {
          $(target).on('shopify:block:deselect', function (e) {
            _._callSectionWith(section, 'onBlockDeselect', e.target, instance.thisContext);
          });
        }
      }
    };

    // unload a section
    _.sectionUnload = function (target) {
      var sectionObj = _._sectionForTarget(target);
      var instanceIndex = -1;
      for (var i = 0; i < _._instances.length; i++) {
        if (_._instances[i].target == target) {
          instanceIndex = i;
        }
      }
      if (instanceIndex > -1) {
        var instance = _._instances[instanceIndex];
        // remove events and call unload, if loaded
        $(target).off('shopify:block:select shopify:block:deselect');
        instance.$shopifySectionContainer.off('shopify:section:select shopify:section:deselect');
        _._callSectionWith(instance.section, 'onSectionUnload', target, instance.thisContext);
        _._unloadRegisteredEventListeners(instance.thisContext.registeredEventListeners);
        _._callSectionWith(sectionObj, 'afterSectionUnloadCallback', target, instance.thisContext);
        _._instances.splice(instanceIndex);

        //Destroy any components
        if ($(target).data('components')) {
          //Init each component
          var components = $(target).data('components').split(',');
          components.forEach((component) => {
            $(document).trigger('cc:component:unload', [component, target]);
          });
        }
      } else {
        // check if it was a deferred section
        for (var i = 0; i < _._deferredSectionTargets.length; i++) {
          if (_._deferredSectionTargets[i].target == target) {
            _._deferredSectionTargets[i].splice(i, 1);
            break;
          }
        }
      }
    };

    _.sectionReorder = function (target) {
      var instanceIndex = -1;
      for (var i = 0; i < _._instances.length; i++) {
        if (_._instances[i].target == target) {
          instanceIndex = i;
        }
      }
      if (instanceIndex > -1) {
        var instance = _._instances[instanceIndex];
        _._callSectionWith(instance.section, 'onSectionReorder', target, instance.thisContext);
      }
    };

    // Helpers
    _._registerEventListener = function (element, eventType, callback) {
      element.addEventListener(eventType, callback);
      this.registeredEventListeners.push({
        element,
        eventType,
        callback });

    };

    _._unloadRegisteredEventListeners = function (registeredEventListeners) {
      registeredEventListeners.forEach((rel) => {
        rel.element.removeEventListener(rel.eventType, rel.callback);
      });
    };

    _._callSectionWith = function (section, method, container, thisContext) {
      if (typeof section[method] === 'function') {
        try {
          if (thisContext) {
            section[method].bind(thisContext)(container);
          } else {
            section[method](container);
          }
        } catch (ex) {
          var sectionType = container.dataset['sectionType'];
          console.warn("Theme warning: '".concat(method, "' failed for section '").concat(sectionType, "'"));
          console.debug(container, ex);
        }
      }
    };

    _._themeSectionTargetFromShopifySectionTarget = function (target) {
      var $target = $('[data-section-type]:first', target);
      if ($target.length > 0) {
        return $target[0];
      } else {
        return false;
      }
    };

    _._sectionForTarget = function (target) {
      var type = $(target).attr('data-section-type');
      for (var i = 0; i < _._sections.length; i++) {
        if (_._sections[i].type == type) {
          return _._sections[i];
        }
      }
      return false;
    };

    _._sectionAlreadyRegistered = function (type) {
      for (var i = 0; i < _._sections.length; i++) {
        if (_._sections[i].type == type) {
          return true;
        }
      }
      return false;
    };
  }();
  // Loading third party scripts
  theme.scriptsLoaded = {};
  theme.loadScriptOnce = function (src, callback, beforeRun, sync) {
    if (typeof theme.scriptsLoaded[src] === 'undefined') {
      theme.scriptsLoaded[src] = [];
      var tag = document.createElement('script');
      tag.src = src;

      if (sync || beforeRun) {
        tag.async = false;
      }

      if (beforeRun) {
        beforeRun();
      }

      if (typeof callback === 'function') {
        theme.scriptsLoaded[src].push(callback);
        if (tag.readyState) {// IE, incl. IE9
          tag.onreadystatechange = function () {
            if (tag.readyState == "loaded" || tag.readyState == "complete") {
              tag.onreadystatechange = null;
              for (var i = 0; i < theme.scriptsLoaded[this].length; i++) {
                theme.scriptsLoaded[this][i]();
              }
              theme.scriptsLoaded[this] = true;
            }
          }.bind(src);
        } else {
          tag.onload = function () {// Other browsers
            for (var i = 0; i < theme.scriptsLoaded[this].length; i++) {
              theme.scriptsLoaded[this][i]();
            }
            theme.scriptsLoaded[this] = true;
          }.bind(src);
        }
      }

      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      return true;
    } else if (typeof theme.scriptsLoaded[src] === 'object' && typeof callback === 'function') {
      theme.scriptsLoaded[src].push(callback);
    } else {
      if (typeof callback === 'function') {
        callback();
      }
      return false;
    }
  };

  theme.loadStyleOnce = function (src) {
    var srcWithoutProtocol = src.replace(/^https?:/, '');
    if (!document.querySelector('link[href="' + encodeURI(srcWithoutProtocol) + '"]')) {
      var tag = document.createElement('link');
      tag.href = srcWithoutProtocol;
      tag.rel = 'stylesheet';
      tag.type = 'text/css';
      var firstTag = document.getElementsByTagName('link')[0];
      firstTag.parentNode.insertBefore(tag, firstTag);
    }
  };theme.Disclosure = function () {
    var selectors = {
      disclosureList: '[data-disclosure-list]',
      disclosureToggle: '[data-disclosure-toggle]',
      disclosureInput: '[data-disclosure-input]',
      disclosureOptions: '[data-disclosure-option]' };


    var classes = {
      listVisible: 'disclosure-list--visible' };


    function Disclosure($disclosure) {
      this.$container = $disclosure;
      this.cache = {};
      this._cacheSelectors();
      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();
    }

    Disclosure.prototype = $.extend({}, Disclosure.prototype, {
      _cacheSelectors: function _cacheSelectors() {
        this.cache = {
          $disclosureList: this.$container.find(selectors.disclosureList),
          $disclosureToggle: this.$container.find(selectors.disclosureToggle),
          $disclosureInput: this.$container.find(selectors.disclosureInput),
          $disclosureOptions: this.$container.find(selectors.disclosureOptions) };

      },

      _connectToggle: function _connectToggle() {
        this.cache.$disclosureToggle.on(
        'click',
        function (evt) {
          var ariaExpanded =
          $(evt.currentTarget).attr('aria-expanded') === 'true';
          $(evt.currentTarget).attr('aria-expanded', !ariaExpanded);

          this.cache.$disclosureList.toggleClass(classes.listVisible);
        }.bind(this));

      },

      _connectOptions: function _connectOptions() {
        this.cache.$disclosureOptions.on(
        'click',
        function (evt) {
          evt.preventDefault();
          this._submitForm($(evt.currentTarget).data('value'));
        }.bind(this));

      },

      _onFocusOut: function _onFocusOut() {
        this.cache.$disclosureToggle.on(
        'focusout',
        function (evt) {
          var disclosureLostFocus =
          this.$container.has(evt.relatedTarget).length === 0;

          if (disclosureLostFocus) {
            this._hideList();
          }
        }.bind(this));


        this.cache.$disclosureList.on(
        'focusout',
        function (evt) {
          var childInFocus =
          $(evt.currentTarget).has(evt.relatedTarget).length > 0;
          var isVisible = this.cache.$disclosureList.hasClass(
          classes.listVisible);


          if (isVisible && !childInFocus) {
            this._hideList();
          }
        }.bind(this));


        this.$container.on(
        'keyup',
        function (evt) {
          if (evt.which !== 27) return; // escape
          this._hideList();
          this.cache.$disclosureToggle.focus();
        }.bind(this));


        this.bodyOnClick = function (evt) {
          var isOption = this.$container.has(evt.target).length > 0;
          var isVisible = this.cache.$disclosureList.hasClass(
          classes.listVisible);


          if (isVisible && !isOption) {
            this._hideList();
          }
        }.bind(this);

        $('body').on('click', this.bodyOnClick);
      },

      _submitForm: function _submitForm(value) {
        this.cache.$disclosureInput.val(value);
        this.$container.parents('form').submit();
      },

      _hideList: function _hideList() {
        this.cache.$disclosureList.removeClass(classes.listVisible);
        this.cache.$disclosureToggle.attr('aria-expanded', false);
      },

      unload: function unload() {
        $('body').off('click', this.bodyOnClick);
        this.cache.$disclosureOptions.off();
        this.cache.$disclosureToggle.off();
        this.cache.$disclosureList.off();
        this.$container.off();
      } });


    return Disclosure;
  }();
  /// Show a short-lived text popup above an element
  theme.showQuickPopup = function (message, $origin) {
    var $popup = $('<div class="simple-popup"/>');
    var offs = $origin.offset();
    $popup.html(message).css({ 'left': offs.left, 'top': offs.top }).hide();
    $('body').append($popup);
    $popup.css({ marginTop: -$popup.outerHeight() - 10, marginLeft: -($popup.outerWidth() - $origin.outerWidth()) / 2 });
    $popup.fadeIn(200).delay(3500).fadeOut(400, function () {
      $(this).remove();
    });
  };
  //v1.0
  $.fn.sort = [].sort; // v1.0
  $.fn.fadeOutAndRemove = function (speed, callback) {
    $(this).fadeOut(speed, function () {
      $(this).remove();
      typeof callback == 'function' && callback();
    });
  }; // Turn a <select> tag into clicky boxes
  // Use with: $('select').clickyBoxes()
  $.fn.clickyBoxes = function (prefix) {
    if (prefix == 'destroy') {
      $(this).off('.clickyboxes');
      $(this).next('.clickyboxes').off('.clickyboxes');
    } else {
      return $(this).filter('select:not(.clickybox-replaced)').addClass('clickybox-replaced').each(function () {
        //Make sure rows are unique
        var prefix = prefix || $(this).attr('id');
        //Create container
        var $optCont = $('<ul class="clickyboxes"/>').attr('id', 'clickyboxes-' + prefix).data('select', $(this)).insertAfter(this);

        var $label;
        if ($(this).is('[id]')) {
          $label = $('label[for="' + $(this).attr('id') + '"]'); // Grab real label
        } else {
          $label = $(this).siblings('label'); // Rough guess
        }
        if ($label.length > 0) {
          $optCont.addClass('options-' + removeDiacritics($label.text()).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/-*$/, ''));
        }

        //Add options to container
        $(this).find('option').each(function () {
          $('<li/>').appendTo($optCont).append(
          $('<a href="#"/>').attr('data-value', $(this).val()).html($(this).html()).
          addClass('opt--' + removeDiacritics($(this).text()).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/-*$/, '')));

        });
        //Select change event
        $(this).hide().addClass('replaced').on('change.clickyboxes keyup.clickyboxes', function () {
          //Choose the right option to show
          var val = $(this).val();
          $optCont.find('a').removeClass('active').filter(function () {
            return $(this).attr('data-value') == val;
          }).addClass('active');
        }).trigger('keyup'); //Initial value
        //Button click event
        $optCont.on('click.clickyboxes', 'a', function () {
          if (!$(this).hasClass('active')) {
            var $clicky = $(this).closest('.clickyboxes');
            $clicky.data('select').val($(this).data('value')).trigger('change');
            $clicky.trigger('change');
          }
          return false;
        });
      });
    }
  };
  // v1.0
  //Find out how wide scrollbars are on this browser
  $.scrollBarWidth = function () {
    var $temp = $('<div/>').css({
      width: 100,
      height: 100,
      overflow: 'scroll',
      position: 'absolute',
      top: -9999 }).
    prependTo('body');
    var w = $temp[0].offsetWidth - $temp[0].clientWidth;
    $temp.remove();
    return w;
  }; //Restyle all select dropdowns
  //NOTE: Only for us on showcase until this can be replaced with jquery.selectreplace.v1.0.js
  var chevronDownIcon = '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/><path d="M0-.75h24v24H0z" fill="none"/></svg>';
  $.fn.selectReplace = function (leaveLabel) {
    return $(this).filter('select:not(.replaced, .noreplace)').each(function () {
      //Add formatting containers
      var $opts = $(this).find('option');
      var initialText = $opts.filter(':selected').length > 0 ? $opts.filter(':selected').text() : $opts.first().text();
      var $cont = $(this).addClass('replaced').wrap('<div class="pretty-select">').parent().addClass('id-' + $(this).attr('id')).
      append('<span class="text"><span class="value">' + initialText + '</span></span>' + chevronDownIcon);
      //Label? Move inside
      if ($(this).attr('id')) {
        //Find label
        var $label = $('label[for="' + $(this).attr('id') + '"]');
        //If table cells used for layout, do not move the label
        var $selectTD = $(this).closest('td');
        var $labelTD = $label.closest('td');
        if (!leaveLabel && ($selectTD.length == 0 || $labelTD.length == 0 || $selectTD[0] == $labelTD[0])) {
          //Add to dropdown
          var $labelSpan = $('<span class="label">').html($label.html()).prependTo($cont.find('.text'));
          //Add colon, if it doesn't exist
          if ($labelSpan.slice(-1) != ':') {
            $labelSpan.append(':');
          }
          // remove label element and use aria
          $cont.find('select').attr('aria-label', $label.text());
          $label.remove();
        }
      }
    }).on('change keyup', function () {
      $(this).siblings('.text').find('.value').html($(this).find(':selected').html());
    });
  };$.fn.ccHoverLine = function (opts) {
    $(this).each(function () {
      var $this = $(this);
      if (!$this.hasClass('cc-init')) {
        $this.append("<li class='cc-hover-line'></li>").addClass('cc-init');
        var $hoverLine = $(this).find(".cc-hover-line");

        if (opts && opts.lineCss) {
          $hoverLine.css(opts.lineCss);
        }

        function updateLine() {var $link = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $this.find('li a[aria-selected="true"], li a.active');
          if ($link.length === 1) {
            $hoverLine.css({
              width: $link.width(),
              top: $link.position().top + $link.outerHeight(),
              left: $link.position().left });

          }
        }

        updateLine();

        if ($(window).outerWidth() < 768) {
          $(this).find("li").click(function () {
            var $link = $(this).find('a');
            if ($link.length === 1) {
              updateLine($link);
            }
          });
        } else {
          $(this).find("li").hover(function () {
            var $link = $(this).find('a');
            if ($link.length === 1) {
              updateLine($link);
            }
          }, function () {
            updateLine();
          });
        }

        $(window).on('debouncedresizewidth', function () {
          updateLine();
        });
      }
    });
  };
  (function () {
    function throttle(callback, threshold) {
      var debounceTimeoutId = -1;
      var tick = false;

      return function () {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = setTimeout(callback, threshold);

        if (!tick) {
          callback.call();
          tick = true;
          setTimeout(function () {
            tick = false;
          }, threshold);
        }
      };
    }

    var scrollEvent = document.createEvent('Event');
    scrollEvent.initEvent('throttled-scroll', true, true);

    window.addEventListener("scroll", throttle(function () {
      window.dispatchEvent(scrollEvent);
    }, 200));

  })();
  theme.cartNoteMonitor = {
    load: function load($notes) {
      $notes.on('change.themeCartNoteMonitor paste.themeCartNoteMonitor keyup.themeCartNoteMonitor', function () {
        theme.cartNoteMonitor.postUpdate($(this).val());
      });
    },

    unload: function unload($notes) {
      $notes.off('.themeCartNoteMonitor');
    },

    updateThrottleTimeoutId: -1,
    updateThrottleInterval: 500,

    postUpdate: function postUpdate(val) {
      clearTimeout(theme.cartNoteMonitor.updateThrottleTimeoutId);
      theme.cartNoteMonitor.updateThrottleTimeoutId = setTimeout(function () {
        $.post(theme.routes.cart_url + '/update.js', {
          note: val },
        function (data) {}, 'json');
      }, theme.cartNoteMonitor.updateThrottleInterval);
    } };

  // Source: https://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  theme.debounce = function (func) {var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 700;var immediate = arguments.length > 2 ? arguments[2] : undefined;
    var timeout;
    return function () {
      var context = this,args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  new class extends ccComponent {
    init(container) {
      super.init(container);

      var $container = $(container);

      //Emit's an event to indicate a tab is being changed. Also includes the difference in height
      //between the closing and opening tab
      function dispatchTabChangedEvent() {
        var event = new CustomEvent("cc-tab-changed");
        window.dispatchEvent(event);
      }

      $container.on('click', '[data-cc-toggle-panel]', function () {
        var $tabs = $(this).closest('.cc-tabs');
        var tabIndexToShow = $(this).data('cc-toggle-panel');
        var $tabToClose = $tabs.find('.cc-tabs__tab__panel:visible');
        var $tabToOpen = $tabs.find(".cc-tabs__tab .cc-tabs__tab__panel[aria-labelledby=\"product-tab-panel".concat(tabIndexToShow, "\"]"));
        var openAllTabs = $(this).closest('.cc-tabs[data-cc-tab-allow-multi-open="true"]').length;

        if ($tabs.hasClass('cc-tabs--tab-mode')) {
          $tabToClose.attr('hidden', '');
          $tabToOpen.removeAttr('hidden');
          $tabs.find('[role="tab"] [aria-selected="true"]').removeAttr('aria-selected');
          $tabs.find("[data-cc-toggle-panel=\"".concat(tabIndexToShow, "\"]")).attr('aria-selected', 'true');
        } else {
          var accordionSpeed = 300;

          if (!openAllTabs) {
            var tabNeedsClosing = $tabToClose.length;
            var tabNeedsOpening = $tabToOpen.attr('id') !== $tabToClose.attr('id') && $tabToOpen.length;

          } else {
            if ($tabToOpen.is(':visible')) {
              var tabNeedsClosing = true;
              var tabNeedsOpening = false;
              $tabToClose = $tabToOpen;
            } else {
              var tabNeedsClosing = false;
              var tabNeedsOpening = true;
            }
          }

          // On mobile, all accordions can be open at once
          if ($(window).outerWidth() < 768) {
            if ($tabToOpen.is(':visible')) {
              tabNeedsClosing = true;
              tabNeedsOpening = false;
              $tabToClose = $tabToOpen;
            } else {
              tabNeedsClosing = false;
            }
          }

          if (tabNeedsClosing) {
            $tabToClose.slideUp(accordionSpeed, function () {
              $(this).attr('hidden', '');
              if (!tabNeedsOpening) {
                dispatchTabChangedEvent();
              }
            });
            $tabToClose.prev().removeAttr('aria-selected');
          }

          if (tabNeedsOpening) {
            $tabToOpen.css('display', 'none').removeAttr('hidden').slideDown(accordionSpeed, dispatchTabChangedEvent);
            $tabToOpen.prev().attr('aria-selected', 'true');
          }
        }
        return false;
      });

      if ($container.hasClass('cc-tabs--tab-mode')) {
        $container.find('.cc-tabs__tab-headers').ccHoverLine();
      }
    }

    destroy(container) {
      super.destroy(container);
      $(container).off('click', '[data-cc-toggle-panel]');
    }}(
  'tabs');
  (() => {
    theme.initAnimateOnScroll = function () {
      if (document.body.classList.contains('cc-animate-enabled') && window.innerWidth >= 768) {
        var animationTimeout = typeof document.body.dataset.ccAnimateTimeout !== "undefined" ? document.body.dataset.ccAnimateTimeout : 200;

        if ('IntersectionObserver' in window) {
          var intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              // In view and hasn't been animated yet
              if (entry.isIntersecting && !entry.target.classList.contains("cc-animate-complete")) {
                setTimeout(() => {
                  entry.target.classList.add("-in", "cc-animate-complete");
                }, animationTimeout);

                setTimeout(() => {
                  //Once the animation is complete (assume 5 seconds), remove the animate attribute to remove all css
                  entry.target.classList.remove("data-cc-animate");
                  entry.target.style.transitionDuration = null;
                  entry.target.style.transitionDelay = null;
                }, 5000);

                // Remove observer after animation
                observer.unobserve(entry.target);
              }
            });
          });

          document.querySelectorAll('[data-cc-animate]:not(.cc-animate-init)').forEach((elem) => {
            //Set the animation delay
            if (elem.dataset.ccAnimateDelay) {
              elem.style.transitionDelay = elem.dataset.ccAnimateDelay;
            }

            ///Set the animation duration
            if (elem.dataset.ccAnimateDuration) {
              elem.style.transitionDuration = elem.dataset.ccAnimateDuration;
            }

            //Init the animation
            if (elem.dataset.ccAnimate) {
              elem.classList.add(elem.dataset.ccAnimate);
            }

            elem.classList.add("cc-animate-init");

            //Watch for elem
            intersectionObserver.observe(elem);
          });
        } else {
          //Fallback, load all the animations now
          var elems = document.querySelectorAll('[data-cc-animate]:not(.cc-animate-init)');
          for (var _i = 0; _i < elems.length; _i++) {
            elems[_i].classList.add("-in", "cc-animate-complete");
          }
        }
      }
    };

    theme.initAnimateOnScroll();

    document.addEventListener('shopify:section:load', () => {
      setTimeout(theme.initAnimateOnScroll, 100);
    });

    //Reload animations when changing from mobile to desktop
    try {
      window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => {
        if (event.matches) {
          setTimeout(theme.initAnimateOnScroll, 100);
        }
      });
    } catch (e) {}
  })();


  class ccPopup {
    constructor($container, namespace) {
      this.$container = $container;
      this.namespace = namespace;
      this.cssClasses = {
        visible: 'cc-popup--visible',
        bodyNoScroll: 'cc-popup-no-scroll',
        bodyNoScrollPadRight: 'cc-popup-no-scroll-pad-right' };

    }

    /**
     * Open popup on timer / local storage - move focus to input ensure you can tab to submit and close
     * Add the cc-popup--visible class
     * Update aria to visible
     */
    open(callback) {
      // Prevent the body from scrolling
      if (this.$container.data('freeze-scroll')) {
        $('body').addClass(this.cssClasses.bodyNoScroll);

        // Add any padding necessary to the body to compensate for the scrollbar that just disappeared
        var scrollDiv = document.createElement('div');
        scrollDiv.className = 'popup-scrollbar-measure';
        document.body.appendChild(scrollDiv);
        var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);
        if (scrollbarWidth > 0) {
          $('body').css('padding-right', scrollbarWidth + 'px').addClass(this.cssClasses.bodyNoScrollPadRight);
        }
      }

      // Add reveal class
      this.$container.addClass(this.cssClasses.visible);

      // Track previously focused element
      this.previouslyActiveElement = document.activeElement;

      // Focus on the close button after the animation in has completed
      setTimeout(() => {
        this.$container.find('.cc-popup-close')[0].focus();
      }, 500);

      // Pressing escape closes the modal
      $(window).on('keydown' + this.namespace, (event) => {
        if (event.keyCode === 27) {
          this.close();
        }
      });

      if (callback) {
        callback();
      }
    }

    /**
     * Close popup on click of close button or background - where does the focus go back to?
     * Remove the cc-popup--visible class
     */
    close(callback) {
      // Remove reveal class
      this.$container.removeClass(this.cssClasses.visible);

      // Revert focus
      if (this.previouslyActiveElement) {
        $(this.previouslyActiveElement).focus();
      }

      // Destroy the escape event listener
      $(window).off('keydown' + this.namespace);

      // Allow the body to scroll and remove any scrollbar-compensating padding
      if (this.$container.data('freeze-scroll')) {
        var transitionDuration = 500;

        var $innerModal = this.$container.find('.cc-popup-modal');
        if ($innerModal.length) {
          transitionDuration = parseFloat(getComputedStyle($innerModal[0])['transitionDuration']);
          if (transitionDuration && transitionDuration > 0) {
            transitionDuration *= 1000;
          }
        }

        setTimeout(() => {
          $('body').removeClass(this.cssClasses.bodyNoScroll).removeClass(this.cssClasses.bodyNoScrollPadRight).css('padding-right', '0');
        }, transitionDuration);
      }

      if (callback) {
        callback();
      }
    }}
  ;
  class PriceRangeInstance {
    constructor(container) {
      this.container = container;
      this.selectors = {
        inputMin: '.cc-price-range__input--min',
        inputMax: '.cc-price-range__input--max',
        control: '.cc-price-range__control',
        controlMin: '.cc-price-range__control--min',
        controlMax: '.cc-price-range__control--max',
        bar: '.cc-price-range__bar',
        activeBar: '.cc-price-range__bar-active' };

      this.controls = {
        min: {
          barControl: container.querySelector(this.selectors.controlMin),
          input: container.querySelector(this.selectors.inputMin) },

        max: {
          barControl: container.querySelector(this.selectors.controlMax),
          input: container.querySelector(this.selectors.inputMax) } };


      this.controls.min.value = parseInt(this.controls.min.input.value === '' ? this.controls.min.input.placeholder : this.controls.min.input.value);
      this.controls.max.value = parseInt(this.controls.max.input.value === '' ? this.controls.max.input.placeholder : this.controls.max.input.value);
      this.valueMin = this.controls.min.input.min;
      this.valueMax = this.controls.min.input.max;
      this.valueRange = this.valueMax - this.valueMin;

      [this.controls.min, this.controls.max].forEach((item) => {
        item.barControl.setAttribute('aria-valuemin', this.valueMin);
        item.barControl.setAttribute('aria-valuemax', this.valueMax);
        item.barControl.setAttribute('tabindex', 0);
      });
      this.controls.min.barControl.setAttribute('aria-valuenow', this.controls.min.value);
      this.controls.max.barControl.setAttribute('aria-valuenow', this.controls.max.value);

      this.bar = container.querySelector(this.selectors.bar);
      this.activeBar = container.querySelector(this.selectors.activeBar);
      this.inDrag = false;

      this.bindEvents();
      this.render();
    }

    getPxToValueRatio() {
      return this.bar.clientWidth / (this.valueMax - this.valueMin);
    }

    getPcToValueRatio() {
      return 100.0 / (this.valueMax - this.valueMin);
    }

    setActiveControlValue(value) {
      // only accept valid numbers
      if (isNaN(parseInt(value))) return;

      // clamp & default
      if (this.activeControl === this.controls.min) {
        if (value === '') {
          value = this.valueMin;
        }
        value = Math.max(this.valueMin, value);
        value = Math.min(value, this.controls.max.value);
      } else {
        if (value === '') {
          value = this.valueMax;
        }
        value = Math.min(this.valueMax, value);
        value = Math.max(value, this.controls.min.value);
      }

      // round
      this.activeControl.value = Math.round(value);

      // update input
      if (this.activeControl.input.value != this.activeControl.value) {
        if (this.activeControl.value == this.activeControl.input.placeholder) {
          this.activeControl.input.value = '';
        } else {
          this.activeControl.input.value = this.activeControl.value;
        }
        this.activeControl.input.dispatchEvent(new CustomEvent('change', { bubbles: true, cancelable: false, detail: { sender: 'theme:component:price_range' } }));
      }

      // a11y
      this.activeControl.barControl.setAttribute('aria-valuenow', this.activeControl.value);
    }

    render() {
      this.drawControl(this.controls.min);
      this.drawControl(this.controls.max);
      this.drawActiveBar();
    }

    drawControl(control) {
      control.barControl.style.left = (control.value - this.valueMin) * this.getPcToValueRatio() + '%';
    }

    drawActiveBar() {
      this.activeBar.style.left = (this.controls.min.value - this.valueMin) * this.getPcToValueRatio() + '%';
      this.activeBar.style.right = (this.valueMax - this.controls.max.value) * this.getPcToValueRatio() + '%';
    }

    handleControlTouchStart(e) {
      e.preventDefault();
      this.startDrag(e.target, e.touches[0].clientX);
      this.boundControlTouchMoveEvent = this.handleControlTouchMove.bind(this);
      this.boundControlTouchEndEvent = this.handleControlTouchEnd.bind(this);
      window.addEventListener('touchmove', this.boundControlTouchMoveEvent);
      window.addEventListener('touchend', this.boundControlTouchEndEvent);
    }

    handleControlTouchMove(e) {
      this.moveDrag(e.touches[0].clientX);
    }

    handleControlTouchEnd(e) {
      e.preventDefault();
      window.removeEventListener('touchmove', this.boundControlTouchMoveEvent);
      window.removeEventListener('touchend', this.boundControlTouchEndEvent);
      this.stopDrag();
    }

    handleControlMouseDown(e) {
      e.preventDefault();
      this.startDrag(e.target, e.clientX);
      this.boundControlMouseMoveEvent = this.handleControlMouseMove.bind(this);
      this.boundControlMouseUpEvent = this.handleControlMouseUp.bind(this);
      window.addEventListener('mousemove', this.boundControlMouseMoveEvent);
      window.addEventListener('mouseup', this.boundControlMouseUpEvent);
    }

    handleControlMouseMove(e) {
      this.moveDrag(e.clientX);
    }

    handleControlMouseUp(e) {
      e.preventDefault();
      window.removeEventListener('mousemove', this.boundControlMouseMoveEvent);
      window.removeEventListener('mouseup', this.boundControlMouseUpEvent);
      this.stopDrag();
    }

    startDrag(target, startX) {
      if (this.controls.min.barControl === target) {
        this.activeControl = this.controls.min;
      } else {
        this.activeControl = this.controls.max;
      }
      this.dragStartX = startX;
      this.dragStartValue = this.activeControl.value;
      this.inDrag = true;
    }

    moveDrag(moveX) {
      if (this.inDrag) {
        var value = this.dragStartValue + (moveX - this.dragStartX) / this.getPxToValueRatio();
        this.setActiveControlValue(value);
        this.render();
      }
    }

    stopDrag() {
      this.inDrag = false;
    }

    handleControlKeyDown(e) {
      if (e.key === 'ArrowRight') {
        this.incrementControlFromKeypress(e.target, 10.0);
      } else if (e.key === 'ArrowLeft') {
        this.incrementControlFromKeypress(e.target, -10.0);
      }
    }

    incrementControlFromKeypress(control, pxAmount) {
      if (this.controls.min.barControl === control) {
        this.activeControl = this.controls.min;
      } else {
        this.activeControl = this.controls.max;
      }
      this.setActiveControlValue(this.activeControl.value + pxAmount / this.getPxToValueRatio());
      this.render();
    }

    handleInputChange(e) {
      // strip out non numeric values
      e.target.value = e.target.value.replace(/\D/g, '');

      if (!e.detail || e.detail.sender != 'theme:component:price_range') {
        if (this.controls.min.input === e.target) {
          this.activeControl = this.controls.min;
        } else {
          this.activeControl = this.controls.max;
        }
        this.setActiveControlValue(e.target.value);
        this.render();
      }
    }

    handleInputKeyup(e) {
      // enforce numeric chars in the input
      setTimeout(function () {
        this.value = this.value.replace(/\D/g, '');
      }.bind(e.target), 10);
    }

    bindEvents() {
      [this.controls.min, this.controls.max].forEach((item) => {
        item.barControl.addEventListener('touchstart', this.handleControlTouchStart.bind(this));
        item.barControl.addEventListener('mousedown', this.handleControlMouseDown.bind(this));
        item.barControl.addEventListener('keydown', this.handleControlKeyDown.bind(this));
        item.input.addEventListener('change', this.handleInputChange.bind(this));
        item.input.addEventListener('keyup', this.handleInputKeyup.bind(this));
      });
    }

    destroy() {
    }}


  class PriceRange extends ccComponent {
    constructor() {var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'price-range';var cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".cc-".concat(name);
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new PriceRangeInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new PriceRange();
  class AccordionInstance {
    constructor(container) {
      this.accordion = container;
      this.itemClass = '.cc-accordion-item';
      this.titleClass = '.cc-accordion-item__title';
      this.panelClass = '.cc-accordion-item__panel';
      this.allowMultiOpen = this.accordion.dataset.allowMultiOpen === 'true';

      // If multiple open items not allowed, set open item as active (if there is one)
      if (!this.allowMultiOpen) {
        this.activeItem = this.accordion.querySelector("".concat(this.itemClass, "[open]"));
      }

      this.bindEvents();
    }

    /**
     * Adds inline 'height' style to a panel, to trigger open transition
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    static addPanelHeight(panel) {
      panel.style.height = "".concat(panel.scrollHeight, "px");
    }

    /**
     * Removes inline 'height' style from a panel, to trigger close transition
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    static removePanelHeight(panel) {
      panel.getAttribute('style'); // Fix Safari bug (doesn't remove attribute without this first!)
      panel.removeAttribute('style');
    }

    /**
     * Opens an accordion item
     * @param {HTMLDetailsElement} item - The accordion item
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    open(item, panel) {
      panel.style.height = '0';

      // Set item to open. Blocking the default click action and opening it this way prevents a
      // slight delay which causes the panel height to be set to '0' (because item's not open yet)
      item.open = true;

      AccordionInstance.addPanelHeight(panel);

      // Slight delay required before starting transitions
      setTimeout(() => {
        item.classList.add('is-open');
      }, 10);

      if (!this.allowMultiOpen) {
        // If there's an active item and it's not the opened item, close it
        if (this.activeItem && this.activeItem !== item) {
          var activePanel = this.activeItem.querySelector(this.panelClass);
          this.close(this.activeItem, activePanel);
        }

        this.activeItem = item;
      }
    }

    /**
     * Closes an accordion item
     * @param {HTMLDetailsElement} item - The accordion item
     * @param {HTMLDivElement} panel - The accordion item content panel
     */
    close(item, panel) {
      AccordionInstance.addPanelHeight(panel);

      item.classList.remove('is-open');
      item.classList.add('is-closing');

      if (this.activeItem === item) {
        this.activeItem = null;
      }

      // Slight delay required to allow scroll height to be applied before changing to '0'
      setTimeout(() => {
        panel.style.height = '0';
      }, 10);
    }

    /**
     * Handles 'click' event on the accordion
     * @param {Object} e - The event object
     */
    handleClick(e) {
      // Ignore clicks outside a toggle (<summary> element)
      var toggle = e.target.closest(this.titleClass);
      if (!toggle) return;

      // Prevent the default action
      // We'll trigger it manually after open transition initiated or close transition complete
      e.preventDefault();

      var item = toggle.parentNode;
      var panel = toggle.nextElementSibling;

      if (item.open) {
        this.close(item, panel);
      } else {
        this.open(item, panel);
      }
    }

    /**
     * Handles 'transitionend' event in the accordion
     * @param {Object} e - The event object
     */
    handleTransition(e) {
      // Ignore transitions not on a panel element
      if (!e.target.matches(this.panelClass)) return;

      var panel = e.target;
      var item = panel.parentNode;

      if (item.classList.contains('is-closing')) {
        item.classList.remove('is-closing');
        item.open = false;
      }

      AccordionInstance.removePanelHeight(panel);
    }

    bindEvents() {
      // Need to assign the function calls to variables because bind creates a new function,
      // which means the event listeners can't be removed in the usual way
      this.clickHandler = this.handleClick.bind(this);
      this.transitionHandler = this.handleTransition.bind(this);

      this.accordion.addEventListener('click', this.clickHandler);
      this.accordion.addEventListener('transitionend', this.transitionHandler);
    }

    destroy() {
      this.accordion.removeEventListener('click', this.clickHandler);
      this.accordion.removeEventListener('transitionend', this.transitionHandler);
    }}


  class Accordion extends ccComponent {
    constructor() {var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'accordion';var cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".cc-".concat(name);
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new AccordionInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new Accordion();
  /**
   * Adjusts the css top property of an element such that it sticks appropriately based on the scroll direction. The
   * container is assumed to be position: sticky, with top: 0 (or whatever).
   *
   * When scrolling down, it'll stick to the bottom of the container, when scrolling up it'll stick to the top of
   * the container.
   */
  class StickyScrollDirectionInstance {
    constructor(container) {
      if (!container) {
        console.warn("StickyScrollDirection component: No container provided");
        return;
      }

      if (window.innerWidth >= 768) {
        this.container = container;
        this.currentTop = parseInt(getComputedStyle(this.container).top);
        this.defaultTop = this.currentTop;
        this.scrollY = window.scrollY;
        this.bindEvents();
      }
    }

    bindEvents() {
      this.scrollListener = this.handleScroll.bind(this);
      window.addEventListener('scroll', this.scrollListener);

      // Use the 'data-cc-sticky-scroll-top' attribute to update the defaultTop. Example use - if the container should
      // stick under the nav, but the nav changes height (either a result from a browser resize, or Theme Editor setting
      // tweak), set this attr the new nav height
      if (typeof this.container.dataset.ccStickyScrollTop !== "undefined") {
        this.observer = new MutationObserver((mutations) => {
          for (var mutation of mutations) {
            if (mutation.attributeName === "data-cc-sticky-scroll-top") {
              this.defaultTop = parseInt(mutation.target.dataset.ccStickyScrollTop);
            }
          }
        });
        this.observer.observe(this.container, { attributes: true });
      }
    }

    /**
     * Updates the current css top based on scroll direction
     */
    handleScroll() {
      var bounds = this.container.getBoundingClientRect();
      var maxTop = bounds.top + window.scrollY - this.container.offsetTop + this.defaultTop;
      var minTop = this.container.clientHeight - window.innerHeight;

      if (window.scrollY < this.scrollY) {
        this.currentTop -= window.scrollY - this.scrollY;
      } else {
        this.currentTop += this.scrollY - window.scrollY;
      }

      this.currentTop = Math.min(Math.max(this.currentTop, -minTop), maxTop, this.defaultTop);
      this.scrollY = window.scrollY;
      this.container.style.top = this.currentTop + "px";
    }

    destroy() {
      window.removeEventListener('scroll', this.scrollListener);
      if (this.observer) {
        this.observer.disconnect();
      }
    }}


  class StickyScrollDirection extends ccComponent {
    constructor() {var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'sticky-scroll-direction';var cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".cc-".concat(name);
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new StickyScrollDirectionInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new StickyScrollDirection();


  // Manage videos
  theme.VideoManager = new function () {
    var _ = this;

    _._permitPlayback = function (container) {
      return !($(container).hasClass('video-container--background') && $(window).outerWidth() < 768);
    };

    // Youtube
    _.youtubeVars = {
      incrementor: 0,
      apiReady: false,
      videoData: {},
      toProcessSelector: '.video-container[data-video-type="youtube"]:not(.video--init)' };


    _.youtubeApiReady = function () {
      _.youtubeVars.apiReady = true;
      _._loadYoutubeVideos();
    };

    _._loadYoutubeVideos = function (container) {
      if ($(_.youtubeVars.toProcessSelector, container).length) {
        if (_.youtubeVars.apiReady) {

          // play those videos
          $(_.youtubeVars.toProcessSelector, container).each(function () {
            // Don't init background videos on mobile
            if (_._permitPlayback($(this))) {
              $(this).addClass('video--init');
              _.youtubeVars.incrementor++;
              var containerId = 'theme-yt-video-' + _.youtubeVars.incrementor;
              $(this).data('video-container-id', containerId);
              var videoElement = $('<div class="video-container__video-element">').attr('id', containerId).
              appendTo($('.video-container__video', this));
              var autoplay = $(this).data('video-autoplay');
              var loop = $(this).data('video-loop');
              var player = new YT.Player(containerId, {
                height: '360',
                width: '640',
                videoId: $(this).data('video-id'),
                playerVars: {
                  iv_load_policy: 3,
                  modestbranding: 1,
                  autoplay: 0,
                  loop: loop ? 1 : 0,
                  playlist: $(this).data('video-id'),
                  rel: 0,
                  showinfo: 0 },

                events: {
                  onReady: _._onYoutubePlayerReady.bind({ autoplay: autoplay, loop: loop, $container: $(this) }),
                  onStateChange: _._onYoutubePlayerStateChange.bind({ autoplay: autoplay, loop: loop, $container: $(this) }) } });


              _.youtubeVars.videoData[containerId] = {
                id: containerId,
                container: this,
                videoElement: videoElement,
                player: player };

            }
          });
        } else {
          // load api
          theme.loadScriptOnce('https://www.youtube.com/iframe_api');
        }
      }
    };

    _._onYoutubePlayerReady = function (event) {
      event.target.setPlaybackQuality('hd1080');
      if (this.autoplay) {
        event.target.mute();
        event.target.playVideo();
      }

      _._initBackgroundVideo(this.$container);
    };

    _._onYoutubePlayerStateChange = function (event) {
      if (event.data == YT.PlayerState.PLAYING) {
        this.$container.addClass('video--play-started');

        if (this.autoplay) {
          event.target.mute();
        }

        if (this.loop) {
          // 4 times a second, check if we're in the final second of the video. If so, loop it for a more seamless loop
          var finalSecond = event.target.getDuration() - 1;
          if (finalSecond > 2) {
            function loopTheVideo() {
              if (event.target.getCurrentTime() > finalSecond) {
                event.target.seekTo(0);
              }
              setTimeout(loopTheVideo, 250);
            }
            loopTheVideo();
          }
        }
      }
    };

    _._unloadYoutubeVideos = function (container) {
      for (var dataKey in _.youtubeVars.videoData) {
        var data = _.youtubeVars.videoData[dataKey];
        if ($(container).find(data.container).length) {
          data.player.destroy();
          delete _.youtubeVars.videoData[dataKey];
          return;
        }
      }
    };

    // Vimeo
    _.vimeoVars = {
      incrementor: 0,
      apiReady: false,
      videoData: {},
      toProcessSelector: '.video-container[data-video-type="vimeo"]:not(.video--init)' };


    _.vimeoApiReady = function () {
      _.vimeoVars.apiReady = true;
      _._loadVimeoVideos();
    };

    _._loadVimeoVideos = function (container) {
      if ($(_.vimeoVars.toProcessSelector, container).length) {
        if (_.vimeoVars.apiReady) {
          // play those videos

          $(_.vimeoVars.toProcessSelector, container).each(function () {
            // Don't init background videos on mobile
            if (_._permitPlayback($(this))) {
              $(this).addClass('video--init');
              _.vimeoVars.incrementor++;
              var $this = $(this);
              var containerId = 'theme-vi-video-' + _.vimeoVars.incrementor;
              $(this).data('video-container-id', containerId);
              var videoElement = $('<div class="video-container__video-element">').attr('id', containerId).
              appendTo($('.video-container__video', this));
              var autoplay = !!$(this).data('video-autoplay');
              var player = new Vimeo.Player(containerId, {
                url: $(this).data('video-url'),
                width: 640,
                loop: $(this).data('video-autoplay'),
                autoplay: autoplay,
                muted: $this.hasClass('video-container--background') || autoplay });

              player.on('playing', function () {
                $(this).addClass('video--play-started');
              }.bind(this));
              player.ready().then(function () {
                if (autoplay) {
                  player.setVolume(0);
                  player.play();
                }
                if (player.element && player.element.width && player.element.height) {
                  var ratio = parseInt(player.element.height) / parseInt(player.element.width);
                  $this.find('.video-container__video').css('padding-bottom', ratio * 100 + '%');
                }
                _._initBackgroundVideo($this);
              });
              _.vimeoVars.videoData[containerId] = {
                id: containerId,
                container: this,
                videoElement: videoElement,
                player: player,
                autoPlay: autoplay };

            }
          });
        } else {
          // load api
          if (window.define) {
            // workaround for third parties using RequireJS
            theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function () {
              _.vimeoVars.apiReady = true;
              _._loadVimeoVideos();
              window.define = window.tempDefine;
            }, function () {
              window.tempDefine = window.define;
              window.define = null;
            });
          } else {
            theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function () {
              _.vimeoVars.apiReady = true;
              _._loadVimeoVideos();
            });
          }
        }
      }
    };

    _._unloadVimeoVideos = function (container) {
      for (var dataKey in _.vimeoVars.videoData) {
        var data = _.vimeoVars.videoData[dataKey];
        if ($(container).find(data.container).length) {
          data.player.unload();
          delete _.vimeoVars.videoData[dataKey];
          return;
        }
      }
    };

    // Init third party apis - Youtube and Vimeo
    _._loadThirdPartyApis = function (container) {
      //Don't init youtube or vimeo background videos on mobile
      if (_._permitPlayback($('.video-container', container))) {
        _._loadYoutubeVideos(container);
        _._loadVimeoVideos(container);
      }
    };

    // Mp4
    _.mp4Vars = {
      incrementor: 0,
      videoData: {},
      toProcessSelector: '.video-container[data-video-type="mp4"]:not(.video--init)' };


    _._loadMp4Videos = function (container) {
      if ($(_.mp4Vars.toProcessSelector, container).length) {
        // play those videos
        $(_.mp4Vars.toProcessSelector, container).addClass('video--init').each(function () {
          _.mp4Vars.incrementor++;
          var $this = $(this);
          var containerId = 'theme-mp-video-' + _.mp4Vars.incrementor;
          $(this).data('video-container-id', containerId);
          var videoElement = $('<div class="video-container__video-element">').attr('id', containerId).
          appendTo($('.video-container__video', this));

          var $video = $('<video playsinline>');
          if ($(this).data('video-loop')) {
            $video.attr('loop', 'loop');
          }
          if (!$(this).hasClass('video-container--background')) {
            $video.attr('controls', 'controls');
          }
          if ($(this).data('video-autoplay')) {
            $video.attr({ autoplay: 'autoplay', muted: 'muted' });
            $video[0].muted = true; // required by Chrome - ignores attribute
            $video.one('loadeddata', function () {
              this.play();
            });
          }
          $video.on('playing', function () {
            $(this).addClass('video--play-started');
          }.bind(this));
          $video.attr('src', $(this).data('video-url')).appendTo(videoElement);
          _.mp4Vars.videoData[containerId] = {
            element: $video[0] };

        });
      }
    };

    _._unloadMp4Videos = function (container) {
    };

    // background video placement for iframes
    _._initBackgroundVideo = function ($container) {
      if ($container.hasClass('video-container--background') && $container.find('.video-container__video iframe').length) {
        function assessBackgroundVideo() {
          var $media = $('.video-container__media', this),
          $container = $media.length ? $media : this,
          cw = $container.width(),
          ch = $container.height(),
          cr = cw / ch,
          $frame = $('.video-container__video iframe', this),
          vr = $frame.attr('width') / $frame.attr('height'),
          $pan = $('.video-container__video', this),
          vCrop = 75; // pushes video outside container to hide controls
          if (cr > vr) {
            var vh = cw / vr + vCrop * 2;
            $pan.css({
              marginTop: (ch - vh) / 2 - vCrop,
              marginLeft: '',
              height: vh + vCrop * 2,
              width: '' });

          } else {
            var vw = cw * vr + vCrop * 2 * vr;
            $pan.css({
              marginTop: -vCrop,
              marginLeft: (cw - vw) / 2,
              height: ch + vCrop * 2,
              width: vw });

          }
        }
        assessBackgroundVideo.bind($container)();
        $(window).on('debouncedresize.' + $container.data('video-container-id'), assessBackgroundVideo.bind($container));
      }
    };

    // Compatibility with Sections
    this.onSectionLoad = function (container) {
      // url only - infer type
      $('.video-container[data-video-url]:not([data-video-type])').each(function () {
        var url = $(this).data('video-url');

        if (url.indexOf('.mp4') > -1) {
          $(this).attr('data-video-type', 'mp4');
        }

        if (url.indexOf('vimeo.com') > -1) {
          $(this).attr('data-video-type', 'vimeo');
          $(this).attr('data-video-id', url.split('?')[0].split('/').pop());
        }

        if (url.indexOf('youtu.be') > -1 || url.indexOf('youtube.com') > -1) {
          $(this).attr('data-video-type', 'youtube');
          if (url.indexOf('v=') > -1) {
            $(this).attr('data-video-id', url.split('v=').pop().split('&')[0]);
          } else {
            $(this).attr('data-video-id', url.split('?')[0].split('/').pop());
          }
        }
      });

      _._loadThirdPartyApis(container);
      _._loadMp4Videos(container);

      $(window).on('debouncedresize.video-manager-resize', function () {
        _._loadThirdPartyApis(container);
      });

      // play button
      $('.video-container__play', container).on('click', function (evt) {
        evt.preventDefault();
        var $container = $(this).closest('.video-container');
        // reveal
        $container.addClass('video-container--playing');

        // broadcast a play event on the section container
        $(container).trigger("cc:video:play");

        // play
        var id = $container.data('video-container-id');
        if (id.indexOf('theme-yt-video') === 0) {
          _.youtubeVars.videoData[id].player.playVideo();
        } else if (id.indexOf('theme-vi-video') === 0) {
          _.vimeoVars.videoData[id].player.play();
        } else if (id.indexOf('theme-mp-video') === 0) {
          _.mp4Vars.videoData[id].element.play();
        }
      });

      // modal close button
      $('.video-container__stop', container).on('click', function (evt) {
        evt.preventDefault();
        var $container = $(this).closest('.video-container');
        // hide
        $container.removeClass('video-container--playing');

        // broadcast a stop event on the section container
        $(container).trigger("cc:video:stop");

        // play
        var id = $container.data('video-container-id');
        if (id.indexOf('theme-yt-video') === 0) {
          _.youtubeVars.videoData[id].player.stopVideo();
        } else {
          _.vimeoVars.videoData[id].player.pause();
          _.vimeoVars.videoData[id].player.setCurrentTime(0);
        }
      });
    };

    this.onSectionUnload = function (container) {
      $('.video-container__play, .video-container__stop', container).off('click');
      $(window).off('.' + $('.video-container').data('video-container-id'));
      $(window).off('debouncedresize.video-manager-resize');
      _._unloadYoutubeVideos(container);
      _._unloadVimeoVideos(container);
      _._unloadMp4Videos(container);
      $(container).trigger("cc:video:stop");
    };
  }();

  // Youtube API callback
  window.onYouTubeIframeAPIReady = function () {
    theme.VideoManager.youtubeApiReady();
  };

  // Register the section
  cc.sections.push({
    name: 'video',
    section: theme.VideoManager });

  theme.MapSection = new function () {
    var _ = this;
    _.config = {
      zoom: 14,
      styles: {
        default: [],
        silver: [{ "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] }, { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }],
        retro: [{ "elementType": "geometry", "stylers": [{ "color": "#ebe3cd" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#523735" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f1e6" }] }, { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#c9b2a6" }] }, { "featureType": "administrative.land_parcel", "elementType": "geometry.stroke", "stylers": [{ "color": "#dcd2be" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#ae9e90" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#93817c" }] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#a5b076" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#447530" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#f5f1e6" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#fdfcf8" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#f8c967" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#e9bc62" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#e98d58" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [{ "color": "#db8555" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#806b63" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "transit.line", "elementType": "labels.text.fill", "stylers": [{ "color": "#8f7d77" }] }, { "featureType": "transit.line", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ebe3cd" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#dfd2ae" }] }, { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#b9d3c2" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#92998d" }] }],
        dark: [{ "elementType": "geometry", "stylers": [{ "color": "#212121" }] }, { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] }, { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] }, { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }, { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] }, { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] }, { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] }, { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] }, { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }],
        night: [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] }, { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }],
        aubergine: [{ "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] }, { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] }, { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] }, { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] }, { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#64779e" }] }, { "featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] }, { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] }, { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] }, { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] }, { "featureType": "poi", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#023e58" }] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#3C7680" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] }, { "featureType": "road", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#b0d5ce" }] }, { "featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{ "color": "#023e58" }] }, { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] }, { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1d2c4d" }] }, { "featureType": "transit.line", "elementType": "geometry.fill", "stylers": [{ "color": "#283d6a" }] }, { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#3a4762" }] }, { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }] } };


    _.apiStatus = null;

    this.geolocate = function ($map) {
      var deferred = $.Deferred();
      var geocoder = new google.maps.Geocoder();
      var address = $map.data('address-setting');

      geocoder.geocode({ address: address }, function (results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {
          deferred.reject(status);
        }

        deferred.resolve(results);
      });

      return deferred;
    };

    this.createMap = function (container) {
      var $map = $('.map-section__map-container', container);

      return _.geolocate($map).
      then(
      function (results) {
        var mapOptions = {
          zoom: _.config.zoom,
          styles: _.config.styles[$(container).data('map-style')],
          center: results[0].geometry.location,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          disableDefaultUI: true,
          zoomControl: true };


        _.map = new google.maps.Map($map[0], mapOptions);
        _.center = _.map.getCenter();

        var marker = new google.maps.Marker({
          map: _.map,
          position: _.center,
          clickable: false });


        google.maps.event.addDomListener(window, 'resize', function () {
          google.maps.event.trigger(_.map, 'resize');
          _.map.setCenter(_.center);
        });
      }.bind(this)).

      fail(function () {
        var errorMessage;

        switch (status) {
          case 'ZERO_RESULTS':
            errorMessage = theme.strings.addressNoResults;
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = theme.strings.addressQueryLimit;
            break;
          default:
            errorMessage = theme.strings.addressError;
            break;}


        // Only show error in the theme editor
        if (Shopify.designMode) {
          var $mapContainer = $map.parents('.map-section');

          $mapContainer.addClass('page-width map-section--load-error');
          $mapContainer.
          find('.map-section__wrapper').
          html(
          '<div class="errors text-center">' + errorMessage + '</div>');

        }
      });
    };

    this.onSectionLoad = function (target) {
      var $container = $(target);
      // Global function called by Google on auth errors
      window.gm_authFailure = function () {
        if (!Shopify.designMode) return;

        $container.addClass('page-width map-section--load-error');
        $container.
        find('.map-section__wrapper').
        html(
        '<div class="errors text-center">' + theme.strings.authError + '</div>');

      };

      // create maps
      var key = $container.data('api-key');

      if (typeof key !== 'string' || key === '') {
        return;
      }

      // load map
      theme.loadScriptOnce('https://maps.googleapis.com/maps/api/js?key=' + key, function () {
        _.createMap($container);
      });
    };

    this.onSectionUnload = function (target) {
      if (typeof window.google !== 'undefined' && typeof google.maps !== 'undefined') {
        google.maps.event.clearListeners(_.map, 'resize');
      }
    };
  }();

  // Register the section
  cc.sections.push({
    name: 'map',
    section: theme.MapSection });

  /**
   * Popup Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace Popup
   */

  theme.Popup = new function () {
    /**
     * Popup section constructor. Runs on page load as well as Theme Editor
     * `section:load` events.
     * @param {string} container - selector for the section container DOM element
     */

    var dismissedStorageKey = 'cc-theme-popup-dismissed';

    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.popup = new ccPopup(this.$container, this.namespace);

      var dismissForDays = this.$container.data('dismiss-for-days'),
      delaySeconds = this.$container.data('delay-seconds'),
      showPopup = true,
      testMode = this.$container.data('test-mode'),
      lastDismissed = window.localStorage.getItem(dismissedStorageKey);

      // Should we show it during this page view?
      // Check when it was last dismissed
      if (lastDismissed) {
        var dismissedDaysAgo = (new Date().getTime() - lastDismissed) / (1000 * 60 * 60 * 24);
        if (dismissedDaysAgo < dismissForDays) {
          showPopup = false;
        }
      }

      // Check for error or success messages
      if (this.$container.find('.cc-popup-form__response').length) {
        showPopup = true;
        delaySeconds = 1;

        // If success, set as dismissed
        if (this.$container.find('.cc-popup-form__response--success').length) {
          this.functions.popupSetAsDismissed.call(this);
        }
      }

      // Prevent popup on Shopify robot challenge page
      if (document.querySelector('.shopify-challenge__container')) {
        showPopup = false;
      }

      // Show popup, if appropriate
      if (showPopup || testMode) {
        setTimeout(() => {
          this.popup.open();
        }, delaySeconds * 1000);
      }

      // Click on close button or modal background
      this.$container.on('click' + this.namespace, '.cc-popup-close, .cc-popup-background', () => {
        this.popup.close(() => {
          this.functions.popupSetAsDismissed.call(this);
        });
      });
    };

    this.onSectionSelect = function () {
      this.popup.open();
    };

    this.functions = {
      /**
       * Use localStorage to set as dismissed
       */
      popupSetAsDismissed: function popupSetAsDismissed() {
        window.localStorage.setItem(dismissedStorageKey, new Date().getTime());
      } };


    /**
     * Event callback for Theme Editor `section:unload` event
     */
    this.onSectionUnload = function () {
      this.$container.off(this.namespace);
    };
  }();

  // Register section
  cc.sections.push({
    name: 'newsletter-popup',
    section: theme.Popup });

  /**
   * StoreAvailability Section Script
   * ------------------------------------------------------------------------------
   *
   * @namespace StoreAvailability
   */

  theme.StoreAvailability = function (container) {
    var loadingClass = 'store-availability-loading';
    var initClass = 'store-availability-initialized';
    var storageKey = 'cc-location';

    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);
      this.productId = this.$container.data('store-availability-container');
      this.sectionUrl = this.$container.data('section-url');
      this.$modal;

      this.$container.addClass(initClass);
      this.transitionDurationMS = parseFloat(getComputedStyle(container).transitionDuration) * 1000;
      this.removeFixedHeightTimeout = -1;

      // Handle when a variant is selected
      $(window).on("cc-variant-updated".concat(this.namespace).concat(this.productId), (e, args) => {
        if (args.product.id === this.productId) {
          this.functions.updateContent.bind(this)(
          args.variant ? args.variant.id : null,
          args.product.title,
          this.$container.data('has-only-default-variant'),
          args.variant && typeof args.variant.available !== "undefined");

        }
      });

      // Handle single variant products
      if (this.$container.data('single-variant-id')) {
        this.functions.updateContent.bind(this)(
        this.$container.data('single-variant-id'),
        this.$container.data('single-variant-product-title'),
        this.$container.data('has-only-default-variant'),
        this.$container.data('single-variant-product-available'));

      }
    };

    this.onSectionUnload = function () {
      $(window).off("cc-variant-updated".concat(this.namespace).concat(this.productId));
      this.$container.off('click');
      if (this.$modal) {
        this.$modal.off('click');
      }
    };

    this.functions = {
      // Returns the users location data (if allowed)
      getUserLocation: function getUserLocation() {
        return new Promise((resolve, reject) => {
          var storedCoords;

          if (sessionStorage[storageKey]) {
            storedCoords = JSON.parse(sessionStorage[storageKey]);
          }

          if (storedCoords) {
            resolve(storedCoords);

          } else {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
              function (position) {
                var coords = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude };


                //Set the localization api
                fetch('/localization.json', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json' },

                  body: JSON.stringify(coords) });


                //Write to a session storage
                sessionStorage[storageKey] = JSON.stringify(coords);

                resolve(coords);
              }, function () {
                resolve(false);
              }, {
                maximumAge: 3600000, // 1 hour
                timeout: 5000 });


            } else {
              resolve(false);
            }
          }
        });
      },

      // Requests the available stores and calls the callback
      getAvailableStores: function getAvailableStores(variantId, cb) {
        return $.get(this.sectionUrl.replace('VARIANT_ID', variantId), cb);
      },

      // Haversine Distance
      // The haversine formula is an equation giving great-circle distances between
      // two points on a sphere from their longitudes and latitudes
      calculateDistance: function calculateDistance(coords1, coords2, unitSystem) {
        var dtor = Math.PI / 180;
        var radius = unitSystem === 'metric' ? 6378.14 : 3959;

        var rlat1 = coords1.latitude * dtor;
        var rlong1 = coords1.longitude * dtor;
        var rlat2 = coords2.latitude * dtor;
        var rlong2 = coords2.longitude * dtor;

        var dlon = rlong1 - rlong2;
        var dlat = rlat1 - rlat2;

        var a =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(rlat1) * Math.cos(rlat2) * Math.pow(Math.sin(dlon / 2), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return radius * c;
      },

      // Updates the existing modal pickup with locations with distances from the user
      updateLocationDistances: function updateLocationDistances(coords) {
        var unitSystem = this.$modal.find('[data-unit-system]').data('unit-system');
        var self = this;

        this.$modal.find('[data-distance="false"]').each(function () {
          var thisCoords = {
            latitude: parseFloat($(this).data('latitude')),
            longitude: parseFloat($(this).data('longitude')) };


          if (thisCoords.latitude && thisCoords.longitude) {
            var distance = self.functions.calculateDistance(
            coords, thisCoords, unitSystem).toFixed(1);

            $(this).html(distance);

            //Timeout to trigger animation
            setTimeout(() => {
              $(this).closest('.store-availability-list__location__distance').addClass('-in');
            }, 0);
          }

          $(this).attr('data-distance', 'true');
        });
      },

      // Requests the available stores and updates the page with info below Add to Basket, and append the modal to the page
      updateContent: function updateContent(variantId, productTitle, isSingleDefaultVariant, isVariantAvailable) {
        this.$container.off('click', '[data-store-availability-modal-open]');
        this.$container.off('click' + this.namespace, '.cc-popup-close, .cc-popup-background');
        $('.store-availabilities-modal').remove();

        if (!isVariantAvailable) {
          //If the variant is Unavailable (not the same as Out of Stock) - hide the store pickup completely
          this.$container.addClass(loadingClass);
          if (this.transitionDurationMS > 0) {
            this.$container.css('height', '0px');
          }
        } else {
          this.$container.addClass(loadingClass);
          if (this.transitionDurationMS > 0) {
            this.$container.css('height', this.$container.outerHeight() + 'px');
          }
        }

        if (isVariantAvailable) {
          this.functions.getAvailableStores.call(this, variantId, (response) => {
            if (response.trim().length > 0 && !response.includes('NO_PICKUP')) {
              this.$container.html(response);
              this.$container.html(this.$container.children().first().html()); // editor bug workaround

              this.$container.find('[data-store-availability-modal-product-title]').html(productTitle);

              if (isSingleDefaultVariant) {
                this.$container.find('.store-availabilities-modal__variant-title').remove();
              }

              this.$container.find('.cc-popup').appendTo('body');

              this.$modal = $('body').find('.store-availabilities-modal');
              var popup = new ccPopup(this.$modal, this.namespace);

              this.$container.on('click', '[data-store-availability-modal-open]', () => {
                popup.open();

                //When the modal is opened, try and get the users location
                this.functions.getUserLocation().then((coords) => {
                  if (coords && this.$modal.find('[data-distance="false"]').length) {
                    //Re-retrieve the available stores location modal contents
                    this.functions.getAvailableStores.call(this, variantId, (response) => {
                      this.$modal.find('.store-availabilities-list').html($(response).find('.store-availabilities-list').html());
                      this.functions.updateLocationDistances.bind(this)(coords);
                    });
                  }
                });

                return false;
              });

              this.$modal.on('click' + this.namespace, '.cc-popup-close, .cc-popup-background', () => {
                popup.close();
              });

              this.$container.removeClass(loadingClass);

              if (this.transitionDurationMS > 0) {
                var newHeight = this.$container.find('.store-availability-container').outerHeight();
                this.$container.css('height', newHeight > 0 ? newHeight + 'px' : '');
                clearTimeout(this.removeFixedHeightTimeout);
                this.removeFixedHeightTimeout = setTimeout(() => {
                  this.$container.css('height', '');
                }, this.transitionDurationMS);
              }
            }
          });
        }
      } };


    // Initialise the section when it's instantiated
    this.onSectionLoad(container);
  };

  // Register section
  cc.sections.push({
    name: 'store-availability',
    section: theme.StoreAvailability });



  // ensure root_url ends in a slash
  if (!/\/$/.test(theme.routes.root_url)) theme.routes.root_url += '/';

  /*================ General Barry Bits ================*/
  theme.icons = {
    left: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
    right: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
    close: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
    chevronLightLeft: '<svg fill="#000000" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M 14.51,6.51 14,6 8,12 14,18 14.51,17.49 9.03,12 Z"></path></svg>',
    chevronLightRight: '<svg fill="#000000" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M 10,6 9.49,6.51 14.97,12 9.49,17.49 10,18 16,12 Z"></path></svg>',
    chevronDown: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/><path d="M0-.75h24v24H0z" fill="none"/></svg>',
    tick: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    add: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
    loading: '<svg xmlns="http://www.w3.org/2000/svg" style="margin: auto; background: transparent; display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><circle cx="50" cy="50" fill="none" stroke="currentColor" stroke-width="5" r="35" stroke-dasharray="164.93361431346415 56.97787143782138" transform="rotate(263.279 50 50)"><animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform></circle></svg>',
    chevronRight: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0-.25H24v24H0Z" transform="translate(0 0.25)" style="fill:none"></path><polyline points="10 17.83 15.4 12.43 10 7.03" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:8;stroke-width:1.5px"></polyline></svg>',
    chevronLeft: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0-.25H24v24H0Z" transform="translate(0 0.25)" style="fill:none"/> <polyline points="14.4 7.03 9 12.43 14.4 17.83" style="fill:none;stroke:currentColor;stroke-linecap:round;stroke-miterlimit:8;stroke-width:1.5px"/></svg>' };


  theme.swipers = {};

  theme.productData = {};

  theme.viewport = {
    isXs: () => {
      return $(window).outerWidth() < 768;
    },
    isSm: () => {
      return $(window).outerWidth() >= 768;
    },
    isMd: () => {
      return $(window).outerWidth() >= 992;
    },
    isLg: () => {
      return $(window).outerWidth() >= 1200;
    },
    isXlg: () => {
      return $(window).outerWidth() >= 1441;
    },
    scroll: {
      currentScrollTop: -1,

      to: function to($elem) {var scrollTop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;var cb = arguments.length > 3 ? arguments[3] : undefined;
        if ($elem && typeof $elem === 'string') {
          $elem = $($elem);
        }

        if (scrollTop === -1 && $elem && $elem.length) {
          var navHeight = theme.Nav().bar.isInline() ? 0 : theme.Nav().bar.height();
          scrollTop = $elem.offset().top - navHeight - offset;
        }

        $('html,body').animate({ scrollTop }, 700, () => {
          if (cb) {
            cb();
          }
        });
      },

      // Locks scrolling on the body in place
      lock: () => {
        theme.viewport.scroll.currentScrollTop = window.scrollY;

        //Set the body top to the current scroll position so we dont get jumped to the top
        document.body.style.top = -window.scrollY + 'px';
        document.body.style.width = '100%';
        document.body.style.position = 'fixed';

        if (document.body.scrollHeight > window.outerHeight) {
          //There is a vertical scrollbar, compensate for that
          document.body.style.overflowY = 'scroll';
        }
      },

      unlock: () => {
        document.body.style.top = null;
        document.body.style.overflowY = null;
        document.body.style.width = null;
        document.body.style.position = null;
        window.scrollTo({ top: theme.viewport.scroll.currentScrollTop, behavior: 'instant' });
      } }

    // ,
    // isElementInView: (el) => {
    //   // Special bonus for those using jQuery
    //   if (typeof jQuery === "function" && el instanceof jQuery) {
    //     el = el[0];
    //   }
    //
    //   var rect = el.getBoundingClientRect();
    //
    //   return (
    //     rect.top >= 0 &&
    //     rect.left >= 0 &&
    //     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    //     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    //   );
    // },
  };

  theme.device = {
    cache: {
      isTouch: null,
      isRetinaDisplay: null },

    isTouch: () => {
      if (theme.device.cache.isTouch !== null) {
        return theme.device.cache.isTouch;
      } else {
        try {
          document.createEvent("TouchEvent");
          theme.device.cache.isTouch = true;
        } catch (e) {
          theme.device.cache.isTouch = false;
        } finally {
          return theme.device.cache.isTouch;
        }
      }
    },
    isRetinaDisplay() {
      if (theme.device.cache.isRetinaDisplay !== null) {
        return theme.device.cache.isRetinaDisplay;
      } else {
        if (window.matchMedia) {
          var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
          theme.device.cache.isRetinaDisplay = mq && mq.matches || window.devicePixelRatio > 1;
        } else {
          theme.device.cache.isRetinaDisplay = false;
        }
        return theme.device.cache.isRetinaDisplay;
      }
    } };


  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
      i,
      el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while (i < 0 && (el = el.parentElement));
      return el;
    };
  }
  ;

  /*================ Components ================*/
  theme.Nav = function () {var $navBar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $('#site-control');
    return {
      bar: {
        //Actions
        turnOpaque: (_turnOpaque) => {
          if (_turnOpaque) {
            $navBar.addClass('nav-opaque');
          } else {
            $navBar.removeClass('nav-opaque');
          }
        },
        hide: (_hide) => {
          if (_hide) {
            $navBar.addClass('nav-hidden');
          } else {
            $navBar.removeClass('nav-hidden');
          }
        },
        fadeOut: (_fadeOut) => {
          if (_fadeOut) {
            $navBar.addClass('nav-fade-out');
          } else {
            $navBar.removeClass('nav-fade-out');
          }
        },
        hideAnnouncement: (hide) => {
          if (hide) {
            $navBar.addClass('announcement-hidden');
          } else {
            $navBar.removeClass('announcement-hidden');
          }
        },

        //Note: Don't reference $navBar below as the object may have changed (if in theme editor)

        //Settings
        hasOpaqueSetting: () => {
          return $('#site-control').data('opacity').includes('opaque');
        },
        hasStickySetting: () => {
          return $('#site-control').data('positioning') === "sticky";
        },
        isInline: () => {
          return $('#site-control').data('positioning') === "inline";
        },
        hasInlineLinks: () => {
          return $('#site-control.nav-inline-desktop').length === 1;
        },
        getPositionSetting: () => {
          return $('#site-control').data('positioning');
        },
        getOpacitySetting: () => {
          return $('#site-control').data('opacity');
        },

        //Current state
        isCurrentlyOpaque: () => {
          return $('#site-control').hasClass('nav-opaque');
        },
        isAnnouncementBar: () => {
          return $('#site-control').find('.cc-announcement__inner').length === 1;
        },
        hasLocalization: () => {
          return $('#site-control').hasClass('has-localization');
        },
        heightExcludingAnnouncementBar: () => {
          return Math.round($('#site-control').find('.site-control__inner').outerHeight());
        },
        heightOfAnnouncementBar: () => {
          return Math.round($('#site-control').find('.announcement').outerHeight());
        },
        height: () => {
          //Returns the height including the announcement bar
          return Math.round($('#site-control').outerHeight());
        } } };


  };

  theme.ProductMediaGallery = function ($gallery, $thumbs, isFeaturedProduct, isQuickbuy, galleryId) {
    var _this = this;
    var currentMedia;
    var initialisedMedia = {};
    var $viewInSpaceButton = $gallery.find('.view-in-space');
    var $swiperCont = $gallery.find('.swiper-container');
    var swiper;
    var preventSizeRedraw = false;
    var vimeoApiReady = false;
    var isFirstRun = true;
    var mediaCount = $gallery.find('.theme-img:visible').length;
    var isCarouselLayout = $gallery.data('layout') === 'carousel';
    var isGalleryNarrow = $gallery.closest('.product-area').hasClass('product-area--restrict-width');
    var $productThumbnails = $gallery.closest('.product-area').find('.product-area__thumbs');
    var isMediaGroupingEnabled = $gallery.data('variant-image-grouping');
    var underlineSelectedMedia = $gallery.data('underline-selected-media');

    var nav = theme.Nav();

    this.Image = function ($elem, autoplay) {
      this.show = function () {
        $elem.addClass('product-media--activated');
        $elem.show();
      };

      this.play = function () {
        $gallery.find('.product-media--current').removeClass('product-media--current');
        $elem.addClass('product-media--current');
      };

      this.destroy = function () {};
      this.pause = function () {
        $elem.removeClass('product-media--activated');
      };

      this.hide = function () {
        $elem.hide();
      };

      //Init the image
      this.show();
    };

    this.Video = function ($elem, autoplay) {
      var _video = this;
      var playerObj = {
        play: function play() {},
        pause: function pause() {},
        destroy: function destroy() {} };

      var videoElement = $elem.find('video')[0];

      this.show = function () {
        $elem.addClass('product-media--activated');
        $elem.show();
        _this.slideshowTabFix();
      };

      this.play = function () {
        $gallery.find('.product-media--current').removeClass('product-media--current');
        $elem.addClass('product-media--current');
        _video.show();
        playerObj.play();
      };

      this.pause = function () {
        playerObj.pause();
        $elem.removeClass('product-media--activated');
      };

      this.hide = function () {
        playerObj.pause();
        $elem.hide();
      };

      this.destroy = function () {
        playerObj.destroy();
        $(videoElement).off('playing', handlePlay);
        $(document).off('fullscreenchange', delayedSwiperResize);
      };

      //Init the video
      theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.css');

      // set up a controller for Plyr video
      window.Shopify.loadFeatures([{
        name: 'video-ui',
        version: '1.0',
        onLoad: function () {
          playerObj = {
            playerType: 'html5',
            element: videoElement,
            plyr: new Shopify.Plyr(videoElement, {
              controls: [
              'play',
              'progress',
              'mute',
              'volume',
              'play-large',
              'fullscreen'],

              loop: {
                active: $elem.data('enable-video-looping') },

              autoplay: theme.viewport.isSm() && autoplay,
              hideControlsOnPause: true,
              iconUrl: '//cdn.shopify.com/shopifycloud/shopify-plyr/v1.0/shopify-plyr.svg',
              tooltips: {
                controls: false,
                seek: true } }),


            play: function play() {
              this.plyr.play();
            },
            pause: function pause() {
              this.plyr.pause();
            },
            destroy: function destroy() {
              this.plyr.destroy();
            } };

          $elem.addClass('product-media--video-loaded');

          // Disable swipe on the model
          $elem.find('.plyr__controls').addClass('swiper-no-swiping');

          initialisedMedia[$elem.data('media-id')] = _video;
        }.bind(this) }]);


      function handlePlay() {
        _this.pauseAllMedia($elem.data('media-id'));
      }

      $(videoElement).on('playing', handlePlay);

      function delayedSwiperResize(event) {
        preventSizeRedraw = true;

        // If not fullscreen
        if (window.innerHeight !== screen.height) {
          setTimeout(function () {
            preventSizeRedraw = true;
          }, 200);
        }
      }

      //When fullscreen ends, trigger a delayed resize to ensure swiper resets correctly
      $(document).on('fullscreenchange', delayedSwiperResize);

      _video.show();
    };

    this.ExternalVideo = function ($elem, autoplay) {
      var isPlaying = false;
      var _video = this;
      var playerObj = {
        play: function play() {},
        pause: function pause() {},
        destroy: function destroy() {} };

      var iframeElement = $elem.find('iframe')[0];

      this.play = function () {
        $gallery.find('.product-media--current').removeClass('product-media--current');
        $elem.addClass('product-media--current');
        _video.show();
        playerObj.play();
      };

      this.togglePlayPause = function () {
        if (isPlaying) {
          _video.pause();
        } else {
          _video.play();
        }
      };

      this.pause = function () {
        playerObj.pause();
        $elem.removeClass('product-media--activated');
      };

      this.show = function () {
        $elem.addClass('product-media--activated');
        $elem.show();
        _this.slideshowTabFix();
      };

      this.hide = function () {
        playerObj.pause();
        $elem.hide();
      };

      this.destroy = function () {
        playerObj.destroy();
        $elem.off('click', '.product-media--video-mask', _video.togglePlayPause);
      };

      //Init the external videoSingle 3d model only
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(iframeElement.src)) {
        var loadYoutubeVideo = function loadYoutubeVideo() {
          playerObj = {
            playerType: 'youtube',
            element: iframeElement,
            player: new YT.Player(iframeElement, {
              videoId: $elem.data('video-id'),
              events: {
                onReady: function onReady() {
                  initialisedMedia[$elem.data('media-id')] = _video;

                  $elem.addClass('product-media--video-loaded');

                  if (autoplay && theme.viewport.isSm()) {
                    _video.play();
                  }
                },
                onStateChange: function onStateChange(event) {
                  if (event.data === 1) {
                    _this.pauseAllMedia($elem.data('media-id'));
                  }
                  isPlaying = event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.UNSTARTED;

                  if (event.data === 0 && $elem.data('enable-video-looping')) {
                    event.target.seekTo(0);
                  }
                } } }),


            play: function play() {
              this.player.playVideo();
            },
            pause: function pause() {
              this.player.pauseVideo();
            },
            destroy: function destroy() {
              this.player.destroy();
            } };

        };

        if (window.YT && window.YT.Player) {
          loadYoutubeVideo();
        } else {
          // set up a controller for YouTube video
          var temp = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function () {
            temp();
            loadYoutubeVideo();
          };

          theme.loadScriptOnce('https://www.youtube.com/iframe_api');
        }
      } else if (/vimeo\.com/.test(iframeElement.src)) {
        var loadVimeoVideos = function loadVimeoVideos() {
          if (vimeoApiReady) {
            if ($elem.data('enable-video-looping')) {
              iframeElement.setAttribute('src', iframeElement.getAttribute('src') + '&loop=1');
            }

            if (autoplay && $(window).width() >= 768) {
              iframeElement.setAttribute('src', iframeElement.getAttribute('src') + '&autoplay=1&muted=1');
            }

            playerObj = {
              playerType: 'vimeo',
              element: iframeElement,
              player: new Vimeo.Player(iframeElement),
              play: function play() {
                this.player.play();
              },
              pause: function pause() {
                this.player.pause();
              },
              destroy: function destroy() {
                this.player.destroy();
              } };


            playerObj.player.ready().then(function () {
              initialisedMedia[$elem.data('media-id')] = _video;
              $elem.addClass('product-media--video-loaded');
            });

          } else {
            theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function () {
              vimeoApiReady = true;
              loadVimeoVideos();
            });
          }
        };
        loadVimeoVideos();
      }

      $elem.on('click', '.product-media--video-mask', _video.togglePlayPause);

      _video.show();
    };

    this.Model = function ($elem, autoplay) {
      var _model = this;
      var playerObj = {
        play: function play() {},
        pause: function pause() {},
        destroy: function destroy() {} };

      var modelElement = $elem.find('model-viewer')[0];

      this.show = function () {
        $elem.show();
        $elem.addClass('product-media--activated');
        _this.slideshowTabFix();
        _model.updateViewInSpaceButton();
      };

      this.updateViewInSpaceButton = function () {
        if (window.ShopifyXR && $viewInSpaceButton.length) {
          //Change the view in space button to launch this model
          $viewInSpaceButton.attr('data-shopify-model3d-id', $elem.data('media-id'));
          window.ShopifyXR.setupXRElements();
        }
      };

      this.play = function () {
        $gallery.find('.product-media--current').removeClass('product-media--current');
        $elem.addClass('product-media--current');
        _model.show();
        playerObj.play();
      };

      this.pause = function () {
        $elem.removeClass('product-media--activated');
        playerObj.pause();
      };

      this.hide = function () {
        playerObj.pause();
        $elem.hide();

        if (window.ShopifyXR && $viewInSpaceButton.length) {
          //Reset the view in space button to launch the first model
          $viewInSpaceButton.attr('data-shopify-model3d-id', $viewInSpaceButton.data('shopify-model3d-first-id'));
          $viewInSpaceButton.attr('data-shopify-title', $viewInSpaceButton.data('shopify-first-title'));
          window.ShopifyXR.setupXRElements();
        }
      };

      this.destroy = function () {
        //Nothing needed
      };

      this.initAugmentedReality = function () {
        if ($('.model-json', $gallery).length) {
          var doInit = function doInit() {
            if (!window.ShopifyXR) {
              document.addEventListener('shopify_xr_initialized', function shopifyXrEventListener(event) {
                doInit();

                //Ensure this only fires once
                event.target.removeEventListener(event.type, shopifyXrEventListener);
              });

              return;
            }

            window.ShopifyXR.addModels(JSON.parse($('.model-json', $gallery).html()));
            window.ShopifyXR.setupXRElements();
          };

          window.Shopify.loadFeatures([{
            name: 'shopify-xr',
            version: '1.0',
            onLoad: doInit }]);

        }
      };

      //Init the model
      theme.loadStyleOnce('https://cdn.shopify.com/shopifycloud/model-viewer-ui/assets/v1.0/model-viewer-ui.css');

      window.Shopify.loadFeatures([
      {
        name: 'model-viewer-ui',
        version: '1.0',
        onLoad: function () {
          playerObj = new Shopify.ModelViewerUI(modelElement);
          $elem.addClass('product-media--model-loaded');

          if (autoplay && theme.viewport.isSm()) {
            _model.play();
          }

          // add mouseup event proxy to fix carousel swipe gestures
          $('<div class="theme-event-proxy">').on('mouseup', function (e) {
            e.stopPropagation();
            e.preventDefault();
            document.dispatchEvent(new MouseEvent('mouseup'));
          }).appendTo(
          $(this).find('.shopify-model-viewer-ui__controls-overlay'));


          // Prevent the buttons from submitting the form
          $elem.find('button').attr('type', 'button');

          // Disable swipe on the model
          $elem.find('.shopify-model-viewer-ui').addClass('swiper-no-swiping');

        }.bind(this) }]);



      $elem.find('model-viewer').on('shopify_model_viewer_ui_toggle_play', function () {
        _this.pauseAllMedia($elem.data('media-id'));
        $elem.addClass('product-media-model--playing');
        $gallery.on('click', '.product-media:not([data-media-type="model"])', _model.pause);
      });

      $elem.find('model-viewer').on('shopify_model_viewer_ui_toggle_pause', function () {
        $elem.removeClass('product-media-model--playing');
        $gallery.off('click', '.product-media:not([data-media-type="model"])', _model.pause);
      });

      $elem.on('click', '.product-media--model-mask', function () {
        if (isCarouselLayout) {
          //If we're on a featured product, delay the initialisation of the model until the current slide has changed
          _this.swipeToSlideIfNotCurrent($elem);
          setTimeout(_model.play, 500);
        } else {
          _model.play();
        }
      });

      initialisedMedia[$elem.data('media-id')] = _model;

      _model.show();

      if (!window.ShopifyXR) {
        _model.initAugmentedReality();
      }
    };

    this.pauseAllMedia = function (ignoreKey) {
      for (var key in initialisedMedia) {
        if (initialisedMedia.hasOwnProperty(key) && (!ignoreKey || key != ignoreKey)) {
          initialisedMedia[key].pause();
        }
      }
    };

    this.showMedia = function ($mediaToShow, autoplay, preventHide) {
      //In with the new
      if ($mediaToShow.length) {
        //Out with the old
        if (currentMedia && !preventHide) {
          currentMedia.pause();
        }

        //Function to instantiate and return the relevant media
        var getMedia = function getMedia(MediaType) {
          var media;

          if (initialisedMedia.hasOwnProperty($mediaToShow.data('media-id'))) {
            media = initialisedMedia[$mediaToShow.data('media-id')];

            if (autoplay && theme.viewport.isSm()) {
              media.show();
              //Delay play so its easier for users to understand that it paused
              setTimeout(media.play, 250);
            } else {
              media.show();
            }
          } else {
            media = new MediaType($mediaToShow, autoplay);
          }

          return media;
        };

        //Initialise the media
        if ($mediaToShow.data('media-type') === "image") {
          currentMedia = getMedia(_this.Image);
        } else if ($mediaToShow.data('media-type') === "video") {
          currentMedia = getMedia(_this.Video);
        } else if ($mediaToShow.data('media-type') === "external_video") {
          currentMedia = getMedia(_this.ExternalVideo);
        } else if ($mediaToShow.data('media-type') === "model") {
          currentMedia = getMedia(_this.Model);
        } else {
          console.warn('Media is unknown', $mediaToShow);
          $gallery.find('.product-media:visible').hide();
          $mediaToShow.show();
        }
      }
    };

    this.swipeToSlideIfNotCurrent = function ($elem) {
      var $slide = $elem.closest('.swiper-slide');
      swiper.slideTo($slide.index(), 500);
    };

    this.destroy = function () {
      for (var i = 0; i < initialisedMedia.length; i++) {
        initialisedMedia[i].destroy();
      }

      if (!isCarouselLayout) {
        $(window).off("load.productTemplateGallery".concat(galleryId, " scroll.productTemplateGallery").concat(galleryId), detectHeaderOverGallery);
      }

      $gallery.closest('.product-area').off('click', '.product-area__thumbs__thumb a', handleThumbnailClick);
      $gallery.off('click', '[data-full-size]', handleImageClick);

      $gallery.off('variantImageSelected', _this.pauseAllMedia);
      $(window).off("ccScrollToMedia.productTemplateGallery".concat(galleryId));
      $(window).off(".".concat(galleryId));

      if ($thumbs && $thumbs.length) {
        $thumbs.off('click');
      }

      destroySwiper();
      destroyColumns();

      if ($productThumbnails.length) {
        destroyThumbnails();
      }
    };

    this.slideshowTabFix = function () {
      if (swiper) {
        // which slide are we going to?
        var $activeMedia = $swiperCont.find('.product-media--current'),
        $activeSlide = null;

        if ($activeMedia.length) {
          $activeSlide = $activeMedia.closest('.swiper-slide');
        } else {
          $activeSlide = $swiperCont.find('.swiper-slide.swiper-slide-active');
        }

        // tabindex everything to prevent tabbing into hidden slides
        $activeSlide.find('a, input, button, select, iframe, video, model-viewer, [tabindex]').each(function () {
          if (typeof $(this).data('theme-slideshow-original-tabindex') !== 'undefined') {
            if ($(this).data('theme-slideshow-original-tabindex') === false) {
              $(this).removeAttr('tabindex');
            } else {
              $(this).attr('tabindex', $(this).data('theme-slideshow-original-tabindex'));
            }
          } else {
            $(this).removeAttr('tabindex');
          }
        });
        $($swiperCont.find('.swiper-slide')).not($activeSlide).find('a, input, button, select, iframe, video, model-viewer, [tabindex]').each(function () {
          if (typeof $(this).data('theme-slideshow-original-tabindex') === 'undefined') {
            $(this).data('theme-slideshow-original-tabindex',
            typeof $(this).attr('tabindex') !== 'undefined' ?
            $(this).attr('tabindex') :
            false);

          }
          $(this).attr('tabindex', '-1');
        });
      }
    };

    this.scrollToMedia = function (mediaId) {
      var $variantImage = $("[data-media-id=\"".concat(mediaId, "\"]"));

      //Scroll to that variant image
      if ($variantImage.length && ($('body').hasClass('template-product') || isQuickbuy) && theme.viewport.isSm()) {
        var offset = parseInt($gallery.find('.theme-images').css('padding-top').replace('px', ''));
        var scrollAmount;

        if (!isQuickbuy) {
          scrollAmount = $variantImage.offset().top - offset + 1;

          //If the nav is opaque and sticky, compensate for the nav when scrolling
          if (nav.bar.hasOpaqueSetting() && nav.bar.hasStickySetting() ||
          isGalleryNarrow && nav.bar.hasStickySetting() ||
          $gallery.data('column-count') > 1 && $(window).outerWidth() >= 1100) {
            scrollAmount -= nav.bar.heightExcludingAnnouncementBar();
          }

          //If scrolling up and the nav is set hide on scroll down, subtract the nav from the new position
          if (scrollAmount < $(window).scrollTop() && nav.bar.getPositionSetting() === 'peek' && nav.bar.hasOpaqueSetting()) {
            scrollAmount -= nav.bar.heightExcludingAnnouncementBar();
          }

          scrollAmount = scrollAmount < 200 ? 0 : scrollAmount;
        } else {
          scrollAmount = $variantImage.offset().top - $(window).scrollTop() + $('#quick-buy-modal').scrollTop();
        }

        if ($gallery.data('column-count') === 1 && $(window).outerWidth() >= 1100 && isQuickbuy) {
          scrollAmount -= isGalleryNarrow ? 60 : -1; //The distance from the top of the viewport
        }

        if (isQuickbuy) {
          $('#quick-buy-modal').animate({
            scrollTop: scrollAmount },
          800);
        } else {
          $('html,body').animate({
            scrollTop: scrollAmount },
          800);
        }
      }
    };

    function detectHeaderOverGallery() {
      var nav = theme.Nav();
      $('body').toggleClass('header-over-gallery', $(window).scrollTop() < $gallery.height() - nav.bar.height());
    }

    function initColumns() {
      var columns = $gallery.data('column-count');
      var isCollage = $gallery.data('layout') === 'collage';

      if (isCollage) {
        var $collageImages = $gallery.find('.theme-img:visible');
        $collageImages.first().addClass('theme-img--collage-full');
        // $collageImages.last().addClass('theme-img--collage-last');
      }

      var $elements = $gallery.find('.theme-img:visible:not(.theme-img--collage-full)');

      var $finalImage,offset = 0;
      if ($elements.length % 2 > 0 && isCollage) {
        $finalImage = $elements.children().last();
        offset = 1;
      }

      var elementsPerCol = Math.ceil(($elements.length - offset) / columns);
      var $colContainer = $gallery.find('.theme-images');
      var currentCol = -1;
      var $colWrapper;

      if (columns > 1 && $elements.length - offset > 1) {
        $elements.each(function (i) {
          if (offset === 0 || i < $elements.length - offset) {
            if (currentCol < Math.floor(i / elementsPerCol)) {
              $colWrapper = $("<div class=\"media-column\"></div>").appendTo($colContainer);
              currentCol++;
            }

            $(this).appendTo($colWrapper);
          }
        });
      }

      if ($finalImage) {
        $finalImage.parent().addClass('theme-img--collage-full').addClass('theme-img--collage-last').appendTo($colContainer);
      }
    }

    function destroyColumns() {
      var $colContainer = $gallery.find('.theme-images');
      $colContainer.find('.theme-img').each(function () {
        $(this).appendTo($colContainer).removeClass('theme-img--collage-full').removeClass('theme-img--collage-last');
      });
      $(window).off('debouncedresize.columnheights');

      $colContainer.find('.media-column').remove();
    }

    //Check if media should be displayed in columns
    if (theme.viewport.isSm() && $gallery.data('column-count') === 2) {
      setTimeout(initColumns, 0);
    }

    //Init all media
    $gallery.find('.product-media').each(function (index) {
      _this.showMedia($(this), false, true);
    });

    //Init swiper
    var $swiperExternalVideos = $swiperCont.find('[data-media-type="external_video"]');

    //Scrolls to the media of the clicked thumbnail
    function handleThumbnailClick(e) {
      e.preventDefault();
      var mediaId = $(this).closest('[data-media-thumb-id]').data('media-thumb-id');
      var $media = $gallery.find(".product-media[data-media-id=\"".concat(mediaId, "\"]"));
      //Scroll to that variant image
      if ($media.length) {
        //fixed and not data-opacity="transparent"
        $gallery.closest('.product-area').find('.thumb-active').removeClass('thumb-active');
        $(this).addClass('thumb-active');
        setTimeout(() => {_this.scrollToMedia(mediaId);}, 0);
      }

      return false;
    }

    //Opens the zoom modal
    function handleImageClick() {
      var nav = theme.Nav();

      if (theme.viewport.isSm()) {
        var thisSmallSizeImageUrl = $(this).find('.rimage-wrapper > img')[0].currentSrc;
        var $allImages = $(this).closest('.theme-images').find('[data-full-size]:visible');
        var imageHtml = "<a href=\"#\" data-modal-close class=\"modal-close\">&times;</a>";

        $allImages.each(function () {
          var smallSizeImageUrl = $(this).find('.rimage-wrapper > img')[0].currentSrc;
          var fullSizeImageUrl = $(this).data('full-size');
          var extraAttrs = thisSmallSizeImageUrl === smallSizeImageUrl ? "id='zoom-image'" : "";

          //Build the html for the images within the modal
          imageHtml += "<img class=\"zoom-image\" ".concat(extraAttrs, " src=\"").concat(smallSizeImageUrl, "\" data-full-size=\"").concat(fullSizeImageUrl, "\"/>");
        });

        showThemeModal($('<div class="theme-modal theme-modal--fullscreen temp -light"  role="dialog" aria-modal="true"/>').append("\n           <div class='inner-scroller -out'>".concat(
        imageHtml, "</div>")), 'product-image', function ($modal) {

          var $mainImage = $('#zoom-image');
          $mainImage.attr('src', $mainImage.data('full-size'));

          setTimeout(() => {
            //Set full resolution of the other images
            $modal.find('[data-full-size]').each(function () {
              $(this).attr('src', $(this).data('full-size'));
            });
          }, 100);

          setTimeout(() => {
            //Scroll to the middle of the image
            $modal.scrollTop($mainImage.position().top + ($mainImage.outerHeight() / 2 - $modal.outerHeight() / 2));

            //Scroll to the top of the image
            $modal.find('.inner-scroller').removeClass('-out');
          }, 1000);
        });
      }
    }

    // Bind listeners
    if ($gallery.hasClass('theme-gallery--thumbs-enabled')) {
      $gallery.closest('.product-area').on('click', '.product-area__thumbs__thumb a', handleThumbnailClick);
    }

    if ($gallery.hasClass('theme-gallery--zoom-enabled')) {
      $gallery.on('click', '[data-full-size]', handleImageClick);
    }

    $(window).off("ccScrollToMedia.productTemplateGallery".concat(galleryId)).on("ccScrollToMedia.productTemplateGallery".concat(
    galleryId), function (e, mediaId) {
      if ($gallery.data('scroll-to-variant-media') !== false || theme.viewport.isXs()) {
        setTimeout(() => {_this.scrollToMedia(mediaId);}, 0);
      }
    });

    if (!isCarouselLayout) {
      $(detectHeaderOverGallery);
      // indicate if header over the gallery
      $(window).on("scroll.productTemplateGallery".concat(galleryId), detectHeaderOverGallery);
    } else {
      // set external video dimensions for featured products
      $swiperExternalVideos.each(function () {
        $(this).width($gallery.outerHeight() * $(this).data('aspectratio'));
      });
    }

    function initThumbnails() {
      $('.carousel-wrapper .carousel:not(.slick-initialized)', $productThumbnails).each(function ($slick) {
        $(this).on('init reInit setPosition', function () {
          var lastSlide = $(this).find('.slick-slide:last');
          if (lastSlide.length > 0) {
            var slideInnerWidth = lastSlide.position().left + lastSlide.outerWidth(true);
            var $carouselWrapper = $(this).parent();
            var carouselWidth = $carouselWrapper.outerWidth(true);

            if (carouselWidth > slideInnerWidth) {
              $(this).find('.slick-next, .slick-prev').addClass('theme-unnecessary').attr('tabindex', '-1');
            } else {
              $(this).find('.slick-next, .slick-prev').removeClass('theme-unnecessary').attr('tabindex', '0');
            }
          }
        }).on('init reInit setPosition', function ($slick) {
          $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');
          setTimeout(function () {
            $($slick.target).find('.slick-slide a').attr('tabindex', '0');
          });
        }).slick({
          autoplay: false,
          fade: false,
          infinite: false,
          useTransform: true,
          arrows: true,
          dots: false,
          slidesToShow: 5,
          slidesToScroll: 5,
          centerMode: false,
          verticalSwiping: true,
          vertical: true,
          prevArrow: '<button type="button" class="slick-prev" aria-label="' + theme.strings.previous + '">' + theme.icons.chevronDown + '</button>',
          nextArrow: '<button type="button" class="slick-next" aria-label="' + theme.strings.next + '">' + theme.icons.chevronDown + '</button>',
          responsive: [
          {
            breakpoint: 1100,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3 } },


          {
            breakpoint: 1400,
            settings: {
              slidesToShow: 4,
              slidesToScroll: 4 } }] });




      });

      if (theme.viewport.isMd()) {
        _this.adjustGalleryMargin = () => {
          $gallery.css('margin-top', "-".concat($productThumbnails.outerHeight(), "px"));
        };
        _this.adjustGalleryMargin();
        $(window).on('resize.thumbHeight', _this.adjustGalleryMargin);
        $(window).on('debouncedresizewidth.thumbHeight', _this.adjustGalleryMargin);
      }
    }

    function destroyThumbnails() {
      $('.carousel-wrapper .carousel', $productThumbnails).off('init reInit setPosition');
      $('.slick-slider', $productThumbnails).slick('unslick');
      $(window).off('resize.thumbHeight');
      $(window).off('debouncedresizewidth.thumbHeight');
    }

    function toggleThumbnailVisibility() {
      $('.slick-slider', $productThumbnails).slick('slickFilter', '[data-cc-hidden="false"]');
    }
    // Hides the irrelevant variant media
    function initVariantImageGrouping() {
      var productData = theme.OptionManager.getProductData(null, $gallery.data('product-id'));

      if (productData.media && productData.media.length > 1 &&
      productData.variants && productData.variants.length > 1 &&
      productData.options && productData.options.length > 0) {

        var getFirstMatchingOptionIndex = function getFirstMatchingOptionIndex(productOptions) {
          productOptions = productOptions.map((option) => option.toLowerCase());

          var colorOptions = $gallery.data('variant-image-grouping-option').split(',');

          for (var colorOption of colorOptions) {
            var index = productOptions.indexOf(colorOption.trim());
            if (index > -1) {
              return index;
            }
          }

          return -1;
        };

        var colorOptionIndex = getFirstMatchingOptionIndex(productData.options);

        //If this product contains a grouping field (eg Color)
        if (colorOptionIndex > -1) {
          var mediaByVariantColor = [];
          productData.variants.forEach((variant) => {
            if (variant.featured_media) {
              if (!mediaByVariantColor[variant.featured_media.id]) {
                mediaByVariantColor[variant.featured_media.id] = [];
              }
              mediaByVariantColor[variant.featured_media.id].push(variant.options[colorOptionIndex]);
            }
          });

          var previousColor;
          var slideContainer = $gallery[0].querySelector('.theme-images');
          var allSlides = $gallery[0].querySelectorAll('.theme-img');

          $gallery.on('variantImageSelected', (e, variant) => {
            var targetColor = variant.options[colorOptionIndex];
            var currentColor,newMediaVisible = false;

            //Only update the thumbnails when the color changes
            if (previousColor != targetColor) {
              if (isCarouselLayout || theme.viewport.isXs()) {
                slideContainer.innerHTML = "";
                slideContainer.append(...allSlides);
              }

              if ($productThumbnails.length) {
                $('.slick-slider', $productThumbnails).slick('slickUnfilter');
              }

              productData.media.forEach((media) => {
                if (mediaByVariantColor[media.id]) {
                  currentColor = mediaByVariantColor[media.id];
                }

                var mediaElement = $gallery[0].querySelector("[data-media-id=\"".concat(media.id, "\"]"));
                if (mediaElement) {
                  var showMedia = !!(currentColor && currentColor.includes(targetColor));
                  if (mediaElement.parentElement.getAttribute('aria-hidden') == showMedia.toString()) {
                    newMediaVisible = true;
                  }

                  //Remove images which precede any variant image
                  if (!currentColor) {
                    mediaElement.parentElement.remove();
                  }

                  mediaElement.parentElement.setAttribute('aria-hidden', !showMedia);

                  if (isCarouselLayout || theme.viewport.isXs()) {
                    if (showMedia) {
                      // Lazy load any media that needs it
                      var lazyImage = mediaElement.querySelector('.lazyload--manual');
                      if (lazyImage) {
                        lazyImage.classList.remove('lazyload--manual');
                        lazyImage.classList.add('lazyload');
                      }
                    } else {
                      mediaElement.parentElement.remove();
                    }
                  }

                  if ($productThumbnails.length) {
                    var thumbnailElement = $productThumbnails[0].querySelector("[data-media-thumb-id=\"".concat(media.id, "\"]"));
                    if (thumbnailElement) {
                      thumbnailElement.setAttribute('data-cc-hidden', !showMedia);
                    }
                  }
                }
              });

              if (isCarouselLayout && newMediaVisible) {
                updateSwiperSlidesPerView();
              }

              if (theme.viewport.isSm() && $gallery.data('column-count') === 2 && !isFirstRun && newMediaVisible) {
                //Reinit columns/collage
                setTimeout(() => {
                  destroyColumns();
                  initColumns();
                }, 0);
              }

              if ($productThumbnails.length) {
                setTimeout(toggleThumbnailVisibility, 0);
              }

              isFirstRun = false;
              previousColor = targetColor;
            }
          });
        }
      }
    }

    // Check the number of visible media and update the carousel options accordingly
    function updateSwiperSlidesPerView() {
      var visibleSlides = $gallery[0].querySelectorAll('.theme-img:not([aria-hidden="true"])');
      var swiperId = $gallery.find('.swiper-container:first').attr('data-swiper-id');
      if (swiperId) {
        var thisSwiper = theme.swipers[swiperId];
        if (thisSwiper && thisSwiper.params) {
          thisSwiper.params.breakpoints[10000].slidesPerView = visibleSlides.length < 2 ? 1 : 2;
          $gallery.attr('data-media-count', visibleSlides.length);
          thisSwiper.currentBreakpoint = false;
          thisSwiper.update();
        }
      }
    }

    if (isMediaGroupingEnabled) {
      initVariantImageGrouping();
    }

    var initialisedSectionVariants = [];
    $gallery.on('variantImageSelected', function (e, args) {
      _this.pauseAllMedia();

      var $container = $(this);
      var sectionId = $container.closest('[data-section-id]').data('section-id');

      if ($(this).find('.swiper-container-horizontal').length) {
        var swiperId = $('.swiper-container:first', this).attr('data-swiper-id');
        var swiper = theme.swipers[swiperId];
        var $swiperContainer = this;

        setTimeout(function () {
          var matchIndex = 0,$match;
          $('.swiper-container:first .swiper-slide:not([aria-hidden="true"]) .product-media', $swiperContainer).each(function (index) {
            if ($(this).data('media-id') == args.featured_media.id) {
              matchIndex = index;
              $match = $(this);
            }
          });

          swiper.update();
          swiper.slideTo(matchIndex, theme.viewport.isXs() ? 500 : 800);

          if (underlineSelectedMedia) {
            $container.find('.product-media--active-variant').removeClass('product-media--active-variant');

            if ($match) {
              $match.closest('.product-media').addClass('product-media--active-variant');
            }
          }
        }, args.eventType === 'firstrun' ? 1500 : 0);
        //Above: If its the first page load, wait 1.5s for media to load

      } else if (!$(this).hasClass('featured-product__gallery')) {
        var isFirstSection = $container.closest('.shopify-section').index() === 0;
        if (isFirstSection || initialisedSectionVariants.includes(sectionId)) {
          $(window).trigger('ccScrollToMedia', args.featured_media.id);
        }
        initialisedSectionVariants.push(sectionId);

        if ($gallery.data('column-count') > 1 && underlineSelectedMedia) {
          $gallery.find('.product-media--active-variant').removeClass('product-media--active-variant');
          $gallery.find("[data-media-id=\"".concat(args.featured_media.id, "\"]")).addClass('product-media--active-variant');
        }
      }

      setTimeout(() => {
        //If thumbs, scroll to the active one and add a class to it
        var $thumbSlider = $("[data-section-id=\"".concat(sectionId, "\"] .product-area__thumbs .carousel.slick-initialized"));
        if ($thumbSlider.length === 1 && ($container.data('scroll-to-variant-media') !== false || theme.viewport.isXs())) {
          var $activeSlide = $thumbSlider.find("[data-media-thumb-id=\"".concat(args.featured_media.id, "\"]:first"));
          if ($activeSlide.length) {
            $thumbSlider.find('.thumb-active').removeClass('thumb-active');
            $activeSlide.find('a').addClass('thumb-active');
            $thumbSlider.slick('slickGoTo', $activeSlide.data('slick-index'));
          }
        }
      }, 0);
    });

    function initSwiper() {
      destroyColumns();

      var extraSwiperOpts = {};

      if ($swiperCont.data('swiper-nav-style') === 'dots') {
        extraSwiperOpts = {
          dynamicBullets: true,
          pagination: {
            el: $swiperCont.find('.swiper-pagination')[0],
            dynamicBullets: true } };


      } else {
        extraSwiperOpts = {
          navigation: {
            nextEl: $swiperCont.find('.swiper-button-next')[0],
            prevEl: $swiperCont.find('.swiper-button-prev')[0] } };


      }

      //Init swiper
      var swiperOpts = _objectSpread(_objectSpread({
        mode: 'horizontal',
        loop: false,
        resizeReInit: true,
        autoHeight: false,
        scrollContainer: true,
        grabCursor: true,
        createPagination: false,
        preventClicks: false,
        freeMode: false,
        freeModeFluid: false,
        slidesPerView: mediaCount > 1 ? 2 : 1,
        spaceBetween: isCarouselLayout && isGalleryNarrow || isFeaturedProduct ? 20 : 0,
        dynamicBullets: false,
        mousewheel: {
          invert: true,
          forceToAxis: true },

        scrollbar: {
          el: $swiperCont.find('.swiper-scrollbar')[0],
          draggable: true } },

      extraSwiperOpts), {}, {
        breakpoints: {
          767: _objectSpread({
            autoHeight: true,
            slidesPerView: 1,
            spaceBetween: 0,
            freeMode: false,
            freeModeFluid: false },
          extraSwiperOpts),

          1199: {
            slidesPerView: 1 },

          10000: {
            slidesPerView: mediaCount > 1 ? 2 : 1 } },


        on: {
          init: function init() {
            lazySizes.autoSizer.checkElems();
            $swiperCont.find('.swiper-slide-active .lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');

            var lazyLoadDelay = 500;

            if (theme.viewport.isXs()) {
              lazyLoadDelay = window.localStorage.getItem('is_first_visit') === null ? 6000 : 2000;
            }

            //Lazy load all slider images
            setTimeout(function () {
              $swiperCont.find('.lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');
            }, lazyLoadDelay);

            //Hack for iPhone X - where loading the page on slower connection sometimes causes Swiper to steal focus
            if (theme.viewport.isXs() && $('.product-detail__form__options a:not(.size-chart-link)').length && !isCarouselLayout) {
              $('.product-detail__form__options a:not(.size-chart-link):first').focus();
              setTimeout(() => {
                $(window).scrollTop(0);
              }, 500);
            }

            //Hack for Safari (2021/08) - where images don't always draw on mobile screens - switching display mode forces it to redraw correctly
            if (theme.viewport.isXs() && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
              setTimeout(function () {
                $swiperCont.find('.swiper-wrapper').css('display', 'inline-flex').css('vertical-align', 'bottom');
              }, 500);
              setTimeout(function () {
                $swiperCont.find('.swiper-wrapper').css('display', '').css('vertical-align', '');
              }, 1000);
            }
          },
          slideChangeTransitionStart: function slideChangeTransitionStart() {
            //Load the next image if not already
            $swiperCont.find('.swiper-slide-active .lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');
          },
          slideChangeTransitionEnd: function slideChangeTransitionEnd(e) {
            // Pause any media after changing slide
            _this.pauseAllMedia();

            // Update the view in space button on swipe
            if (theme.viewport.isXs() || isCarouselLayout) {
              var $activeMedia = $gallery.find('.swiper-slide-active .product-media');
              var activeMediaObj = initialisedMedia[$activeMedia.data('media-id')];

              if (activeMediaObj) {
                if ($activeMedia.data('media-type') === 'model') {
                  activeMediaObj.updateViewInSpaceButton();
                } else if (window.ShopifyXR && $viewInSpaceButton.length) {
                  //Reset the view in space button to launch the first model
                  $viewInSpaceButton.attr('data-shopify-model3d-id', $viewInSpaceButton.data('shopify-model3d-first-id'));
                  $viewInSpaceButton.attr('data-shopify-title', $viewInSpaceButton.data('shopify-first-title'));
                  window.ShopifyXR.setupXRElements();
                }
              }
            }

            _this.slideshowTabFix();
          } } });



      swiper = new Swiper($swiperCont, swiperOpts);

      var randomId = new Date().getTime();
      theme.swipers[randomId] = swiper;
      $swiperCont.attr('data-swiper-id', randomId);

      var startIndex = $gallery.find('.current-img').index();
      swiper.slideTo(startIndex, 0);

      if (isCarouselLayout) {
        if (underlineSelectedMedia) {
          $gallery.find('.current-img .product-media').addClass('product-media--active-variant');
        }

        if (isMediaGroupingEnabled) {
          updateSwiperSlidesPerView();
        }
      }

      //Disable swipe on single products within the featured product slider
      if ($gallery.hasClass('featured-product__gallery--single')) {
        $swiperCont.addClass('swiper-no-swiping');
      }

      //Fixes bug where the last slide gets cut off if its a model
      setTimeout(function () {
        $(window).trigger('resize');

        //Load lazy images
        lazySizes.autoSizer.checkElems();

        if (swiper) {
          swiper.update();
        }

        //Autoplay the active slide on desktop
        if (theme.viewport.isSm() && !isCarouselLayout) {
          _this.showMedia($swiperCont.find('.swiper-slide.swiper-slide-active .product-media'), false, true);
        }

        if (isCarouselLayout) {
          _this.slideshowTabFix();
        }
      }, isCarouselLayout ? 3000 : 1000);
    }

    function destroySwiper() {
      $swiperCont.removeClass('swiper-no-swiping');
      if (swiper) {
        swiper.destroy(true);
      }
      initColumns();

      if ($productThumbnails.length && theme.viewport.isMd()) {
        initThumbnails();
      }
    }

    var swiperEnabled = false;
    function toggleSwiper() {
      if (theme.viewport.isXs() && !swiperEnabled) {
        swiperEnabled = true;
        initSwiper();
      } else if (theme.viewport.isSm() && swiperEnabled) {
        swiperEnabled = false;
        destroySwiper();
        $swiperCont.find('.lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');
      } else if (theme.viewport.isSm()) {
        $swiperCont.find('.lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');
      }
    }

    $(function () {
      if (isCarouselLayout) {
        initSwiper();
        $(window).on('cc-mobile-viewport-size-change.swiper', () => {
          destroySwiper();
          initSwiper();
        });

      } else {
        toggleSwiper();
        $(window).on('debouncedresize.swiper', toggleSwiper);
      }

      if ($productThumbnails.length) {
        if (theme.viewport.isMd()) {
          initThumbnails();
        }
      }
    });
  };
  ;
  theme.initContentSlider = function (target, afterChange) {
    $('.slideshow', target).each(function () {
      var autoplaySpeed = $(this).data('autoplay-speed') * 1000;
      var speed = $(this).data('transition') == 'instant' ? 0 : 600;

      $(this).on('init', function () {
        $('.slick-current .lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');

        //Lazyload all slide images after a few seconds
        $(function () {
          setTimeout(() => {
            $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');
          }, window.localStorage.getItem('is_first_visit') === null ? 5000 : 2000);
        });

      }).slick({
        autoplay: $(this).data('autoplay'),
        fade: $(this).data('transition') === 'slide' && theme.viewport.isXs() ? false : true,
        speed: speed,
        autoplaySpeed: autoplaySpeed,
        arrows: $(this).data('navigation') == 'arrows',
        dots: $(this).data('navigation') == 'dots',
        // pauseOnHover: $(this).data('transition') != 'instant' || $(this).data('autoplay-speed') > 2, // no pause when quick & instant
        infinite: true,
        useTransform: true,
        prevArrow: '<button type="button" class="slick-prev" aria-label="' + theme.strings.previous + '">' + theme.icons.chevronLeft + '</button>',
        nextArrow: '<button type="button" class="slick-next" aria-label="' + theme.strings.next + '">' + theme.icons.chevronRight + '</button>',
        pauseOnHover: false,
        cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
        lazyLoad: $(this).find('[data-lazy]').length > 0 ? 'ondemand' : null,
        customPaging: function customPaging(slider, i) {
          return "<button class=\"custom-dot\" type=\"button\" data-role=\"none\" role=\"button\" tabindex=\"0\">" + "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" width=\"30px\" height=\"30px\" viewBox=\"0 0 30 30\" xml:space=\"preserve\">" + "<circle class=\"circle-one\" cx=\"15\" cy=\"15\" r=\"13\" />" + "<circle class=\"circle-two\" cx=\"15\" cy=\"15\" r=\"13\" style=\"animation-duration: ".concat(


          autoplaySpeed + speed, "ms\" />") + "</svg>" + "</button>";


        },
        responsive: [
        {
          breakpoint: 768,
          settings: {
            arrows: false, //$(this).data('navigation') == 'arrows',
            dots: $(this).data('navigation') != 'none', // $(this).data('navigation') == 'none' || $(this).data('navigation') == 'dots',
            lazyLoad: $(this).find('[data-lazy]').length > 0 ? 'progressive' : null } }] }).



      on('beforeChange', function (event, slick, currentSlide, nextSlide) {
        $(slick.$slides).filter('.slick--out').removeClass('slick--out');

        //Lazy load the next slide image if not already loaded
        var $unloadedImage = $(slick.$slides.get(nextSlide)).find('.lazyload--manual');
        if ($unloadedImage.length) {
          $unloadedImage.removeClass('lazyload--manual').addClass('lazyload');
        }

        if ($(this).data('transition') === 'slide' || $(this).data('transition') === 'zoom') {
          var $outgoingSlide = $(slick.$slides.get(currentSlide));
          $outgoingSlide.addClass('slick--leaving');
        }
      }).on('afterChange', function (event, slick, currentSlide) {
        $(slick.$slides).filter('.slick--leaving').addClass('slick--out').removeClass('slick--leaving');

        if (afterChange) {
          afterChange(currentSlide);
        }
      });
    });
  };

  theme.initProductSlider = function ($swiperCont) {var isBlog = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var slidesInView = $swiperCont.data('products-in-view');

    var breakpoints = {
      767: {
        slidesPerView: 1.2,
        spaceBetween: 10 },

      900: {
        slidesPerView: slidesInView === 4 || slidesInView === 3 ? 2 : slidesInView },

      1439: {
        slidesPerView: slidesInView === 4 || slidesInView === 3 ? 3 : slidesInView },

      3000: {
        slidesPerView: slidesInView,
        spaceBetween: 20 } };



    if (isBlog) {
      var isFirstPostBig = $swiperCont.data('first-post-big');

      if (isFirstPostBig) {
        breakpoints = {
          767: {
            slidesPerView: 1.2,
            spaceBetween: 10 },

          1024: {
            slidesPerView: 'auto' },

          1600: {
            slidesPerView: 'auto' },

          3000: {
            slidesPerView: 'auto',
            spaceBetween: 20 } };


      } else {
        breakpoints = {
          767: {
            slidesPerView: 1.2,
            spaceBetween: 10 },

          1024: {
            slidesPerView: 2 },

          1600: {
            slidesPerView: 3 },

          3000: {
            slidesPerView: 4,
            spaceBetween: 20 } };


      }
    }

    //Init swiper
    new Swiper($swiperCont, {
      mode: 'horizontal',
      loop: false,
      resizeReInit: true,
      freeMode: true,
      freeModeFluid: true,
      scrollContainer: true,
      grabCursor: true,
      createPagination: false,
      slidesPerView: slidesInView,
      spaceBetween: 20,
      mousewheel: {
        invert: true,
        forceToAxis: true },

      scrollbar: {
        el: $swiperCont.find('.swiper-scrollbar')[0],
        draggable: true },

      navigation: {
        nextEl: $swiperCont.find('.swiper-button-next')[0],
        prevEl: $swiperCont.find('.swiper-button-prev')[0] },

      breakpoints: breakpoints,
      on: {
        init: function init() {
          lazySizes.autoSizer.checkElems();
        } } });


  };

  theme.convertOptionsToBoxes = function (container) {
    // show box-style options
    var $clickies = $(container).find('select[data-make-box]').each(function () {
      $(this).find('option[value=""]').remove(); //Remove 'Pick a' option, if exists
    }).clickyBoxes().parent().addClass('has-clickyboxes');
    $('.selector-wrapper:not(.cc-swatches) .clickyboxes').ccHoverLine({
      lineCss: {
        height: '2px' } });




    // If we have clicky boxes, add the disabled-state to options that have no valid variants
    if ($clickies.length > 0) {
      var productData = theme.OptionManager.getProductData($(container));

      // each option
      for (var optionIndex = 0; optionIndex < productData.options.length; optionIndex++) {
        // list each value for this option
        var optionValues = {};
        for (var variantIndex = 0; variantIndex < productData.variants.length; variantIndex++) {
          var variant = productData.variants[variantIndex];
          if (typeof optionValues[variant.options[optionIndex]] === 'undefined') {
            optionValues[variant.options[optionIndex]] = false;
          }
          // mark true if an option is available
          if (variant.available) {
            optionValues[variant.options[optionIndex]] = true;
          }
        }
        // mark any completely unavailable options
        for (var key in optionValues) {
          if (!optionValues[key]) {
            $('.selector-wrapper:eq(' + optionIndex + ') .clickyboxes li a', container).filter(function () {
              return $(this).attr('data-value') == key;
            }).addClass('unavailable');
          }
        }
      }
    }
  };


  theme.loadInfiniteScroll = function (container, cb) {
    var infiniteLoadCount = 1;

    /// Pagination-replacement
    $('[data-infinite-scroll-container] .pagination.infiniscroll:not(.infinit)', container).addClass('infinit').each(function () {
      var waitForTrigger = $(this).hasClass('wait-for-trigger');
      var $pager = $('<div class="pager-button"><a href="#" aria-label="' + theme.strings.loadMore + '">' + theme.icons.loading + '</a></div>');
      $(this).replaceWith($pager);
      $pager.find('a').attr('href', $(this).find('.next a').attr('href'));

      $pager.on('click', 'a', function (e) {
        if ($(this).hasClass('loading')) {
          return false;
        }
        //Show spinner
        $(this).addClass('loading');
        //Load next page
        var $link = $(this);
        $.get($(this).attr('href'), function (data) {
          infiniteLoadCount++;
          var isCollage = false;
          // var $data = $($.parseHTML(data));
          // //Grab products & insert into page
          // var indexOffset = $('.product-list .product-block').length;
          // var $newProducts = $data.find('.product-list .product-block').hide().appendTo('.product-list').filter('.product-block').each(function(index){
          //   $(this).removeAttr('data-loop-index').data('loop-index', indexOffset + index);
          // });

          var $data = $($.parseHTML(data));
          //Grab products & insert into page
          if ($('[data-infinite-scroll-results].product-list--columns', container).length) {
            //Collage
            isCollage = true;
            var $newProducts = $data.find('[data-infinite-scroll-results]').hide();
            $newProducts.prepend('<h2>' + theme.strings.page.replace('{{ page }}', infiniteLoadCount) + '</h2>');

            var $newProducts = $newProducts.insertBefore('[data-infinite-scroll-container] .pager-button');
          } else {
            //Not collage
            var $newProducts = $data.find('[data-infinite-scroll-results] .product-block').hide().appendTo('[data-infinite-scroll-results]');
          }

          $('[data-infinite-scroll-container]', container).filter('.product-block').each(function (index) {
            $(this).removeAttr('data-loop-index').data('loop-index', index);
            i++;
          });

          //Sort by offset from the top
          //Fix height
          if (!isCollage) {
            $('[data-infinite-scroll-results]', container).height($('[data-infinite-scroll-results]', container).height());

            //Prep entry transitions
            $newProducts.addClass('pre-trans').css('display', '');

            //Find total height to slide to
            var newHeight = 0;
            $('[data-infinite-scroll-results]', container).children().each(function () {
              var h = $(this).position().top + $(this).height();
              if (h > newHeight) newHeight = h;
            });

            //Slide down, reveal & prep for more
            $('[data-infinite-scroll-results]', container).animate({ height: newHeight }, 500, function () {
              $(this).css('height', '');

              //At this point, we're ready to transition in & load more
              $newProducts.removeClass('pre-trans');

              theme.inlineVideos.init(container);
              theme.initAnimateOnScroll();
              new ProductBlock();
              lazySizes.autoSizer.checkElems();
              if (cb) {
                cb();
              }
            });
          } else {
            setTimeout(function () {
              $newProducts.fadeIn();
              theme.inlineVideos.init(container);
              theme.initAnimateOnScroll();
              lazySizes.autoSizer.checkElems();
              if (cb) {
                cb();
              }
            }, 300);
          }

          //Spin no more
          var $next = $data.find('[data-infinite-scroll-container] .pagination .next a');

          if ($next.length == 0) {
            //We are out of products
            $pager.slideUp();
          } else {
            //More to show
            $link.attr('href', $next.attr('href')).removeClass('loading');
          }
        });

        return false;
      });
      if (!waitForTrigger) {
        //Infiniscroll
        $(window).on('throttled-scroll.infiniscroll', function () {
          if ($(window).scrollTop() + $(window).height() > $pager.offset().top - 500) {
            $pager.find('a').trigger('click');
          }
        });
      }
    });
  };

  theme.unloadInfiniteScroll = function (container) {
    if (container) {
      $('.pagination.infiniscroll.infinit', container).removeClass('infinit');
    }

    $(window).off('throttled-scroll.infiniscroll');
  };

  theme.applyAjaxToProductForm = function ($formContainer) {
    var shopifyAjaxAddURL = theme.routes.cart_add_url + '.js';

    $formContainer.filter('[data-ajax-add-to-cart="true"]:not(.feedback-go_to_cart)').find('.product-purchase-form').on('submit', function (e) {
      e.preventDefault();
      var $form = $(this);

      //Disable add button
      var $btn = $(this).find('[type=submit]').attr('disabled', 'disabled').addClass('confirmation adding');
      $btn.data('originalHtml', $btn.html()).html(theme.strings.productAddingToCart);

      var $stickyBtn = $('.product-area__add-to-cart-xs button');
      var updateStickyButton = theme.viewport.isXs() && $stickyBtn.length;
      if (updateStickyButton) {
        $stickyBtn.attr('disabled', 'disabled');
        $stickyBtn.data('originalHtml', $stickyBtn.html()).html(theme.strings.productAddingToCart);
      }

      //Add to cart
      $.post(shopifyAjaxAddURL, $form.serialize(), function (itemData) {
        //Enable add button
        $btn.html(theme.icons.tick + ' ' + theme.strings.productAddedToCart);

        if (updateStickyButton) {
          $stickyBtn.html(theme.icons.tick + ' ' + theme.strings.productAddedToCart);
        }

        setTimeout(function () {
          $btn.removeAttr('disabled').removeClass('confirmation').html($btn.data('originalHtml'));
          if (updateStickyButton) {
            $stickyBtn.removeAttr('disabled').removeClass('confirmation').html($stickyBtn.data('originalHtml'));
          }
        }, 4000);

        if ($form.hasClass('feedback-add_in_modal') || $form.hasClass('feedback-add_in_modal_no_checkout')) {
          var product = $.parseJSON(itemData);
          var noCheckoutButton = $form.hasClass('feedback-add_in_modal_no_checkout');

          //Preload the thumbnail image
          var thumbUrl = theme.Shopify.formatImage(product.image, '300x');
          var img = new Image();
          img.src = thumbUrl;

          $btn.removeClass('adding');

          var variantHtml = "";

          var $priceElem = $form.closest('.product-area__details__inner').find('.price-area');
          var $altPriceElem = $form.closest('.product-area__details__inner').find('.alt-price-area');
          if ($altPriceElem.length) $priceElem = $altPriceElem;
          if ($priceElem.length) {
            variantHtml += "<p class=\"cart-product__content__price\">".concat($priceElem.html(), "</p>");
          }

          if (product.selling_plan_allocation && product.selling_plan_allocation.selling_plan.name) {
            variantHtml += "<p class=\"cart-product__content__meta\">".concat(product.selling_plan_allocation.selling_plan.name, "</p>");
          }

          if (product.options_with_values && product.options_with_values.length) {
            for (var _i2 = 0; _i2 < product.options_with_values.length; _i2++) {
              var option = product.options_with_values[_i2];
              if (option.name !== "Title" && option.value !== "Default Title") {
                variantHtml += "<p class=\"cart-product__content__meta\">".concat(option.name, ": ").concat(option.value, "</p>");
              }
            }
          }

          var offset = 25;
          var nav = theme.Nav();
          if (nav.bar.getPositionSetting() !== "inline") {
            offset = nav.bar.height();
          }

          showThemeModal([
          '<div id="added-to-cart" class="theme-modal theme-modal--small" role="dialog" aria-modal="true" aria-labelledby="added-to-cart-title">', "<div class=\"inner\" style=\"top:".concat(
          offset, "px\">"),
          '<a href="#" data-modal-close class="modal-close">&times;</a>',
          '<h4 id="added-to-cart-title">' + theme.icons.tick + theme.strings.productAddedToCart + '</h4>',
          '<div class="cart-product">', "<div class=\"cart-product__image\"><img src=\"".concat(
          thumbUrl, "\" alt=\"").concat(product.featured_image.alt, "\"/></div>"),
          '<div class="cart-product__content">' +
          '<p class="cart-product__content__title">', product.product_title, '</p>' + "".concat(
          variantHtml ? variantHtml : '') +
          '</div>',
          '</div>', "<p class=\"links ".concat(
          noCheckoutButton ? 'links--no-checkout' : '', "\">"),
          '<a href="' + theme.routes.cart_url + "\" class=\"button ".concat(noCheckoutButton ? '' : 'alt', "\">") + theme.strings.viewCart + '</a>',
          '<a href="' + theme.routes.checkout + '" class="button button--checkout" [data-cc-checkout-button]>' + theme.strings.popupCheckout + '</a> ',
          '</p>',
          '</div>',
          '</div>'].
          join(''), "added-to-cart", null);
        }

        // Update header (& cart if on cart)
        $.get(theme.routes.cart_url, function (data) {
          var cartUpdateSelector = '#site-control .cart:not(.nav-search), [data-section-type="cart-template"]';
          var $newCartObj = $($.parseHTML('<div>' + data + '</div>')).find(cartUpdateSelector);
          $(cartUpdateSelector).each(function (index) {
            $($newCartObj[index]).find('[data-cc-animate]').removeAttr('data-cc-animate');
            $(this).replaceWith($newCartObj[index]);
            $(this).parent().find('[data-cc-animate]').removeAttr('data-cc-animate');
          });
        });
      }, 'text').fail(function (data) {

        //Enable add button
        $btn.removeAttr('disabled').removeClass('confirmation').html($btn.data('originalHtml'));

        if (updateStickyButton) {
          $stickyBtn.removeAttr('disabled').removeClass('confirmation').html($stickyBtn.data('originalHtml'));
        }

        console.log(data, "data--here");
        console.log(data.status, 'daa.status---');

        //Not added, show message
        if (typeof data != 'undefined' && typeof data.status != 'undefined') {
          
          var jsonRes = $.parseJSON(data.responseText);
          var $statusMessageContainer = $form.find('.product-status-message');
          $statusMessageContainer.html(jsonRes.description);
          $statusMessageContainer.slideDown().fadeIn();

          setTimeout(() => {
            $statusMessageContainer.slideUp();
          }, 8000);
        } else {
          //Some unknown error? Disable ajax and submit the old-fashioned way.
          $form.attr('ajax-add-to-cart', 'false').submit();
        }
      });
    });
  };

  theme.removeAjaxFromProductForm = function ($formContainer) {
    $formContainer.find('form.product-purchase-form').off('submit');
  };

  // Manage option dropdowns
  theme.OptionManager = new function () {
    var _ = this;

    _._getVariantOptionElement = function (variant, $container) {
      return $container.find('select[name="id"] option[value="' + variant.id + '"]');
    };

    _.selectors = {
      container: '.product-area',
      gallery: '.theme-gallery',
      priceArea: '.price-area',
      variantIdInputs: '[name="id"]',
      submitButton: '.product-detail__form input[type=submit], .product-detail__form button[type=submit], .product-area__add-to-cart-xs button',
      multiOption: '.option-selectors' };


    _.strings = {
      priceNonExistent: theme.strings.priceNonExistent,
      buttonDefault: theme.strings.buttonDefault,
      buttonPreorder: theme.strings.buttonPreorder,
      buttonNoStock: theme.strings.buttonNoStock,
      buttonNoVariant: theme.strings.buttonNoVariant,
      unitPriceSeparator: theme.strings.unitPriceSeparator,
      inventoryNotice: theme.strings.onlyXLeft,
      inventoryLowStock: theme.strings.inventoryLowStock,
      inventoryInStock: theme.strings.inventoryInStock,
      priceSoldOut: theme.strings.priceSoldOut };


    _._getString = function (key, variant) {
      var string = _.strings[key];
      if (variant) {
        if (string) {
          string = string.replace('[PRICE]', '<span class="theme-money">' + theme.Shopify.formatMoney(variant.price, theme.money_format_with_code_preference) + '</span>');
        } else {
          console.warn("No string for key '".concat(key, "' was found."));
        }
      }
      return string;
    };

    _.getProductData = function ($form, productId) {
      if (!productId) {
        productId = $form.data('product-id');
      }
      var data = null;
      if (!theme.productData[productId]) {
        theme.productData[productId] = JSON.parse(document.getElementById('cc-product-json-' + productId).innerHTML);
      }
      data = theme.productData[productId];
      if (!data) {
        console.log('Product data missing (id: ' + $form.data('product-id') + ')');
      }
      return data;
    };

    _.getBaseUnit = function (variant) {
      return variant.unit_price_measurement.reference_value === 1 ?
      variant.unit_price_measurement.reference_unit :
      variant.unit_price_measurement.reference_value +
      variant.unit_price_measurement.reference_unit;
    },

    _.addVariantUrlToHistory = function (variant) {
      if (variant) {
        var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
        window.history.replaceState({ path: newurl }, '', newurl);
      }
    };

    _.updateSku = function (variant, $container) {
      $container.find('.sku .sku__value').html(variant ? variant.sku : '');
      $container.find('.sku').toggleClass('sku--no-sku', !variant || !variant.sku);
    };

    _.updateBarcode = function (variant, $container) {
      $container.find('.barcode .barcode__value').html(variant ? variant.barcode : '');
      $container.find('.barcode').toggleClass('barcode--no-barcode', !variant || !variant.barcode);
    };

    _.updateInventoryNotice = function (variant, $container) {
      var $inventoryNotice = $container.find('.product-inventory-notice');
      var $inventoryNoticeText = $container.find('.product-inventory-notice__text');
      var $inventoryNoticeIndicator = $container.find('.product-inventory-notice__indicator');

      if ($inventoryNotice.length) {
        var invCount = _._getVariantOptionElement(variant, $container).data('inventory');
        var invData = $inventoryNotice[0].dataset;

        var showInventoryCount = invData.showInventoryCount === "always" ||
        invData.showInventoryCount === "low" && invCount <= invData.inventoryThreshold;

        var notice;
        if (showInventoryCount) {
          notice = _._getString('inventoryNotice').replace('[[ quantity ]]', invCount);
        } else {
          if (invCount <= parseInt(invData.inventoryThreshold)) {
            notice = _._getString('inventoryLowStock');
          } else {
            notice = _._getString('inventoryInStock');
          }
        }

        //Update the bar indicator
        if ($inventoryNoticeIndicator.length === 1) {
          var $bar = $inventoryNoticeIndicator.find('span');
          var newWidth;
          if (invCount >= invData.indicatorScale) {
            newWidth = 100;
          } else {
            newWidth = (100 / parseInt(invData.indicatorScale) * invCount).toFixed(1);
          }

          if (invCount <= parseInt(invData.inventoryThreshold)) {
            $bar.css('width', newWidth + '%').css('background-color', invData.indicatorScaleColorBelow);
          } else {
            $bar.css('width', newWidth + '%').css('background-color', invData.indicatorScaleColorAbove);
          }
        }

        if (invCount && invCount > 0 && (invData.showInventoryNotice === "always" || invCount <= parseInt(invData.inventoryThreshold))) {
          $inventoryNotice.removeClass('product-inventory-notice--no-inventory').slideDown(300);
          $inventoryNoticeText.html(notice);
        } else {
          $inventoryNotice.addClass('product-inventory-notice--no-inventory').slideUp(300);
        }
      }
    };

    _.updateBackorder = function (variant, $container) {
      var $backorder = $container.find('.backorder');
      if ($backorder.length) {
        if (variant && variant.available) {
          if (variant.inventory_management && _._getVariantOptionElement(variant, $container).data('stock') == 'out') {
            var productData = _.getProductData($container);
            $backorder.find('.backorder__variant').html(productData.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - ' + variant.title));
            $backorder.show();
          } else {
            $backorder.hide();
          }
        } else {
          $backorder.hide();
        }
      }
    };

    _.updatePrice = function (variant, $container) {
      var $priceArea = $container.find(_.selectors.priceArea);
      if($priceArea.length < 1 ) return;
      $priceArea.removeClass('on-sale');

      if (variant && variant.available == true) {
        var $newPriceArea = $('<div>');
        if (variant.compare_at_price > variant.price) {
          $('<span class="was-price theme-money">').html(theme.Shopify.formatMoney(variant.compare_at_price, theme.money_format_with_code_preference)).appendTo($newPriceArea);
          $newPriceArea.append(' ');
          $priceArea.addClass('on-sale');
        }
        $('<span class="current-price theme-money">').html(theme.Shopify.formatMoney(variant.price, theme.money_format_with_code_preference)).appendTo($newPriceArea);
        if (variant.unit_price_measurement) {
          var $newUnitPriceArea = $('<div class="unit-price">').appendTo($newPriceArea);
          $('<span class="unit-price__price theme-money">').html(theme.Shopify.formatMoney(variant.unit_price, theme.money_format)).appendTo($newUnitPriceArea);
          $('<span class="unit-price__separator">').html(_._getString('unitPriceSeparator')).appendTo($newUnitPriceArea);
          $('<span class="unit-price__unit">').html(_.getBaseUnit(variant)).appendTo($newUnitPriceArea);
        }
        $priceArea.html($newPriceArea.html());
      }
    };

    _._updateButtonText = function ($button, string, variant) {
      $button.each(function () {
        var newVal;
        newVal = _._getString('button' + string, variant);
        if (newVal !== false) {
          if ($(this).is('input')) {
            $(this).val(newVal);
          } else {
            $(this).html(newVal);
          }
        }
      });
    };

    _.updateButtons = function (variant, $container) {
      var $button = $container.find(_.selectors.submitButton);
      if (variant && variant.available == true) {
        $button.removeAttr('disabled');


        if ($container.data('is-preorder')) {
          _._updateButtonText($button, 'Preorder', variant);
        } else {
          _._updateButtonText($button, 'Default', variant);
        }
      } else {
        $button.attr('disabled', 'disabled');
        if (variant) {
          _._updateButtonText($button, 'NoStock', variant);
        } else {
          _._updateButtonText($button, 'NoVariant', variant);
        }
      }
    };

    _.updateContainerStatusClasses = function (variant, $container) {
      $container.toggleClass('variant-status--unavailable', !variant.available);
      $container.toggleClass('variant-status--backorder', variant.available &&
      variant.inventory_management &&
      _._getVariantOptionElement(variant, $container).data('stock') == 'out');
    };

    _.updateVariantOptionStatusClasses = function (variant, $container) {
      var productData = _.getProductData($container);

      //For the given array of option values, find variants which share the same options
      function getMatchingVariants(optionValues) {
        // console.log(`Finding variants with option values: ${optionValues}`);

        var tempVariants = productData.variants;

        var matchingVariants = tempVariants.filter((thisVariant) => {
          var variantMatches = true;

          for (var j = 0; j < optionValues.length; j++) {
            if (thisVariant.options[j] !== optionValues[j]) {
              variantMatches = false;
              break;
            }
          }

          return variantMatches;
        });

        return matchingVariants;
      }

      //Returns an object of all the possible values for the given option with each option set to false
      function getAllValuesForOption(i) {
        var allOptionValues = {};

        for (var l = 0; l < productData.variants.length; l++) {
          var value = productData.variants[l].options[i];
          if (value) {
            allOptionValues[value] = false;
          }
        }

        return allOptionValues;
      }

      if (variant === false) {
        //The variant is unavailable, fabricate variant options based on the current selection
        variant = {
          options: [] };


        $container.find('.selector-wrapper a.active[data-value]').each(function () {
          variant.options.push($(this).data('value'));
        });
      }

      if (variant && variant.options && variant.options.length > 1) {
        var optionValues = [...variant.options];
        var optionStock = {};

        //Iterate the current variant option selection from the bottom up
        for (var _i3 = variant.options.length - 1; _i3 >= 0; _i3--) {
          optionValues.pop();

          //Get an object of values for this option all with stock set to false
          var optionAvailability = getAllValuesForOption(_i3);

          //Get variants which have the parent options
          var matchingVariants = getMatchingVariants(optionValues);

          //Check for in stock options within matching variants
          for (var k = 0; k < matchingVariants.length; k++) {
            if (matchingVariants[k].available) {
              var value = matchingVariants[k].options[_i3];
              if (value) {
                optionAvailability[value] = true;
              }
            }
          }

          //Add this option value to the master object of availability for this variant
          optionStock[productData.options[_i3]] = optionAvailability;
        }

        //Update the UI to reflect stock
        $('.selector-wrapper', $container).each(function () {
          var optionName = $(this).data('option-name');
          for (var [option, isAvailable] of Object.entries(optionStock[optionName])) {
            option = removeDiacritics(option).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/-*$/, '');
            $(this).find(".clickyboxes .opt--".concat(option)).toggleClass('unavailable', !isAvailable);
          }
        });
      }
    };

    _.initProductOptions = function ($productForm) {
      if ($productForm.hasClass('theme-init')) return;

      var productData = _.getProductData($productForm);
      $productForm.addClass('theme-init');

      // init option selectors
      $productForm.find(_.selectors.multiOption).on('change.themeProductOptions', 'select', function () {
        var selectedOptions = [];
        $(this).closest(_.selectors.multiOption).find('select').each(function () {
          selectedOptions.push($(this).val());
        });
        // find variant
        var variant = false;
        for (var i = 0; i < productData.variants.length; i++) {
          var v = productData.variants[i];
          var matchCount = 0;
          for (var j = 0; j < selectedOptions.length; j++) {
            if (v.options[j] == selectedOptions[j]) {
              matchCount++;
            }
          }
          if (matchCount == selectedOptions.length) {
            variant = v;
            break;
          }
        }
        // trigger change
        if (variant) {
          $productForm.find(_.selectors.variantIdInputs).val(variant.id);
        }
        // a jQuery event may not be picked up by all listeners
        $productForm.find(_.selectors.variantIdInputs).each(function () {
          this.dispatchEvent(
          new CustomEvent('change', { bubbles: true, cancelable: false, detail: variant }));

        });
      });

      // init variant ids
      $productForm.find(_.selectors.variantIdInputs).each(function () {
        // change state for original dropdown
        $(this).on('change.themeProductOptions firstrun.themeProductOptions', function (e) {
          if ($(this).is('input[type=radio]:not(:checked)')) {
            return; // handle radios - only update for checked
          }
          var variant = e.detail;
          if (!variant && variant !== false) {
            for (var i = 0; i < productData.variants.length; i++) {
              if (productData.variants[i].id == $(this).val()) {
                variant = productData.variants[i];
              }
            }
          }
          var $container = $(this).closest(_.selectors.container);

          // string overrides
          var $addToCart = $container.find(_.selectors.submitButton).filter('[data-add-to-cart-text]');
          if ($addToCart.length) {
            _.strings.buttonDefault = $addToCart.data('add-to-cart-text');
          }

          // update price
          _.updatePrice(variant, $container);

          // update buttons
          _.updateButtons(variant, $container);

          // emit an event to broadcast the variant update
          $(window).trigger('cc-variant-updated', {
            variant: variant,
            product: productData });


          // retrigger stuff, eg hover line
          $(window).trigger('debouncedresizewidth');

          // variant images
          if (variant && variant.featured_media) {
            $container.find(_.selectors.gallery).trigger('variantImageSelected', variant);
          }

          // extra details
          _.updateBarcode(variant, $container);
          _.updateSku(variant, $container);
          _.updateInventoryNotice(variant, $container);
          //_.updateTransferNotice(variant, $container);
          _.updateBackorder(variant, $container);
          _.updateContainerStatusClasses(variant, $container);

          if ($productForm.find('[data-show-realtime-availability="true"]').length > 0) {
            _.updateVariantOptionStatusClasses(variant, $productForm);
          }

          // variant urls
          if ($productForm.data('enable-history-state') && e.type == 'change') {
            _.addVariantUrlToHistory(variant);
          }

          // notify quickbuy of content change
          $productForm.find('.quickbuy-container').trigger('changedsize');

          // allow other things to hook on
          $productForm.trigger('variantChanged', variant);
        });

        // first-run
        $(this).trigger('firstrun');
      });

      // ajax
      theme.applyAjaxToProductForm($productForm);
    };

    _.unloadProductOptions = function ($productForm) {
      $productForm.removeClass('theme-init').each(function () {
        $(this).trigger('unloading').off('.themeProductOptions');
        $(this).find(_.selectors.multiOption).off('.themeProductOptions');
        theme.removeAjaxFromProductForm($productForm);
      });
    };
  }();
  ;
  theme.addControlPaddingToModal = function () {
    $('.theme-modal.reveal > .inner').css('padding-top', theme.Nav().bar.height());
  };

  theme.assessTopSectionPadding = function () {
    var $topBlogSection = $('#page-content .shopify-section:first-child.section-featured-blog .slideshow-blog');
    if ($topBlogSection.length) {
      $topBlogSection.addClass('slideshow-blog--top');

      var nav = theme.Nav();
      if ($topBlogSection.find('.slideshow-blog__title').length) {
        $topBlogSection.find('.slideshow-blog__title').css('top', nav.bar.height());
      }

      if ($topBlogSection.find('.slideshow-blog__view-all').length) {
        $topBlogSection.find('.slideshow-blog__view-all').css('top', nav.bar.height());
      }
    }
  };

  theme.allowRTEFullWidthImages = function (container) {
    $('.rte--allow-full-width-images p > img, .rte--allow-full-width-images div > img', container).each(function () {
      if ($(this).siblings().length == 0) {
        $(this).parent().addClass('no-side-pad');
      }
    });
    $('.rte--allow-full-width-images p > a > img, .rte--allow-full-width-images div > a > img', container).each(function () {
      if ($(this).siblings().length == 0 && $(this).parent().siblings().length == 0) {
        $(this).parent().addClass('no-side-pad');
      }
    });
  };

  theme.browserHas3DTransforms = function () {
    var el = document.createElement('p'),
    has3d,
    transforms = {
      'webkitTransform': '-webkit-transform',
      'OTransform': '-o-transform',
      'msTransform': '-ms-transform',
      'MozTransform': '-moz-transform',
      'transform': 'transform' };


    // Add it to the body to get the computed style.
    document.body.insertBefore(el, null);

    for (var t in transforms) {
      if (el.style[t] !== undefined) {
        el.style[t] = "translate3d(1px,1px,1px)";
        has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
      }
    }

    document.body.removeChild(el);

    return has3d !== undefined && has3d.length > 0 && has3d !== "none";
  };

  if (theme.browserHas3DTransforms()) {$('html').addClass('supports-transforms');}

  theme.namespaceFromSection = function (container) {
    return ['.', $(container).data('section-type'), $(container).data('section-id')].join('');
  };

  theme.inlineVideos = {
    init: (target) => {
      $('.section-background-video--inline', target).each(function () {
        theme.VideoManager.onSectionLoad($(this)[0]);
        $(this).addClass('cc-init');
      });
    },
    destroy: (target) => {
      $('.section-background-video--inline', target).each(function () {
        theme.VideoManager.onSectionUnload($(this)[0]);
        $(this).removeClass('cc-init');
      });
    } };


  //Load shopify payments button
  theme.initShopifyPaymentButtons = function ($elem) {
    if (Shopify.PaymentButton && $elem.find('.shopify-payment-button').length) {
      // resize after loading extra payment buttons
      var _f = null;
      _f = function f() {
        document.removeEventListener('shopify:payment_button:loaded', _f);
        $elem.trigger('changedsize');
      };
      document.addEventListener('shopify:payment_button:loaded', _f);

      Shopify.PaymentButton.init();
    }
  };

  //Initialise any components in the passed element
  theme.initComponents = function ($elem) {
    var $components = $elem.find("[data-components]");
    if ($components.length) {
      //Init each component
      var components = $components.data('components').split(',');
      components.forEach((component) => {
        $(document).trigger('cc:component:load', [component, $elem[0]]);
      });
    }
  };

  // Check for full width sections
  theme.assessFullWidthSections = function () {
    document.querySelectorAll('#page-content .shopify-section > .use-alt-bg').forEach((elem) => elem.parentElement.classList.add('has-alt-bg'));
  };

  theme.updateNavHeight = function () {
    var nav = theme.Nav();
    document.documentElement.style.setProperty('--nav-height', nav.bar.height() + "px");
    document.querySelectorAll('[data-cc-sticky-scroll-top]').forEach((elem) => {
      elem.setAttribute('data-cc-sticky-scroll-top', nav.bar.height() + 20);
    });
  };

  // Perform common functions when the theme inits
  theme.init = function () {
    theme.checkViewportFillers();
    theme.assessAltLogo();
    theme.assessTopSectionPadding();
    theme.assessFullWidthSections();
    theme.calc100vh();
    theme.updateNavHeight();
  };

  // Perform common functions when the window resizes (debounced)
  theme.windowResize = function () {
    theme.assessTopSectionPadding();
    theme.calc100vh();
    theme.updateNavHeight();
  };
  jQuery(function ($) {
    $(document).on('click', '[data-cc-quick-buy]', function () {
      var nav = theme.Nav();
      var productUrl = $(this).attr('href');

      // Cancel current request if one exists
      if (theme.currentQuickbuyRequest) {
        theme.currentQuickbuyRequest.abort();
      }

      showThemeModal("<div class=\"theme-modal theme-modal--fullscreen theme-modal--quickbuy -light\" id=\"quick-buy-modal\" role=\"dialog\" aria-modal=\"true\"/>\n                        <a href=\"#\" data-modal-close class=\"modal-close\">&times;</a>\n                        <div class=\"theme-modal__loading\">".concat(

      theme.icons.loading, "</div>\n                    </div>"),
      'quick-buy', null);

      // load in content
      var ajaxUrl = productUrl;
      // ajaxUrl += ajaxUrl.indexOf('?') >= 0 ? '&view=ajax' : '?view=ajax';
      theme.currentQuickbuyRequest = $.get(ajaxUrl, function (response) {
        var $quickbuyModal = $('#quick-buy-modal');
        var $productDetail = $('<div>' + response + '</div>').find('.section-product-template');
        var $section = $productDetail.find('[data-section-type="product-template"]')[0];

        //Prepare the html
        $productDetail.find('.store-availability-container-outer').remove();
        $productDetail.find('[data-show-in-quickbuy="false"]').remove();
        $productDetail.find('.theme-gallery--zoom-enabled').removeClass('theme-gallery--zoom-enabled');
        $productDetail.find('.product-area__details__title').wrapInner($('<a>').attr('href', productUrl).attr('data-cc-animate-click', 'true'));
        $productDetail.find('.product-detail__more_details a').attr('href', productUrl);

        //Display the html
        $quickbuyModal.find('.theme-modal__loading').replaceWith($productDetail);

        //Load the section etc
        theme.initAnimateOnScroll();

        //Init the product template section
        theme.ProductTemplateSection.onSectionLoad($section, true);

        //Initialise any components
        theme.initComponents($quickbuyModal);

        //Load shopify payments button
        theme.initShopifyPaymentButtons($quickbuyModal);

        $(window).one('ccModalClosing', function () {
          theme.ProductTemplateSection.onSectionUnload($section, true);
        });

      }).always(function () {
        theme.currentQuickbuyRequest = false;
      });

      return false;
    });
  });
  ;
  class ProductBlockInstance {
    constructor(container) {
      this.productBlock = container;
      this.productBlockImageContainer = this.productBlock.querySelector('.image');
      this.imageContainer = this.productBlock.querySelector('.image-inner');
      this.swatchesContainer = this.productBlock.querySelector('.cc-swatches');

      this.slideDuration = 1000;
      this.swatchImagesPreloaded = false;
      this.imageSliderLoaded = false;
      this.widths = [460, 540, 720, 900, 1080, 1296, 1512, 1728, 2048];

      this.imageWidth;
      this.hoverTimeout;
      this.preloadedImages = [];
      this.swatches = [];

      this.bindEvents();

      if (this.productBlock.querySelector('[data-section-type="background-video"]')) {
        this.initImageSlider();
      }
    }

    /**
     * Shows the next image in the product block
     */
    showNextSlideImage() {
      this.hoverTimeout = setTimeout(() => {
        var slides = this.imageContainer.querySelectorAll('.product-block--slide');
        if (slides && slides.length > 1) {
          if (!this.imageContainer.querySelector('.product-block--slide.-in')) {
            this.imageContainer.querySelector('.image__first').classList.add('-out');
            slides[1].classList.add('-in');
          } else {
            for (var _i4 = 0; _i4 < slides.length; _i4++) {
              //Trigger the next one to be visible
              if (slides[_i4].classList.contains('-in')) {
                slides[_i4].classList.remove('-in');
                if (_i4 === slides.length - 1) {
                  //If this is the last slide, loop round
                  this.destroyImageSliderLoadingBar();
                  slides[0].classList.add('-in');
                  this.initImageSliderLoadingBar();
                } else {
                  //Show the next image
                  slides[_i4 + 1].classList.add('-in');
                }
                break;
              }
            }
          }
        }
        this.showNextSlideImage();
      }, this.slideDuration);
    }

    /**
     * Show a specific slide with the passed image
     * @param imageUrl
     */
    showSpecificSlideImage(imageUrl) {
      var imageUrlStart = imageUrl.substring(0, imageUrl.lastIndexOf('_'));
      var nextSlide = this.imageContainer.querySelector(".product-block--slide[src^=\"".concat(imageUrlStart, "\"]"));
      if (nextSlide) {
        var currentSlide = this.imageContainer.querySelector(".product-block--slide.-in");
        if (currentSlide) {
          currentSlide.classList.remove('-in');
        }

        this.imageContainer.querySelector('.image__first').classList.add('-out');

        nextSlide.classList.add('-in');
      } else {
        console.warn('No next slide for ', imageUrlStart);
      }
    }

    /**
     * Preload an image
     * @param imageUrl
     */
    preloadImage(imageUrl) {
      if (!this.preloadedImages.includes(imageUrl)) {
        var imageElem = new Image();
        imageElem.src = imageUrl;
        this.preloadedImages.push(imageUrl);
      }
    }

    /**
     * Resolves the image url for the passed placeholder image url
     * @param url
     * @returns {*}
     */
    getImageUrl(url) {
      //Up the image width to get a decent quality image for retina
      var imageContainerWidth = theme.device.isRetinaDisplay() ? this.productBlock.clientWidth * 2 : this.productBlock.clientWidth;
      for (var _i5 = 0; _i5 < this.widths.length; _i5++) {
        if (this.widths[_i5] >= imageContainerWidth) {
          this.imageWidth = this.widths[_i5];
          return url.replace('{width}', this.widths[_i5]);
        }
      }
    }

    /**
     * Initialises the image slider for this product block
     */
    initImageSlider() {
      if (this.productBlock) {
        var allImages = this.productBlock.dataset.productImages;
        if (allImages && !this.imageSliderLoaded) {
          var allImagesArr = allImages.split(',');
          var sliderHtml = "";
          allImagesArr.forEach((image) => {
            sliderHtml += "<img class=\"product-block--slide\" tabindex=\"-1\" src=\"".concat(this.getImageUrl(image), "\"/>");
          });

          this.imageContainer.innerHTML += sliderHtml;
          this.imageSliderLoaded = true;
        }
      }
    }

    /**
     * Destroys the image slider
     */
    destroyImageSlider() {
      if (this.imageSliderLoaded) {
        var slides = this.imageContainer.querySelectorAll('.product-block--slide');
        if (slides) {
          slides.forEach((slide) => {
            slide.remove();
          });
        }
        this.imageSliderLoaded = false;
      }
    }

    /**
     * When the mouse hovers a swatch - replace the main image
     * @param e
     */
    handleMouseEnterSwatch(e) {
      if (e.target.dataset.variantImage) {
        if (!this.imageSliderLoaded) {
          this.initImageSlider();
        }
        var newUrl = this.getImageUrl(e.target.dataset.variantImage);
        this.showSpecificSlideImage(newUrl);
      }
    }

    /**
     * Remove focus from the image slider slides
     * @param e
     */
    handleMouseLeaveSwatch(e) {
      var currentSlide = this.imageContainer.querySelector(".product-block--slide.-in");
      if (currentSlide) {
        currentSlide.classList.remove('-in');
      }

      this.imageContainer.querySelector('.image__first').classList.remove('-out');
    }

    /**
     * On mobile, don't redirect the page when a swatch is clicked
     * @param e
     */
    handleClickSwatch(e) {
      e.preventDefault();
    }

    /**
     * Preload all swatch images and init the slider on mouseover the product block
     * @param e
     */
    handleMouseEnterProductBlock(e) {
      //Preload swatch images if present
      if (!this.swatchImagesPreloaded) {
        this.productBlock.querySelectorAll('.cc-swatches a').forEach((swatch) => {
          if (swatch.dataset.variantImage) {
            this.preloadImage(this.getImageUrl(swatch.dataset.variantImage));
          }
        });
        this.swatchImagesPreloaded = true;
      }

      //Init the image slider
      if (this.productBlock.dataset.productImages && !this.imageSliderLoaded) {
        if (this.productBlock.classList.contains('all-images')) {
          this.initImageSlider();
        } else {
          setTimeout(this.initImageSlider, 500);
        }
      }
    }

    /**
     * Show the next image in the slider when hovering over the image
     * @param e
     */
    handleEnterImageContainer(e) {
      if (this.productBlock.classList.contains('all-images')) {
        this.showNextSlideImage();

        //Init the loading bar
        this.initImageSliderLoadingBar();
      }
    }

    /**
     * Mouse leaves a product block
     * @param e
     */
    handleLeaveImageContainer(e) {
      clearTimeout(this.hoverTimeout);

      if (this.imageSliderLoaded) {
        var activeSlide = this.imageContainer.querySelector('.product-block--slide.-in');
        if (activeSlide) {
          activeSlide.classList.remove('-in');
          this.imageContainer.querySelector('.image__first').classList.remove('-out');
        }

        this.destroyImageSliderLoadingBar();
      }
    }

    /**
     * Creates and starts the image slider loading bar
     */
    initImageSliderLoadingBar() {
      var loadingBarAnimateDelay = 100;
      var slides = this.imageContainer.querySelectorAll('.product-block--slide');
      var transitionDuration = slides.length * this.slideDuration - loadingBarAnimateDelay;
      var loadingBar = document.createElement('div');
      loadingBar.classList.add('loading-bar');
      loadingBar.style.transitionDuration = transitionDuration + 'ms';
      this.productBlockImageContainer.append(loadingBar);
      setTimeout(() => {
        loadingBar.classList.add('-in');
      }, loadingBarAnimateDelay);
    }

    /**
     * Remove the image slider loading bar
     */
    destroyImageSliderLoadingBar() {
      var loadingBar = this.productBlockImageContainer.querySelector('.loading-bar');
      if (loadingBar) {
        loadingBar.remove();
      }
    }

    /**
     * When the window is resized, check if image quality needs updating and if so destroy
     * the sliders (which re-init when needed)
     */
    handleWindowResize() {
      if (this.imageWidth && this.productBlock.clientWidth > this.imageWidth) {
        for (var _i6 = 0; _i6 < this.widths.length; _i6++) {
          if (this.widths[_i6] >= this.productBlock.clientWidth && this.widths[_i6] > this.imageWidth) {
            this.destroyImageSlider();
            break;
          }
        }
      }
    }

    /**
    * Bind various listeners
    */
    bindEvents() {
      this.focusSwatchHandler = this.handleMouseEnterSwatch.bind(this);
      this.mouseEnterSwatchHandler = theme.debounce(this.handleMouseEnterSwatch.bind(this), 150);
      this.mouseLeaveSwatchHandler = theme.debounce(this.handleMouseLeaveSwatch.bind(this), 150);
      this.touchDeviceClickHandler = this.handleClickSwatch.bind(this);
      this.mouseEnterProductBlockHandler = this.handleMouseEnterProductBlock.bind(this);
      this.mouseEnterImageContainerHandler = this.handleEnterImageContainer.bind(this);
      this.mouseLeaveImageContainerHandler = this.handleLeaveImageContainer.bind(this);
      this.windowResizeHandler = theme.debounce(this.handleWindowResize.bind(this));


      this.productBlock.querySelectorAll('.cc-swatches a').forEach((swatch) => {
        swatch.addEventListener('mouseenter', this.mouseEnterSwatchHandler);
        swatch.addEventListener('focus', this.focusSwatchHandler);

        this.swatches.push(swatch);

        if (theme.device.isTouch()) {
          swatch.addEventListener('click', this.touchDeviceClickHandler);
        }
      });

      if (this.swatchesContainer) {
        this.swatchesContainer.addEventListener('mouseleave', this.mouseLeaveSwatchHandler);
      }

      this.productBlock.addEventListener('mouseenter', this.mouseEnterProductBlockHandler);
      this.imageContainer.addEventListener('mouseenter', this.mouseEnterImageContainerHandler);
      this.imageContainer.addEventListener('mouseleave', this.mouseLeaveImageContainerHandler);
      window.addEventListener('resize', this.windowResizeHandler);
    }

    /**
     * Destroy the listeners
     */
    destroy() {
      this.swatches.forEach((swatch) => {
        swatch.removeEventListener('mouseenter', this.mouseEnterSwatchHandler);
        swatch.removeEventListener('click', this.touchDeviceClickHandler);
      });
      this.productBlock.removeEventListener('mouseenter', this.mouseEnterProductBlockHandler);
      this.productBlock.removeEventListener('mouseenter', this.mouseEnterImageContainerHandler);
      this.productBlock.removeEventListener('mouseleave', this.mouseLeaveImageContainerHandler);
      window.removeEventListener('resize', this.windowResizeHandler);

      if (this.swatchesContainer) {
        this.swatchesContainer.removeEventListener('mouseleave', this.mouseLeaveSwatchHandler);
      }
    }}


  class ProductBlock extends ccComponent {
    constructor() {var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'product-block';var cssSelector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ".cc-".concat(name, ":not(.cc-initialized)");
      super(name, cssSelector);
    }

    init(container) {
      super.init(container);
      this.registerInstance(container, new ProductBlockInstance(container));
    }

    destroy(container) {
      this.destroyInstance(container);
      super.destroy(container);
    }}


  new ProductBlock();
  ;

  /*================ Sections ================*/
  theme.HeaderSection = new function () {
    var c;
    var currentScrollTop = 0;
    var default_threshold = 100;

    handleScroll = function handleScroll(nav, positioning, opacity) {
      if (opacity === 'opaque_on_scroll' || opacity === 'opaque_on_scroll_alt') {
        if ($(window).scrollTop() < 100) {
          nav.bar.turnOpaque(false);
        } else {
          nav.bar.turnOpaque(true);
        }
      } else if (opacity !== 'opaque') {
        nav.bar.turnOpaque(false);
      }

      var scrollTop = $(window).scrollTop();

      if ((positioning === 'peek' || nav.bar.isAnnouncementBar() && positioning == "sticky") && scrollTop > 100) {
        currentScrollTop = scrollTop;

        if (positioning != "sticky") {
          if (c < currentScrollTop && scrollTop > default_threshold) {
            nav.bar.hide(true);
          } else if (c > currentScrollTop && !(scrollTop <= 50)) {
            nav.bar.hide(false);
          }
        }

        c = currentScrollTop;

      } else {
        nav.bar.hide(false);
      }

      if (positioning == "sticky" || positioning == "peek") {
        if (scrollTop <= 50) {
          nav.bar.hideAnnouncement(false);
        } else {
          nav.bar.hideAnnouncement(true);
        }
      }
    };

    this.onSectionLoad = function (target) {
      theme.addControlPaddingToModal();
      $('body').toggleClass('modal-active', $('.theme-modal.reveal').length > 0);
      $('#page-menu a', target).attr('tabindex', '-1');
      $('#page-menu .main-nav li:has(ul)', target).addClass('has-children');
      $('#page-menu.nav-uses-modal .main-nav li.has-children > a', target).append('<span class="arr">' + theme.icons.chevronRight + '</span>');
      $('.disclosure', target).each(function () {
        $(this).data('disclosure', new theme.Disclosure($(this)));
      });

      var nav = new theme.Nav();
      var positioning = nav.bar.getPositionSetting();
      var opacity = nav.bar.getOpacitySetting();

      if (opacity === "opaque") {
        $('body').addClass('nav-opaque');
      } else {
        $('body').removeClass('nav-opaque');
      }

      if (positioning === "inline") {
        $('body').addClass('nav-inline');
      } else {
        $('body').removeClass('nav-inline');
      }

      if (opacity !== 'opaque') {
        $('body').addClass('nav-transparent');
      } else {
        $('body').removeClass('nav-transparent');
      }

      if (nav.bar.isAnnouncementBar()) {
        $('body').addClass('showing-announcement');
      } else {
        $('body').removeClass('showing-announcement');
      }

      if (opacity === 'opaque_on_scroll' || opacity === 'opaque_on_scroll_alt' || positioning === 'peek' || nav.bar.isAnnouncementBar()) {
        currentScrollTop = 0;
        $(window).on('throttled-scroll.nav', function () {
          handleScroll(nav, positioning, opacity);
        });
      }

      $(document).on('click.video-section', '.video-container__play', function () {
        if (theme.viewport.isXs()) {
          nav.bar.fadeOut(true);
        }
      });

      $(document).on('click.video-section', '.video-container__stop', function () {
        if (theme.viewport.isXs()) {
          nav.bar.fadeOut(false);
        }
      });

      // Keep the logo width equal to toolbar width
      if (nav.bar.hasInlineLinks() && nav.bar.hasLocalization()) {
        var $logo = $('.logo', target);
        var $toolbarRight = $('.nav-right-side', target);

        function doNavResizeEvents() {
          if (theme.viewport.isXlg() && $toolbarRight.width() > $logo.width()) {
            $logo.css('width', $toolbarRight.outerWidth() - 20 + 'px');
          } else {
            $logo.css('width', '');
          }
        }

        $(window).on('debouncedresize.headerSection doNavResizeEvents.headerSection', doNavResizeEvents).trigger('doNavResizeEvents');

        var event = new CustomEvent("cc-header-updated");
        window.dispatchEvent(event);
      }

      //Lazy load nav promo images
      setTimeout(function () {
        $('.lazyload--manual', target).removeClass('lazyload--manual').addClass('lazyload');
      }, 5000);

      theme.checkViewportFillers();
      theme.assessAltLogo();
      $(window).trigger('cc-header-updated');
    };

    this.onSectionUnload = function (target) {
      $('.disclosure', target).each(function () {
        $(this).data('disclosure').unload();
      });
      $(window).off('throttled-scroll.nav');
      $(window).off('headerSection');
      $(document).on('click.video-section');
    };
  }();

  theme.FooterSection = new function () {
    this.onSectionLoad = function (container) {
      $('.disclosure', container).each(function () {
        $(this).data('disclosure', new theme.Disclosure($(this)));
      });
    };

    this.onSectionUnload = function (container) {
      $('.disclosure', container).each(function () {
        $(this).data('disclosure').unload();
      });
    };
  }();

  theme.SlideshowSection = new function () {
    this.onSectionLoad = function (target) {
      theme.initContentSlider(target);
      $(window).trigger('slideshowfillheight');
      theme.checkViewportFillers();
      theme.assessAltLogo();
    };

    this.onSectionUnload = function (target) {
      $('.slick-slider', target).slick('unslick').off('init');
      $(window).off('.slideshowSection');
    };

    this.onBlockSelect = function (target) {
      $(target).closest('.slick-slider').
      slick('slickGoTo', $(target).data('slick-index')).
      slick('slickPause');
    };

    this.onBlockDeselect = function (target) {
      $(target).closest('.slick-slider').
      slick('slickPlay');
    };
  }();

  theme.FeaturedBlogSection = new function () {
    this.onSectionLoad = function (target) {
      if ($('.carousel-blog', target).length) {
        var $swiperCont = $('.swiper-container', target);
        if ($swiperCont.length === 1) {
          theme.initProductSlider($swiperCont, true);
        }
      }

      if ($('.slideshow-blog', target).length) {
        theme.initContentSlider(target, function (slide) {
          $('.slideshow-blog__titles__active', target).removeClass('slideshow-blog__titles__active');
          $("[data-go-to-slide=\"".concat(slide, "\"]"), target).parent().addClass('slideshow-blog__titles__active');
        });

        var $slideshowTitles = $('.slideshow-blog__titles', target);

        if ($('.slideshow[data-title-navigation="true"]', target).length) {
          function checkTitleNavHeight() {
            if (theme.viewport.isSm()) {
              $('.overlay-type .inner', target).css('padding-bottom', $slideshowTitles.height() + 50 + 'px');
            } else {
              $('.overlay-type .inner', target).removeAttr('style');
            }
          }
          checkTitleNavHeight();
          $(window).on('debouncedresize.titleNavHeight', checkTitleNavHeight);

          $('[data-go-to-slide]', target).on('click', function () {
            var slideNum = $(this).data('go-to-slide');
            $('.slideshow', target).slick('slickGoTo', slideNum).slick('slickPause');
            $('.slideshow-blog', target).addClass('slideshow--paused');;

            return false;
          });

          $('[data-go-to-slide]:first', target).parent().addClass('slideshow-blog__titles__active');
        }

        $(window).trigger('slideshowfillheight');
      }

      theme.checkViewportFillers();
      theme.assessAltLogo();
    };

    this.onSectionUnload = function (target) {
      $('.slick-slider', target).slick('unslick').off('init');
      $(window).off('debouncedresize.titleNavHeight');
      $('[data-go-to-slide]', target).off('click');
    };
  }();

  theme.ImageWithTextOverlay = new function () {
    var _ = this;
    _.checkTextOverImageHeights = function () {
      $('[data-section-type="image-with-text-overlay"], [data-nested-section-type="image-with-text-overlay"]').each(function () {
        var $imageContainer = $('.rimage-outer-wrapper', this);
        var imageHeight = $('.rimage-wrapper', this).outerHeight();
        var textVerticalPadding = parseInt($('.overlay', this).css('padding-top'));
        var textHeight = $('.overlay__content', this).height() + textVerticalPadding * 2;
        if (textHeight > imageHeight + 2) {// +2 for rounding errors
          $imageContainer.css('height', textHeight);
        } else {
          $imageContainer.css('height', '');
        }
      });
    };

    this.onSectionLoad = function (target) {
      $(window).off('.imageWithTextOverlaySection');
      if ($('.overlay__content', target).length) {
        $(_.checkTextOverImageHeights);
        $(window).on('debouncedresize.imageWithTextOverlaySection', _.checkTextOverImageHeights);
      }
      theme.checkViewportFillers();
    };

    this.onSectionUnload = function (target) {
      $(window).off('.imageWithTextOverlaySection');
    };
  }();

  theme.ImageBesideImageSection = new function () {
    var _ = this;
    _.checkTextOverImageHeights = function () {
      $('.image-beside-image__image').each(function () {
        var $imageContainer = $('.rimage-outer-wrapper', this);
        var imageHeight = $('.rimage-wrapper', this).outerHeight();
        var textVerticalPadding = parseInt($('.overlay', this).css('padding-top'));
        var textHeight = $('.overlay__content', this).height() + textVerticalPadding * 2;
        if (textHeight > imageHeight + 2) {// +2 for rounding errors
          $imageContainer.css('height', textHeight);
        } else {
          $imageContainer.css('height', '');
        }
      });
    };

    this.onSectionLoad = function (target) {
      $(window).off('.imageBesideImageSection');
      if ($('.overlay__content', target).length) {
        $(_.checkTextOverImageHeights);
        $(window).on('debouncedresize.imageBesideImageSection', _.checkTextOverImageHeights);
      }
      theme.checkViewportFillers();
    };

    this.onSectionUnload = function (target) {
      $(window).off('.imageBesideImageSection');
    };
  }();

  theme.ProductTemplateSection = new function () {
    var nav = theme.Nav();
    var galleries = {};

    this.onSectionLoad = function (target) {var isQuickbuy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var sectionUniqueId = new Date().getTime();
      $(target).attr('data-section-id', sectionUniqueId);

      var isFeaturedProduct = $(target).data('is-featured-product') || false;

      /// Init store availability if applicable
      if (!isFeaturedProduct && !isQuickbuy && $('[data-store-availability-container]', target).length) {
        this.storeAvailability = new theme.StoreAvailability($('[data-store-availability-container]', target)[0]);
      }

      // header assessment first (affects gallery height)
      theme.checkViewportFillers();
      theme.assessAltLogo();

      if (nav.bar.isCurrentlyOpaque() && !isFeaturedProduct && !isQuickbuy) {
        $('body').removeClass('header-section-overlap');
      }

      /// Product page upper gallery
      var $gallery = $('.theme-gallery', target);
      if ($gallery.length > 0) {
        galleries[sectionUniqueId] = new theme.ProductMediaGallery(
        $gallery, $('.theme-gallery-thumb', target), isFeaturedProduct, isQuickbuy, sectionUniqueId);
      }

      if (!isFeaturedProduct) {
        var $stickyAddToCart = $('.product-area__add-to-cart-xs', target);
        var stickyAddToCartInitialised = !$stickyAddToCart.length;
        var stickyAddToCartIsUnstuck = false;
        var productSection = $('.section-product-template')[0];

        /// Work out the tallest product tab and compensate the height of the details area
        /// (for position:sticky to work in this case, it needs a fixed height).
        function resizeProductDetails() {
          if (theme.viewport.isXs()) {
            if (!stickyAddToCartInitialised && !isQuickbuy) {
              $(window).on('throttled-scroll.sticky-add-to-cart', function () {
                if (productSection.getBoundingClientRect().bottom < $(window).outerHeight()) {
                  if (!stickyAddToCartIsUnstuck) {
                    $stickyAddToCart.addClass('-out');
                    stickyAddToCartIsUnstuck = true;
                  }
                } else {
                  if (stickyAddToCartIsUnstuck) {
                    $stickyAddToCart.removeClass('-out');
                    stickyAddToCartIsUnstuck = false;
                  }
                }
              });

              $('.product-area__add-to-cart-xs button', target).on('click', function (e) {
                $('.product-detail__form form.product-purchase-form:first', target).submit();
              });

              stickyAddToCartInitialised = true;
            }
          }
        }

        $(window).on("debouncedresizewidth.productDetails".concat(sectionUniqueId), resizeProductDetails);
        $(window).on("cc-header-updated.productDetails".concat(sectionUniqueId), resizeProductDetails);
        $(window).on("shopify:section:reorder.productDetails".concat(sectionUniqueId), resizeProductDetails);
        resizeProductDetails();
      }

      /// Boxed-options (do before initProductOptions - which applies classes to these boxes)
      theme.convertOptionsToBoxes(target);

      /// Product options
      theme.OptionManager.initProductOptions($(target));

      /// Visual style of dropdowns
      $('select:not(.original-selector)').selectReplace().closest('.selector-wrapper').addClass('has-pretty-select');

      /// Size chart
      $('.size-chart-link', target).on('click', function () {
        $.colorbox({
          inline: true,
          fixed: true,
          maxHeight: "80%",
          href: '#size-chart-content > .size-chart',
          onOpen: () => {
            theme.viewport.scroll.lock();
          },
          onClosed: () => {
            theme.viewport.scroll.unlock();
          } });

        return false;
      });

      // Keep colour swatches updated
      $(window).on("cc-variant-updated.product-swatches".concat(sectionUniqueId), (e, args) => {
        var $swatchesContainer = $('.cc-swatches', target);
        if ($swatchesContainer.length) {
          $swatchesContainer.find('.cc-swatches__label').remove();
          $swatchesContainer.find('label').append("<span class=\"cc-swatches__label\">".concat($swatchesContainer.find('.active').text(), "</span>"));
        }
      });

      /// Trigger the animations
      theme.initAnimateOnScroll();
      theme.checkViewportFillers();
      theme.initShopifyPaymentButtons($(target));
    };

    this.onSectionUnload = function (target, isQuickbuy) {
      var sectionUniqueId = $(target).attr('data-section-id');

      if (!isQuickbuy) {
        $(window).off('throttled-scroll.sticky-add-to-cart');
      }

      $(window).off(".productDetails".concat(sectionUniqueId));
      $(window).off("cc-variant-updated.product-swatches".concat(sectionUniqueId));
      $('.spr-container', target).off('click');
      $('.theme-gallery-thumb', target).off('click');
      $('.size-chart-link', target).off('click');
      $('.product-area__add-to-cart-xs button', target).off('click');

      theme.OptionManager.unloadProductOptions($(target));

      if (galleries[sectionUniqueId]) {
        galleries[sectionUniqueId].destroy();
      } else {
        console.warn('No galleries found');
      }

      if (this.storeAvailability && !isQuickbuy) {
        this.storeAvailability.onSectionUnload();
      }
    };
  }();

  theme.FilterManager = new function () {
    this.onSectionLoad = function (container) {
      this.namespace = theme.namespaceFromSection(container);
      this.$container = $(container);

      // ajax filter & sort
      if (this.$container.data('ajax-filtering')) {
        // ajax load on link click
        this.$container.on('click' + this.namespace, '.pagination a,.active-filter-controls a', this.functions.ajaxLoadLink.bind(this));

        // ajax load form submission
        this.$container.on('change' + this.namespace + ' submit' + this.namespace, '#FacetsForm',
        theme.debounce(this.functions.ajaxLoadForm.bind(this), 700));

        // handle back button
        this.registerEventListener(window, 'popstate', this.functions.ajaxPopState.bind(this));
      } else {
        this.$container.on('change' + this.namespace, '#FacetsForm', this.functions.submitForm);
      }

      // click on the mobile 'show filters' button
      this.$container.on('click' + this.namespace, '[data-show-filter]', this.functions.toggleFilter.bind(this));

      // the search query is updated
      this.$container.on('submit' + this.namespace, '#search-page-form', this.functions.updateSearchQuery.bind(this));

      theme.loadInfiniteScroll(container);
      this.functions.refreshSelects();
    };

    this.onSectionUnload = function (container) {
      this.$container.off(this.namespace);
      $(window).off(this.namespace);
      $(document).off(this.namespace);
      theme.unloadInfiniteScroll();
    };

    this.functions = {
      submitForm: function submitForm(e) {
        e.currentTarget.submit();
      },

      updateSearchQuery: function updateSearchQuery(e) {
        var $form = this.$container.find('#FacetsForm');
        if ($form.length) {
          e.preventDefault();
          $form.find('[name="q"]').val($(e.currentTarget).find('[name="q"]').val());

          if (this.$container.data('ajax-filtering')) {
            var ajaxLoadForm = this.functions.ajaxLoadForm.bind(this);
            ajaxLoadForm({
              type: null,
              currentTarget: $form[0] });

          } else {
            $form.submit();
          }
        }
      },

      toggleFilter: function toggleFilter() {
        var $filterBtn = $('[data-show-filter]', this.$container);
        var $productFilter = $('.cc-product-filter', this.$container);
        var nav = theme.Nav();

        if ($productFilter.hasClass('-in')) {
          $filterBtn.text($filterBtn.data('open-text'));
          nav.bar.fadeOut(false);
        } else {
          $filterBtn.text($filterBtn.data('close-text'));
          nav.bar.fadeOut(true);
        }

        $productFilter.toggleClass('-in');

        return false;
      },

      ajaxLoadLink: function ajaxLoadLink(evt) {
        evt.preventDefault();
        this.functions.ajaxLoadUrl.call(this, $(evt.currentTarget).attr('href'));
      },

      ajaxLoadForm: function ajaxLoadForm(evt) {
        if (evt.type === 'submit') {
          evt.preventDefault();
        }

        var queryVals = [];
        evt.currentTarget.querySelectorAll('input, select').forEach((input) => {
          if (
          (input.type !== 'checkbox' && input.type !== 'radio' || input.checked // is an active input value
          ) && input.value !== '' // has a value
          ) {
            // if no value, check for the default and include
            if (input.value === '' && input.dataset.currentValue) {
              queryVals.push([input.name, encodeURIComponent(input.dataset.currentValue)]);
            } else {
              queryVals.push([input.name, encodeURIComponent(input.value)]);
            }
          }
        });

        evt.currentTarget.querySelectorAll('[data-current-value]').forEach((input) => {
          input.setAttribute('value', input.dataset.currentValue);
        });
        var data = new FormData(evt.currentTarget);
        var queryString = new URLSearchParams(data).toString();
        this.functions.ajaxLoadUrl.call(this, '?' + queryString);
      },

      ajaxPopState: function ajaxPopState(event) {
        this.functions.ajaxLoadUrl.call(this, document.location.href);
      },

      initFilterResults: function initFilterResults() {
        theme.loadInfiniteScroll(this.container);
        theme.inlineVideos.init(this.container);

        // init scroll animations
        theme.initAnimateOnScroll();

        // init theme components
        var $components = this.$container.closest('[data-components]');
        if ($components.length) {
          var components = $components.data('components').split(',');
          components.forEach(function (component) {
            $(document).trigger('cc:component:load', [component, $components[0]]);
          }.bind(this));
        }
      },

      refreshSelects: function refreshSelects() {
        $('select:not(.original-selector)', this.$container).selectReplace().closest('.selector-wrapper').addClass('has-pretty-select');
      },

      ajaxLoadUrl: function ajaxLoadUrl(url) {
        var _this = this;

        // update url history
        var fullUrl = url;
        if (fullUrl.slice(0, 1) === '/') {
          fullUrl = window.location.protocol + '//' + window.location.host + fullUrl;
        }

        // start fetching URL
        var refreshContainerSelector = '[data-ajax-container]',
        $ajaxContainers = this.$container.find(refreshContainerSelector);

        // loading state
        $ajaxContainers.addClass('cc-product-filter-container--loading');
        $ajaxContainers.find('.product-list').append("<span class=\"loading\" aria-label=\"".concat(theme.strings.loading, "\">").concat(theme.icons.loading, " </span>"));
        theme.unloadInfiniteScroll(this.$container);
        theme.inlineVideos.destroy(this.$container);

        // fetch content
        if (this.currentAjaxLoadUrlFetch) {
          this.currentAjaxLoadUrlFetch.abort();
        }

        this.currentAjaxLoadUrlFetch = $.get(url, function (data) {
          this.currentAjaxLoadUrlFetch = null;

          var $newPage = $($.parseHTML(data));
          var newTitleTag = $newPage.filter('title').text().trim();
          document.title = newTitleTag;
          window.history.pushState({ path: fullUrl }, newTitleTag, fullUrl);

          // save active element
          if (document.activeElement) {
            this.activeElementId = document.activeElement.id;
          }

          // replace contents
          var $newAjaxContainers = $("<div>".concat(data, "</div>")).find(refreshContainerSelector);
          $newAjaxContainers.each(function (index) {
            var $newAjaxContainer = $(this);

            // preserve accordion state
            $($ajaxContainers[index]).find('.cc-accordion-item').each(function () {
              var accordionIndex = $(this).closest('.cc-accordion').index();
              if ($(this).hasClass('is-open')) {
                $newAjaxContainer.find(".cc-accordion:nth-child(".concat(accordionIndex + 1, ") .cc-accordion-item")).addClass('is-open').attr('open', '');
              } else {
                $newAjaxContainer.find(".cc-accordion:nth-child(".concat(accordionIndex + 1, ") .cc-accordion-item")).removeClass('is-open').removeAttr('open');
              }
            });

            // maintain mobile filter menu state
            if ($('.cc-product-filter', _this.$container).length && $('.cc-product-filter', _this.$container).hasClass('-in')) {
              $newAjaxContainer.find('.cc-product-filter').addClass('-in');
            }

            $($ajaxContainers[index]).html($newAjaxContainer.html());
            _this.functions.refreshSelects();
          });

          // init js
          this.functions.initFilterResults.call(this);

          //Update the mobile 'Close filters' button text
          var $filterSidebar = $('.cc-product-filter', _this.$container);
          var $filterBtn = $('[data-show-filter]', _this.$container);
          if ($filterSidebar.length && $filterSidebar.hasClass('-in')) {
            var buttonText;
            var resultCount = $('.product-list', _this.$container).data('result-count');

            if (resultCount === 1) {
              buttonText = $filterBtn.data('result-count-text-singular').replace("[x]", resultCount);
            } else {
              buttonText = $filterBtn.data('result-count-text').replace("[x]", resultCount);
            }

            $filterBtn.text(buttonText);
          }

          // remove loading state
          $ajaxContainers.removeClass('cc-product-filter-container--loading');

          // restore active element
          if (this.activeElementId) {
            var el = document.getElementById(this.activeElementId);
            if (el) {
              el.focus();
            }
          }

          var $resultContainer = $('[data-ajax-scroll-to]:first', this.$container);
          if ($(window).scrollTop() - 200 > $resultContainer.offset().top) {
            theme.viewport.scroll.to($resultContainer, -1, 25);
          }
        }.bind(this));
      } };

  }();

  theme.ListCollectionsSection = new function () {
    this.onSectionLoad = function (target) {
    };
  }();

  theme.BlogTemplateSection = new function () {
    this.onSectionLoad = function (target) {
      /// Visual style of dropdowns
      $('select').selectReplace();

      theme.allowRTEFullWidthImages(target);
    };
  }();

  theme.ArticleTemplateSection = new function () {
    this.onSectionLoad = function (target) {
      theme.checkViewportFillers();
      theme.assessAltLogo();
      theme.allowRTEFullWidthImages(target);
    };
  }();

  theme.CartTemplateSection = new function () {
    this.onSectionLoad = function (target) {
      theme.cartNoteMonitor.load($('#cartform [name="note"]', target));

      // terms and conditions checkbox
      if ($('#cartform input#terms', target).length > 0) {
        $(document).on('click.cartTemplateSection', '#cartform [name="checkout"]:submit, .additional-checkout-buttons :submit, .additional-checkout-buttons input[type=image], a[href="/checkout"]', function () {
          if ($('#cartform input#terms:checked').length == 0) {
            alert(theme.strings.cartConfirmation);
            return false;
          }
        });
      }
    };

    this.onSectionUnload = function (target) {
      theme.cartNoteMonitor.unload($('#cartform [name="note"]', target));
      $(document).off('.cartTemplateSection');
    };
  }();

  theme.CollectionListSection = new function () {
    this.onSectionLoad = function (target) {
      var $swiperCont = $('.swiper-container', target);
      if ($swiperCont.length === 1) {
        theme.initProductSlider($swiperCont);
      }
    };
  }();

  theme.FeaturedCollectionSection = new function () {
    this.onSectionLoad = function (target) {
      var $swiperCont = $('.swiper-container', target);
      if ($swiperCont.length === 1) {
        theme.initProductSlider($swiperCont);
      }
    };
  }();

  theme.ProductRecommendations = new function () {
    this.onSectionLoad = function (container) {
      // Look for an element with class 'product-recommendations'
      var productRecommendationsSection = document.querySelector(".product-recommendations");

      if (productRecommendationsSection === null) {return;}

      // Create request and submit it using Ajax
      var request = new XMLHttpRequest();
      request.open("GET", productRecommendationsSection.dataset.url, true);
      request.onload = function () {
        if (request.status >= 200 && request.status < 300) {
          var container = document.createElement("div");
          container.innerHTML = request.response;
          productRecommendationsSection.innerHTML = container.querySelector(".product-recommendations").innerHTML;
          theme.initAnimateOnScroll();

          var $swiperCont = $('.section-product-recommendations .swiper-container');

          if ($swiperCont.length === 1) {
            theme.initProductSlider($swiperCont);
            setTimeout(() => {
              theme.inlineVideos.init(productRecommendationsSection.parentElement);
              new ProductBlock();
            }, 500);
          } else {
            console.warn('Unable to find .section-product-recommendations');
          }
        }
      };
      request.send();

    };

    this.onSectionUnload = function (container) {
      theme.inlineVideos.destroy(container);
    };
  }();

  theme.GallerySection = new function () {
    this.onSectionLoad = function (container) {
      var $carouselGallery = $('.gallery--mobile-carousel', container);
      if ($carouselGallery.length) {
        var assessCarouselFunction = function assessCarouselFunction() {
          var isCarousel = $carouselGallery.hasClass('slick-slider'),
          shouldShowCarousel = theme.viewport.isXs();

          if (!shouldShowCarousel) {
            $('.lazyload--manual', $carouselGallery).removeClass('lazyload--manual').addClass('lazyload');
          }

          if (isCarousel && !shouldShowCarousel) {
            // Destroy carousel

            // - unload slick
            $carouselGallery.slick('unslick').off('init');
            $carouselGallery.removeAttr('data-transition');
            $carouselGallery.removeClass('slideshow');
            $carouselGallery.find('a, .gallery__item').removeAttr('tabindex').removeAttr('role');

            // - re-row items
            var rowLimit = $carouselGallery.data('grid');
            var $currentRow = null;
            $carouselGallery.find('.gallery__item').each(function (index) {
              if (index % rowLimit === 0) {
                $currentRow = $('<div class="gallery__row">').appendTo($carouselGallery);
              }
              $(this).appendTo($currentRow);
            });
          } else if (!isCarousel && shouldShowCarousel) {
            // Create carousel
            $carouselGallery.find('[data-cc-animate]').removeAttr('data-cc-animate');

            // - de-row items
            $carouselGallery.find('.gallery__item').appendTo($carouselGallery).addClass('slide');
            $carouselGallery.find('.gallery__row').remove();
            $carouselGallery.attr('data-transition', 'slide');
            $carouselGallery.addClass('slideshow');

            // - init carousel
            $carouselGallery.on('init', function () {
              $('.lazyload--manual', this).removeClass('lazyload--manual').addClass('lazyload');
            }).slick({
              autoplay: false,
              fade: false,
              speed: 600,
              infinite: true,
              useTransform: true,
              arrows: false,
              dots: true,
              cssEase: 'cubic-bezier(0.25, 1, 0.5, 1)',
              customPaging: function customPaging(slider, i) {
                return "<button class=\"custom-dot\" type=\"button\" data-role=\"none\" role=\"button\" tabindex=\"0\">" + "<svg xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" width=\"30px\" height=\"30px\" viewBox=\"0 0 30 30\" xml:space=\"preserve\">" + "<circle class=\"circle-one\" cx=\"15\" cy=\"15\" r=\"13\" />" + "<circle class=\"circle-two\" cx=\"15\" cy=\"15\" r=\"13\" />" + "</svg>" + "</button>";





              } }).
            on('beforeChange', function (event, slick, currentSlide, nextSlide) {
              var $outgoingSlide = $(slick.$slides.get(currentSlide));
              $outgoingSlide.addClass('slick--leaving');
            }).on('afterChange', function (event, slick, currentSlide) {
              $(slick.$slides).filter('.slick--leaving').removeClass('slick--leaving');
            });
          }
        };

        assessCarouselFunction();
        $(window).on('debouncedresize.themeSection' + container.id, assessCarouselFunction);
      }
    };

    this.onSectionUnload = function (container) {
      $(window).off('.themeSection' + container.id);
      $('.slick-slider', container).each(function () {
        $(this).slick('unslick').off('init');
      });
    };

    this.onBlockSelect = function (block) {
      $(block).closest('.slick-slider').each(function () {
        $(this).slick('slickGoTo', $(this).data('slick-index')).slick('slickPause');
      });
    };

    this.onBlockDeselect = function (block) {
      $(block).closest('.slick-slider').each(function () {
        $(this).slick('slickPlay');
      });
    };
  }();

  theme.TestimonialsSection = new function () {
    var scrollax;

    this.onSectionLoad = function (container) {
      if (theme.settings.animationEnabledDesktop && theme.viewport.isSm()) {
        scrollax = new Scrollax(window).init();
      }
    };

    this.onSectionUnload = function (container) {
      if (scrollax && scrollax.Scrollax) {
        scrollax.Scrollax('destroy');
      }
    };
  }();

  theme.AccordionSection = new function () {
    this.onSectionLoad = function (container) {
      var event = new CustomEvent("cc-accordion-load");
      window.dispatchEvent(event);
    };

    this.onBlockSelect = function (container) {
      var accordionElem = container.querySelector('.cc-accordion-item:not(.is-open) .cc-accordion-item__title');
      if (accordionElem) {
        accordionElem.click();
      }
    };

    this.onSectionUnload = function (container) {
      var event = new CustomEvent("cc-accordion-unload");
      window.dispatchEvent(event);
    };
  }();

  theme.FaqSection = new function () {
    this.onSectionLoad = function (container) {
      this.intersectionObserver;
      this.namespace = theme.namespaceFromSection(container);
      this.container = container;
      this.pageContent = document.getElementById('page-content');
      this.sidebar = document.getElementById('faq-sidebar');
      this.accordions = this.pageContent.querySelectorAll('.cc-accordion-item__title');
      this.isScrolling = false;

      this.classNames = {
        questionContainerHidden: 'hidden' };


      //Init the FAQs area css classes
      this.functions.initFaqSections.call(this);
      window.addEventListener("shopify:section:load", this.functions.delayedInitFaqSections.bind(this));
      window.addEventListener("shopify:section:unload", this.functions.delayedInitFaqSections.bind(this));
      window.addEventListener("shopify:section:reorder", this.functions.initFaqSections.bind(this));

      //Init the search input
      this.searchInput = this.container.querySelector('#faq-search__input');
      if (this.searchInput) {
        this.registerEventListener(this.searchInput, 'change', this.functions.performSearch.bind(this));
        this.registerEventListener(this.searchInput, 'keyup', this.functions.performSearch.bind(this));
        this.registerEventListener(this.searchInput, 'paste', this.functions.performSearch.bind(this));
      }

      //Init the sidebar
      if (this.container.dataset.sidebarEnabled === "true") {
        this.functions.initSidebar.call(this);
        window.addEventListener("resize", this.functions.debounceUpdateSidebarPosition);
        window.addEventListener("shopify:section:load", this.functions.delayedInitSidebar.bind(this));
        window.addEventListener("shopify:section:unload", this.functions.delayedInitSidebar.bind(this));
        window.addEventListener("shopify:section:reorder", this.functions.initSidebar.bind(this));

        //Everytime an accordion is opened, reposition the sidebar
        this.accordions.forEach((accordion) => {
          accordion.addEventListener('click', this.functions.debounceUpdateSidebarPosition);
        });

        //Add css class to the body to indicate the sidebar is enabled
        document.body.classList.add('faq-sidebar-enabled');
      }
    };

    this.onSectionUnload = function (container) {
      //Destroy the sidebar
      if (this.container.dataset.sidebarEnabled === "true") {
        window.removeEventListener("resize", this.functions.debounceUpdateSidebarPosition);
        window.removeEventListener("shopify:section:load", this.functions.delayedInitSidebar);
        window.removeEventListener("shopify:section:unload", this.functions.delayedInitSidebar);
        window.removeEventListener("shopify:section:reorder", this.functions.initSidebar);
        document.body.classList.remove('faq-sidebar-enabled');
      }

      //Destroy the FAQs area
      window.removeEventListener("shopify:section:load", this.functions.delayedInitFaqSections);
      window.removeEventListener("shopify:section:unload", this.functions.delayedInitFaqSections);
      window.removeEventListener("shopify:section:reorder", this.functions.initFaqSections);
      document.querySelectorAll('.section-faq-accordion').forEach((section) => {
        section.classList.remove('section-faq-accordion');
      });

      //Unobserve intersections
      if (this.intersectionObserver) {
        this.pageContent.querySelectorAll('.section-faq-accordion h2 a').forEach(
        (accordion) => this.intersectionObserver.unobserve(accordion));
      }

      //Remove click bind from accordions
      this.accordions.forEach((accordion) => {
        accordion.removeEventListener('click', this.functions.updateSidebarPosition);
      });

      //Remove active search
      this.pageContent.classList.remove('faq-search-active');
    };

    this.functions = {
      //Add css classes to the consecutive accordion sections that follow the FAQ section
      initFaqSections: function initFaqSections() {
        //Remove the class
        this.pageContent.querySelectorAll('.section-faq-accordion').forEach((section) => section.classList.remove('section-faq-accordion'));

        //Re-add the class
        var foundFaqSection = false,foundNonAccordionSection = false;
        this.pageContent.querySelectorAll('.shopify-section').forEach((section) => {
          if (!foundFaqSection) {
            if (section.classList.contains('section-faq')) {
              foundFaqSection = true;
            }
          } else {
            if (section.classList.contains('section-accordion') && foundNonAccordionSection === false) {
              section.classList.add('section-faq-accordion');
            } else {
              foundNonAccordionSection = true;
            }
          }
        });
      },

      //Delay the init of the FAQs until sections have finished loading/unloading
      delayedInitFaqSections: function delayedInitFaqSections() {
        setTimeout(this.functions.initFaqSections.bind(this), 10);
      },

      //Handles search
      performSearch: function performSearch() {
        // defer to avoid input lag
        setTimeout((() => {
          var splitValue = this.searchInput.value.toLowerCase().split(' ');
          var questionContainers = this.pageContent.querySelectorAll('.section-faq-accordion .cc-accordion');

          // sanitise terms
          var terms = [];
          splitValue.forEach((t) => {
            if (t.length > 0) {
              terms.push(t);
            }
          });

          // add css to indicate whether a search is active
          if (terms.length > 0) {
            this.pageContent.classList.add('faq-search-active');
          } else {
            this.pageContent.classList.remove('faq-search-active');
          }

          // reset the found count
          var accordionSections = this.pageContent.querySelectorAll('.section-faq-accordion');
          if (accordionSections) {
            accordionSections.forEach((accordionSection) => {
              accordionSection.classList.remove('faq-first-answer');
              if (terms.length > 0) {
                accordionSection.dataset.foundCount = '0';
              } else {
                accordionSection.removeAttribute('data-found-count');
              }
            });
          }

          // search
          var noResults = true;
          questionContainers.forEach(((questionContainer) => {
            var foundCount = 0;
            if (terms.length) {
              var termFound = false;
              var matchContent = questionContainer.textContent.toLowerCase();
              terms.forEach((term) => {
                if (matchContent.includes(term)) {
                  if (noResults) {
                    questionContainer.closest('.section-accordion').classList.add('faq-first-answer');
                  }

                  termFound = true;
                  noResults = false;
                }
              });
              if (termFound) {
                questionContainer.classList.remove(this.classNames.questionContainerHidden);
                foundCount++;
              } else {
                questionContainer.classList.add(this.classNames.questionContainerHidden);
              }
            } else {
              questionContainer.classList.remove(this.classNames.questionContainerHidden);
            }

            // Update the found count of the section
            var sectionElem = questionContainer.closest('.section-accordion');
            sectionElem.dataset.foundCount = parseInt(sectionElem.dataset.foundCount) + foundCount;
          }).bind(this));

          //Show/hide the no results message
          if (noResults && terms.length) {
            this.container.classList.add('faq-no-results');
          } else {
            this.container.classList.remove('faq-no-results');
          }

          // Update the sidebar active links
          if (this.container.dataset.sidebarEnabled === "true") {
            var activeSidebar = this.sidebar.querySelector('.faq-sidebar--active');
            if (activeSidebar) {
              activeSidebar.classList.remove('faq-sidebar--active');
            }

            this.sidebar.querySelectorAll('a').forEach((link) => {
              var id = link.getAttribute('href').replace('#', '');
              var anchorElem = document.getElementById(id);
              if (anchorElem) {
                if (anchorElem.offsetParent === null) {
                  link.classList.add('faq-sidebar--disabled');
                } else {
                  link.classList.remove('faq-sidebar--disabled');

                  if (!this.sidebar.querySelector('.faq-sidebar--active')) {
                    link.classList.add('faq-sidebar--active');
                  }
                }
              }
            });
            this.functions.updateSidebarPosition();
          }

        }).bind(this), 10);
      },

      //Init the sticky sidebar
      initSidebar: function initSidebar() {
        //Build the HTML of the sidebar from the FAQ accordion headings
        var anchorHtml = "";
        this.pageContent.querySelectorAll('.section-faq-accordion .section-heading h2').forEach((heading, index) => {
          var label = heading.innerText;
          var anchor = "faq-" + JSON.stringify(label.toLowerCase()).replace(/\W/g, '');
          heading.innerHTML = "<a id=\"".concat(anchor, "\"></a>").concat(label);
          anchorHtml += "<li><a href=\"#".concat(anchor, "\" ").concat(index === 0 ? 'class="faq-sidebar--active"' : '', ">").concat(label, "</a></li>");
        });

        // Append the sidebar HTML
        var nav = new theme.Nav();
        var top = nav.bar.hasStickySetting() ? nav.bar.height() + 50 : 50;

        this.sidebar.innerHTML = "<div class=\"faq-sidebar__inner\" style=\"top: ".concat(
        parseInt(top), "px\">\n          ").concat(
        this.container.dataset.sidebarTitle ? '<h3>' + this.container.dataset.sidebarTitle + '</h3>' : '', "\n          <ol>").concat(
        anchorHtml, "</ol>\n        </div>");


        //Bind click events to each anchor in the sidebar
        this.sidebar.querySelectorAll('a').forEach((anchor) => {
          this.registerEventListener(anchor, 'click', this.functions.handleIndexClick.bind(this));
        });

        //Observe current quick link
        if ('IntersectionObserver' in window) {
          this.intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !this.isScrolling) {
                this.sidebar.querySelectorAll('a').forEach((link) => {
                  if (link.getAttribute('href').replace('#', '') ===
                  entry.target.getAttribute('id')) {
                    link.classList.add('faq-sidebar--active');
                  } else {
                    link.classList.remove('faq-sidebar--active');
                  }
                });
              }
            });
          }, {
            rootMargin: '0px 0px -70%' });


          this.pageContent.querySelectorAll('.section-faq-accordion h2 a').forEach(
          (accordion) => this.intersectionObserver.observe(accordion));
        }

        this.functions.updateSidebarPosition();
      },

      //Delay the init of the sidebar until sections have finished loading/unloading
      delayedInitSidebar: function delayedInitSidebar() {
        setTimeout(this.functions.initSidebar.bind(this), 20);
      },

      //Calculates the position of the sidebar
      updateSidebarPosition: function updateSidebarPosition() {
        var sidebar = document.getElementById('faq-sidebar');
        var faqSection = document.querySelector('.section-faq');
        var foundFaqSection = false,firstNonAccordionSection = null;
        if (faqSection) {
          // Find the section that terminates the FAQ area
          document.querySelectorAll('#page-content .shopify-section').forEach((section) => {
            if (!foundFaqSection) {
              if (section.classList.contains('section-faq')) {
                foundFaqSection = true;
              }
            } else if (firstNonAccordionSection === null && !section.classList.contains('section-accordion')) {
              firstNonAccordionSection = section;
            }
          });

          if (!firstNonAccordionSection) {
            firstNonAccordionSection = document.querySelector('.section-footer');
          }

          var faqSectionTop = faqSection.getBoundingClientRect().top + document.documentElement.scrollTop;
          var bodyPaddingTop = window.getComputedStyle(document.body).getPropertyValue("padding-top");
          bodyPaddingTop = parseInt(bodyPaddingTop.replace('px', ''));
          sidebar.style.top = faqSectionTop - bodyPaddingTop + 'px';

          if (firstNonAccordionSection) {
            var firstNonAccordionSectionTop = firstNonAccordionSection.getBoundingClientRect().top + document.documentElement.scrollTop;
            sidebar.style.height = firstNonAccordionSectionTop - faqSectionTop + 'px';

            var sidebarInner = sidebar.querySelector('.faq-sidebar__inner');
            if (sidebarInner) {
              sidebarInner.style.maxHeight = firstNonAccordionSectionTop - faqSectionTop - 100 + 'px';
            }
          }
        }
      },

      debounceUpdateSidebarPosition: theme.debounce(() => this.functions.updateSidebarPosition),

      handleIndexClick: function handleIndexClick(e) {
        e.preventDefault();

        //Highlight the relevant index immediately
        var activeSidebar = this.sidebar.querySelector('.faq-sidebar--active');
        if (activeSidebar) {
          activeSidebar.classList.remove('faq-sidebar--active');
        }
        e.target.classList.add('faq-sidebar--active');

        this.isScrolling = true;
        theme.viewport.scroll.to(e.currentTarget.getAttribute('href'), -1, 50, () => {
          this.isScrolling = false;
        });
      } };

  }();


  jQuery(function ($) {
    lazySizesConfig.minSize = 200;
    var nav = theme.Nav();

    /// Visual style of dropdowns
    $('select:not(.original-selector)').selectReplace().closest('.selector-wrapper').addClass('has-pretty-select');

    /// General-purpose lightbox
    $('a[rel=lightbox]').colorbox();

    /// Galleries (only on large screens)
    if (theme.viewport.isSm()) {
      $('a[rel="gallery"]').colorbox({ rel: 'gallery' });
    }

    /// Translations for colorbox
    $.extend($.colorbox.settings, {
      previous: theme.strings.colorBoxPrevious,
      next: theme.strings.colorBoxNext,
      close: theme.icons.close });


    /// Image-links
    $('.rte a img').closest('a').addClass('contains-img');

    /// Slideshow fills viewport
    theme.lastViewportWidth = 0;
    $(window).on('debouncedresize slideshowfillheight', function (e) {
      // if only height changed, don't do anything, to avoid issue with viewport-size-change on mobile-scroll
      if (e.type == 'debouncedresize' && theme.lastViewportWidth == $(window).width()) {
        return;
      }

      // set height of slideshows
      var desiredHeight = $(window).height();

      if (nav.bar.isAnnouncementBar()) {
        desiredHeight -= nav.bar.heightOfAnnouncementBar();
      }
      $('.slideshow.fill-viewport, .slideshow.fill-viewport .slide').css('min-height', desiredHeight);

      // check for content that must be contained
      $('.slideshow.fill-viewport').each(function () {
        var inner = 0;
        $(this).find('.slide').each(function () {
          var t = 0;
          $('.fill-viewport__contain', this).each(function () {
            t += $(this).outerHeight(true);
          });
          if (inner < t) {
            inner = t;
          }
        });
        if (inner > desiredHeight) {
          $(this).css('min-height', inner);
          $('.slide', this).css('min-height', inner);
        }
      });

      theme.lastViewportWidth = $(window).width();

      // bump down any header-overlap areas to cater for announcements
      if ($('body.header-section-overlap').length && nav.bar.isAnnouncementBar()) {
        $('#page-content').css('margin-top', nav.bar.heightOfAnnouncementBar());
      } else {
        $('#page-content').css('margin-top', '');
      }
    });

    /// Some states are dependent on scroll position
    $(window).on('scroll assessFeatureHeaders', function () {
      var scrollTop = $(window).scrollTop();
      var appearenceBuffer = 60;
      var windowBottom = scrollTop + $(window).height() - appearenceBuffer;

      $('body').toggleClass('scrolled-down', scrollTop > 0);

      theme.assessAltLogo();

      $('.feature-header:not(.feature-header--visible)').filter(function () {
        var offset = $(this).offset().top;
        var height = $(this).outerHeight();
        return offset + height >= scrollTop && offset <= windowBottom;
      }).addClass('feature-header--visible');
    });

    /// Side up and remove
    $.fn.slideUpAndRemove = function () {var speed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 200;
      $(this).each(function () {
        $(this).slideUp(speed, function () {
          $(this).remove();
        });
      });
    };

    /// Overlay menu nav
    var previousNavRoutes = ['_root'];

    updateNavCtas = function updateNavCtas() {
      var trimmedTitle = previousNavRoutes[previousNavRoutes.length - 1];
      var $ctasToShow = $("#page-menu .nav-ctas__container[data-for-nav-item=\"".concat(trimmedTitle, "\"]:hidden"));

      if ($ctasToShow.length > 0) {
        if ($('#page-menu .nav-ctas__container:visible').length) {
          $('#page-menu .nav-ctas__container:visible').fadeOut(drilldownTransSpeed, function () {
            $ctasToShow.fadeIn(drilldownTransSpeed);
          });
        } else {
          setTimeout(function () {
            $ctasToShow.fadeIn(drilldownTransSpeed);
          }, drilldownTransSpeed);
        }
      } else {
        $('#page-menu .nav-ctas__container:visible').fadeOut(drilldownTransSpeed);
      }
    };

    //Drill down
    var drilldownTransSpeed = 250;
    $(document).on('click', '#page-menu.nav-uses-modal .main-nav li.has-children > a', function () {
      var trimmedTitle = $(this).text().replace(/^\s\s*/, '').replace(/\s\s*$/, '').toLowerCase();
      previousNavRoutes.push(trimmedTitle);

      //- Links
      var $content = $('<div class="container growth-area"/>').append($(this).siblings('ul').clone().wrap("<div class=\"nav-body main-nav growth-area\"/>").
      parent());

      //- Title, in its own menu row, using subnav style for the other links
      var $menuList = $content.find('.main-nav > ul').wrap('<li/>').parent().wrap('<ul/>').parent();
      if (theme.strings.back.length > 0) {
        $menuList.prepend("<li class=\"main-nav__back\" data-nav-title=\"".concat(trimmedTitle, "\"><a href=\"#\" data-revert-back><span class=\"arr arr--left\">").concat(theme.icons.chevronLeft, "</span>").concat(theme.strings.back, "</a></li>"));
      }

      //Hide current & show new
      var $containers = $('#page-menu > .inner > .nav-container > .container:not(.inactive)');
      $containers.addClass('inactive').fadeOut(drilldownTransSpeed, function () {
        $content.hide().insertAfter($containers.last()).fadeIn(drilldownTransSpeed);
        $content.closest('.theme-modal').focus(); // add focus for keyboard scrolling
      });

      updateNavCtas();

      //Hide the footer links
      $('#page-menu > .inner > .nav-container > .nav-footer-links').fadeOut(drilldownTransSpeed);

      return false;
    });

    //Drill back up
    $(document).on('click', '#page-menu.nav-uses-modal a[data-revert-back]', function () {
      previousNavRoutes.pop();
      updateNavCtas();

      $('#page-menu.nav-uses-modal > .inner > .nav-container > .container:not(.inactive)').fadeOutAndRemove(drilldownTransSpeed, function () {
        var $menuToShow = $('#page-menu.nav-uses-modal > .inner > .nav-container > .container.inactive:last');
        $menuToShow.removeClass('inactive').fadeIn(drilldownTransSpeed);

        if ($menuToShow.data('root-nav')) {
          $('#page-menu > .inner > .nav-container > .nav-footer-links').fadeIn(drilldownTransSpeed);
        }
      });
      return false;
    });

    //Close and reset nav
    $(document).on('reset-modal', '#page-menu.nav-uses-modal', function () {
      closeThemeModal();
      setTimeout(function () {
        $('#page-menu.nav-uses-modal > .inner > .nav-container > .container').removeClass('inactive').show().slice(1).remove();
      }, 300); // Delay to match transition on .theme-modal.reveal
      return false;
    }).on('click', 'a[data-reset-and-close]', function () {
      $('#page-menu.nav-uses-modal').trigger('reset-modal');
      return false;
    });


    /// Inline nav links

    //Handle expanding nav
    theme.lastHoverInteractionTimestamp = -1;
    $(document).on('click keydown', '.multi-level-nav .nav-rows .contains-children > a', function (e) {
      if (e.type == 'click' || e.key == 'Enter') {
        $(this).parent().find('ul:first').slideToggle(300);
        return false;
      }
    });

    $(document).on(theme.device.isTouch() ? 'click forceopen forceclose' : 'forceopen forceclose', '.multi-level-nav .contains-mega-menu a.has-children', function (e) {
      $('.nav-ctas__cta .lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');

      // skip column headings
      if ($(this).hasClass('column-title')) {
        return true;
      }

      var navAnimSpeed = 200;

      // check if mouse + click events occurred in same event chain
      var thisInteractionTimestamp = Date.now();
      if (e.type == 'click' && thisInteractionTimestamp - theme.lastHoverInteractionTimestamp < 500) {
        return false;
      }
      if (e.type == 'forceopen' || e.type == 'forceclose') {
        theme.lastHoverInteractionTimestamp = thisInteractionTimestamp;
      }

      //Set some useful vars
      var $tierEl = $(this).closest('[class^="tier-"]');
      var $tierCont = $tierEl.parent();
      var targetTierNum = parseInt($tierEl.attr('class').split('-')[1]) + 1;
      var targetTierClass = 'tier-' + targetTierNum;

      ///Remove nav for all tiers higher than this one (unless we're opening on same level on hover)
      if (e.type != 'forceopen') {
        $tierCont.children().each(function () {
          if (parseInt($(this).attr('class').split('-')[1]) >= targetTierNum) {
            if (e.type == 'forceclose') {
              $(this).removeClass('tier-appeared');
              var $this = $(this);
              theme.hoverRemoveTierTimeoutId = setTimeout(function () {
                $this.remove();
              }, 260);
            } else {
              $(this).slideUpAndRemove(navAnimSpeed);
            }
          }
        });
      }

      //Are we expanding or collapsing
      if ($(this).hasClass('expanded') && e.type != 'forceopen') {
        //Collapsing. Reset state
        $(this).removeClass('expanded').removeAttr('aria-expanded').removeAttr('aria-controls');
      } else {
        ///Show nav
        //Reset other nav items at this level
        $tierEl.find('a.expanded').removeClass('expanded').removeAttr('aria-expanded');
        clearTimeout(theme.hoverRemoveTierTimeoutId);

        //If next tier div doesn't exist, make it
        var $targetTierEl = $tierCont.children('.' + targetTierClass);
        if ($targetTierEl.length == 0) {
          $targetTierEl = $('<div />').addClass(targetTierClass).attr('id', 'menu-' + targetTierClass).appendTo($tierCont);
          if (navAnimSpeed > 0) {
            // new tier, start at 0 height
            $targetTierEl.css('height', '0px');
          }
        } else {
          if (navAnimSpeed > 0) {
            // tier exists, fix its height before replacing contents
            $targetTierEl.css('height', $targetTierEl.height() + 'px');
          }
        }
        // populate new tier
        $targetTierEl.empty().stop(true, false).append($(this).siblings('ul').clone().attr('style', ''));
        if (navAnimSpeed > 0) {
          // transition to correct height, then clear height css
          $targetTierEl.animate(
          {
            height: $targetTierEl.children().outerHeight() },

          navAnimSpeed,
          function () {
            $(this).css('height', '');
          });

        }
        // add class after reflow, for any transitions
        setTimeout(function () {
          $targetTierEl.addClass('tier-appeared');
        }, 10);
        //Mark as expanded
        $(this).addClass('expanded').attr('aria-expanded', 'true').attr('aria-controls', 'menu-' + targetTierClass);
        $('body').addClass('nav-mega-open');
      }
      return false;
    });

    /// Expanding nav on hover
    theme.closeOpenMenuItem = function () {
      $('body').removeClass('nav-mega-open');
      $('.multi-level-nav.reveal-on-hover .has-children.expanded').trigger('forceclose');
    };

    $(document).on('mouseenter mouseleave', '.multi-level-nav.reveal-on-hover .tier-1 .contains-mega-menu', function (e) {
      if (theme.viewport.isSm()) {
        clearTimeout(theme.closeOpenMenuItemTimeoutId);
        if (e.type == 'mouseenter') {
          $(this).children('a').trigger('forceopen');
        } else {
          theme.closeOpenMenuItemTimeoutId = setTimeout(theme.closeOpenMenuItem, 200);
        }
      }
    });

    $(document).on('mouseleave', '.multi-level-nav.reveal-on-hover .tier-appeared', function (e) {
      if (theme.viewport.isSm()) {
        clearTimeout(theme.closeOpenMenuItemTimeoutId);
        theme.closeOpenMenuItemTimeoutId = setTimeout(theme.closeOpenMenuItem, 50);
      }
    });

    $(document).on('mouseenter', '.multi-level-nav.reveal-on-hover .tier-2, .multi-level-nav.reveal-on-hover .tier-3', function (e) {
      if (theme.viewport.isSm()) {
        clearTimeout(theme.closeOpenMenuItemTimeoutId);
      }
    });

    // Keyboard access
    $(document).on('keydown', '.multi-level-nav .contains-children > a.has-children', function (e) {
      if (e.key == 'Enter') {
        if ($(this).parent().hasClass('contains-mega-menu')) {
          if ($(this).attr('aria-expanded') == 'true') {
            theme.closeOpenMenuItem();
          } else {
            $(this).trigger('forceopen');
          }
        } else {
          $(this).parent().toggleClass('reveal-child');
        }
        return false;
      }
    });

    function isPageScrollin() {
      return $('#page-content').outerHeight() > $(window).height();
    }

    /// Modal windows
    var removeModalTimeoutID = -1;
    var closeModalDelay = 300;
    window.closeThemeModal = function (immediate, callbackFn) {
      $('a[data-modal-toggle].active').removeClass('active');

      var $modal = $('.theme-modal.reveal');

      $modal.removeClass('reveal').addClass('unreveal');

      if ($('html.supports-transforms').length && (typeof immediate == 'undefined' || !immediate)) {
        removeModalTimeoutID = setTimeout(function () {
          $('body').removeClass('modal-active');
          $('body, #page-content, #site-control').css('padding-right', '');
        }, closeModalDelay); // Delay to match transition on .theme-modal.reveal
      } else {
        $('body').removeClass('modal-active');
        $('body, #site-control').css('padding-right', '');
      }

      // tabindex
      $modal.find('a').attr('tabindex', '-1');

      if (immediate) {
        $('body').removeAttr('data-modal-id');
      } else {
        setTimeout(function () {
          $('body').removeAttr('data-modal-id');
        }, 200);
      }

      $(window).trigger('ccModalClosing');

      setTimeout(function () {
        $('body').removeClass('modal-closing');

        if ($modal.attr('id') === 'quick-buy-modal') {
          $modal.remove();
        }

        if (callbackFn) {
          callbackFn();
        }

        $(window).trigger('ccModalClosed');
      }, 300);

      $('#search-modal').removeClass('-in');
    };

    //Show arbitrary content in modal window
    window.showThemeModal = function (el, id, callbackFn) {
      //Close current
      closeThemeModal(true);
      //Remove any existing temporary modals
      $('.theme-modal.temp').remove();
      theme.Nav().bar.hide(false);
      //Actually add to the page
      var $el = $(el);
      $el.appendTo('body');
      setTimeout(function () {
        $el.addClass('reveal');
      }, 10);
      theme.addControlPaddingToModal();
      var scrollbarWidth = $.scrollBarWidth();
      //When body is under a modal & has scrollbar, it is not allowed to scroll,
      //so we overflow:hidden it and add a padding the same size as the scrollbar
      if (isPageScrollin()) {
        $('#page-content, #site-control').css('padding-right', scrollbarWidth);
      }
      //Set page state
      $('body').addClass('modal-active modal-opening');

      if (id) {
        $('body').attr('data-modal-id', id);
      }

      setTimeout(function () {
        if ($('.theme-modal:visible [data-modal-close]').length) {
          $('.theme-modal:visible [data-modal-close]').focus();
        }

        $('body').removeClass('modal-opening');
      }, 300);

      //Compensate for an 'always visible' scrollbar
      if (scrollbarWidth > 0) {
        $('.theme-modal:visible').addClass('scrollbar-visible');
      }

      if (callbackFn) {
        callbackFn($el);
      }
    };

    //Show existing modal container hidden on page
    window.showInPageModal = function ($target) {
      $target.removeClass('unreveal').addClass('reveal');
      theme.addControlPaddingToModal();
      var $inputs = $target.find('.focus-me'); //Any inputs to highlight?

      $(this).addClass('active');
      //When body is under a modal, it is not allowed to scroll, so we need this to keep it the same width
      if (isPageScrollin()) {
        $('body, #site-control').css('padding-right', $.scrollBarWidth());
      }
      $('body').addClass('modal-active modal-opening').attr('data-modal-id', $target.attr('id'));
      $('a[tabindex]', $target).removeAttr('tabindex');

      if ($inputs.length == 0) {
        $target.closest('.theme-modal').focus(); // add focus for keyboard scrolling
      } else {
        if (theme.viewport.isSm()) {
          $inputs.focus();
        }
      }

      if ($target.attr('id') === "search-modal") {
        setTimeout(function () {
          $('#search-modal').addClass('-in');
        }, 400);
      }

      setTimeout(function () {
        $('body').removeClass('modal-opening');
      }, 400);
    };

    $(document).on('click', 'body:not(.modal-active) a[data-modal-toggle]', function (e) {
      e.preventDefault();
      window.showInPageModal($($(this).data('modal-toggle')));
    });

    //Close modal on escape keypress
    $(document).on('keyup', function (e) {
      if (e.which == 27) {
        closeThemeModal();
      }
    });
    //Close modal button
    $(document).on('click', 'body.modal-active a[data-modal-close]', function () {
      closeThemeModal();
      return false;
    });
    //Click outside container to close modal
    $(document).on('click', '.theme-modal', function (e) {
      if (e.target == this) {
        closeThemeModal();

        //Trigger any reset events (e.g. in drilldown nav)
        $(this).trigger('reset-modal');
        return false;
      }
    });
    //Switch to a different modal
    $(document).on('click', 'body.modal-active a[data-modal-toggle]', function () {
      closeThemeModal(true);
      $(this).click();
      return false;
    });

    $(document).on('click', '.site-control a[data-modal-nav-toggle]', function () {
      if ($('body.modal-active').length) {
        closeThemeModal(true);
        setTimeout(function () {
          $('#page-menu .crumbs a:first').trigger('click');
        }, 305); // after modal fade-out
      } else {
        $('.nav-ctas__cta .lazyload--manual').removeClass('lazyload--manual').addClass('lazyload');
        window.showInPageModal($('#page-menu'));
      }
      return false;
    });

    //Immmediately select contents when focussing on some inputs
    $(document).on('focusin click', 'input.select-on-focus', function () {
      $(this).select();
      
    }).on('mouseup', 'input.select-on-focus', function (e) {
      e.preventDefault(); //Prevent mouseup killing select()
    });

    //Textareas increase size as you type
    $('#template textarea').each(function () {$(this).autogrow({ animate: false, onInitialize: true });});

    $(document).on('click', '.quantity-wrapper [data-quantity]',function () {
      var $input = $(this);
      var $parent = $input.closest('.quantity-wrapper');
      var adj = $input.data('quantity') == 'up' ? 1 : -1;
      let $qty = $parent.find('input');
      $('.sub-price').css('display', 'block');
      // var $pallet_qty = $parent.find('[name=pallet]');
      // var qty_val = $qty.val(Math.max(1, parseInt($qty.val()) + adj));
      $qty.val(Math.max(0, parseInt($qty.val()) + adj));
      $qty.change();   
      
      return false;
    });
    

    // addToCart Button
    $('.product-detail__form__options--with-calculated-quantity #AddToCart').prop('disabled', true);
    
    // custom-functionality

    // button disabled
    // const disableButton = document.getElementById('AddToCart');
    // disableButton.disabled = true;

    // pallet
    $(document).on('keyup', '.quantity-wrapper [name=pallet]', function() {  
      // disableButton.disabled = false;
      // display none breaking 
      $('.price-pallet').find('.pallet-price:last').css('display', 'none');
      let $unit = parseInt($(this).data('limit'));
      let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
      let $qty = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]');

      $('.sub-price').css('display', 'block');
      if ($(this).val() == 0 ) {
        $('.sub-price').css('display', 'none');
        $ratio.val(0);
        $qty.val(0);
        // disableButton.disabled = true;
      } else{
          $qty.val(Math.max(0, parseInt($(this).val()) * $unit) - parseInt(Math.ceil(parseInt($qty.val()) / $unit) * $unit - parseInt($qty.val())));
          console.log($qty, "qty_pal");
          $ratio.val(Math.max(0, parseFloat(parseInt($qty.val()) / parseFloat($ratio.data('consequent'))).toFixed(2)));
      }

        let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1');
        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());
        let $pallet_real = parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val());
        let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));
        let $quantity_real = Math.ceil($pallet_real * $unit);
        $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val($quantity_real);
        let $ratio_real = parseFloat($quantity_real / $ratio.data('consequent')).toFixed(2);
        $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]').val($ratio_real);
       
        // pallet
        let $pallet_update = $pallet_price/100 * $pallet_val;
        $('.price-pallet').find('.pallet-value').html($pallet_update + ' kr');
        $('input[data-product="Returpall"]').val($pallet_val);
        // product_price
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        console.log($product_price, "product_price");
        let $product_update =parseFloat($product_price * $quantity_real + $pallet_update).toFixed(2) ;
        let $price_format = Math.round($product_update).toLocaleString("en");        
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');

        let inputElement = document.querySelector('input[name="items[0]quantity"]')
        inputElement.value= $pallet_val;
        console.log(inputElement, "input"); 
        let input_breaking = document.querySelector('input[name="items[1]quantity"]')
        input_breaking.value = 0;
  
    })
    // pallet
    $(document).on('change', '.quantity-wrapper [name=pallet]', function() {  
      console.log("before_paellt");
      // display none breaking 
      $('.price-pallet').find('.pallet-price:last').css('display', 'none');
      let $unit = parseInt($(this).data('limit'));
      let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
      let $qty = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]');

      $('.sub-price').css('display', 'block');
      if ($(this).val() == 0 ) {
        $('.sub-price').css('display', 'none');
        $ratio.val(0);
        $qty.val(0);
      } else{
          $qty.val(Math.max(0, parseInt($(this).val()) * $unit) - parseInt(Math.ceil(parseInt($qty.val()) / $unit) * $unit - parseInt($qty.val())));
          console.log($qty, "qty_pal");
          $ratio.val(Math.max(0, parseFloat(parseInt($qty.val()) / parseFloat($ratio.data('consequent'))).toFixed(2)));
      }

        let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1');
        console.log($pallet_price, "pallet_price");

        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());
        let $pallet_real = parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val());
        let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));
        
        console.log($pallet_val, "pallet_val");  
        console.log($quantity, "quantity");
        console.log($pallet_real, "real");

        let $quantity_real = Math.ceil($pallet_real * $unit);

        $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val($quantity_real);
        let $ratio_real = parseFloat($quantity_real / $ratio.data('consequent')).toFixed(2);
        $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]').val($ratio_real);

       
        // pallet
        let $pallet_update = $pallet_price/100 * $pallet_val;
        $('.price-pallet').find('.pallet-value').html($pallet_update + ' kr');
        $('input[data-product="Returpall"]').val($pallet_val);
        // product_price
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        console.log($product_price, "product_price");
        let $product_update =parseFloat($product_price * $quantity_real + $pallet_update).toFixed(2) ;
        let $price_format = Math.round($product_update).toLocaleString("en");
        
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');

        let inputElement = document.querySelector('input[name="items[0]quantity"]')
        inputElement.value= $pallet_val;
        console.log(inputElement, "input"); 
        let input_breaking = document.querySelector('input[name="items[1]quantity"]')
        input_breaking.value = 0;
        
    })

    // product
    
    $(document).on('keyup', '.quantity-wrapper [name=quantity]', function() {
      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "bags") {
        console.log("keyup pc for bags");
        let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
        console.log($ratio.data('consequent'), "ratio");
        $ratio.val(Math.max(0, parseFloat(parseInt($(this).val()) * parseFloat($ratio.data('consequent'))).toFixed(2)));
        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());

        // product
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        let $product_update =parseFloat($product_price * $quantity).toFixed(2);
        let $price_format = Math.round($product_update).toLocaleString("en");
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');
      }

      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "pallet") {
        $('.price-pallet').find('.pallet-price:last').css('display', 'flex');
        let $unit = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').data('limit'));
        let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
        let $pallet = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]');
        $('.sub-price').css('display', 'block');
        $ratio.val(Math.max(0, parseFloat(parseInt($(this).val()) / parseFloat($ratio.data('consequent'))).toFixed(2)));
        $pallet.val(Math.max(0, (parseInt($(this).val()) / $unit).toFixed(3)));
        let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1'); //15000
        let $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); //30000
        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());
        let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));

        // display none pallet
        if ($(this).val() == 0) {
          $('.sub-price').css('display', 'none');
          $pallet.val(0);
          $ratio.val(0);
        }      

        // display none breaking
        let $remainder = $quantity % $unit;
        let breaking = $('.price-pallet').find('.pallet-price:last');

        // number of pallet and breaking
        let inputElement = document.querySelector('input[name="items[0]quantity"]')
        inputElement.value= $pallet_val;
        let input_breaking = document.querySelector('input[name="items[1]quantity"]')

        if ($remainder == 0) {
          breaking.addClass('remove');
          $('.pallet-price.remove').css('display', 'none');
          $breaking_price = 0;
          input_breaking.value = 0;
        } else {
          breaking.removeClass('remove');
          $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); 
          input_breaking.value = 1;
        }

        // pallet
        let $pallet_update = $pallet_price/100 * $pallet_val;

        // product
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        let $product_update =parseFloat($product_price * $quantity + $breaking_price/100 + $pallet_update).toFixed(2);
        let $price_format = Math.round($product_update).toLocaleString("en");
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');
        $('.price-pallet').find('.pallet-value:first').html($pallet_price*$pallet_val/100 + ' kr');
        $('.price-pallet').find('.pallet-value:last').html($breaking_price/100 + ' kr');

      }  
    })

    // product
    $(document).on('change', '.quantity-wrapper [name=quantity]', function() {
      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "bags") {
        let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
        $ratio.val(Math.max(0, parseFloat(parseInt($(this).val()) * parseFloat($ratio.data('consequent'))).toFixed(2)));
        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());

        // product
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        let $product_update =parseFloat($product_price * $quantity).toFixed(2);
        let $price_format = Math.round($product_update).toLocaleString("en");
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');
      }

      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "pallet") {
        $('.price-pallet').find('.pallet-price:last').css('display', 'flex');
        let $unit = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').data('limit'));
        let $ratio = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="ratio"]');
        let $pallet = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]');
        $('.sub-price').css('display', 'block');
        $ratio.val(Math.max(0, parseFloat(parseInt($(this).val()) / parseFloat($ratio.data('consequent'))).toFixed(2)));
        $pallet.val(Math.max(0, (parseInt($(this).val()) / $unit).toFixed(3)));
        let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1'); //15000
        let $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); //30000
        let $quantity = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').val());
        let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));

        // display none pallet
        if ($(this).val() == 0) {
          $('.sub-price').css('display', 'none');
          $pallet.val(0);
          $ratio.val(0);
        }      

        // display none breaking
        let $remainder = $quantity % $unit;
        let breaking = $('.price-pallet').find('.pallet-price:last');

        // number of pallet and breaking
        let inputElement = document.querySelector('input[name="items[0]quantity"]')
        inputElement.value= $pallet_val;
        let input_breaking = document.querySelector('input[name="items[1]quantity"]')

        if ($remainder == 0) {
          breaking.addClass('remove');
          $('.pallet-price.remove').css('display', 'none');
          $breaking_price = 0;
          input_breaking.value = 0;
        } else {
          breaking.removeClass('remove');
          $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); 
          input_breaking.value = 1;
        }

        // pallet
        let $pallet_update = $pallet_price/100 * $pallet_val;

        // product
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        let $product_update =parseFloat($product_price * $quantity + $breaking_price/100 + $pallet_update).toFixed(2);
        let $price_format = Math.round($product_update).toLocaleString("en");
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');
        $('.price-pallet').find('.pallet-value:first').html($pallet_price*$pallet_val/100 + ' kr');
        $('.price-pallet').find('.pallet-value:last').html($breaking_price/100 + ' kr');

      }
      

      

    })

    // ratio quantity
    $(document).on('click', '.ratio-wrapper [data-quantity]',function () {
      console.log("here agaain----------->");
      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "bags") {
          var $input = $(this);
          let consequent = $(this).closest('.ratio-wrapper').find('[name="ratio"]').data('consequent');
          console.log(consequent, "consequent");
          var $parent = $input.closest('.ratio-wrapper');
          var adj = $input.data('quantity') == 'up' ? consequent : -consequent;
          console.log(adj, "adj");
          let $qty = $parent.find('input');
          $qty.val(Math.max(0, Number($qty.val()) + adj).toFixed(2));
          let pc = $qty.val()/consequent;
          let pc_quantity = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]');
          pc_quantity.val(pc);
          $qty.change();           

          // // product
          let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
          let $product_update =parseFloat($product_price * pc).toFixed(2);
          let $price_format = Math.round($product_update).toLocaleString("en");
          $('.price-pallet').find('.theme-money').html($price_format + ' kr');
      }

      if ($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]').data('type') == "pallet") {
        console.log("ratio-change");
        $('.sub-price').css('display', 'block');
        var $input = $(this);
        let consequent = $(this).closest('.ratio-wrapper').find('[name="ratio"]').data('consequent');
        let ratio_unit = Number(1/consequent).toFixed(2);
        console.log(ratio_unit, "ratio_unit");
        let adj = $input.data('quantity') == 'up' ? Number(ratio_unit) : -Number(ratio_unit);
        let $ratio_qty = $input.closest('.ratio-wrapper').find('input');
        $ratio_qty.val(Number($ratio_qty.val()) + adj);
        let pc = Math.ceil($ratio_qty.val()/ratio_unit);
        let pc_quantity = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]');
        pc_quantity.val(pc); 

        let $unit = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').data('limit'));
        let $pallet = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]');
        let pallet_value = Math.max(0, (pc / $unit).toFixed(2));
        $pallet.val(pallet_value);
        let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1'); //15000
        let $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); //30000         
        let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));
        
        // display none pallet
        if (adj == 0) {
          $('.sub-price').css('display', 'none');
          $pallet.val(0);
          pc = 0;
        }      

        // display none breaking
        let $remainder = pc % $unit;
        let breaking = $('.price-pallet').find('.pallet-price:last');

        // number of pallet and breaking
        let inputElement = document.querySelector('input[name="items[0]quantity"]')
        inputElement.value= $pallet_val;
        let input_breaking = document.querySelector('input[name="items[1]quantity"]')

        if ($remainder == 0) {
          breaking.addClass('remove');
          $('.pallet-price.remove').css('display', 'none');
          $breaking_price = 0;
          input_breaking.value = 0;
        } else {
          breaking.removeClass('remove');
          $('.pallet-price').css('display', 'flex');
          $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); 
          console.log($breaking_price, "breakingprice");
          input_breaking.value = 1;
        }

        // pallet
        let $pallet_update = $pallet_price/100 * $pallet_val;

        // product
        let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
        let $product_update =parseFloat($product_price * pc + $breaking_price/100 + $pallet_update).toFixed(2);
        let $price_format = Math.round($product_update).toLocaleString("en");
        $('.price-pallet').find('.theme-money').html($price_format + ' kr');
        $('.price-pallet').find('.pallet-value:first').html($pallet_price*$pallet_val/100 + ' kr');
        $('.price-pallet').find('.pallet-value:last').html($breaking_price/100 + ' kr');

      }
     
      
      return false;
    });
 

    // ratio
    $(document).on('keyup', '.ratio-wrapper [name="ratio"]', function () {
      console.log("ratio-key");
      $('.sub-price').css('display', 'block');
      let $ratio = $(this);
      let consequent = $ratio.data('consequent');
      let $unit = parseInt($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').data('limit'));
      let $pallet = $(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]');
      /* store the entered value */
      var antecedent = $ratio.val();
      console.log(antecedent, "herer");
      /* make the quantity input reflect the calculated result of this number */
      let $qty = $ratio.closest('.product-detail__form__options--with-calculated-quantity').find('[name="quantity"]');
      /*
      set the quantity value to be equal to the entered value divided by the ratio minimum, but that result up to the nearest whole number
      give us that number as an integer, but if that number is below 1, give us 1. Quantity must always be an integer >= 1 */
      let $qty_real = $qty.val(Math.max(0, parseInt(Math.ceil(antecedent * consequent ))));
      /* now set the ratio value again, this time to be the qty times the min */
      $ratio.val(Math.max(0, parseFloat($qty.val() / consequent).toFixed(2)));
      let $pallet_real = $pallet.val(Math.max(0, (parseInt($qty.val()) / $unit).toFixed(2)));
      let $pallet_price = $('.price-pallet').find('.pallet-value').data('pallet-1'); //15000
      let $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); //30000         
      let $pallet_val = Math.ceil(parseFloat($(this).closest('.product-detail__form__options--with-calculated-quantity').find('[name="pallet"]').val()));
      
      // display none pallet
      if ($(this).val() == 0) {
        $('.sub-price').css('display', 'none');
        $pallet.val(0);
        $qty.val(0);
      }      

      // display none breaking
      let $remainder = $qty_real.val() % $unit;
      console.log($remainder, "remainder");
      let breaking = $('.price-pallet').find('.pallet-price:last');

      // number of pallet and breaking
      let inputElement = document.querySelector('input[name="items[0]quantity"]')
      inputElement.value= $pallet_val;
      let input_breaking = document.querySelector('input[name="items[1]quantity"]')

      if ($remainder == 0) {
        breaking.addClass('remove');
        $('.pallet-price.remove').css('display', 'none');
        $breaking_price = 0;
        input_breaking.value = 0;
      } else {
        breaking.removeClass('remove');
        $('.pallet-price').css('display', 'flex');
        $breaking_price = $('.price-pallet').find('.pallet-value:last').data('pallet-2'); 
        console.log($breaking_price, "breakingprice");
        input_breaking.value = 1;
      }

      // pallet
      let $pallet_update = $pallet_price/100 * $pallet_val;

      // product
      let $product_price = parseInt($('.price-pallet').find('.theme-money').data('product-price')) / 100;
      let $product_update =parseFloat($product_price * $qty.val() + $breaking_price/100 + $pallet_update).toFixed(2);
      console.log($product_update, "update");
      let $price_format = Math.round($product_update).toLocaleString("en");
      $('.price-pallet').find('.theme-money').html($price_format + ' kr');
      $('.price-pallet').find('.pallet-value:first').html($pallet_price*$pallet_val/100 + ' kr');
      $('.price-pallet').find('.pallet-value:last').html($breaking_price/100 + ' kr');

      return false;
    });

    /// Redirection dropdowns
    $(document).on('change', 'select.redirecter', function () {
      window.location = $(this).val();
    });

    theme.getUrlParameter = function (name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    /// Scroll to the newsletter when necessary
    var formType = theme.getUrlParameter('form_type');
    if (theme.getUrlParameter('customer_posted') || formType && formType === 'customer') {
      if (window.location.hash && window.location.hash === "footer_newsletter_signup") {
        setTimeout(() => {
          $('html,body').animate({
            scrollTop: $('#footer_newsletter_signup').offset().top - 100 },
          1000);
        }, 100);
      }
    }

    /// Detect android for 100vh fix
    if (navigator.userAgent.toLowerCase().indexOf("android") > -1) {
      $('html').addClass('os-android');
    }

    /// Bind checkout button clicks
    $(document).on('click', '[data-cc-checkout-button]', function (e) {
      if ($('#cc-checkout-form').length) {
        $('#cc-checkout-form').submit();
        return false;
      } else {
        console.warn('Unable to find form with id cc-checkout-form');
      }
    });

    /// Bind pseudo-page-to-page animation event
    $(document).on('click', '[data-cc-animate-click]', function (e) {
      if (theme.settings.animationEnabledDesktop && theme.viewport.isSm() ||
      theme.settings.animationEnabledMobile && theme.viewport.isXs()) {
        if ((window.location.hostname === this.hostname || !this.hostname.length) &&
        $(this).attr('href').length > 0 &&
        $(this).attr('href') !== '#') {
          e.preventDefault();

          var isAnimationFast = $('body').hasClass('animation-speed-fast');
          var pageNavigateDelay = isAnimationFast ? 100 : 200;
          var loaderVisibleDuration = isAnimationFast ? 800 : 1300;
          var $veil = $('#cc-veil');
          var isLoadingAnimation = $veil.hasClass('cc-veil--animate');
          var url = $(this).attr('href');

          $('body').append("<link rel=\"prefetch\" href=\"".concat(url, "\">"));

          $veil.addClass('-in');

          if (isLoadingAnimation) {
            setTimeout(() => {
              $veil.addClass('cc-veil--animate--in').addClass('cc-veil--animate--running');
            }, pageNavigateDelay + 100);
          }

          setTimeout(() => {
            $veil.removeClass('cc-veil--animate--in');
            window.location.href = url;
          }, isLoadingAnimation ? loaderVisibleDuration : pageNavigateDelay);

          //Failsafe - remove the veil after a few second just in case
          setTimeout(() => {
            $('#cc-veil').removeClass('-in');
          }, 8000);

          return false;
        }
      }
    });

    // Process lazy loaded images on page load
    setTimeout(lazySizes.autoSizer.checkElems, 1000);

    /// Watch for tabbing
    function handleFirstTab(e) {
      if (e.keyCode === 9) {// 9 == tab
        $('body').addClass('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);

    //Hide the footer on the challenge page
    if (document.querySelector('.shopify-challenge__container')) {
      document.getElementById('shopify-section-footer').style.display = 'none';
    }

    if (theme.device.isTouch()) {
      document.getElementsByTagName('html')[0].classList.add('touch');
    }

    //Remove the scroll animation from the first element for new users
    var firstSection = document.body.querySelector('.template-index #page-content .shopify-section:first-child [data-cc-animate]');
    if (firstSection && window.localStorage.getItem('is_first_visit') === null) {
      firstSection.removeAttribute('data-cc-animate');
    }
    window.localStorage.setItem('is_first_visit', 'false');

    ///Init stuff
    $(document).on('shopify:section:reorder', function (e) {
      theme.init();
    });

    $(document).on('shopify:section:load', function (e) {
      /// Image-links inside any rte block
      $('.rte a img', e.target).closest('a').addClass('contains-img');

      /// Feature-sized headers have a little fluff
      if ($('.feature-header', e.target).length) {
        $(window).trigger('assessFeatureHeaders');
      }

      /// Init any inline videos
      theme.inlineVideos.init(e.target);

      theme.init();
    }); // end of shopify:section:load

    $(document).on('shopify:section:unload', function (e) {
      /// Unload any inline videos
      theme.inlineVideos.destroy(e.target);

      setTimeout(() => {
        theme.init();
      }, 0);
    });

    //Theme resize events
    $(window).on('debouncedresizewidth', theme.windowResize);

    //Broadcast an event when the screen changes between Xs and Sm
    if (window.matchMedia) {
      var mq = window.matchMedia('(min-width: 768px)');
      if (mq.addEventListener) {
        mq.addEventListener('change', (event) => {
          var customEvent = new CustomEvent("cc-mobile-viewport-size-change");
          window.dispatchEvent(customEvent);
        });
      }
    }

    //Init the theme
    $(function () {
      theme.init();
      $(window).trigger('slideshowfillheight');
      $(window).trigger('assessFeatureHeaders');
    });

    /// Register all sections
    var deferredLoadViewportExcess = 1200;
    theme.Sections.init();
    theme.Sections.register('header', theme.HeaderSection, { deferredLoad: false });
    theme.Sections.register('footer', theme.FooterSection, { deferredLoadViewportExcess });
    theme.Sections.register('slideshow', theme.SlideshowSection, { deferredLoadViewportExcess });
    theme.Sections.register('video', theme.VideoManager, { deferredLoadViewportExcess });
    theme.Sections.register('background-video', theme.VideoManager, { deferredLoadViewportExcess });
    theme.Sections.register('image-with-text-overlay', theme.ImageWithTextOverlay, { deferredLoadViewportExcess });
    theme.Sections.register('image-beside-image', theme.ImageBesideImageSection, { deferredLoadViewportExcess });
    theme.Sections.register('featured-collection', theme.FeaturedCollectionSection, { deferredLoadViewportExcess });
    theme.Sections.register('collection-list', theme.CollectionListSection, { deferredLoadViewportExcess });
    theme.Sections.register('featured-blog', theme.FeaturedBlogSection, { deferredLoadViewportExcess });
    theme.Sections.register('product-template', theme.ProductTemplateSection, { deferredLoadViewportExcess: 200 });
    theme.Sections.register('collection-template', theme.FilterManager, { deferredLoad: false });
    theme.Sections.register('blog-template', theme.BlogTemplateSection, { deferredLoad: false });
    theme.Sections.register('article-template', theme.ArticleTemplateSection, { deferredLoad: false });
    theme.Sections.register('list-collections', theme.ListCollectionsSection, { deferredLoadViewportExcess });
    theme.Sections.register('cart-template', theme.CartTemplateSection, { deferredLoad: false });
    theme.Sections.register('product-recommendations', theme.ProductRecommendations, { deferredLoadViewportExcess });
    theme.Sections.register('gallery', theme.GallerySection, { deferredLoadViewportExcess });
    theme.Sections.register('testimonials', theme.TestimonialsSection, { deferredLoadViewportExcess });
    theme.Sections.register('accordion', theme.AccordionSection, { deferredLoadViewportExcess });
    theme.Sections.register('faq', theme.FaqSection, { deferredLoadViewportExcess });
    theme.Sections.register('search-template', theme.FilterManager, { deferredLoad: false });
  });


  //Register dynamically pulled in sections
  $(function ($) {
    if (cc.sections.length) {
      cc.sections.forEach((section) => {
        try {
          var data = {};
          if (typeof section.deferredLoad !== 'undefined') {
            data.deferredLoad = section.deferredLoad;
          }
          if (typeof section.deferredLoadViewportExcess !== 'undefined') {
            data.deferredLoadViewportExcess = section.deferredLoadViewportExcess;
          }
          theme.Sections.register(section.name, section.section, data);
        } catch (err) {
          console.error("Unable to register section ".concat(section.name, "."), err);
        }
      });
    } else {
      console.warn('Barry: No common sections have been registered.');
    }
  });

})(theme.jQuery);
/* Built with Barry v1.0.8 */


// cart 
// cart 
setInterval(() => {
  $('.cart-list li[p-handle="pallbrytningskostnad"] .quantity-and-remove').css('display', 'none');
  $('.cart-list li[p-handle="returpall-eur-pall"] .quantity-and-remove').css('display', 'none');
  $('.cart-list li[p-handle="byggpall"] .quantity-and-remove').css('display', 'none');


  $('.cart-list li[p-handle="pallbrytningskostnad"]').addClass("custom-product");
  $('.cart-list li[p-handle="returpall-eur-pall"]').addClass("custom-product");
  $('.cart-list li[p-handle="byggpall"]').addClass("custom-product");



  

}, 100);
clearInterval();

document.querySelectorAll('.product-price').forEach(item => {
    var productPrice = item.getAttribute('data-product-price');
    var property = item.closest('.item').querySelector('input').getAttribute('data-properties');
    // Given array
    // Function to get the value for a specific key
    var data =  JSON.parse(property);

    if (data.length > 2) {
      item.innerHTML = "";
    } else {
      item.innerHtml = Number(productPrice)/100 + "/st";
    }
})

// custom search result
document.querySelector('.search-btn').addEventListener('click', (e) => {
  // e.preventDefault();
  setTimeout(() => {
   document.querySelectorAll('.product-block').forEach(item => {
      if (item.getAttribute('data-product-show') == "search") {
        item.style.display = "none";
      }
      
    })
}, "1000");
})



// Set a timeout for 3 seconds (3000 milliseconds)
setTimeout(() => {
   document.querySelectorAll('.product-block').forEach(item => {
      if (item.getAttribute('data-product-show') == "search") {
        item.style.display = "none";
      }
      
    })
}, "1000");





