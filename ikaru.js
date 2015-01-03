//
//     @version 0.0.3 http://rsurjano.github.com/ikaru/
//     ikaru.js is a lightweiht & Faster DOM manipulation cross Browser
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

  var _domReadyHandlers = [],
    _domLoadedHandlers = [],
    _isDomReady = false,
    _isDomLoaded = false,
    _animationLastTime;

  // EVENTS
  var addListener = document.addEventListener ? 'addEventListener' : 'attachEvent';
  var removeListener = document.removeEventListener ? 'removeEventListener' : 'detachEvent';
  var eventPrefix = document.addEventListener ? '' : 'on';
  var createEvent = document.createEvent ? 'createEvent' : 'createEventObject';
  var dispatchEvent = document.dispatchEvent ? 'dispatchEvent' : 'fireEvent';


  // MANIPULATION / AANIMATIONS
  var cssNameProperty = function(prop) {
    return prop;
  };
  var requestAnimationFrame = window.requestAnimationFrame;
  var cancelAnimationFrame = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
  var style = _getComputedStyle(div);

  // CROSSBROWSER
  var vendors = ['-moz-', '-ms-', '-webkit-', '-o-', ''];

  //DOM
  var doc = window.document;
  var _createElem = doc.createElement;
  var div = _createElem('div');



  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations to shortcut use
  var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;

  // MATH FUNCTIONS
  var math = Math,
    round = math.round;

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
      if (_isString(style[vendors[i] + 'transition'])) return true;
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
  //
  var _curry2 = function _curry2(fn) {
    return function(a, b) {
      switch (arguments.length) {
        case 0:
          throw _noArgsException();
        case 1:
          return function(b) {
            return fn(a, b);
          };
        default:
          return fn(a, b);
      }
    };
  };

  var _indexOf = function _indexOf(array, obj) {
    if (Array.prototype.indexOf) return Array.prototype.indexOf.call(array, obj);
    for (var i = 0, j = array.length; i < j; i++) {
      if (array[i] === obj) return i;
    }
    return -1;
  };
  var _isArray = nativeIsArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
  };
  var _isString = function _isString(object) {
    return typeof object === 'string';
  };
  var _isNumeric = function _isNumeric(object) {
    return typeof object === 'number' && isFinite(object);
  };
  var _isObject = function _isObject(object) {
    return typeof object === 'object';
  };
  var _isFunction = function _isFunction(object) {
    return typeof object === 'function';
  };
  var _isLiteralObject = function _isLiteralObject(object) {
    return object && typeof object === "object" && Object.getPrototypeOf(object) === Object.getPrototypeOf({});
  };
  var _isIterable = function _isIterable(object) {
    if (I.isNode(object) || I.isElement(object) || object === window) return false;
    var r = _isLiteralObject(object) || _isArray(object) || (typeof object === 'object' && object !== null && object['length'] !== undefined);
    return r;
  };
  var _getComputedStyle = function _getComputedStyle(element, prop) {
    var computedStyle;
    if (typeof window.getComputedStyle === 'function') { //normal browsers
      computedStyle = window.getComputedStyle(element);
    } else if (typeof document.currentStyle !== undefined) { //shitty browsers
      computedStyle = element.currentStyle;
    } else {
      computedStyle = element.style;
    }
    if (prop) {
      return computedStyle[prop];
    } else {
      return computedStyle;
    }
  };
  var _each = function _each(object, callback) {
    if (_isArray(object) || (typeof object === 'object' && object.length !== undefined)) {
      for (var i = 0, l = object.length; i < l; i++) {
        callback.apply(object[i], [object[i], i]);
      }
      return;
    }

    if (_isLiteralObject(object)) {
      for (var key in object) {
        callback.apply(object[key], [object[key], key]);
      }
    }
  };
  var _error = function _error(msg) {
    str = msg || 'Error detected';
    throw new Error(str);
  };
  var _checkDomRequired = function _checkDomRequired(object) {
    if (!!(object && object.nodeType === 1)) _error('HTML Object required');
    return true;
  };
  var _noArgsException = function _noArgsException() {
    return new TypeError('Funtion called with no arguments');
  };
  var _forEach = function _forEach(fn, list) {
    var idx = -1,
      len = list.length;
    while (++idx < len) {
      fn(list[idx]);
    }
    // i can't bear not to return *something*
    return list;
  };
  var _has = _curry2(function(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  });


  /**
   *
   * FUNCTIONS
   *
   */

  // Implement forEach iteration
  I.forEach = _curry2(_forEach);

  // Implement has check
  I._has = _curry2(__has);


  // See type element
  // Object | Number | String
  // @return true | false
  I.is = _curry2(function is(Ctor, val) {
    return val != null && val.constructor === Ctor || val instanceof Ctor;
  });

  //Verify if is empty
  I.isEmpty = function(object) {
    if (object == null) return true;
    if (_isArray(object) || I.is('string', object)) return object.length === 0;
    for (var key in object)
      if (_has(key, object)) return false;
    return true;
  };

  // Checks if given parameter is a DOMNode Object
  I.isDom = function(object) {
    return !!(object && object.nodeType === 1);
  };

  // DOM Manipulation
  // based in part from: http://blog.garstasio.com/you-dont-need-jquery/

  // Create new Tag DOM Object
  // IE 5.5+
  I.domNode = function(tag) {
    if (I.isEmpty(tag) || !I.is('String', tag)) error('Need a DOM Object');
    return _createElem(tag);
  };

  // Polyfill window.requestAnimationFrame
  I.requestAnimationFrame = function() {
    return requestAnimationFrame;
  };

  // Polyfill window.cancelAnimationFrame
  I.cancelAnimationFrame = function() {
    return cancelAnimationFrame;
  };

  // Normalized Event object
  I.Event = function(e) {
    this._e = e;
    /**
     * Stops event bubbling
     */
    I.Event.prototype.stopPropagation = function() {
      if (this._e.stopPropagation) {
        this._e.stopPropagation();
      } else {
        this._e.cancelBubble = true;
      }
    };

    /**
     * Prevents default behaviour
     */
    I.Event.prototype.preventDefault = function() {
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
      this.button = this._e.button == 1 ? I.Mouse.BUTTON_LEFT : (this._e.button == 4 ? I.Mouse.BUTTON_MIDDLE : I.Mouse.BUTTON_RIGHT);
    } else if (this._e.hasOwnProperty('which')) {
      this.button = this._e.which == 1 ? I.Mouse.BUTTON_LEFT : (this._e.which == 2 ? I.Mouse.BUTTON_MIDDLE : I.Mouse.BUTTON_RIGHT);
    } else {
      this.button = this._e.button;
    }
  };

  // I.Mouse = {};

  // I.Mouse.BUTTON_LEFT = 0;
  // I.Mouse.BUTTON_MIDDLE = 1;
  // I.Mouse.BUTTON_RIGHT = 2;

  // // Mouse events
  // I.Event.ON_CLICK = 'click';
  // I.Event.ON_DBLCLICK = 'dblclick';
  // I.Event.ON_CONTEXTMENU = 'contextmenu';
  // I.Event.ON_MOUSEDOWN = 'mousedown';
  // I.Event.ON_MOUSEENTER = 'mouseenter';
  // I.Event.ON_MOUSELEAVE = 'mouseleave';
  // I.Event.OM_MOUSEMOVE = 'mousemove';
  // I.Event.ON_MOUSEOVER = 'mouseover';
  // I.Event.ON_MOUSEOUT = 'mouseout';
  // I.Event.ON_MOUSEUP = 'mouseup';
  // I.Event.ON_MOUSEMOVE = 'mousemove';

  // // Touch Events
  // I.Event.ON_TOUCHSTART = 'touchstart';
  // I.Event.ON_TOUCHEND = 'touchend';
  // I.Event.ON_TOUCHMOVE = 'touchmove';
  // I.Event.ON_TOUCHCANCEL = 'touchcancel';

  // // Keyboard events
  // I.Event.ON_KEYDOWN = 'keydown';
  // I.Event.ON_KEYUP = 'keyup';
  // I.Event.ON_KEYPRESS = 'keypress';

  // //form events
  // I.Event.ON_SELECT = 'select';
  // I.Event.ON_RESET = 'reset';
  // I.Event.ON_FOCUS = 'focus';
  // I.Event.ON_BLUR = 'blur';
  // I.Event.ON_SUBMIT = 'submit';
  // I.Event.ON_CHANGE = 'change';

  // //frame/window events
  // I.Event.ON_LOAD = 'load';
  // I.Event.ON_UNLOAD = 'unload';
  // I.Event.ON_RESIZE = 'resize';
  // I.Event.ON_UNLOAD = 'unload';
  // I.Event.ON_ERROR = 'error';
  // I.Event.ON_SCROLL = 'scroll';

  // // Standard drag and drop events
  // I.Event.ON_DRAG = 'drag';
  // I.Event.ON_DRAGSTART = 'dragstart';
  // I.Event.ON_DRAGEND = 'dragend';
  // I.Event.ON_DRAGENTER = 'dragenter';
  // I.Event.ON_DRAGLEAVE = 'dragleave';
  // I.Event.ON_DRAGOVER = 'dragover';
  // I.Event.ON_DROP = 'drop';

  // //Dom drag and drop events
  // I.Event.ON_DOM_DRAGSTART = 'onDomDragStart';
  // I.Event.ON_DOM_DRAGEND = 'onDomDragEnd';
  // I.Event.ON_DOM_DRAGMOVE = 'onDomDragMove';
  // I.Event.ON_DOM_DROP = 'onDomDrop';
  // I.Event.ON_DOM_DRAGENTER = 'onDomDragEnter';
  // I.Event.ON_DOM_DRAGLEAVE = 'onDomDragLeave';

  //Attaches javascript listener to DOM Object
  I.addListener = function(event, element, listener) {
    if (element === undefined) _error("Parameter cannot be undefined");

    if (_isIterable(element)) {
      _each(element, function(e, index) {
        I.addListener(e, event, listener);
      });
      return Dom;
    }

    _checkDomRequired(element);

    element._event = element._event || {};
    element._event[event] = element._event[event] || {
      keys: [],
      values: []
    };

    //checks if listener already exists
    if (_indexOf(element._event[event].keys, listener) != -1) return Dom;

    element._event[event].keys.push(listener);
    var _listener = function(e) {
      var evt = new I.Event(e);
      if (listener.call(element, evt) === false) e.stop();
    };

    element._event[event].values.push(_listener);
    element[addListener](eventPrefix + event, _listener);

    return Dom;
  };

  // remove Listener from element
  I.removeListener = function(element, event, listener) {
    if (element === undefined) _error("Parameter cannot be undefined");

    if (_isIterable(element)) {
      _each(element, function(e, index) {
        I.removeListener(e, event, listener);
      });
      return Dom;
    }

    if (!I.isDom(element) && element !== window) _error(element + " is not a DOMNode object");

    if (!element._event || !element._event[event]) return false;


    var key = _indexOf(element._event[evenµt].keys, listener);
    if (key === -1) return false;
    var _listener = element._event[event].values[key];

    element[removeListener](eventPrefix + event, _listener);
    delete element._event[event].values[key];
    delete element._event[event].keys[key];

    return Dom;
  };

  // Determine if element has listener
  I.hasListener = function(element, event, listener) {
    if (!I.isDom(element) && element !== window) _error(element + " is not a DOMNode object");
    if (!element._event || !element._event[event]) return false;
    return _indexOf(element._event[event].keys, listener) !== -1;
  };

  // Find DOM element by CSS Selector
  I.find = function(selector, element) {
    var result = (I.isDom(element)) ? element.querySelectorAll(selector) : document.querySelectorAll(selector);
    return result;
  };

  //Return DOM element by ID
  I.id = function(id) {
    return document.getElementById(id);
  };

  //Return DOM element by Tag
  I.tag = function(name) {
    return document.getElementsByTagName(name);
  };

  // Find elements by Class Name
  I.byClass = function(name) {
    if (name.substring(0, 1) == ".") name = name.substring(1);
    if (document.getElementsByClassName) return document.getElementsByClassName(name);
    if (document.querySelector && document.querySelectorAll) return document.querySelectorAll("." + name);
  };

  // Get Coordinates from element
  I.offset = function(element) {
    _checkDomRequired(element);

    var rect = element.getBoundingClientRect();

    var offset = {
      top: round(rect.top),
      right: round(rect.right),
      bottom: round(rect.bottom),
      left: round(rect.left),
      width: rect.width ? round(rect.width) : round(element.offsetWidth),
      height: rect.height ? round(rect.height) : round(element.offsetHeight)

    };

    //fallback to css width and height
    if (offset.width <= 0) offset.width = parseFloat(_getComputedStyle(element, 'width'));
    if (offset.height <= 0) offset.height = parseFloat(_getComputedStyle(element, 'height'));

    return offset;
  };

  // get Element width
  I.width = function(element) {
    return I.offset(element).width;
  };

  // get Height element
  I.height = function(element) {
    return I.offset(element).height;
  };

  // Get parent from HTML Element
  I.parent = function(element) {
    if (!I.isDom(element)) _error(element + " is not a DOM element");
    return element.parentNode;
  };

  // Get Children elements from HTML Element
  I.children = function(element, tag) {
    var i;

    if (typeof tag === 'boolean' && tag) return element.childNodes;

    var res = [];

    if (_isString(tag)) {
      for (i = 0, j = element.childNodes.length; i < j; i++) {
        if (element.childNodes[i].nodeName.toLowerCase() === tag.toLowerCase()) res.push(element.childNodes[i]);
      }
      return res;
    }

    for (i in element.childNodes) {
      if (element.childNodes[i].nodeType === 1) res.push(element.childNodes[i]);
    }

    return res;
  };

  // get Next sibling from HTML element
  I.next = function(element) {
    _checkDomRequired(element);
    var res = element.nextSibling;
    if (res.nodeType != 1) return I.next(res);
    return res;
  };

  // get Previous sibling from HTML Element
  I.previous = function(element) {
    _checkDomRequired(element);

    var result = element.previousSibling;
    if (result.nodeType != 1) return I.previous(result);
    return result;
  };

  /**
   * Gets or sets element attributes
   * I.attr(element, "href"); // returns href attribute's value of the element
   * I.attr(element, ["href", "target"]); //returns object of attributed of the element
   * I.attr(element, {href: "#new"}); //sets href attribute's value
   */
  I.attr = function(element, attribute) {
    _checkDomRequired(element);

    var result, i;

    //get one attribute
    if (typeof attribute === "string") {

      if (attribute === 'class' && element.className !== undefined) { //class?
        result = element.className;
      } else if (attribute === 'for' && element.htmlFor !== undefined) { //for?
        result = element.htmlFor;
      } else if (attribute === 'value' && element.value !== undefined) { //value?
        result = element.value;
      } else {
        result = element.getAttribute(attribute);
      }

      if (result === '') result = null;
      return result;
    }

    //get many
    if (_isArray(attribute)) {
      result = {};
      for (i in attribute) {
        result[attribute[i]] = I.attribute(element, attribute[i]);
      }
      return result;
    }

    //set attribute(s)
    if (_isLiteralObject(attribute)) {
      for (i in attribute) {
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

  // Set CSS Properties
  I.css = function(element, style) {
    var i;

    if (_isIterable(element) && _isLiteralObject(style)) {
      _each(element, function(e) {
        I.css(e, style);
      });
      return Dom;
    }
    _checkDomRequired(element);

    //get one element
    if (typeof style === "string") return _getComputedStyle(element, cssNameProperty(style));

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

  // Gets css classes
  I.classess = function(element) {
    _checkDomRequired(element);

    var attribute = I.attribute(element, 'class');
    if (!attribute) return [];
    attribute = attribute.split(' ');
    var classNames = [];
    for (var i in attribute) {
      if (attribute[i] === '') continue;
      classNames.push(attribute[i]);
    }
    return classNames;
  };

  // Check if HTML Element hasClass
  I.hasClass = function(element, className) {
    _checkDomRequired(element);

    if (_isString(className)) {
      return _indexOf(I.classess(element), className) > -1 ? true : false;
    } else if (_isArray(className)) {
      var elementClasses = I.classess(element);
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

  // Add Class to HTML object
  I.addClass = function(element, className) {
    if (element === undefined) _error("first parameter cannot be undefined");

    if (_isIterable(element)) {
      _each(element, function(e) {
        I.addClass(e, className);
      });
      return Dom;
    }

    _checkDomRequired(element);

    if (_isArray(className)) {
      for (var i in className) {
        I.addClass(element, className[i]);
      }
      return Dom;
    }

    var classes = I.classess(element);

    if (_indexOf(classes, className) === -1) {
      classes.push(className);
    }
    classes = classes.join(' ');
    return I.attribute(element, {
      class: classes
    });
  };

  // Remove Class
  I.removeClass = function(element, className) {
    if (element === undefined) _error("first parameter cannot be undefined");

    if (_isIterable(element)) {
      _each(element, function(e) {
        I.removeClass(e, className);
      });
      return Dom;
    }
    if (!I.isDom(element)) _error("I.removeClass" + element + " is not a DOMNode object");

    if (!className) {
      return I.attribute(element, {
        class: null
      });
    }

    var classes = I.classess(element);
    var i = _indexOf(classes, className);

    if (i === -1) return;

    classes.splice(i, 1);
    return I.attribute(element, {
      class: classes.join(' ')
    });
  };

  I.create = function(html) {
    var div = document.createElement('tbody');
    var doc = document.createDocumentFragment();
    I.html(div, html);
    var children = I.children(div);

    for (var i = 0, j = children.length; i < j; i++) {
      I.append(doc, children[i]);
    }

    return doc;
  };

  //Create a DOMNode copy
  I.copy = function(element) {
    _checkDomRequired(element);
    return element.cloneNode(true);
  };

  // Set or Get HTML text from  HTML element
  I.html = function(element, string) {
    _checkDomRequired(element);

    if (_isString(string)) {
      element.innerHTML = string;
      return string;
    }

    return element.innerHTML;
  };

  //Set or get Text from HTML element
  I.text = function(element, string) {
    _checkDomRequired(element);

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

  // Insert html content to the End from HTML Element
  I.append = function(element, html) {
    _checkDomRequired(element);

    if (_isString(html)) html = I.create(html);

    element.appendChild(html);
    return html;
  };

  // Insert html content to the BEGINNING from HTML Element
  I.prepend = function(element, html) {
    _checkDomRequired(element);

    if (_isString(html)) html = I.create(html);

    element.insertBefore(html, element.firstChild);
    return html;
  };

  // Insert html content AFTER from HTML Element
  I.after = function(element, html) {
    _checkDomRequired(element);

    if (_isString(html)) {
      html = I.create(html);
    }

    element.parentNode.insertBefore(html, element.nextSibling);
    return html;
  };

  // Insert html content BEFORE from HTML Element
  I.before = function(element, html) {
    _checkDomRequired(element);

    if (_isString(html)) {
      html = I.create(html);
    }

    element.insertBefore(html, element);
    return html;
  };

  //Replace Given HTML to element
  I.replace = function(element, html) {
    _checkDomRequired(element);

    if (_isString(html)) html = I.create(html);

    element.parentNode.replaceChild(html, element);
    return html;
  };

  // remove DOM element
  I.remove = function(element) {
    _checkDomRequired(element);

    return element.parentNode.removeChild(element);
  };

  // Executed when PAGE is loaded
  I.loaded = function(handler) {
    if (_isDomLoaded !== false) {
      handler.call(null, _isDomLoaded);
      return Dom;
    }
    _domLoadedHandlers.push(handler);
    return Dom;
  };

  // executed when document will be ready
  I.ready = function(handler) {
    if (_isDomReady !== false) {
      handler.call(null, _isDomReady);
      return Dom;
    }
    _domReadyHandlers.push(handler);
    return Dom;
  };

  function _onDOMLoaded(e) {

    var event = new I.Event(e);
    _isDomLoaded = event;

    _each(_domLoadedHandlers, function(fn) {
      fn.call(null, event);
    });
  }

  //on load
  if (window.onload !== null) _domLoadedHandlers.push(window.onload);

  window.onload = _onDOMLoaded;

  //on ready
  function _onDOMReady(e) {
    //add most used selectors
    I.body = I.tag('body')[0];
    I.head = I.tag('head')[0];

    var event = new I.Event(e);
    _isDomReady = event;

    _each(_domReadyHandlers, function(fn) {
      fn.call(null, event);
    });
  }
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