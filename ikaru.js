//
//     @version 0.0.3 http://rsurjano.github.com/ikaru/
//     Ikaru.js is a lightweiht & Faster DOM manipulation cross Browser
//
//     @Supports
//
//     @author Roy Surjano <rsurjano> <rsurjano@outlook.com> 2014-2015
//     @author Codex Media http://codex-media.com <codex@codex-media.com>
//     @license MIT
//

(function(window, document, undefined) {

  /**
   * DOM global object
   * @type {{}}
   */
  var Dom = {};

  var _domReadyHandlers = [];
  var _domLoadedHandlers = [];
  var _isDomReady = false;
  var _isDomLoaded = false;
  var _animationLastTime;

  var addListener = document.addEventListener ? 'addEventListener' : 'attachEvent';
  var removeListener = document.removeEventListener ? 'removeEventListener' : 'detachEvent';
  var eventPrefix = document.addEventListener ? '' : 'on';
  var createEvent = document.createEvent ? 'createEvent' : 'createEventObject';
  var dispatchEvent = document.dispatchEvent ? 'dispatchEvent' : 'fireEvent';
  var vendors = ['-moz-', '-ms-', '-webkit-', '-o-', ''];

  var cssNameProperty = function(prop) {
    return prop;
  };
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var div = document.createElement('div');
  var style = _getComputedStyle(div);

  //ie?
  var ie = (function() {
    var undef, v = 3,
      div = document.createElement('div'),
      all = div.getElementsByTagName('i');
    while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]);
    return v > 4 ? v : undef;
  }());

  //css name property detection
  if (ie && ie < 9) {
    cssNameProperty = function(prop) {
      for (var exp = /-([a-z0-9])/; exp.test(prop); prop = prop.replace(exp, RegExp.$1.toUpperCase()));
      return prop;
    };
  }
  //transition detection
  var transitionSupport = (function() {
    for (var i in vendors) {
      if (_isString(style[vendors[i] + 'transition'])) {
        return true;
      }
    }
    return false;
  })();

  //request animation pollyfill
  if (!requestAnimationFrame || !cancelAnimationFrame) {
    for (var i = 0; i < vendors.length; i++) {
      var vendor = vendors[i];
      requestAnimationFrame = requestAnimationFrame || window[vendor + 'RequestAnimationFrame'];
      cancelAnimationFrame = cancelAnimationFrame || window[vendor + 'CancelAnimationFrame'] || window[vendor + 'CancelRequestAnimationFrame'];
    }
  }

  if (!requestAnimationFrame || !cancelAnimationFrame) {
    requestAnimationFrame = function(callback) {
      var currentTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currentTime - _animationLastTime));
      var id = window.setTimeout(function _requestAnimationFrameTimeout() {
        callback(currentTime + timeToCall);
      }, timeToCall);

      _animationLastTime = currentTime + timeToCall;
      return id;
    };

    cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }


  // Util functions
  var error = function(str) {
    if (typeof str !== 'string') throw new Error('provide a string to Throw Error');
    throw new Error(str);
  };


  // Checks if given parameter is a DOMNode
  ikaru.isDom = function(ob) {
    return !!(ob && ob.nodeType === 1);
  };

  // DOM Manipulation
  // based in part from: http://blog.garstasio.com/you-dont-need-jquery/

  // domNode | Create new DOM element
  // IE 5.5+
  ikaru.domNode = function(tag) {
    if (ikaru.isEmpty(tag) || !ikaru.is('string', tag)) return '';
    return createElem(tag);
  };

  /**
   * Polyfill for window.requestAnimationFrame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window.requestAnimationFrame
   * @returns {Function}
   */
  Dom.requestAnimationFrame = function() {
    return requestAnimationFrame;
  };

  /**
   * Polyfill for window.cancelAnimationFrame
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window.cancelAnimationFrame
   * @returns {Function}
   */
  Dom.cancelAnimationFrame = function() {
    return cancelAnimationFrame;
  };

  /**
   * Normalized Event object
   *
   * @param {DOMEvent} e
   * @constructor
   */
  Dom.Event = function(e) {
    this._e = e;
    /**
     * Stops event bubbling
     */
    Dom.Event.prototype.stopPropagation = function() {
      if (this._e.stopPropagation) {
        this._e.stopPropagation();
      } else {
        this._e.cancelBubble = true;
      }
    };

    /**
     * Prevents default behaviour
     */
    Dom.Event.prototype.preventDefault = function() {
      if (this._e.preventDefault) {
        this._e.preventDefault();
      } else {
        this._e.returnValue = false;
      }
    };

    this.target = this._e.target || this._e.srcElement;
    this.ctrlKey = this._e.ctrlKey;
    this.shiftKey = this._e.shiftKey;
    this.altKey = this._e.altKey;
    this.layerY = this._e.layerY || this._e.offsetY;
    this.layerX = this._e.layerX || this._e.offsetX;
    this.x = this._e.x || this._e.clientX;
    this.y = this._e.y || this._e.clientY;
    this.keyCode = this._e.keyCode;
    this.name = this.type = this._e.type;
    this.path = this._e.path;
    this.timeStamp = this._e.timeStamp;
    if (ie & ie < 9) {
      this.button = this._e.button == 1 ? Dom.Mouse.BUTTON_LEFT : (this._e.button == 4 ? Dom.Mouse.BUTTON_MIDDLE : Dom.Mouse.BUTTON_RIGHT);
    } else if (this._e.hasOwnProperty('which')) {
      this.button = this._e.which == 1 ? Dom.Mouse.BUTTON_LEFT : (this._e.which == 2 ? Dom.Mouse.BUTTON_MIDDLE : Dom.Mouse.BUTTON_RIGHT);
    } else {
      this.button = this._e.button;
    }
  };

  Dom.Mouse = {};

  Dom.Mouse.BUTTON_LEFT = 0;
  Dom.Mouse.BUTTON_MIDDLE = 1;
  Dom.Mouse.BUTTON_RIGHT = 2;

  /**
   * Mouse events
   */
  Dom.Event.ON_CLICK = 'click';
  Dom.Event.ON_DBLCLICK = 'dblclick';
  Dom.Event.ON_CONTEXTMENU = 'contextmenu';
  Dom.Event.ON_MOUSEDOWN = 'mousedown';
  Dom.Event.ON_MOUSEENTER = 'mouseenter';
  Dom.Event.ON_MOUSELEAVE = 'mouseleave';
  Dom.Event.OM_MOUSEMOVE = 'mousemove';
  Dom.Event.ON_MOUSEOVER = 'mouseover';
  Dom.Event.ON_MOUSEOUT = 'mouseout';
  Dom.Event.ON_MOUSEUP = 'mouseup';
  Dom.Event.ON_MOUSEMOVE = 'mousemove';

  /**
   * Touch Events
   */
  Dom.Event.ON_TOUCHSTART = 'touchstart';
  Dom.Event.ON_TOUCHEND = 'touchend';
  Dom.Event.ON_TOUCHMOVE = 'touchmove';
  Dom.Event.ON_TOUCHCANCEL = 'touchcancel';

  /**
   * Keyboard events
   */
  Dom.Event.ON_KEYDOWN = 'keydown';
  Dom.Event.ON_KEYUP = 'keyup';
  Dom.Event.ON_KEYPRESS = 'keypress';

  //form events
  Dom.Event.ON_SELECT = 'select';
  Dom.Event.ON_RESET = 'reset';
  Dom.Event.ON_FOCUS = 'focus';
  Dom.Event.ON_BLUR = 'blur';
  Dom.Event.ON_SUBMIT = 'submit';
  Dom.Event.ON_CHANGE = 'change';

  //frame/window events
  Dom.Event.ON_LOAD = 'load';
  Dom.Event.ON_UNLOAD = 'unload';
  Dom.Event.ON_RESIZE = 'resize';
  Dom.Event.ON_UNLOAD = 'unload';
  Dom.Event.ON_ERROR = 'error';
  Dom.Event.ON_SCROLL = 'scroll';

  /**
   * Standard drag and drop events
   */
  Dom.Event.ON_DRAG = 'drag';
  Dom.Event.ON_DRAGSTART = 'dragstart';
  Dom.Event.ON_DRAGEND = 'dragend';
  Dom.Event.ON_DRAGENTER = 'dragenter';
  Dom.Event.ON_DRAGLEAVE = 'dragleave';
  Dom.Event.ON_DRAGOVER = 'dragover';
  Dom.Event.ON_DROP = 'drop';

  /**
   * Dom drag and drop events
   */
  Dom.Event.ON_DOM_DRAGSTART = 'onDomDragStart';
  Dom.Event.ON_DOM_DRAGEND = 'onDomDragEnd';
  Dom.Event.ON_DOM_DRAGMOVE = 'onDomDragMove';
  Dom.Event.ON_DOM_DROP = 'onDomDrop';
  Dom.Event.ON_DOM_DRAGENTER = 'onDomDragEnter';
  Dom.Event.ON_DOM_DRAGLEAVE = 'onDomDragLeave';

  /**
   * Attaches javascript listener to the element(s) for the given event type
   *
   * @param {HTMLElement|NodeList} element
   * @param {String} event
   * @param {Function} listener
   *
   * @returns {Dom|false} returns Dom if listener has been attached otherwise false
   */
  Dom.addListener = function(element, event, listener) {
    if (element === undefined) {
      error("Parameter cannot be undefined");
    }

    if (_isIterable(element)) {
      _each(element, function(e, index) {
        Dom.addListener(e, event, listener);
      });
      return Dom;
    }

    if (!Dom.isDom(element) && element !== window) {
      error(element + " is not a DOMNode object");
    }

    element._event = element._event || {};
    element._event[event] = element._event[event] || {
      keys: [],
      values: []
    };

    //checks if listener already exists
    if (_indexOf(element._event[event].keys, listener) != -1) {
      return Dom;
    }

    element._event[event].keys.push(listener);
    var _listener = function(e) {
      var evt = new Dom.Event(e);
      if (listener.call(element, evt) === false) {
        e.stop();
      }
    };
    element._event[event].values.push(_listener);

    element[addListener](eventPrefix + event, _listener);

    return Dom;
  };

  /**
   * Removes javascript listener from the element(s) for the given event type.
   * @param {HTMLElement|NodeList} element
   * @param {String} event
   * @param {Function} listener
   * @returns {object|false} returns Dom object if success otherwise false
   */
  Dom.removeListener = function(element, event, listener) {
    if (element === undefined) {
      error("Parameter cannot be undefined");
    }

    if (_isIterable(element)) {
      _each(element, function(e, index) {
        Dom.removeListener(e, event, listener);
      });
      return Dom;
    }

    if (!Dom.isDom(element) && element !== window) {
      error(element + " is not a DOMNode object");
    }

    if (!element._event || !element._event[event]) {
      return false;
    }

    var key = _indexOf(element._event[event].keys, listener);
    if (key === -1) {
      return false;
    }
    var _listener = element._event[event].values[key];

    element[removeListener](eventPrefix + event, _listener);
    delete element._event[event].values[key];
    delete element._event[event].keys[key];

    return Dom;
  };

  /**
   * Determine whether a supplied listener is attached to the element
   *
   * @param {HTMLElement} element
   * @param {String} event
   * @param {Function} listener
   * @returns {boolean}
   */
  Dom.hasListener = function(element, event, listener) {
    if (!Dom.isDom(element) && element !== window) {
      error(element + " is not a DOMNode object");
    }

    if (!element._event || !element._event[event]) {
      return false;
    }
    return _indexOf(element._event[event].keys, listener) !== -1;
  };


  /* Dom Traversal */

  /**
   * Finds HTMLElements that match css pattern
   *
   * Supported from IE 8.0, FF 3.5, Chrome 4.0, Safari 3.1
   * @param {String} selector
   * @oaram {HTMLElement} element not required
   * @returns {NodeList}
   */
  Dom.find = function(selector, element) {
    var result = [];
    if (Dom.isDom(element)) {
      result = element.querySelectorAll(selector);
    } else {
      result = document.querySelectorAll(selector);
    }
    return result;
  };

  /**
   * Returns HTMLElement with given id
   *
   * @param {String} id
   * @returns {HTMLElement}
   */
  Dom.id = function(id) {
    return document.getElementById(id);
  };

  //Finds domElement by tag
  Dom.tag = function(name) {
    return document.getElementsByTagName(name);
  };

  /**
   * Finds HTMLElements with given class name
   *
   * Supported from IE 8.0, FF 3.5, Chrome 4.0, Safari 3.1
   * @param name
   * @returns {NodeList}
   */
  Dom.byClass = function(name) {
    if (name.substring(0, 1) == ".") name = name.substring(1);
    if (document.getElementsByClassName) return document.getElementsByClassName(name);
    if (document.querySelector && document.querySelectorAll) return document.querySelectorAll("." + name);
  };

  /**
   * Returns current coordinates of the element,
   * relative to the document
   *
   * @param {HTMLElement} element
   * @returns {*}
   */
  Dom.offset = function(element) {
    if (!Dom.isDom(element)) {
      return false;
    }
    var rect = element.getBoundingClientRect();

    var offset = {
      top: Math.round(rect.top),
      right: Math.round(rect.right),
      bottom: Math.round(rect.bottom),
      left: Math.round(rect.left),
      width: rect.width ? Math.round(rect.width) : Math.round(element.offsetWidth),
      height: rect.height ? Math.round(rect.height) : Math.round(element.offsetHeight)

    };

    //fallback to css width and height
    if (offset.width <= 0) {
      offset.width = parseFloat(_getComputedStyle(element, 'width'));
    }
    if (offset.height <= 0) {
      offset.height = parseFloat(_getComputedStyle(element, 'height'));
    }

    return offset;
  };

  /**
   * Returns the width of the element
   *
   * @param {HTMLElement} element
   */
  Dom.width = function(element) {
    return Dom.offset(element).width;
  };

  /**
   * Returns the height of the element
   *
   * @param {HTMLElement} element
   */
  Dom.height = function(element) {
    return Dom.offset(element).height;
  };

  /**
   * Gets the parent of the html element
   *
   * @param {HTMLElement} element
   * @returns {HTMLElement}
   */
  Dom.parent = function(element) {
    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }
    return element.parentNode;
  };

  /**
   * Gets children elements of html element. Text nodes are ommited by default.
   * To get textnodes tag must be set to true, eg.
   *
   *      Dom.children(element, true)
   *
   * @param {HTMLElement} element
   * @param {String|boolean} tag filters children by tag name or tells to retrieve text nodes as well
   * @returns {NodeList|Array}
   */
  Dom.children = function(element, tag) {
    var i;

    if (typeof tag === 'boolean' && tag) {
      return element.childNodes;
    }

    var result = [];

    if (_isString(tag)) {

      for (i = 0, j = element.childNodes.length; i < j; i++) {
        if (element.childNodes[i].nodeName.toLowerCase() === tag.toLowerCase()) {
          result.push(element.childNodes[i]);
        }
      }
      return result;
    }

    for (i in element.childNodes) {
      if (element.childNodes[i].nodeType === 1) {
        result.push(element.childNodes[i]);
      }
    }

    return result;
  };

  /**
   * Gets following sibling element of the HTMLElement
   *
   * @param {HTMLElement} element
   * @returns {HTMLElement}
   */
  Dom.next = function(element) {
    if (!Dom.isDom(element)) error(element + " is not a DOMNode object");
    var res = element.nextSibling;
    if (res.nodeType != 1) return Dom.next(res);
    return res;
  };

  /**
   * Gets previous sibling element of the HTMLElement
   *
   * @param {HTMLElement} element
   * @returns {HTMLElement}
   */
  Dom.previous = function(element) {
    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    var result = element.previousSibling;
    if (result.nodeType != 1) {
      return Dom.previous(result);
    }
    return result;
  };

  /* Dom Manipulation */

  /**
   * Gets or sets element attributes
   * if the attribute is not defined this method
   * return an empty string
   *
   * @param element
   * @param attribute
   * @param {*} attribute attribute name or names
   *
   * @example
   * Dom.attribute(el, "href"); // returns href attribute's value of the element
   * Dom.attribute(el, ["href", "target"]); //returns object of attributed of the element
   * Dom.attribute(el, {href: "#new"}); //sets href attribute's value
   */
  Dom.attribute = function(element, attribute) {
    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    //get one attribute
    if (typeof attribute === "string") {

      var result;

      if (attribute === 'class' && element['className'] !== undefined) { //class?
        result = element.className;
      } else if (attribute === 'for' && element['htmlFor'] !== undefined) { //for?
        result = element.htmlFor;
      } else if (attribute === 'value' && element['value'] !== undefined) { //value?
        result = element.value;
      } else {
        result = element.getAttribute(attribute);
      }

      if (result === '') {
        result = null;
      }
      return result;
    }

    //get many
    if (_isArray(attribute)) {
      var result = {};
      for (var i in attribute) {
        result[attribute[i]] = Dom.attribute(element, attribute[i]);
      }
      return result;
    }

    //set attribute(s)
    if (_isLiteralObject(attribute)) {
      for (var i in attribute) {
        if (attribute[i] === null) {
          element.removeAttribute(i);
        } else {
          element.setAttribute(i, attribute[i]);
        }
      }
      return attribute;
    }

    return false;
  };

  /**
   * Sets or gets HTMLElement's style
   *
   * @param {HTMLElement} element
   * @param {Object} style key value pair object
   * @returns {Object|false}
   */
  Dom.css = function(element, style) {
    var i;

    if (_isIterable(element) && _isLiteralObject(style)) {
      _each(element, function(e) {
        Dom.css(e, style);
      });
      return Dom;
    }

    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    //get one element
    if (typeof style === "string") {
      return _getComputedStyle(element, cssNameProperty(style));
    }

    //get array of elements
    if (_isArray(style)) {
      var css = {};
      for (i in style) {
        css[style[i]] = _getComputedStyle(element, cssNameProperty(style[i]));
      }
      return css;
    }

    if (_isLiteralObject(style)) {
      //set csses
      for (i in style) {
        element.style[cssNameProperty(i)] = style[i];
      }
      return style;
    }

    return false;
  };

  /**
   * Gets css classes of the given element
   *
   * @param {HTMLElement} element
   * @returns {Array}
   */
  Dom.classess = function(element) {
    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    var attribute = Dom.attribute(element, 'class');
    if (!attribute) {
      return [];
    }
    attribute = attribute.split(' ');
    var classNames = [];
    for (var i in attribute) {
      if (attribute[i] === '') {
        continue;
      }
      classNames.push(attribute[i]);
    }
    return classNames;
  };

  /**
   * Checks whether html element is assigned to the given class(es)
   *
   * @param element
   * @param {String|Array} className
   * @returns {boolean}
   */
  Dom.hasClass = function(element, className) {
    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    if (_isString(className)) {
      return _indexOf(Dom.classess(element), className) > -1 ? true : false;
    } else if (_isArray(className)) {
      var elementClasses = Dom.classess(element);
      for (var i in className) {
        if (_indexOf(className[i], elementClasses) === -1) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }

    return false;
  };

  /**
   * Assign new css class(es) to the html element(s)
   *
   * @param {HTMLElement} element
   * @param {String} className
   * @returns {boolean}
   */
  Dom.addClass = function(element, className) {
    if (element === undefined) {
      error("Dom.addClass first parameter cannot be undefined");
    }

    if (_isIterable(element)) {
      _each(element, function(e) {
        Dom.addClass(e, className);
      });
      return Dom;
    }

    if (!Dom.isDom(element)) {
      error(element + " is not a DOMNode object");
    }

    if (_isArray(className)) {
      for (var i in className) {
        Dom.addClass(element, className[i]);
      }
      return Dom;
    }

    var classes = Dom.classess(element);

    if (_indexOf(classes, className) === -1) {
      classes.push(className);
    }
    classes = classes.join(' ');
    return Dom.attribute(element, {
      class: classes
    });
  };

  /**
   * Removes html element's assignment to the css class(es)
   *
   * @param {HTMLElement} element
   * @param {String} className
   */
  Dom.removeClass = function(element, className) {
    if (element === undefined) {
      error("Dom.removeClass first parameter cannot be undefined");
    }

    if (_isIterable(element)) {
      _each(element, function(e) {
        Dom.removeClass(e, className);
      });
      return Dom;
    }

    if (!Dom.isDom(element)) {
      error("Dom.removeClass" + element + " is not a DOMNode object");
    }

    if (!className) {
      return Dom.attribute(element, {
        class: null
      });
    }

    var classes = Dom.classess(element);
    var i = _indexOf(classes, className);

    if (i === -1) {
      return;
    }
    classes.splice(i, 1);
    return Dom.attribute(element, {
      class: classes.join(' ')
    });

  };

  /**
   * Creates html element(s)
   *
   * @param {String} html
   * @return {HTMLElement}
   */
  Dom.create = function(html) {
    var div = document.createElement('tbody');
    var doc = document.createDocumentFragment();
    Dom.html(div, html);
    var children = Dom.children(div);


    for (var i = 0, j = children.length; i < j; i++) {
      Dom.append(doc, children[i]);
    }

    return doc;
  };

  /**
   * Creates a copy of a node, and returns the clone.
   *
   * @param {HTMLElement} element
   * @return {HTMLElement}
   */
  Dom.copy = function(element) {
    if (!Dom.isDom(element)) error("Dom.copy" + element + " is not a DOMNode object");
    return element.cloneNode(true);
  };

  /**
   * Gets or sets inner html of HTMLElement
   *
   * @param {HTMLElement} element
   * @param {String} string
   * @returns {String}
   */
  Dom.html = function(element, string) {
    if (!Dom.isDom(element)) {
      error("Dom.html" + element + " is not a DOMNode object");
    }

    if (_isString(string)) {
      element.innerHTML = string;
      return string;
    }

    return element.innerHTML;
  };

  /**
   * Gets or sets text value of the HTML element
   *
   * @param {HTMLElement} element
   * @param {String} string
   * @returns {*}
   */
  Dom.text = function(element, string) {

    if (!Dom.isDom(element)) {
      error("Dom.text " + element + " is not a DOMNode object");
    }

    if (_isString(string)) {

      if (element.innerText) {
        element.innerText = string;
      } else {
        element.textContent = string;
      }
      return string;
    }

    if (element.innerText) {
      return element.innerText;
    }

    return element.textContent;
  };

  /**
   * Micro template support, replaces the {{tag}} with variable
   * in hash array passed to function
   *
   * @param {String} tpl template string
   * @param {Object} hash
   * @returns {String}
   *
   * @example
   * ```
   * var str = '<h1 class="{{class}}">{{text}}</h1>';
   * var hash = {class: 'example', text: function () {return 'header';}};
   *
   * var result = Dom.template(str, hash);//<h1 class="example">header</h1>
   * ```
   */
  Dom.template = function(tpl, hash) {

    var regex = /\{\{.*?\}\}/gi;

    return tpl.replace(regex, function replacer(str, pos, tpl) {
      var properties = str.replace('{{', '').replace('}}', '').trim().split(' ');
      var tag = properties[0];
      if (!tag || !hash.hasOwnProperty(tag)) {
        return '';
      }
      if (_isFunction(hash[tag])) {
        return hash[tag].apply(tpl, properties);
      }
      if (_isString(hash[tag]) || _isNumeric(hash[tag])) {
        return hash[tag];
      }
      return '';
    });
  };

  /**
   * Inserts content specified by the html argument at the end of HTMLElement
   *
   * @param {HTMLElement} element
   * @param {String|HTMLElement} html
   * @return {HTMLElement} inserted element
   */
  Dom.append = function(element, html) {

    if (!Dom.isDom(element)) {
      error("Dom.append " + element + " is not a DOMNode object");
    }

    if (_isString(html)) {
      html = Dom.create(html);
    }
    element.appendChild(html);
    return html;
  };

  /**
   * Inserts content specified by the html argument at the beginning of HTMLElement
   *
   * @param {HTMLElement} element
   * @param {String|HTMLElement} html
   * @returns {HTMLElement} inserted element
   */
  Dom.prepend = function(element, html) {

    if (!Dom.isDom(element)) {
      error("Dom.prepend " + element + " is not a DOMNode object");
    }

    if (_isString(html)) {
      html = Dom.create(html);
    }
    element.insertBefore(html, element.firstChild);
    return html;
  };

  /**
   * Inserts content specified by the html argument after the HTMLElement
   *
   * @param {HTMLElement} element
   * @param {String|HTMLElement} html
   * @returns {HTMLElement} inserted element
   */
  Dom.after = function(element, html) {

    if (!Dom.isDom(element)) {
      error("Dom.after " + element + " is not a DOMNode object");
    }

    if (_isString(html)) {
      html = Dom.create(html);
    }

    element.parentNode.insertBefore(html, element.nextSibling);
    return html;
  };

  /**
   * Inserts content specified by the html argument before the HTMLElement
   *
   * @param {HTMLElement} element
   * @param {String|HTMLElement} html
   * @returns {HTMLElement} inserted element
   */
  Dom.before = function(element, html) {

    if (!Dom.isDom(element)) {
      error("Dom.before " + element + " is not a DOMNode object");
    }

    if (_isString(html)) {
      html = Dom.create(html);
    }

    element.insertBefore(html, element);
    return html;
  };

  /**
   * Replaces given html element with content specified in html parameter
   *
   * @param {HTMLElement} element
   * @param {String|HTMLElement} html
   * @returns {HTMLElement} inserted element
   */
  Dom.replace = function(element, html) {

    if (!Dom.isDom(element)) {
      error("Dom.replace " + element + " is not a DOMNode object");
    }

    if (_isString(html)) {
      html = Dom.create(html);
    }
    element.parentNode.replaceChild(html, element);
    return html;
  };

  /**
   * Removes HTMLElement from dom tree
   *
   * @param {HTMLElement} element
   * @returns {HTMLElement} removed element
   */
  Dom.remove = function(element) {

    if (!Dom.isDom(element)) {
      error("Dom.remove " + element + " is not a DOMNode object");
    }

    var parent = element.parentNode;
    return parent.removeChild(element);
  };

  /**
   * Sets handler which will be executed as soon as
   * document will load
   *
   * @param {Function} handler
   * @returns {Dom}
   */
  Dom.loaded = function(handler) {
    if (_isDomLoaded !== false) {
      handler.call(null, _isDomLoaded);
      return Dom;
    }

    _domLoadedHandlers.push(handler);
    return Dom;
  };

  // executed when document will be ready
  Dom.ready = function(handler) {
    if (_isDomReady !== false) {
      handler.call(null, _isDomReady);
      return Dom;
    }
    _domReadyHandlers.push(handler);
    return Dom;
  };

  function _onDOMReady(e) {
    //add most used selectors
    Dom.body = Dom.tag('body')[0];
    Dom.head = Dom.tag('head')[0];

    var event = new Dom.Event(e);
    _isDomReady = event;

    _each(_domReadyHandlers, function(fn) {
      fn.call(null, event);
    });
  }

  function _onDOMLoaded(e) {

    var event = new Dom.Event(e);
    _isDomLoaded = event;

    _each(_domLoadedHandlers, function(fn) {
      fn.call(null, event);
    });
  }

  //on load
  if (window.onload !== null) {
    _domLoadedHandlers.push(window.onload);
  }
  window.onload = _onDOMLoaded;

  //on ready
  if (addListener === 'attachEvent') { //shitty browsers
    document[addListener]('onreadystatechange', function(e) {
      if (document.readyState === 'complete') {
        document[removeListener]('onreadystatechange', arguments.callee);
        _onDOMReady(e);
      }
    });
  } else { //ecma compatible browsers
    document[addListener]('DOMContentLoaded', function(e) {
      document[removeListener]('DOMContentLoaded', arguments.callee, false);
      _onDOMReady(e);
    }, false);
  }


  //export dom
  window.Dom = Dom;
})(this, document);