(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.$ = factory());
}(this, (function () { 'use strict';

/*
 * @module Util
 */

/*
 * Reference to the window object
 * @private
 */

var win = typeof window !== 'undefined' ? window : {};

/**
 * Convert `NodeList` to `Array`.
 *
 * @param {NodeList|Array} collection
 * @return {Array}
 * @private
 */

var toArray = function (collection) {
  var length = collection.length;
  var result = new Array(length);
  for (var i = 0; i < length; i++) {
    result[i] = collection[i];
  }
  return result;
};

/**
 * Faster alternative to [].forEach method
 *
 * @param {Node|NodeList|Array} collection
 * @param {Function} callback
 * @return {Node|NodeList|Array}
 * @private
 */

var each = function (collection, callback, thisArg) {
  var length = collection.length;
  if (length !== undefined && collection.nodeType === undefined) {
    for (var i = 0; i < length; i++) {
      callback.call(thisArg, collection[i], i, collection);
    }
  } else {
    callback.call(thisArg, collection, 0, collection);
  }
  return collection;
};

/**
 * Assign enumerable properties from source object(s) to target object
 *
 * @method extend
 * @param {Object} target Object to extend
 * @param {Object} [source] Object to extend from
 * @return {Object} Extended object
 * @example
 *     $.extend({a: 1}, {b: 2});
 *     // {a: 1, b: 2}
 * @example
 *     $.extend({a: 1}, {b: 2}, {a: 3});
 *     // {a: 3, b: 2}
 */

var extend = function (target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  sources.forEach(function (src) {
    for (var prop in src) {
      target[prop] = src[prop];
    }
  });
  return target;
};

/**
 * Return the collection without duplicates
 *
 * @param collection Collection to remove duplicates from
 * @return {Node|NodeList|Array}
 * @private
 */

var uniq = function (collection) {
  return collection.filter(function (item, index) {
    return collection.indexOf(item) === index;
  });
};

/**
 * @module Selector
 */

var isPrototypeSet = false;

var reFragment = /^\s*<(\w+|!)[^>]*>/;
var reSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
var reSimpleSelector = /^[\.#]?[\w-]*$/;

/*
 * Versatile wrapper for `querySelectorAll`.
 *
 * @param {String|Node|NodeList|Array} selector Query selector, `Node`, `NodeList`, array of elements, or HTML fragment string.
 * @param {String|Node|NodeList} context=document The context for the selector to query elements.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     var $items = $(.items');
 * @example
 *     var $element = $(domElement);
 * @example
 *     var $list = $(nodeList, document.body);
 * @example
 *     var $element = $('<p>evergreen</p>');
 */

var $$2 = function (selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;


  var collection = void 0;

  if (!selector) {

    collection = document.querySelectorAll(null);
  } else if (selector instanceof Wrapper) {

    return selector;
  } else if (typeof selector !== 'string') {

    collection = selector.nodeType || selector === window ? [selector] : selector;
  } else if (reFragment.test(selector)) {

    collection = createFragment(selector);
  } else {

    context = typeof context === 'string' ? document.querySelector(context) : context.length ? context[0] : context;

    collection = querySelector(selector, context);
  }

  return wrap(collection);
};

/*
 * Find descendants matching the provided `selector` for each element in the collection.
 *
 * @param {String|Node|NodeList|Array} selector Query selector, `Node`, `NodeList`, array of elements, or HTML fragment string.
 * @return {Object} The wrapped collection
 * @example
 *     $('.selector').find('.deep').$('.deepest');
 */

var find = function (selector) {
  var nodes = [];
  each(this, function (node) {
    return each(querySelector(selector, node), function (child) {
      if (nodes.indexOf(child) === -1) {
        nodes.push(child);
      }
    });
  });
  return $$2(nodes);
};

/*
 * Returns `true` if the element would be selected by the specified selector string; otherwise, returns `false`.
 *
 * @param {Node} element Element to test
 * @param {String} selector Selector to match against element
 * @return {Boolean}
 *
 * @example
 *     $.matches(element, '.match');
 */

var matches = function () {
  var context = typeof Element !== 'undefined' ? Element.prototype : win;
  var _matches = context.matches || context.matchesSelector || context.mozMatchesSelector || context.msMatchesSelector || context.oMatchesSelector || context.webkitMatchesSelector;
  return function (element, selector) {
    return _matches.call(element, selector);
  };
}();

/*
 * Use the faster `getElementById`, `getElementsByClassName` or `getElementsByTagName` over `querySelectorAll` if possible.
 *
 * @private
 * @param {String} selector Query selector.
 * @param {Node} context The context for the selector to query elements.
 * @return {Object} NodeList, HTMLCollection, or Array of matching elements (depending on method used).
 */

var querySelector = function (selector, context) {

  var isSimpleSelector = reSimpleSelector.test(selector);

  if (isSimpleSelector) {
    if (selector[0] === '#') {
      var element = (context.getElementById ? context : document).getElementById(selector.slice(1));
      return element ? [element] : [];
    }
    if (selector[0] === '.') {
      return context.getElementsByClassName(selector.slice(1));
    }
    return context.getElementsByTagName(selector);
  }

  return context.querySelectorAll(selector);
};

/*
 * Create DOM fragment from an HTML string
 *
 * @private
 * @param {String} html String representing HTML.
 * @return {NodeList}
 */

var createFragment = function (html) {

  if (reSingleTag.test(html)) {
    return [document.createElement(RegExp.$1)];
  }

  var elements = [];
  var container = document.createElement('div');
  var children = container.childNodes;

  container.innerHTML = html;

  for (var i = 0, l = children.length; i < l; i++) {
    elements.push(children[i]);
  }

  return elements;
};

/*
 * Calling `$(selector)` returns a wrapped collection of elements.
 *
 * @private
 * @param {NodeList|Array} collection Element(s) to wrap.
 * @return Object) The wrapped collection
 */

var wrap = function (collection) {

  if (!isPrototypeSet) {
    Wrapper.prototype = $$2.fn;
    Wrapper.prototype.constructor = Wrapper;
    isPrototypeSet = true;
  }

  return new Wrapper(collection);
};

/*
 * Constructor for the Object.prototype strategy
 *
 * @constructor
 * @private
 * @param {NodeList|Array} collection Element(s) to wrap.
 */

var Wrapper = function (collection) {
  var i = 0;
  var length = collection.length;
  for (; i < length;) {
    this[i] = collection[i++];
  }
  this.length = length;
};

var selector = Object.freeze({
	$: $$2,
	find: find,
	matches: matches,
	Wrapper: Wrapper
});

/**
 * @module Array
 */

var ArrayProto = Array.prototype;

/**
 * Checks if the given callback returns a true(-ish) value for each element in the collection.
 *
 * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
 * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
 * @return {Boolean} Whether each element passed the callback check.
 * @example
 *     $('.items').every(function(element) {
 *         return element.hasAttribute('active')
 *     });
 *     // true/false
 */

var every = ArrayProto.every;

/**
 * Filter the collection by selector or function, and return a new collection with the result.
 *
 * @param {String|Function} selector Selector or function to filter the collection.
 * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
 * @return {Object} A new wrapped collection
 * @chainable
 * @example
 *     $('.items').filter('.active');
 * @example
 *     $('.items').filter(function(element) {
 *         return element.hasAttribute('active')
 *     });
 */

var filter = function (selector, thisArg) {
  var callback = typeof selector === 'function' ? selector : function (element) {
    return matches(element, selector);
  };
  return $$2(ArrayProto.filter.call(this, callback, thisArg));
};

/**
 * Execute a function for each element in the collection.
 *
 * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
 * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.items').forEach(function(element) {
 *         element.style.color = 'evergreen';
 *     );
 */

var forEach = function (callback, thisArg) {
  return each(this, callback, thisArg);
};

var each$1 = forEach;

/**
 * Returns the index of an element in the collection.
 *
 * @param {Node} element
 * @return {Number} The zero-based index, -1 if not found.
 * @example
 *     $('.items').indexOf(element);
 *     // 2
 */

var indexOf = ArrayProto.indexOf;

/**
 * Create a new collection by executing the callback for each element in the collection.
 *
 * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
 * @param {Object} [thisArg] Value to use as `this` when executing `callback`.
 * @return {Array} Collection with the return value of the executed callback for each element.
 * @example
 *     $('.items').map(function(element) {
 *         return element.getAttribute('name')
 *     });
 *     // ['ever', 'green']
 */

var map = ArrayProto.map;

/**
 * Removes the last element from the collection, and returns that element.
 *
 * @return {Object} The last element from the collection.
 * @example
 *     var lastElement = $('.items').pop();
 */

var pop = ArrayProto.pop;

/**
 * Adds one or more elements to the end of the collection, and returns the new length of the collection.
 *
 * @param {Object} element Element(s) to add to the collection
 * @return {Number} The new length of the collection
 * @example
 *     $('.items').push(element);
 */

var push = ArrayProto.push;

/**
 * Apply a function against each element in the collection, and this accumulator function has to reduce it
 * to a single value.
 *
 * @param {Function} callback Function to execute on each value in the array, taking four arguments (see example).
 * @param {Mixed} initialValue Object to use as the first argument to the first call of the callback.
 * @example
 *     $('.items').reduce(function(previousValue, element, index, collection) {
 *         return previousValue + element.clientHeight;
 *     }, 0);
 *     // [total height of elements]
 */

var reduce = ArrayProto.reduce;

/**
 * Apply a function against each element in the collection (from right-to-left), and this accumulator function has
 * to reduce it to a single value.
 *
 * @param {Function} callback Function to execute on each value in the array, taking four arguments (see example).
 * @param {Mixed} initialValue Object to use as the first argument to the first call of the callback.
 * @example
 *     $('.items').reduceRight(function(previousValue, element, index, collection) {
 *         return previousValue + element.textContent;
 *     }, '')
 *     // [reversed text of elements]
 */

var reduceRight = ArrayProto.reduceRight;

/**
 * Reverses an array in place. The first array element becomes the last and the last becomes the first.
 *
 * @return {Object} The wrapped collection, reversed
 * @chainable
 * @example
 *     $('.items').reverse();
 */

var reverse = function () {
  return $$2(toArray(this).reverse());
};

/**
 * Removes the first element from the collection, and returns that element.
 *
 * @return {Object} The first element from the collection.
 * @example
 *     var firstElement = $('.items').shift();
 */

var shift = ArrayProto.shift;

/**
 * Checks if the given callback returns a true(-ish) value for any of the elements in the collection.
 *
 * @param {Function} callback Function to execute for each element, invoked with `element` as argument.
 * @return {Boolean} Whether any element passed the callback check.
 * @example
 *     $('.items').some(function(element) {
 *         return element.hasAttribute('active')
 *     });
 *     // true/false
 */

var some = ArrayProto.some;

/**
 * Adds one or more elements to the beginning of the collection, and returns the new length of the collection.
 *
 * @param {Object} element Element(s) to add to the collection
 * @return {Number} The new length of the collection
 * @example
 *     $('.items').unshift(element);
 */

var unshift = ArrayProto.unshift;

var array = Object.freeze({
	every: every,
	filter: filter,
	forEach: forEach,
	each: each$1,
	indexOf: indexOf,
	map: map,
	pop: pop,
	push: push,
	reduce: reduce,
	reduceRight: reduceRight,
	reverse: reverse,
	shift: shift,
	some: some,
	unshift: unshift
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module BaseClass
 */

var BaseClass = function (api) {

  /**
   * Provide subclass for classes or components to extend from.
   * The opposite and successor of plugins (no need to extend `$.fn` anymore, complete control).
   *
   * @return {Class} The class to extend from, including all `$.fn` methods.
   * @example
   *     import { BaseClass } from  'domtastic';
   *
   *     class MyComponent extends BaseClass {
   *         doSomething() {
   *             return this.addClass('.foo');
   *         }
   *     }
   *
   *     let component = new MyComponent('body');
   *     component.doSomething();
   *
   * @example
   *     import $ from  'domtastic';
   *
   *     class MyComponent extends $.BaseClass {
   *         progress(value) {
   *             return this.attr('data-progress', value);
   *         }
   *     }
   *
   *     let component = new MyComponent(document.body);
   *     component.progress('ive').append('<p>enhancement</p>');
   */

  var BaseClass = function BaseClass() {
    _classCallCheck(this, BaseClass);

    Wrapper.call(this, $$2.apply(undefined, arguments));
  };

  extend(BaseClass.prototype, api);
  return BaseClass;
};

/**
 * @module CSS
 */

var isNumeric = function (value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

var camelize = function (value) {
  return value.replace(/-([\da-z])/gi, function (matches, letter) {
    return letter.toUpperCase();
  });
};

var dasherize = function (value) {
  return value.replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Get the value of a style property for the first element, or set one or more style properties for each element in the collection.
 *
 * @param {String|Object} key The name of the style property to get or set. Or an object containing key-value pairs to set as style properties.
 * @param {String} [value] The value of the style property to set.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').css('padding-left'); // get
 *     $('.item').css('color', '#f00'); // set
 *     $('.item').css({'border-width': '1px', display: 'inline-block'}); // set multiple
 */

var css = function (key, value) {

  var styleProps = void 0,
      prop = void 0,
      val = void 0;

  if (typeof key === 'string') {
    key = camelize(key);

    if (typeof value === 'undefined') {
      var element = this.nodeType ? this : this[0];
      if (element) {
        val = element.style[key];
        return isNumeric(val) ? parseFloat(val) : val;
      }
      return undefined;
    }

    styleProps = {};
    styleProps[key] = value;
  } else {
    styleProps = key;
    for (prop in styleProps) {
      val = styleProps[prop];
      delete styleProps[prop];
      styleProps[camelize(prop)] = val;
    }
  }

  each(this, function (element) {
    for (prop in styleProps) {
      if (styleProps[prop] || styleProps[prop] === 0) {
        element.style[prop] = styleProps[prop];
      } else {
        element.style.removeProperty(dasherize(prop));
      }
    }
  });

  return this;
};

var css$1 = Object.freeze({
	css: css
});

/**
 * @module DOM
 */

var forEach$1 = Array.prototype.forEach;

/**
 * Append element(s) to each element in the collection.
 *
 * @param {String|Node|NodeList|Object} element What to append to the element(s).
 * Clones elements as necessary.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').append('<p>more</p>');
 */

var append = function (element) {
  if (this instanceof Node) {
    if (typeof element === 'string') {
      this.insertAdjacentHTML('beforeend', element);
    } else {
      if (element instanceof Node) {
        this.appendChild(element);
      } else {
        var elements = element instanceof NodeList ? toArray(element) : element;
        forEach$1.call(elements, this.appendChild.bind(this));
      }
    }
  } else {
    _each(this, append, element);
  }
  return this;
};

/**
 * Place element(s) at the beginning of each element in the collection.
 *
 * @param {String|Node|NodeList|Object} element What to place at the beginning of the element(s).
 * Clones elements as necessary.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').prepend('<span>start</span>');
 */

var prepend = function (element) {
  if (this instanceof Node) {
    if (typeof element === 'string') {
      this.insertAdjacentHTML('afterbegin', element);
    } else {
      if (element instanceof Node) {
        this.insertBefore(element, this.firstChild);
      } else {
        var elements = element instanceof NodeList ? toArray(element) : element;
        forEach$1.call(elements.reverse(), prepend.bind(this));
      }
    }
  } else {
    _each(this, prepend, element);
  }
  return this;
};

/**
 * Place element(s) before each element in the collection.
 *
 * @param {String|Node|NodeList|Object} element What to place as sibling(s) before to the element(s).
 * Clones elements as necessary.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.items').before('<p>prefix</p>');
 */

var before = function (element) {
  if (this instanceof Node) {
    if (typeof element === 'string') {
      this.insertAdjacentHTML('beforebegin', element);
    } else {
      if (element instanceof Node) {
        this.parentNode.insertBefore(element, this);
      } else {
        var elements = element instanceof NodeList ? toArray(element) : element;
        forEach$1.call(elements, before.bind(this));
      }
    }
  } else {
    _each(this, before, element);
  }
  return this;
};

/**
 * Place element(s) after each element in the collection.
 *
 * @param {String|Node|NodeList|Object} element What to place as sibling(s) after to the element(s). Clones elements as necessary.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.items').after('<span>suf</span><span>fix</span>');
 */

var after = function (element) {
  if (this instanceof Node) {
    if (typeof element === 'string') {
      this.insertAdjacentHTML('afterend', element);
    } else {
      if (element instanceof Node) {
        this.parentNode.insertBefore(element, this.nextSibling);
      } else {
        var elements = element instanceof NodeList ? toArray(element) : element;
        forEach$1.call(elements.reverse(), after.bind(this));
      }
    }
  } else {
    _each(this, after, element);
  }
  return this;
};

/**
 * Clone a wrapped object.
 *
 * @return {Object} Wrapped collection of cloned nodes.
 * @example
 *     $(element).clone();
 */

var clone = function () {
  return $$2(_clone(this));
};

/**
 * Clone an object
 *
 * @param {String|Node|NodeList|Array} element The element(s) to clone.
 * @return {String|Node|NodeList|Array} The cloned element(s)
 * @private
 */

var _clone = function (element) {
  if (typeof element === 'string') {
    return element;
  } else if (element instanceof Node) {
    return element.cloneNode(true);
  } else if ('length' in element) {
    return [].map.call(element, function (el) {
      return el.cloneNode(true);
    });
  }
  return element;
};

/**
 * Specialized iteration, applying `fn` in reversed manner to a clone of each element, but the provided one.
 *
 * @param {NodeList|Array} collection
 * @param {Function} fn
 * @param {Node} element
 * @private
 */

var _each = function (collection, fn, element) {
  var l = collection.length;
  while (l--) {
    var elm = l === 0 ? element : _clone(element);
    fn.call(collection[l], elm);
  }
};

var dom = Object.freeze({
	append: append,
	prepend: prepend,
	before: before,
	after: after,
	clone: clone,
	_clone: _clone,
	_each: _each
});

/**
 * @module Attr
 */

/**
 * Get the value of an attribute for the first element, or set one or more attributes for each element in the collection.
 *
 * @param {String|Object} key The name of the attribute to get or set. Or an object containing key-value pairs to set as attributes.
 * @param {String} [value] The value of the attribute to set.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').attr('attrName'); // get
 *     $('.item').attr('attrName', 'attrValue'); // set
 *     $('.item').attr({attr1: 'value1', 'attr-2': 'value2'}); // set multiple
 */

var attr = function (key, value) {

  if (typeof key === 'string' && typeof value === 'undefined') {
    var element = this.nodeType ? this : this[0];
    return element ? element.getAttribute(key) : undefined;
  }

  return each(this, function (element) {
    if (typeof key === 'object') {
      for (var _attr in key) {
        element.setAttribute(_attr, key[_attr]);
      }
    } else {
      element.setAttribute(key, value);
    }
  });
};

/**
 * Remove attribute from each element in the collection.
 *
 * @param {String} key Attribute name
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.items').removeAttr('attrName');
 */

var removeAttr = function (key) {
  return each(this, function (element) {
    return element.removeAttribute(key);
  });
};

var dom_attr = Object.freeze({
	attr: attr,
	removeAttr: removeAttr
});

/**
 * @module Class
 */

/**
 * Add a class to the element(s)
 *
 * @param {String} value Space-separated class name(s) to add to the element(s).
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').addClass('bar');
 *     $('.item').addClass('bar foo');
 */

var addClass = function (value) {
  if (value && value.length) {
    each(value.split(' '), _each$1.bind(this, 'add'));
  }
  return this;
};

/**
 * Remove a class from the element(s)
 *
 * @param {String} value Space-separated class name(s) to remove from the element(s).
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.items').removeClass('bar');
 *     $('.items').removeClass('bar foo');
 */

var removeClass = function (value) {
  if (value && value.length) {
    each(value.split(' '), _each$1.bind(this, 'remove'));
  }
  return this;
};

/**
 * Toggle a class at the element(s)
 *
 * @param {String} value Space-separated class name(s) to toggle at the element(s).
 * @param {Boolean} [state] A Boolean value to determine whether the class should be added or removed.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').toggleClass('bar');
 *     $('.item').toggleClass('bar foo');
 *     $('.item').toggleClass('bar', true);
 */

var toggleClass = function (value, state) {
  if (value && value.length) {
    var action = typeof state === 'boolean' ? state ? 'add' : 'remove' : 'toggle';
    each(value.split(' '), _each$1.bind(this, action));
  }
  return this;
};

/**
 * Check if the element(s) have a class.
 *
 * @param {String} value Check if the DOM element contains the class name. When applied to multiple elements,
 * returns `true` if _any_ of them contains the class name.
 * @return {Boolean} Whether the element's class attribute contains the class name.
 * @example
 *     $('.item').hasClass('bar');
 */

var hasClass = function (value) {
  return (this.nodeType ? [this] : this).some(function (element) {
    return element.classList.contains(value);
  });
};

/**
 * Specialized iteration, applying `fn` of the classList API to each element.
 *
 * @param {String} fnName
 * @param {String} className
 * @private
 */

var _each$1 = function (fnName, className) {
  return each(this, function (element) {
    return element.classList[fnName](className);
  });
};

var dom_class = Object.freeze({
	addClass: addClass,
	removeClass: removeClass,
	toggleClass: toggleClass,
	hasClass: hasClass
});

/**
 * @module contains
 */

/**
 * Test whether an element contains another element in the DOM.
 *
 * @param {Element} container The element that may contain the other element.
 * @param {Element} element The element that may be a descendant of the other element.
 * @return {Boolean} Whether the `container` element contains the `element`.
 * @example
 *     $.contains(parentElement, childElement);
 *     // true/false
 */

var contains = function (container, element) {
  if (!container || !element || container === element) {
    return false;
  } else if (container.contains) {
    return container.contains(element);
  } else if (container.compareDocumentPosition) {
    return !(container.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_DISCONNECTED);
  }
  return false;
};

var dom_contains = Object.freeze({
	contains: contains
});

/**
 * @module Data
 */

var isSupportsDataSet = typeof document !== 'undefined' && 'dataset' in document.documentElement;
var DATAKEYPROP = isSupportsDataSet ? 'dataset' : '__DOMTASTIC_DATA__';

/**
 * Get data from first element, or set data for each element in the collection.
 *
 * @param {String} key The key for the data to get or set.
 * @param {String} [value] The data to set.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').data('attrName'); // get
 *     $('.item').data('attrName', {any: 'data'}); // set
 */

var data = function (key, value) {

  if (typeof key === 'string' && typeof value === 'undefined') {
    var element = this.nodeType ? this : this[0];
    return element && DATAKEYPROP in element ? element[DATAKEYPROP][key] : undefined;
  }

  return each(this, function (element) {
    if (!isSupportsDataSet) {
      element[DATAKEYPROP] = element[DATAKEYPROP] || {};
    }
    element[DATAKEYPROP][key] = value;
  });
};

/**
 * Get property from first element, or set property on each element in the collection.
 *
 * @param {String} key The name of the property to get or set.
 * @param {String} [value] The value of the property to set.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').prop('attrName'); // get
 *     $('.item').prop('attrName', 'attrValue'); // set
 */

var prop = function (key, value) {

  if (typeof key === 'string' && typeof value === 'undefined') {
    var element = this.nodeType ? this : this[0];
    return element && element ? element[key] : undefined;
  }

  return each(this, function (element) {
    return element[key] = value;
  });
};

var dom_data = Object.freeze({
	data: data,
	prop: prop
});

/**
 * @module DOM (extra)
 */

/**
 * Append each element in the collection to the specified element(s).
 *
 * @param {Node|NodeList|Object} element What to append the element(s) to. Clones elements as necessary.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').appendTo(container);
 */

var appendTo = function (element) {
  var context = typeof element === 'string' ? $$2(element) : element;
  append.call(context, this);
  return this;
};

/*
 * Empty each element in the collection.
 *
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').empty();
 */

var empty = function () {
  return each(this, function (element) {
    return element.innerHTML = '';
  });
};

/**
 * Remove the collection from the DOM.
 *
 * @return {Array} Array containing the removed elements
 * @example
 *     $('.item').remove();
 */

var remove = function () {
  return each(this, function (element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
};

/**
 * Replace each element in the collection with the provided new content, and return the array of elements that were replaced.
 *
 * @return {Array} Array containing the replaced elements
 */

var replaceWith = function () {
  return before.apply(this, arguments).remove();
};

/**
 * Get the `textContent` from the first, or set the `textContent` of each element in the collection.
 *
 * @param {String} [value]
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').text('New content');
 */

var text = function (value) {

  if (value === undefined) {
    return this[0].textContent;
  }

  return each(this, function (element) {
    return element.textContent = '' + value;
  });
};

/**
 * Get the `value` from the first, or set the `value` of each element in the collection.
 *
 * @param {String} [value]
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('input.firstName').val('New value');
 */

var val = function (value) {

  if (value === undefined) {
    return this[0].value;
  }

  return each(this, function (element) {
    return element.value = value;
  });
};

var dom_extra = Object.freeze({
	appendTo: appendTo,
	empty: empty,
	remove: remove,
	replaceWith: replaceWith,
	text: text,
	val: val
});

/**
 * @module HTML
 */

/*
 * Get the HTML contents of the first element, or set the HTML contents for each element in the collection.
 *
 * @param {String} [fragment] HTML fragment to set for the element. If this argument is omitted, the HTML contents are returned.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').html();
 *     $('.item').html('<span>more</span>');
 */

var html = function (fragment) {

  if (typeof fragment !== 'string') {
    var element = this.nodeType ? this : this[0];
    return element ? element.innerHTML : undefined;
  }

  return each(this, function (element) {
    return element.innerHTML = fragment;
  });
};

var dom_html = Object.freeze({
	html: html
});

/**
 * @module closest
 */

/**
 * Return the closest element matching the selector (starting by itself) for each element in the collection.
 *
 * @param {String} selector Filter
 * @param {Object} [context] If provided, matching elements must be a descendant of this element
 * @return {Object} New wrapped collection (containing zero or one element)
 * @chainable
 * @example
 *     $('.selector').closest('.container');
 */

var closest = function () {

  var closest = function (selector, context) {
    var nodes = [];
    each(this, function (node) {
      while (node && node !== context) {
        if (matches(node, selector)) {
          nodes.push(node);
          break;
        }
        node = node.parentElement;
      }
    });
    return $$2(uniq(nodes));
  };

  return typeof Element === 'undefined' || !Element.prototype.closest ? closest : function (selector, context) {
    if (!context) {
      var nodes = [];
      each(this, function (node) {
        var n = node.closest(selector);
        if (n) {
          nodes.push(n);
        }
      });
      return $$2(uniq(nodes));
    } else {
      return closest.call(this, selector, context);
    }
  };
}();

var selector_closest = Object.freeze({
	closest: closest
});

/**
 * @module Events
 */

/**
 * Shorthand for `addEventListener`. Supports event delegation if a filter (`selector`) is provided.
 *
 * @param {String} eventNames List of space-separated event types to be added to the element(s)
 * @param {String} [selector] Selector to filter descendants that delegate the event to this element.
 * @param {Function} handler Event handler
 * @param {Boolean} useCapture=false
 * @param {Boolean} once=false
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').on('click', callback);
 *     $('.container').on('click focus', '.item', handler);
 */

var on = function (eventNames, selector, handler, useCapture, once) {
  var _this = this;

  if (typeof selector === 'function') {
    handler = selector;
    selector = null;
  }

  var parts = void 0,
      namespace = void 0,
      eventListener = void 0;

  eventNames.split(' ').forEach(function (eventName) {

    parts = eventName.split('.');
    eventName = parts[0] || null;
    namespace = parts[1] || null;

    eventListener = proxyHandler(handler);

    each(_this, function (element) {

      if (selector) {
        eventListener = delegateHandler.bind(element, selector, eventListener);
      }

      if (once) {
        var listener = eventListener;
        eventListener = function (event) {
          off.call(element, eventNames, selector, handler, useCapture);
          listener.call(element, event);
        };
      }

      element.addEventListener(eventName, eventListener, useCapture || false);

      getHandlers(element).push({
        eventName: eventName,
        handler: handler,
        eventListener: eventListener,
        selector: selector,
        namespace: namespace
      });
    });
  }, this);

  return this;
};

/**
 * Shorthand for `removeEventListener`.
 *
 * @param {String} eventNames List of space-separated event types to be removed from the element(s)
 * @param {String} [selector] Selector to filter descendants that undelegate the event to this element.
 * @param {Function} handler Event handler
 * @param {Boolean} useCapture=false
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').off('click', callback);
 *     $('#my-element').off('myEvent myOtherEvent');
 *     $('.item').off();
 */

var off = function () {
  var eventNames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var selector = arguments[1];

  var _this2 = this;

  var handler = arguments[2];
  var useCapture = arguments[3];


  if (typeof selector === 'function') {
    handler = selector;
    selector = null;
  }

  var parts = void 0,
      namespace = void 0,
      handlers = void 0;

  eventNames.split(' ').forEach(function (eventName) {

    parts = eventName.split('.');
    eventName = parts[0] || null;
    namespace = parts[1] || null;

    return each(_this2, function (element) {

      handlers = getHandlers(element);

      each(handlers.filter(function (item) {
        return (!eventName || item.eventName === eventName) && (!namespace || item.namespace === namespace) && (!handler || item.handler === handler) && (!selector || item.selector === selector);
      }), function (item) {
        element.removeEventListener(item.eventName, item.eventListener, useCapture || false);
        handlers.splice(handlers.indexOf(item), 1);
      });

      if (!eventName && !namespace && !selector && !handler) {
        clearHandlers(element);
      } else if (handlers.length === 0) {
        clearHandlers(element);
      }
    });
  }, this);

  return this;
};

/**
 * Add event listener and execute the handler at most once per element.
 *
 * @param eventNames
 * @param selector
 * @param handler
 * @param useCapture
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').one('click', callback);
 */

var one = function (eventNames, selector, handler, useCapture) {
  return on.call(this, eventNames, selector, handler, useCapture, 1);
};

/**
 * Get event handlers from an element
 *
 * @private
 * @param {Node} element
 * @return {Array}
 */

var eventKeyProp = '__domtastic_event__';
var id = 1;
var handlers = {};
var unusedKeys = [];

var getHandlers = function (element) {
  if (!element[eventKeyProp]) {
    element[eventKeyProp] = unusedKeys.length === 0 ? ++id : unusedKeys.pop();
  }
  var key = element[eventKeyProp];
  return handlers[key] || (handlers[key] = []);
};

/**
 * Clear event handlers for an element
 *
 * @private
 * @param {Node} element
 */

var clearHandlers = function (element) {
  var key = element[eventKeyProp];
  if (handlers[key]) {
    handlers[key] = null;
    element[eventKeyProp] = null;
    unusedKeys.push(key);
  }
};

/**
 * Function to create a handler that augments the event object with some extra methods,
 * and executes the callback with the event and the event data (i.e. `event.detail`).
 *
 * @private
 * @param handler Callback to execute as `handler(event, data)`
 * @return {Function}
 */

var proxyHandler = function (handler) {
  return function (event) {
    return handler.call(this, augmentEvent(event));
  };
};

var eventMethods = {
  preventDefault: 'isDefaultPrevented',
  stopImmediatePropagation: 'isImmediatePropagationStopped',
  stopPropagation: 'isPropagationStopped'
};
var returnTrue = function () {
  return true;
};
var returnFalse = function () {
  return false;
};

/**
 * Attempt to augment events and implement something closer to DOM Level 3 Events.
 *
 * @private
 * @param {Object} event
 * @return {Function}
 */

var augmentEvent = function (event) {
  if (!event.isDefaultPrevented || event.stopImmediatePropagation || event.stopPropagation) {
    for (var methodName in eventMethods) {
      (function (methodName, testMethodName, originalMethod) {
        event[methodName] = function () {
          this[testMethodName] = returnTrue;
          return originalMethod && originalMethod.apply(this, arguments);
        };
        event[testMethodName] = returnFalse;
      })(methodName, eventMethods[methodName], event[methodName]);
    }
    if (event._preventDefault) {
      event.preventDefault();
    }
  }
  return event;
};

/**
 * Function to test whether delegated events match the provided `selector` (filter),
 * if the event propagation was stopped, and then actually call the provided event handler.
 * Use `this` instead of `event.currentTarget` on the event object.
 *
 * @private
 * @param {String} selector Selector to filter descendants that undelegate the event to this element.
 * @param {Function} handler Event handler
 * @param {Event} event
 */

var delegateHandler = function (selector, handler, event) {
  var eventTarget = event._target || event.target;
  var currentTarget = closest.call([eventTarget], selector, this)[0];
  if (currentTarget && currentTarget !== this) {
    if (currentTarget === eventTarget || !(event.isPropagationStopped && event.isPropagationStopped())) {
      handler.call(currentTarget, event);
    }
  }
};

var bind = on;
var unbind = off;

var event = Object.freeze({
	on: on,
	off: off,
	one: one,
	getHandlers: getHandlers,
	clearHandlers: clearHandlers,
	proxyHandler: proxyHandler,
	delegateHandler: delegateHandler,
	bind: bind,
	unbind: unbind
});

/**
 * @module trigger
 */

var reMouseEvent = /^(?:mouse|pointer|contextmenu)|click/;
var reKeyEvent = /^key/;

/**
 * Trigger event at element(s)
 *
 * @param {String} type Type of the event
 * @param {Object} data Data to be sent with the event (`params.detail` will be set to this).
 * @param {Object} [params] Event parameters (optional)
 * @param {Boolean} params.bubbles=true Does the event bubble up through the DOM or not.
 * @param {Boolean} params.cancelable=true Is the event cancelable or not.
 * @param {Mixed} params.detail=undefined Additional information about the event.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $('.item').trigger('anyEventType');
 */

var trigger = function (type, data) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$bubbles = _ref.bubbles,
      bubbles = _ref$bubbles === undefined ? true : _ref$bubbles,
      _ref$cancelable = _ref.cancelable,
      cancelable = _ref$cancelable === undefined ? true : _ref$cancelable,
      _ref$preventDefault = _ref.preventDefault,
      preventDefault = _ref$preventDefault === undefined ? false : _ref$preventDefault;

  var EventConstructor = getEventConstructor(type);
  var event = new EventConstructor(type, {
    bubbles: bubbles,
    cancelable: cancelable,
    preventDefault: preventDefault,
    detail: data
  });

  event._preventDefault = preventDefault;

  return each(this, function (element) {
    if (!bubbles || isEventBubblingInDetachedTree || isAttachedToDocument(element)) {
      dispatchEvent(element, event);
    } else {
      triggerForPath(element, type, {
        bubbles: bubbles,
        cancelable: cancelable,
        preventDefault: preventDefault,
        detail: data
      });
    }
  });
};

var getEventConstructor = function (type) {
  return supportsOtherEventConstructors ? reMouseEvent.test(type) ? MouseEvent : reKeyEvent.test(type) ? KeyboardEvent : CustomEvent : CustomEvent;
};

/**
 * Trigger event at first element in the collection. Similar to `trigger()`, except:
 *
 * - Event does not bubble
 * - Default event behavior is prevented
 * - Only triggers handler for first matching element
 *
 * @param {String} type Type of the event
 * @param {Object} data Data to be sent with the event
 * @example
 *     $('form').triggerHandler('submit');
 */

var triggerHandler = function (type, data) {
  if (this[0]) {
    trigger.call(this[0], type, data, {
      bubbles: false,
      preventDefault: true
    });
  }
};

/**
 * Check whether the element is attached to or detached from) the document
 *
 * @private
 * @param {Node} element Element to test
 * @return {Boolean}
 */

var isAttachedToDocument = function (element) {
  if (element === window || element === document) {
    return true;
  }
  return contains(element.ownerDocument.documentElement, element);
};

/**
 * Dispatch the event at the element and its ancestors.
 * Required to support delegated events in browsers that don't bubble events in detached DOM trees.
 *
 * @private
 * @param {Node} element First element to dispatch the event at
 * @param {String} type Type of the event
 * @param {Object} [params] Event parameters (optional)
 * @param {Boolean} params.bubbles=true Does the event bubble up through the DOM or not.
 * Will be set to false (but shouldn't matter since events don't bubble anyway).
 * @param {Boolean} params.cancelable=true Is the event cancelable or not.
 * @param {Mixed} params.detail=undefined Additional information about the event.
 */

var triggerForPath = function (element, type) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  params.bubbles = false;
  var event = new CustomEvent(type, params);
  event._target = element;
  do {
    dispatchEvent(element, event);
  } while (element = element.parentNode); // eslint-disable-line no-cond-assign
};

/**
 * Dispatch event to element, but call direct event methods instead if available
 * (e.g. "blur()", "submit()") and if the event is non-cancelable.
 *
 * @private
 * @param {Node} element Element to dispatch the event at
 * @param {Object} event Event to dispatch
 */

var directEventMethods = ['blur', 'focus', 'select', 'submit'];

var dispatchEvent = function (element, event) {
  if (directEventMethods.indexOf(event.type) !== -1 && typeof element[event.type] === 'function' && !event._preventDefault && !event.cancelable) {
    element[event.type]();
  } else {
    element.dispatchEvent(event);
  }
};

/**
 * Polyfill for CustomEvent, borrowed from [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill).
 * Needed to support IE (9, 10, 11) & PhantomJS
 */

(function () {
  var CustomEvent = function (event) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    var customEvent = document.createEvent('CustomEvent');
    customEvent.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return customEvent;
  };

  CustomEvent.prototype = win.CustomEvent && win.CustomEvent.prototype;
  win.CustomEvent = CustomEvent;
})();

/*
 * Are events bubbling in detached DOM trees?
 * @private
 */

var isEventBubblingInDetachedTree = function () {
  var isBubbling = false;
  var doc = win.document;
  if (doc) {
    var parent = doc.createElement('div');
    var child = parent.cloneNode();
    parent.appendChild(child);
    parent.addEventListener('e', function () {
      isBubbling = true;
    });
    child.dispatchEvent(new CustomEvent('e', { bubbles: true }));
  }
  return isBubbling;
}();

var supportsOtherEventConstructors = function () {
  try {
    new MouseEvent('click');
  } catch (e) {
    return false;
  }
  return true;
}();

var event_trigger = Object.freeze({
	trigger: trigger,
	triggerHandler: triggerHandler
});

/**
 * @module Ready
 */

/**
 * Execute callback when `DOMContentLoaded` fires for `document`, or immediately if called afterwards.
 *
 * @param handler Callback to execute when initial DOM content is loaded.
 * @return {Object} The wrapped collection
 * @chainable
 * @example
 *     $(document).ready(callback);
 */

var ready = function (handler) {
  if (/complete|loaded|interactive/.test(document.readyState) && document.body) {
    handler();
  } else {
    document.addEventListener('DOMContentLoaded', handler, false);
  }
  return this;
};

var event_ready = Object.freeze({
	ready: ready
});

/**
 * @module noConflict
 */

/*
 * Save the previous value of the global `$` variable, so that it can be restored later on.
 * @private
 */

var previousLib = win.$;

/**
 * In case another library sets the global `$` variable before DOMtastic does,
 * this method can be used to return the global `$` to that other library.
 *
 * @return {Object} Reference to DOMtastic.
 * @example
 *     var domtastic = $.noConflict();
 */

var noConflict = function () {
  win.$ = previousLib;
  return this;
};

var noconflict = Object.freeze({
	noConflict: noConflict
});

/**
 * @module Selector (extra)
 */

/**
 * Return children of each element in the collection, optionally filtered by a selector.
 *
 * @param {String} [selector] Filter
 * @return {Object} New wrapped collection
 * @chainable
 * @example
 *     $('.selector').children();
 *     $('.selector').children('.filter');
 */

var children = function (selector) {
  var nodes = [];
  each(this, function (element) {
    if (element.children) {
      each(element.children, function (child) {
        if (!selector || selector && matches(child, selector)) {
          nodes.push(child);
        }
      });
    }
  });
  return $$2(nodes);
};

/**
 * Return child nodes of each element in the collection, including text and comment nodes.
 *
 * @return {Object} New wrapped collection
 * @example
 *     $('.selector').contents();
 */

var contents = function () {
  var nodes = [];
  each(this, function (element) {
    return nodes.push.apply(nodes, toArray(element.childNodes));
  });
  return $$2(nodes);
};

/**
 * Return a collection containing only the one at the specified index.
 *
 * @param {Number} index
 * @return {Object} New wrapped collection
 * @chainable
 * @example
 *     $('.items').eq(1)
 *     // The second item; result is the same as doing $($('.items')[1]);
 */

var eq = function (index) {
  return slice.call(this, index, index + 1);
};

/**
 * Return a collection containing only the first item.
 *
 * @return {Object} New wrapped collection
 * @chainable
 * @example
 *     $('.items').first()
 *     // The first item; result is the same as doing $($('.items')[0]);
 */

var first = function () {
  return slice.call(this, 0, 1);
};

/**
 * Return the DOM element at the specified index.
 *
 * @param {Number} index
 * @return {Node} Element at the specified index
 * @example
 *     $('.items').get(1)
 *     // The second element; result is the same as doing $('.items')[1];
 */

var get = function (index) {
  return this[index];
};

/**
 * Return the parent elements of each element in the collection, optionally filtered by a selector.
 *
 * @param {String} [selector] Filter
 * @return {Object} New wrapped collection
 * @chainable
 * @example
 *     $('.selector').parent();
 *     $('.selector').parent('.filter');
 */

var parent = function (selector) {
  var nodes = [];
  each(this, function (element) {
    if (!selector || selector && matches(element.parentNode, selector)) {
      nodes.push(element.parentNode);
    }
  });
  return $$2(nodes);
};

/**
 * Return the sibling elements of each element in the collection, optionally filtered by a selector.
 *
 * @param {String} [selector] Filter
 * @return {Object} New wrapped collection
 * @chainable
 * @example
 *     $('.selector').siblings();
 *     $('.selector').siblings('.filter');
 */

var siblings = function (selector) {
  var nodes = [];
  each(this, function (element) {
    return each(element.parentNode.children, function (sibling) {
      if (sibling !== element && (!selector || selector && matches(sibling, selector))) {
        nodes.push(sibling);
      }
    });
  });
  return $$2(nodes);
};

/**
 * Create a new, sliced collection.
 *
 * @param {Number} start
 * @param {Number} end
 * @return {Object} New wrapped collection
 * @example
 *     $('.items').slice(1, 3)
 *     // New wrapped collection containing the second, third, and fourth element.
 */

var slice = function (start, end) {
  // eslint-disable-line no-unused-vars
  return $$2([].slice.apply(this, arguments));
};

var selector_extra = Object.freeze({
	children: children,
	contents: contents,
	eq: eq,
	first: first,
	get: get,
	parent: parent,
	siblings: siblings,
	slice: slice
});

/**
 * @module Type
 */

/*
 * Determine if the argument passed is a Javascript function object.
 *
 * @param {Object} [obj] Object to test whether or not it is a function.
 * @return {boolean}
 * @example
 *     $.isFunction(function(){});
 *     // true
 * @example
 *     $.isFunction({});
 *     // false
 */

var isFunction = function (obj) {
  return typeof obj === 'function';
};

/*
 * Determine whether the argument is an array.
 *
 * @param {Object} [obj] Object to test whether or not it is an array.
 * @return {boolean}
 * @example
 *     $.isArray([]);
 *     // true
 * @example
 *     $.isArray({});
 *     // false
 */

var isArray = Array.isArray;

var type = Object.freeze({
	isFunction: isFunction,
	isArray: isArray
});

/**
 * @module API
 */

var api = {};
var $$$1 = {};

// Import modules to build up the API

if (typeof selector !== 'undefined') {
  $$$1 = $$2;
  $$$1.matches = matches;
  api.find = find;
}

extend($$$1, dom_contains, noconflict, type);
extend(api, array, css$1, dom_attr, dom, dom_class, dom_data, dom_extra, dom_html, event, event_trigger, event_ready, selector_closest, selector_extra);

$$$1.fn = api;

// Version

$$$1.version = '0.14.0';

// Util

$$$1.extend = extend;

// Provide base class to extend from

if (typeof BaseClass !== 'undefined') {
  $$$1.BaseClass = BaseClass($$$1.fn);
}

// Export interface

var $$1 = $$$1;

return $$1;

})));


},{}],2:[function(require,module,exports){
var promise = require('../vendor/promise.min');
var $ = require('domtastic');

function late(n) {
    var p = new promise.promise.Promise();
    setTimeout(function() {
        p.done(null, n);
    }, n);
    return p;
}

late(100).then(
    function(err, n) {
        return late(n + 200);
    }
).then(
    function(err, n) {
        return late(n + 300);
    }
).then(
    function(err, n) {
        return late(n + 400);
    }
).then(
    function(err, n) {
        alert(n);
    }
);
},{"../vendor/promise.min":3,"domtastic":1}],3:[function(require,module,exports){
/*
 *  Copyright 2012-2013 (c) Pierre Duquesne <stackp@online.fr>
 *  Licensed under the New BSD License.
 *  https://github.com/stackp/promisejs
 */
(function(a){function b(){this._callbacks=[];}b.prototype.then=function(a,c){var d;if(this._isdone)d=a.apply(c,this.result);else{d=new b();this._callbacks.push(function(){var b=a.apply(c,arguments);if(b&&typeof b.then==='function')b.then(d.done,d);});}return d;};b.prototype.done=function(){this.result=arguments;this._isdone=true;for(var a=0;a<this._callbacks.length;a++)this._callbacks[a].apply(null,arguments);this._callbacks=[];};function c(a){var c=new b();var d=[];if(!a||!a.length){c.done(d);return c;}var e=0;var f=a.length;function g(a){return function(){e+=1;d[a]=Array.prototype.slice.call(arguments);if(e===f)c.done(d);};}for(var h=0;h<f;h++)a[h].then(g(h));return c;}function d(a,c){var e=new b();if(a.length===0)e.done.apply(e,c);else a[0].apply(null,c).then(function(){a.splice(0,1);d(a,arguments).then(function(){e.done.apply(e,arguments);});});return e;}function e(a){var b="";if(typeof a==="string")b=a;else{var c=encodeURIComponent;var d=[];for(var e in a)if(a.hasOwnProperty(e))d.push(c(e)+'='+c(a[e]));b=d.join('&');}return b;}function f(){var a;if(window.XMLHttpRequest)a=new XMLHttpRequest();else if(window.ActiveXObject)try{a=new ActiveXObject("Msxml2.XMLHTTP");}catch(b){a=new ActiveXObject("Microsoft.XMLHTTP");}return a;}function g(a,c,d,g){var h=new b();var j,k;d=d||{};g=g||{};try{j=f();}catch(l){h.done(i.ENOXHR,"");return h;}k=e(d);if(a==='GET'&&k){c+='?'+k;k=null;}j.open(a,c);var m='application/x-www-form-urlencoded';for(var n in g)if(g.hasOwnProperty(n))if(n.toLowerCase()==='content-type')m=g[n];else j.setRequestHeader(n,g[n]);j.setRequestHeader('Content-type',m);function o(){j.abort();h.done(i.ETIMEOUT,"",j);}var p=i.ajaxTimeout;if(p)var q=setTimeout(o,p);j.onreadystatechange=function(){if(p)clearTimeout(q);if(j.readyState===4){var a=(!j.status||(j.status<200||j.status>=300)&&j.status!==304);h.done(a,j.responseText,j);}};j.send(k);return h;}function h(a){return function(b,c,d){return g(a,b,c,d);};}var i={Promise:b,join:c,chain:d,ajax:g,get:h('GET'),post:h('POST'),put:h('PUT'),del:h('DELETE'),ENOXHR:1,ETIMEOUT:2,ajaxTimeout:0};if(typeof define==='function'&&define.amd)define(function(){return i;});else a.promise=i;})(this);
},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9tdGFzdGljL2Rpc3QvZG9tdGFzdGljLmpzIiwic3JjL21haW4uanMiLCJ2ZW5kb3IvcHJvbWlzZS5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3g5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuJCA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuLypcbiAqIEBtb2R1bGUgVXRpbFxuICovXG5cbi8qXG4gKiBSZWZlcmVuY2UgdG8gdGhlIHdpbmRvdyBvYmplY3RcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHdpbiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge307XG5cbi8qKlxuICogQ29udmVydCBgTm9kZUxpc3RgIHRvIGBBcnJheWAuXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciB0b0FycmF5ID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHRbaV0gPSBjb2xsZWN0aW9uW2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEZhc3RlciBhbHRlcm5hdGl2ZSB0byBbXS5mb3JFYWNoIG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7Tm9kZXxOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge05vZGV8Tm9kZUxpc3R8QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBlYWNoID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgaWYgKGxlbmd0aCAhPT0gdW5kZWZpbmVkICYmIGNvbGxlY3Rpb24ubm9kZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgY29sbGVjdGlvbltpXSwgaSwgY29sbGVjdGlvbik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgY29sbGVjdGlvbiwgMCwgY29sbGVjdGlvbik7XG4gIH1cbiAgcmV0dXJuIGNvbGxlY3Rpb247XG59O1xuXG4vKipcbiAqIEFzc2lnbiBlbnVtZXJhYmxlIHByb3BlcnRpZXMgZnJvbSBzb3VyY2Ugb2JqZWN0KHMpIHRvIHRhcmdldCBvYmplY3RcbiAqXG4gKiBAbWV0aG9kIGV4dGVuZFxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCBPYmplY3QgdG8gZXh0ZW5kXG4gKiBAcGFyYW0ge09iamVjdH0gW3NvdXJjZV0gT2JqZWN0IHRvIGV4dGVuZCBmcm9tXG4gKiBAcmV0dXJuIHtPYmplY3R9IEV4dGVuZGVkIG9iamVjdFxuICogQGV4YW1wbGVcbiAqICAgICAkLmV4dGVuZCh7YTogMX0sIHtiOiAyfSk7XG4gKiAgICAgLy8ge2E6IDEsIGI6IDJ9XG4gKiBAZXhhbXBsZVxuICogICAgICQuZXh0ZW5kKHthOiAxfSwge2I6IDJ9LCB7YTogM30pO1xuICogICAgIC8vIHthOiAzLCBiOiAyfVxuICovXG5cbnZhciBleHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBzb3VyY2VzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHNvdXJjZXNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcmMpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIHNyYykge1xuICAgICAgdGFyZ2V0W3Byb3BdID0gc3JjW3Byb3BdO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgY29sbGVjdGlvbiB3aXRob3V0IGR1cGxpY2F0ZXNcbiAqXG4gKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIHRvIHJlbW92ZSBkdXBsaWNhdGVzIGZyb21cbiAqIEByZXR1cm4ge05vZGV8Tm9kZUxpc3R8QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciB1bmlxID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLmluZGV4T2YoaXRlbSkgPT09IGluZGV4O1xuICB9KTtcbn07XG5cbi8qKlxuICogQG1vZHVsZSBTZWxlY3RvclxuICovXG5cbnZhciBpc1Byb3RvdHlwZVNldCA9IGZhbHNlO1xuXG52YXIgcmVGcmFnbWVudCA9IC9eXFxzKjwoXFx3K3whKVtePl0qPi87XG52YXIgcmVTaW5nbGVUYWcgPSAvXjwoXFx3KylcXHMqXFwvPz4oPzo8XFwvXFwxPnwpJC87XG52YXIgcmVTaW1wbGVTZWxlY3RvciA9IC9eW1xcLiNdP1tcXHctXSokLztcblxuLypcbiAqIFZlcnNhdGlsZSB3cmFwcGVyIGZvciBgcXVlcnlTZWxlY3RvckFsbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gc2VsZWN0b3IgUXVlcnkgc2VsZWN0b3IsIGBOb2RlYCwgYE5vZGVMaXN0YCwgYXJyYXkgb2YgZWxlbWVudHMsIG9yIEhUTUwgZnJhZ21lbnQgc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdH0gY29udGV4dD1kb2N1bWVudCBUaGUgY29udGV4dCBmb3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5IGVsZW1lbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciAkaXRlbXMgPSAkKC5pdGVtcycpO1xuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGVsZW1lbnQgPSAkKGRvbUVsZW1lbnQpO1xuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGxpc3QgPSAkKG5vZGVMaXN0LCBkb2N1bWVudC5ib2R5KTtcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyICRlbGVtZW50ID0gJCgnPHA+ZXZlcmdyZWVuPC9wPicpO1xuICovXG5cbnZhciAkJDIgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50O1xuXG5cbiAgdmFyIGNvbGxlY3Rpb24gPSB2b2lkIDA7XG5cbiAgaWYgKCFzZWxlY3Rvcikge1xuXG4gICAgY29sbGVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobnVsbCk7XG4gIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBXcmFwcGVyKSB7XG5cbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuXG4gICAgY29sbGVjdGlvbiA9IHNlbGVjdG9yLm5vZGVUeXBlIHx8IHNlbGVjdG9yID09PSB3aW5kb3cgPyBbc2VsZWN0b3JdIDogc2VsZWN0b3I7XG4gIH0gZWxzZSBpZiAocmVGcmFnbWVudC50ZXN0KHNlbGVjdG9yKSkge1xuXG4gICAgY29sbGVjdGlvbiA9IGNyZWF0ZUZyYWdtZW50KHNlbGVjdG9yKTtcbiAgfSBlbHNlIHtcblxuICAgIGNvbnRleHQgPSB0eXBlb2YgY29udGV4dCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRleHQpIDogY29udGV4dC5sZW5ndGggPyBjb250ZXh0WzBdIDogY29udGV4dDtcblxuICAgIGNvbGxlY3Rpb24gPSBxdWVyeVNlbGVjdG9yKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgfVxuXG4gIHJldHVybiB3cmFwKGNvbGxlY3Rpb24pO1xufTtcblxuLypcbiAqIEZpbmQgZGVzY2VuZGFudHMgbWF0Y2hpbmcgdGhlIHByb3ZpZGVkIGBzZWxlY3RvcmAgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBzZWxlY3RvciBRdWVyeSBzZWxlY3RvciwgYE5vZGVgLCBgTm9kZUxpc3RgLCBhcnJheSBvZiBlbGVtZW50cywgb3IgSFRNTCBmcmFnbWVudCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuZmluZCgnLmRlZXAnKS4kKCcuZGVlcGVzdCcpO1xuICovXG5cbnZhciBmaW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuIGVhY2gocXVlcnlTZWxlY3RvcihzZWxlY3Rvciwgbm9kZSksIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgaWYgKG5vZGVzLmluZGV4T2YoY2hpbGQpID09PSAtMSkge1xuICAgICAgICBub2Rlcy5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLypcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBlbGVtZW50IHdvdWxkIGJlIHNlbGVjdGVkIGJ5IHRoZSBzcGVjaWZpZWQgc2VsZWN0b3Igc3RyaW5nOyBvdGhlcndpc2UsIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byB0ZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgU2VsZWN0b3IgdG8gbWF0Y2ggYWdhaW5zdCBlbGVtZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5tYXRjaGVzKGVsZW1lbnQsICcubWF0Y2gnKTtcbiAqL1xuXG52YXIgbWF0Y2hlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRleHQgPSB0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBFbGVtZW50LnByb3RvdHlwZSA6IHdpbjtcbiAgdmFyIF9tYXRjaGVzID0gY29udGV4dC5tYXRjaGVzIHx8IGNvbnRleHQubWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQubXNNYXRjaGVzU2VsZWN0b3IgfHwgY29udGV4dC5vTWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIF9tYXRjaGVzLmNhbGwoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9O1xufSgpO1xuXG4vKlxuICogVXNlIHRoZSBmYXN0ZXIgYGdldEVsZW1lbnRCeUlkYCwgYGdldEVsZW1lbnRzQnlDbGFzc05hbWVgIG9yIGBnZXRFbGVtZW50c0J5VGFnTmFtZWAgb3ZlciBgcXVlcnlTZWxlY3RvckFsbGAgaWYgcG9zc2libGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBRdWVyeSBzZWxlY3Rvci5cbiAqIEBwYXJhbSB7Tm9kZX0gY29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5IGVsZW1lbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBOb2RlTGlzdCwgSFRNTENvbGxlY3Rpb24sIG9yIEFycmF5IG9mIG1hdGNoaW5nIGVsZW1lbnRzIChkZXBlbmRpbmcgb24gbWV0aG9kIHVzZWQpLlxuICovXG5cbnZhciBxdWVyeVNlbGVjdG9yID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG5cbiAgdmFyIGlzU2ltcGxlU2VsZWN0b3IgPSByZVNpbXBsZVNlbGVjdG9yLnRlc3Qoc2VsZWN0b3IpO1xuXG4gIGlmIChpc1NpbXBsZVNlbGVjdG9yKSB7XG4gICAgaWYgKHNlbGVjdG9yWzBdID09PSAnIycpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gKGNvbnRleHQuZ2V0RWxlbWVudEJ5SWQgPyBjb250ZXh0IDogZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yLnNsaWNlKDEpKTtcbiAgICAgIHJldHVybiBlbGVtZW50ID8gW2VsZW1lbnRdIDogW107XG4gICAgfVxuICAgIGlmIChzZWxlY3RvclswXSA9PT0gJy4nKSB7XG4gICAgICByZXR1cm4gY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG4vKlxuICogQ3JlYXRlIERPTSBmcmFnbWVudCBmcm9tIGFuIEhUTUwgc3RyaW5nXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sIFN0cmluZyByZXByZXNlbnRpbmcgSFRNTC5cbiAqIEByZXR1cm4ge05vZGVMaXN0fVxuICovXG5cbnZhciBjcmVhdGVGcmFnbWVudCA9IGZ1bmN0aW9uIChodG1sKSB7XG5cbiAgaWYgKHJlU2luZ2xlVGFnLnRlc3QoaHRtbCkpIHtcbiAgICByZXR1cm4gW2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoUmVnRXhwLiQxKV07XG4gIH1cblxuICB2YXIgZWxlbWVudHMgPSBbXTtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGROb2RlcztcblxuICBjb250YWluZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGVsZW1lbnRzLnB1c2goY2hpbGRyZW5baV0pO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRzO1xufTtcblxuLypcbiAqIENhbGxpbmcgYCQoc2VsZWN0b3IpYCByZXR1cm5zIGEgd3JhcHBlZCBjb2xsZWN0aW9uIG9mIGVsZW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uIEVsZW1lbnQocykgdG8gd3JhcC5cbiAqIEByZXR1cm4gT2JqZWN0KSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKi9cblxudmFyIHdyYXAgPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuXG4gIGlmICghaXNQcm90b3R5cGVTZXQpIHtcbiAgICBXcmFwcGVyLnByb3RvdHlwZSA9ICQkMi5mbjtcbiAgICBXcmFwcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdyYXBwZXI7XG4gICAgaXNQcm90b3R5cGVTZXQgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBXcmFwcGVyKGNvbGxlY3Rpb24pO1xufTtcblxuLypcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgT2JqZWN0LnByb3RvdHlwZSBzdHJhdGVneVxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb24gRWxlbWVudChzKSB0byB3cmFwLlxuICovXG5cbnZhciBXcmFwcGVyID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOykge1xuICAgIHRoaXNbaV0gPSBjb2xsZWN0aW9uW2krK107XG4gIH1cbiAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG59O1xuXG52YXIgc2VsZWN0b3IgPSBPYmplY3QuZnJlZXplKHtcblx0JDogJCQyLFxuXHRmaW5kOiBmaW5kLFxuXHRtYXRjaGVzOiBtYXRjaGVzLFxuXHRXcmFwcGVyOiBXcmFwcGVyXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEFycmF5XG4gKi9cblxudmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjYWxsYmFjayByZXR1cm5zIGEgdHJ1ZSgtaXNoKSB2YWx1ZSBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggZWxlbWVudCwgaW52b2tlZCB3aXRoIGBlbGVtZW50YCBhcyBhcmd1bWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdGhpc0FyZ10gVmFsdWUgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciBlYWNoIGVsZW1lbnQgcGFzc2VkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZXZlcnkoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKiAgICAgLy8gdHJ1ZS9mYWxzZVxuICovXG5cbnZhciBldmVyeSA9IEFycmF5UHJvdG8uZXZlcnk7XG5cbi8qKlxuICogRmlsdGVyIHRoZSBjb2xsZWN0aW9uIGJ5IHNlbGVjdG9yIG9yIGZ1bmN0aW9uLCBhbmQgcmV0dXJuIGEgbmV3IGNvbGxlY3Rpb24gd2l0aCB0aGUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBzZWxlY3RvciBTZWxlY3RvciBvciBmdW5jdGlvbiB0byBmaWx0ZXIgdGhlIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmZpbHRlcignLmFjdGl2ZScpO1xuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKi9cblxudmFyIGZpbHRlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgdGhpc0FyZykge1xuICB2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicgPyBzZWxlY3RvciA6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIG1hdGNoZXMoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9O1xuICByZXR1cm4gJCQyKEFycmF5UHJvdG8uZmlsdGVyLmNhbGwodGhpcywgY2FsbGJhY2ssIHRoaXNBcmcpKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBhIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBlbGVtZW50LCBpbnZva2VkIHdpdGggYGVsZW1lbnRgIGFzIGFyZ3VtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IFt0aGlzQXJnXSBWYWx1ZSB0byB1c2UgYXMgYHRoaXNgIHdoZW4gZXhlY3V0aW5nIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnZXZlcmdyZWVuJztcbiAqICAgICApO1xuICovXG5cbnZhciBmb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGNhbGxiYWNrLCB0aGlzQXJnKTtcbn07XG5cbnZhciBlYWNoJDEgPSBmb3JFYWNoO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIGFuIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB6ZXJvLWJhc2VkIGluZGV4LCAtMSBpZiBub3QgZm91bmQuXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmluZGV4T2YoZWxlbWVudCk7XG4gKiAgICAgLy8gMlxuICovXG5cbnZhciBpbmRleE9mID0gQXJyYXlQcm90by5pbmRleE9mO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjb2xsZWN0aW9uIGJ5IGV4ZWN1dGluZyB0aGUgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge0FycmF5fSBDb2xsZWN0aW9uIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZXhlY3V0ZWQgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudC5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCduYW1lJylcbiAqICAgICB9KTtcbiAqICAgICAvLyBbJ2V2ZXInLCAnZ3JlZW4nXVxuICovXG5cbnZhciBtYXAgPSBBcnJheVByb3RvLm1hcDtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBsYXN0IGVsZW1lbnQgZnJvbSB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhhdCBlbGVtZW50LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGxhc3QgZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgbGFzdEVsZW1lbnQgPSAkKCcuaXRlbXMnKS5wb3AoKTtcbiAqL1xuXG52YXIgcG9wID0gQXJyYXlQcm90by5wb3A7XG5cbi8qKlxuICogQWRkcyBvbmUgb3IgbW9yZSBlbGVtZW50cyB0byB0aGUgZW5kIG9mIHRoZSBjb2xsZWN0aW9uLCBhbmQgcmV0dXJucyB0aGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBFbGVtZW50KHMpIHRvIGFkZCB0byB0aGUgY29sbGVjdGlvblxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5wdXNoKGVsZW1lbnQpO1xuICovXG5cbnZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoO1xuXG4vKipcbiAqIEFwcGx5IGEgZnVuY3Rpb24gYWdhaW5zdCBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIGFuZCB0aGlzIGFjY3VtdWxhdG9yIGZ1bmN0aW9uIGhhcyB0byByZWR1Y2UgaXRcbiAqIHRvIGEgc2luZ2xlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXksIHRha2luZyBmb3VyIGFyZ3VtZW50cyAoc2VlIGV4YW1wbGUpLlxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFZhbHVlIE9iamVjdCB0byB1c2UgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBmaXJzdCBjYWxsIG9mIHRoZSBjYWxsYmFjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzVmFsdWUsIGVsZW1lbnQsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gKiAgICAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlICsgZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gKiAgICAgfSwgMCk7XG4gKiAgICAgLy8gW3RvdGFsIGhlaWdodCBvZiBlbGVtZW50c11cbiAqL1xuXG52YXIgcmVkdWNlID0gQXJyYXlQcm90by5yZWR1Y2U7XG5cbi8qKlxuICogQXBwbHkgYSBmdW5jdGlvbiBhZ2FpbnN0IGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiAoZnJvbSByaWdodC10by1sZWZ0KSwgYW5kIHRoaXMgYWNjdW11bGF0b3IgZnVuY3Rpb24gaGFzXG4gKiB0byByZWR1Y2UgaXQgdG8gYSBzaW5nbGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheSwgdGFraW5nIGZvdXIgYXJndW1lbnRzIChzZWUgZXhhbXBsZSkuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsVmFsdWUgT2JqZWN0IHRvIHVzZSBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIGZpcnN0IGNhbGwgb2YgdGhlIGNhbGxiYWNrLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZWR1Y2VSaWdodChmdW5jdGlvbihwcmV2aW91c1ZhbHVlLCBlbGVtZW50LCBpbmRleCwgY29sbGVjdGlvbikge1xuICogICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZSArIGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gKiAgICAgfSwgJycpXG4gKiAgICAgLy8gW3JldmVyc2VkIHRleHQgb2YgZWxlbWVudHNdXG4gKi9cblxudmFyIHJlZHVjZVJpZ2h0ID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodDtcblxuLyoqXG4gKiBSZXZlcnNlcyBhbiBhcnJheSBpbiBwbGFjZS4gVGhlIGZpcnN0IGFycmF5IGVsZW1lbnQgYmVjb21lcyB0aGUgbGFzdCBhbmQgdGhlIGxhc3QgYmVjb21lcyB0aGUgZmlyc3QuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uLCByZXZlcnNlZFxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZXZlcnNlKCk7XG4gKi9cblxudmFyIHJldmVyc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAkJDIodG9BcnJheSh0aGlzKS5yZXZlcnNlKCkpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24sIGFuZCByZXR1cm5zIHRoYXQgZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBmaXJzdEVsZW1lbnQgPSAkKCcuaXRlbXMnKS5zaGlmdCgpO1xuICovXG5cbnZhciBzaGlmdCA9IEFycmF5UHJvdG8uc2hpZnQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjYWxsYmFjayByZXR1cm5zIGEgdHJ1ZSgtaXNoKSB2YWx1ZSBmb3IgYW55IG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIGFueSBlbGVtZW50IHBhc3NlZCB0aGUgY2FsbGJhY2sgY2hlY2suXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnNvbWUoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKiAgICAgLy8gdHJ1ZS9mYWxzZVxuICovXG5cbnZhciBzb21lID0gQXJyYXlQcm90by5zb21lO1xuXG4vKipcbiAqIEFkZHMgb25lIG9yIG1vcmUgZWxlbWVudHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgRWxlbWVudChzKSB0byBhZGQgdG8gdGhlIGNvbGxlY3Rpb25cbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykudW5zaGlmdChlbGVtZW50KTtcbiAqL1xuXG52YXIgdW5zaGlmdCA9IEFycmF5UHJvdG8udW5zaGlmdDtcblxudmFyIGFycmF5ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGV2ZXJ5OiBldmVyeSxcblx0ZmlsdGVyOiBmaWx0ZXIsXG5cdGZvckVhY2g6IGZvckVhY2gsXG5cdGVhY2g6IGVhY2gkMSxcblx0aW5kZXhPZjogaW5kZXhPZixcblx0bWFwOiBtYXAsXG5cdHBvcDogcG9wLFxuXHRwdXNoOiBwdXNoLFxuXHRyZWR1Y2U6IHJlZHVjZSxcblx0cmVkdWNlUmlnaHQ6IHJlZHVjZVJpZ2h0LFxuXHRyZXZlcnNlOiByZXZlcnNlLFxuXHRzaGlmdDogc2hpZnQsXG5cdHNvbWU6IHNvbWUsXG5cdHVuc2hpZnQ6IHVuc2hpZnRcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKipcbiAqIEBtb2R1bGUgQmFzZUNsYXNzXG4gKi9cblxudmFyIEJhc2VDbGFzcyA9IGZ1bmN0aW9uIChhcGkpIHtcblxuICAvKipcbiAgICogUHJvdmlkZSBzdWJjbGFzcyBmb3IgY2xhc3NlcyBvciBjb21wb25lbnRzIHRvIGV4dGVuZCBmcm9tLlxuICAgKiBUaGUgb3Bwb3NpdGUgYW5kIHN1Y2Nlc3NvciBvZiBwbHVnaW5zIChubyBuZWVkIHRvIGV4dGVuZCBgJC5mbmAgYW55bW9yZSwgY29tcGxldGUgY29udHJvbCkuXG4gICAqXG4gICAqIEByZXR1cm4ge0NsYXNzfSBUaGUgY2xhc3MgdG8gZXh0ZW5kIGZyb20sIGluY2x1ZGluZyBhbGwgYCQuZm5gIG1ldGhvZHMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBpbXBvcnQgeyBCYXNlQ2xhc3MgfSBmcm9tICAnZG9tdGFzdGljJztcbiAgICpcbiAgICogICAgIGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgQmFzZUNsYXNzIHtcbiAgICogICAgICAgICBkb1NvbWV0aGluZygpIHtcbiAgICogICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ2xhc3MoJy5mb28nKTtcbiAgICogICAgICAgICB9XG4gICAqICAgICB9XG4gICAqXG4gICAqICAgICBsZXQgY29tcG9uZW50ID0gbmV3IE15Q29tcG9uZW50KCdib2R5Jyk7XG4gICAqICAgICBjb21wb25lbnQuZG9Tb21ldGhpbmcoKTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIGltcG9ydCAkIGZyb20gICdkb210YXN0aWMnO1xuICAgKlxuICAgKiAgICAgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyAkLkJhc2VDbGFzcyB7XG4gICAqICAgICAgICAgcHJvZ3Jlc3ModmFsdWUpIHtcbiAgICogICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignZGF0YS1wcm9ncmVzcycsIHZhbHVlKTtcbiAgICogICAgICAgICB9XG4gICAqICAgICB9XG4gICAqXG4gICAqICAgICBsZXQgY29tcG9uZW50ID0gbmV3IE15Q29tcG9uZW50KGRvY3VtZW50LmJvZHkpO1xuICAgKiAgICAgY29tcG9uZW50LnByb2dyZXNzKCdpdmUnKS5hcHBlbmQoJzxwPmVuaGFuY2VtZW50PC9wPicpO1xuICAgKi9cblxuICB2YXIgQmFzZUNsYXNzID0gZnVuY3Rpb24gQmFzZUNsYXNzKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCYXNlQ2xhc3MpO1xuXG4gICAgV3JhcHBlci5jYWxsKHRoaXMsICQkMi5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIGV4dGVuZChCYXNlQ2xhc3MucHJvdG90eXBlLCBhcGkpO1xuICByZXR1cm4gQmFzZUNsYXNzO1xufTtcblxuLyoqXG4gKiBAbW9kdWxlIENTU1xuICovXG5cbnZhciBpc051bWVyaWMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KHZhbHVlKSkgJiYgaXNGaW5pdGUodmFsdWUpO1xufTtcblxudmFyIGNhbWVsaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8tKFtcXGRhLXpdKS9naSwgZnVuY3Rpb24gKG1hdGNoZXMsIGxldHRlcikge1xuICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59O1xuXG52YXIgZGFzaGVyaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGEgc3R5bGUgcHJvcGVydHkgZm9yIHRoZSBmaXJzdCBlbGVtZW50LCBvciBzZXQgb25lIG9yIG1vcmUgc3R5bGUgcHJvcGVydGllcyBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0ga2V5IFRoZSBuYW1lIG9mIHRoZSBzdHlsZSBwcm9wZXJ0eSB0byBnZXQgb3Igc2V0LiBPciBhbiBvYmplY3QgY29udGFpbmluZyBrZXktdmFsdWUgcGFpcnMgdG8gc2V0IGFzIHN0eWxlIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgdmFsdWUgb2YgdGhlIHN0eWxlIHByb3BlcnR5IHRvIHNldC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmNzcygncGFkZGluZy1sZWZ0Jyk7IC8vIGdldFxuICogICAgICQoJy5pdGVtJykuY3NzKCdjb2xvcicsICcjZjAwJyk7IC8vIHNldFxuICogICAgICQoJy5pdGVtJykuY3NzKHsnYm9yZGVyLXdpZHRoJzogJzFweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSk7IC8vIHNldCBtdWx0aXBsZVxuICovXG5cbnZhciBjc3MgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gIHZhciBzdHlsZVByb3BzID0gdm9pZCAwLFxuICAgICAgcHJvcCA9IHZvaWQgMCxcbiAgICAgIHZhbCA9IHZvaWQgMDtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXkgPSBjYW1lbGl6ZShrZXkpO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdmFsID0gZWxlbWVudC5zdHlsZVtrZXldO1xuICAgICAgICByZXR1cm4gaXNOdW1lcmljKHZhbCkgPyBwYXJzZUZsb2F0KHZhbCkgOiB2YWw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHN0eWxlUHJvcHMgPSB7fTtcbiAgICBzdHlsZVByb3BzW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZVByb3BzID0ga2V5O1xuICAgIGZvciAocHJvcCBpbiBzdHlsZVByb3BzKSB7XG4gICAgICB2YWwgPSBzdHlsZVByb3BzW3Byb3BdO1xuICAgICAgZGVsZXRlIHN0eWxlUHJvcHNbcHJvcF07XG4gICAgICBzdHlsZVByb3BzW2NhbWVsaXplKHByb3ApXSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZm9yIChwcm9wIGluIHN0eWxlUHJvcHMpIHtcbiAgICAgIGlmIChzdHlsZVByb3BzW3Byb3BdIHx8IHN0eWxlUHJvcHNbcHJvcF0gPT09IDApIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZVtwcm9wXSA9IHN0eWxlUHJvcHNbcHJvcF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KGRhc2hlcml6ZShwcm9wKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnZhciBjc3MkMSA9IE9iamVjdC5mcmVlemUoe1xuXHRjc3M6IGNzc1xufSk7XG5cbi8qKlxuICogQG1vZHVsZSBET01cbiAqL1xuXG52YXIgZm9yRWFjaCQxID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cbi8qKlxuICogQXBwZW5kIGVsZW1lbnQocykgdG8gZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gYXBwZW5kIHRvIHRoZSBlbGVtZW50KHMpLlxuICogQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmFwcGVuZCgnPHA+bW9yZTwvcD4nKTtcbiAqL1xuXG52YXIgYXBwZW5kID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cywgdGhpcy5hcHBlbmRDaGlsZC5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgX2VhY2godGhpcywgYXBwZW5kLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGxhY2UgZWxlbWVudChzKSBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIHBsYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGVsZW1lbnQocykuXG4gKiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykucHJlcGVuZCgnPHNwYW4+c3RhcnQ8L3NwYW4+Jyk7XG4gKi9cblxudmFyIHByZXBlbmQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cy5yZXZlcnNlKCksIHByZXBlbmQuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIHByZXBlbmQsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGFjZSBlbGVtZW50KHMpIGJlZm9yZSBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBwbGFjZSBhcyBzaWJsaW5nKHMpIGJlZm9yZSB0byB0aGUgZWxlbWVudChzKS5cbiAqIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuYmVmb3JlKCc8cD5wcmVmaXg8L3A+Jyk7XG4gKi9cblxudmFyIGJlZm9yZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cywgYmVmb3JlLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBfZWFjaCh0aGlzLCBiZWZvcmUsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGFjZSBlbGVtZW50KHMpIGFmdGVyIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIHBsYWNlIGFzIHNpYmxpbmcocykgYWZ0ZXIgdG8gdGhlIGVsZW1lbnQocykuIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuYWZ0ZXIoJzxzcGFuPnN1Zjwvc3Bhbj48c3Bhbj5maXg8L3NwYW4+Jyk7XG4gKi9cblxudmFyIGFmdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyZW5kJywgZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMubmV4dFNpYmxpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gZWxlbWVudCBpbnN0YW5jZW9mIE5vZGVMaXN0ID8gdG9BcnJheShlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICAgIGZvckVhY2gkMS5jYWxsKGVsZW1lbnRzLnJldmVyc2UoKSwgYWZ0ZXIuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIGFmdGVyLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xvbmUgYSB3cmFwcGVkIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFdyYXBwZWQgY29sbGVjdGlvbiBvZiBjbG9uZWQgbm9kZXMuXG4gKiBAZXhhbXBsZVxuICogICAgICQoZWxlbWVudCkuY2xvbmUoKTtcbiAqL1xuXG52YXIgY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAkJDIoX2Nsb25lKHRoaXMpKTtcbn07XG5cbi8qKlxuICogQ2xvbmUgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gZWxlbWVudCBUaGUgZWxlbWVudChzKSB0byBjbG9uZS5cbiAqIEByZXR1cm4ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBUaGUgY2xvbmVkIGVsZW1lbnQocylcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIF9jbG9uZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgIHJldHVybiBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgfSBlbHNlIGlmICgnbGVuZ3RoJyBpbiBlbGVtZW50KSB7XG4gICAgcmV0dXJuIFtdLm1hcC5jYWxsKGVsZW1lbnQsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgcmV0dXJuIGVsLmNsb25lTm9kZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZWxlbWVudDtcbn07XG5cbi8qKlxuICogU3BlY2lhbGl6ZWQgaXRlcmF0aW9uLCBhcHBseWluZyBgZm5gIGluIHJldmVyc2VkIG1hbm5lciB0byBhIGNsb25lIG9mIGVhY2ggZWxlbWVudCwgYnV0IHRoZSBwcm92aWRlZCBvbmUuXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgX2VhY2ggPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZm4sIGVsZW1lbnQpIHtcbiAgdmFyIGwgPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgd2hpbGUgKGwtLSkge1xuICAgIHZhciBlbG0gPSBsID09PSAwID8gZWxlbWVudCA6IF9jbG9uZShlbGVtZW50KTtcbiAgICBmbi5jYWxsKGNvbGxlY3Rpb25bbF0sIGVsbSk7XG4gIH1cbn07XG5cbnZhciBkb20gPSBPYmplY3QuZnJlZXplKHtcblx0YXBwZW5kOiBhcHBlbmQsXG5cdHByZXBlbmQ6IHByZXBlbmQsXG5cdGJlZm9yZTogYmVmb3JlLFxuXHRhZnRlcjogYWZ0ZXIsXG5cdGNsb25lOiBjbG9uZSxcblx0X2Nsb25lOiBfY2xvbmUsXG5cdF9lYWNoOiBfZWFjaFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBBdHRyXG4gKi9cblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBmb3IgdGhlIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBvbmUgb3IgbW9yZSBhdHRyaWJ1dGVzIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBrZXkgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byBnZXQgb3Igc2V0LiBPciBhbiBvYmplY3QgY29udGFpbmluZyBrZXktdmFsdWUgcGFpcnMgdG8gc2V0IGFzIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hdHRyKCdhdHRyTmFtZScpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLmF0dHIoJ2F0dHJOYW1lJywgJ2F0dHJWYWx1ZScpOyAvLyBzZXRcbiAqICAgICAkKCcuaXRlbScpLmF0dHIoe2F0dHIxOiAndmFsdWUxJywgJ2F0dHItMic6ICd2YWx1ZTInfSk7IC8vIHNldCBtdWx0aXBsZVxuICovXG5cbnZhciBhdHRyID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgIHJldHVybiBlbGVtZW50ID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBfYXR0ciBpbiBrZXkpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoX2F0dHIsIGtleVtfYXR0cl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYXR0cmlidXRlIGZyb20gZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgQXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZW1vdmVBdHRyKCdhdHRyTmFtZScpO1xuICovXG5cbnZhciByZW1vdmVBdHRyID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICB9KTtcbn07XG5cbnZhciBkb21fYXR0ciA9IE9iamVjdC5mcmVlemUoe1xuXHRhdHRyOiBhdHRyLFxuXHRyZW1vdmVBdHRyOiByZW1vdmVBdHRyXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIENsYXNzXG4gKi9cblxuLyoqXG4gKiBBZGQgYSBjbGFzcyB0byB0aGUgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBTcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZShzKSB0byBhZGQgdG8gdGhlIGVsZW1lbnQocykuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hZGRDbGFzcygnYmFyJyk7XG4gKiAgICAgJCgnLml0ZW0nKS5hZGRDbGFzcygnYmFyIGZvbycpO1xuICovXG5cbnZhciBhZGRDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgZWFjaCh2YWx1ZS5zcGxpdCgnICcpLCBfZWFjaCQxLmJpbmQodGhpcywgJ2FkZCcpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBTcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZShzKSB0byByZW1vdmUgZnJvbSB0aGUgZWxlbWVudChzKS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZW1vdmVDbGFzcygnYmFyJyk7XG4gKiAgICAgJCgnLml0ZW1zJykucmVtb3ZlQ2xhc3MoJ2JhciBmb28nKTtcbiAqL1xuXG52YXIgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgIGVhY2godmFsdWUuc3BsaXQoJyAnKSwgX2VhY2gkMS5iaW5kKHRoaXMsICdyZW1vdmUnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBhIGNsYXNzIGF0IHRoZSBlbGVtZW50KHMpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFNwYWNlLXNlcGFyYXRlZCBjbGFzcyBuYW1lKHMpIHRvIHRvZ2dsZSBhdCB0aGUgZWxlbWVudChzKS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3N0YXRlXSBBIEJvb2xlYW4gdmFsdWUgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGNsYXNzIHNob3VsZCBiZSBhZGRlZCBvciByZW1vdmVkLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykudG9nZ2xlQ2xhc3MoJ2JhcicpO1xuICogICAgICQoJy5pdGVtJykudG9nZ2xlQ2xhc3MoJ2JhciBmb28nKTtcbiAqICAgICAkKCcuaXRlbScpLnRvZ2dsZUNsYXNzKCdiYXInLCB0cnVlKTtcbiAqL1xuXG52YXIgdG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXRlKSB7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHtcbiAgICB2YXIgYWN0aW9uID0gdHlwZW9mIHN0YXRlID09PSAnYm9vbGVhbicgPyBzdGF0ZSA/ICdhZGQnIDogJ3JlbW92ZScgOiAndG9nZ2xlJztcbiAgICBlYWNoKHZhbHVlLnNwbGl0KCcgJyksIF9lYWNoJDEuYmluZCh0aGlzLCBhY3Rpb24pKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGVsZW1lbnQocykgaGF2ZSBhIGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBDaGVjayBpZiB0aGUgRE9NIGVsZW1lbnQgY29udGFpbnMgdGhlIGNsYXNzIG5hbWUuIFdoZW4gYXBwbGllZCB0byBtdWx0aXBsZSBlbGVtZW50cyxcbiAqIHJldHVybnMgYHRydWVgIGlmIF9hbnlfIG9mIHRoZW0gY29udGFpbnMgdGhlIGNsYXNzIG5hbWUuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIHRoZSBlbGVtZW50J3MgY2xhc3MgYXR0cmlidXRlIGNvbnRhaW5zIHRoZSBjbGFzcyBuYW1lLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmhhc0NsYXNzKCdiYXInKTtcbiAqL1xuXG52YXIgaGFzQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICh0aGlzLm5vZGVUeXBlID8gW3RoaXNdIDogdGhpcykuc29tZShmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh2YWx1ZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTcGVjaWFsaXplZCBpdGVyYXRpb24sIGFwcGx5aW5nIGBmbmAgb2YgdGhlIGNsYXNzTGlzdCBBUEkgdG8gZWFjaCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmbk5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIF9lYWNoJDEgPSBmdW5jdGlvbiAoZm5OYW1lLCBjbGFzc05hbWUpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3RbZm5OYW1lXShjbGFzc05hbWUpO1xuICB9KTtcbn07XG5cbnZhciBkb21fY2xhc3MgPSBPYmplY3QuZnJlZXplKHtcblx0YWRkQ2xhc3M6IGFkZENsYXNzLFxuXHRyZW1vdmVDbGFzczogcmVtb3ZlQ2xhc3MsXG5cdHRvZ2dsZUNsYXNzOiB0b2dnbGVDbGFzcyxcblx0aGFzQ2xhc3M6IGhhc0NsYXNzXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIGNvbnRhaW5zXG4gKi9cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYW4gZWxlbWVudCBjb250YWlucyBhbm90aGVyIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciBUaGUgZWxlbWVudCB0aGF0IG1heSBjb250YWluIHRoZSBvdGhlciBlbGVtZW50LlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgbWF5IGJlIGEgZGVzY2VuZGFudCBvZiB0aGUgb3RoZXIgZWxlbWVudC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgdGhlIGBjb250YWluZXJgIGVsZW1lbnQgY29udGFpbnMgdGhlIGBlbGVtZW50YC5cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5jb250YWlucyhwYXJlbnRFbGVtZW50LCBjaGlsZEVsZW1lbnQpO1xuICogICAgIC8vIHRydWUvZmFsc2VcbiAqL1xuXG52YXIgY29udGFpbnMgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBlbGVtZW50KSB7XG4gIGlmICghY29udGFpbmVyIHx8ICFlbGVtZW50IHx8IGNvbnRhaW5lciA9PT0gZWxlbWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChjb250YWluZXIuY29udGFpbnMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGVsZW1lbnQpO1xuICB9IGVsc2UgaWYgKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbikge1xuICAgIHJldHVybiAhKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihlbGVtZW50KSAmIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fRElTQ09OTkVDVEVEKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgZG9tX2NvbnRhaW5zID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGNvbnRhaW5zOiBjb250YWluc1xufSk7XG5cbi8qKlxuICogQG1vZHVsZSBEYXRhXG4gKi9cblxudmFyIGlzU3VwcG9ydHNEYXRhU2V0ID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAnZGF0YXNldCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIERBVEFLRVlQUk9QID0gaXNTdXBwb3J0c0RhdGFTZXQgPyAnZGF0YXNldCcgOiAnX19ET01UQVNUSUNfREFUQV9fJztcblxuLyoqXG4gKiBHZXQgZGF0YSBmcm9tIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBkYXRhIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUga2V5IGZvciB0aGUgZGF0YSB0byBnZXQgb3Igc2V0LlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIGRhdGEgdG8gc2V0LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuZGF0YSgnYXR0ck5hbWUnKTsgLy8gZ2V0XG4gKiAgICAgJCgnLml0ZW0nKS5kYXRhKCdhdHRyTmFtZScsIHthbnk6ICdkYXRhJ30pOyAvLyBzZXRcbiAqL1xuXG52YXIgZGF0YSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCAmJiBEQVRBS0VZUFJPUCBpbiBlbGVtZW50ID8gZWxlbWVudFtEQVRBS0VZUFJPUF1ba2V5XSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKCFpc1N1cHBvcnRzRGF0YVNldCkge1xuICAgICAgZWxlbWVudFtEQVRBS0VZUFJPUF0gPSBlbGVtZW50W0RBVEFLRVlQUk9QXSB8fCB7fTtcbiAgICB9XG4gICAgZWxlbWVudFtEQVRBS0VZUFJPUF1ba2V5XSA9IHZhbHVlO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHByb3BlcnR5IGZyb20gZmlyc3QgZWxlbWVudCwgb3Igc2V0IHByb3BlcnR5IG9uIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQgb3Igc2V0LlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5wcm9wKCdhdHRyTmFtZScpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLnByb3AoJ2F0dHJOYW1lJywgJ2F0dHJWYWx1ZScpOyAvLyBzZXRcbiAqL1xuXG52YXIgcHJvcCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50ID8gZWxlbWVudFtrZXldIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudFtrZXldID0gdmFsdWU7XG4gIH0pO1xufTtcblxudmFyIGRvbV9kYXRhID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGRhdGE6IGRhdGEsXG5cdHByb3A6IHByb3Bcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgRE9NIChleHRyYSlcbiAqL1xuXG4vKipcbiAqIEFwcGVuZCBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24gdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50KHMpLlxuICpcbiAqIEBwYXJhbSB7Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBhcHBlbmQgdGhlIGVsZW1lbnQocykgdG8uIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hcHBlbmRUbyhjb250YWluZXIpO1xuICovXG5cbnZhciBhcHBlbmRUbyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBjb250ZXh0ID0gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gJCQyKGVsZW1lbnQpIDogZWxlbWVudDtcbiAgYXBwZW5kLmNhbGwoY29udGV4dCwgdGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLypcbiAqIEVtcHR5IGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5lbXB0eSgpO1xuICovXG5cbnZhciBlbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgY29sbGVjdGlvbiBmcm9tIHRoZSBET00uXG4gKlxuICogQHJldHVybiB7QXJyYXl9IEFycmF5IGNvbnRhaW5pbmcgdGhlIHJlbW92ZWQgZWxlbWVudHNcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5yZW1vdmUoKTtcbiAqL1xuXG52YXIgcmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBuZXcgY29udGVudCwgYW5kIHJldHVybiB0aGUgYXJyYXkgb2YgZWxlbWVudHMgdGhhdCB3ZXJlIHJlcGxhY2VkLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBjb250YWluaW5nIHRoZSByZXBsYWNlZCBlbGVtZW50c1xuICovXG5cbnZhciByZXBsYWNlV2l0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGJlZm9yZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnJlbW92ZSgpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGB0ZXh0Q29udGVudGAgZnJvbSB0aGUgZmlyc3QsIG9yIHNldCB0aGUgYHRleHRDb250ZW50YCBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV1cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnRleHQoJ05ldyBjb250ZW50Jyk7XG4gKi9cblxudmFyIHRleHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcblxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzWzBdLnRleHRDb250ZW50O1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC50ZXh0Q29udGVudCA9ICcnICsgdmFsdWU7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGB2YWx1ZWAgZnJvbSB0aGUgZmlyc3QsIG9yIHNldCB0aGUgYHZhbHVlYCBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV1cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCdpbnB1dC5maXJzdE5hbWUnKS52YWwoJ05ldyB2YWx1ZScpO1xuICovXG5cbnZhciB2YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcblxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzWzBdLnZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICB9KTtcbn07XG5cbnZhciBkb21fZXh0cmEgPSBPYmplY3QuZnJlZXplKHtcblx0YXBwZW5kVG86IGFwcGVuZFRvLFxuXHRlbXB0eTogZW1wdHksXG5cdHJlbW92ZTogcmVtb3ZlLFxuXHRyZXBsYWNlV2l0aDogcmVwbGFjZVdpdGgsXG5cdHRleHQ6IHRleHQsXG5cdHZhbDogdmFsXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEhUTUxcbiAqL1xuXG4vKlxuICogR2V0IHRoZSBIVE1MIGNvbnRlbnRzIG9mIHRoZSBmaXJzdCBlbGVtZW50LCBvciBzZXQgdGhlIEhUTUwgY29udGVudHMgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW2ZyYWdtZW50XSBIVE1MIGZyYWdtZW50IHRvIHNldCBmb3IgdGhlIGVsZW1lbnQuIElmIHRoaXMgYXJndW1lbnQgaXMgb21pdHRlZCwgdGhlIEhUTUwgY29udGVudHMgYXJlIHJldHVybmVkLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuaHRtbCgpO1xuICogICAgICQoJy5pdGVtJykuaHRtbCgnPHNwYW4+bW9yZTwvc3Bhbj4nKTtcbiAqL1xuXG52YXIgaHRtbCA9IGZ1bmN0aW9uIChmcmFnbWVudCkge1xuXG4gIGlmICh0eXBlb2YgZnJhZ21lbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBlbGVtZW50LmlubmVySFRNTCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuaW5uZXJIVE1MID0gZnJhZ21lbnQ7XG4gIH0pO1xufTtcblxudmFyIGRvbV9odG1sID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGh0bWw6IGh0bWxcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgY2xvc2VzdFxuICovXG5cbi8qKlxuICogUmV0dXJuIHRoZSBjbG9zZXN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yIChzdGFydGluZyBieSBpdHNlbGYpIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIEZpbHRlclxuICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0XSBJZiBwcm92aWRlZCwgbWF0Y2hpbmcgZWxlbWVudHMgbXVzdCBiZSBhIGRlc2NlbmRhbnQgb2YgdGhpcyBlbGVtZW50XG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb24gKGNvbnRhaW5pbmcgemVybyBvciBvbmUgZWxlbWVudClcbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY2xvc2VzdCgnLmNvbnRhaW5lcicpO1xuICovXG5cbnZhciBjbG9zZXN0ID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjbG9zZXN0ID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgZWFjaCh0aGlzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gY29udGV4dCkge1xuICAgICAgICBpZiAobWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuICQkMih1bmlxKG5vZGVzKSk7XG4gIH07XG5cbiAgcmV0dXJuIHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA/IGNsb3Nlc3QgOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHZhciBub2RlcyA9IFtdO1xuICAgICAgZWFjaCh0aGlzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICB2YXIgbiA9IG5vZGUuY2xvc2VzdChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChuKSB7XG4gICAgICAgICAgbm9kZXMucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gJCQyKHVuaXEobm9kZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNsb3Nlc3QuY2FsbCh0aGlzLCBzZWxlY3RvciwgY29udGV4dCk7XG4gICAgfVxuICB9O1xufSgpO1xuXG52YXIgc2VsZWN0b3JfY2xvc2VzdCA9IE9iamVjdC5mcmVlemUoe1xuXHRjbG9zZXN0OiBjbG9zZXN0XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEV2ZW50c1xuICovXG5cbi8qKlxuICogU2hvcnRoYW5kIGZvciBgYWRkRXZlbnRMaXN0ZW5lcmAuIFN1cHBvcnRzIGV2ZW50IGRlbGVnYXRpb24gaWYgYSBmaWx0ZXIgKGBzZWxlY3RvcmApIGlzIHByb3ZpZGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVzIExpc3Qgb2Ygc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIHRvIGJlIGFkZGVkIHRvIHRoZSBlbGVtZW50KHMpXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCBkZWxlZ2F0ZSB0aGUgZXZlbnQgdG8gdGhpcyBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBFdmVudCBoYW5kbGVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmU9ZmFsc2VcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZT1mYWxzZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykub24oJ2NsaWNrJywgY2FsbGJhY2spO1xuICogICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2sgZm9jdXMnLCAnLml0ZW0nLCBoYW5kbGVyKTtcbiAqL1xuXG52YXIgb24gPSBmdW5jdGlvbiAoZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUsIG9uY2UpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IHNlbGVjdG9yO1xuICAgIHNlbGVjdG9yID0gbnVsbDtcbiAgfVxuXG4gIHZhciBwYXJ0cyA9IHZvaWQgMCxcbiAgICAgIG5hbWVzcGFjZSA9IHZvaWQgMCxcbiAgICAgIGV2ZW50TGlzdGVuZXIgPSB2b2lkIDA7XG5cbiAgZXZlbnROYW1lcy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuXG4gICAgcGFydHMgPSBldmVudE5hbWUuc3BsaXQoJy4nKTtcbiAgICBldmVudE5hbWUgPSBwYXJ0c1swXSB8fCBudWxsO1xuICAgIG5hbWVzcGFjZSA9IHBhcnRzWzFdIHx8IG51bGw7XG5cbiAgICBldmVudExpc3RlbmVyID0gcHJveHlIYW5kbGVyKGhhbmRsZXIpO1xuXG4gICAgZWFjaChfdGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcblxuICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIgPSBkZWxlZ2F0ZUhhbmRsZXIuYmluZChlbGVtZW50LCBzZWxlY3RvciwgZXZlbnRMaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGV2ZW50TGlzdGVuZXI7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBvZmYuY2FsbChlbGVtZW50LCBldmVudE5hbWVzLCBzZWxlY3RvciwgaGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChlbGVtZW50LCBldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gICAgICBnZXRIYW5kbGVycyhlbGVtZW50KS5wdXNoKHtcbiAgICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgIGV2ZW50TGlzdGVuZXI6IGV2ZW50TGlzdGVuZXIsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2hvcnRoYW5kIGZvciBgcmVtb3ZlRXZlbnRMaXN0ZW5lcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZXMgTGlzdCBvZiBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50KHMpXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCB1bmRlbGVnYXRlIHRoZSBldmVudCB0byB0aGlzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZT1mYWxzZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykub2ZmKCdjbGljaycsIGNhbGxiYWNrKTtcbiAqICAgICAkKCcjbXktZWxlbWVudCcpLm9mZignbXlFdmVudCBteU90aGVyRXZlbnQnKTtcbiAqICAgICAkKCcuaXRlbScpLm9mZigpO1xuICovXG5cbnZhciBvZmYgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBldmVudE5hbWVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgdmFyIHNlbGVjdG9yID0gYXJndW1lbnRzWzFdO1xuXG4gIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gIHZhciBoYW5kbGVyID0gYXJndW1lbnRzWzJdO1xuICB2YXIgdXNlQ2FwdHVyZSA9IGFyZ3VtZW50c1szXTtcblxuXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0gc2VsZWN0b3I7XG4gICAgc2VsZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgdmFyIHBhcnRzID0gdm9pZCAwLFxuICAgICAgbmFtZXNwYWNlID0gdm9pZCAwLFxuICAgICAgaGFuZGxlcnMgPSB2b2lkIDA7XG5cbiAgZXZlbnROYW1lcy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuXG4gICAgcGFydHMgPSBldmVudE5hbWUuc3BsaXQoJy4nKTtcbiAgICBldmVudE5hbWUgPSBwYXJ0c1swXSB8fCBudWxsO1xuICAgIG5hbWVzcGFjZSA9IHBhcnRzWzFdIHx8IG51bGw7XG5cbiAgICByZXR1cm4gZWFjaChfdGhpczIsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgIGhhbmRsZXJzID0gZ2V0SGFuZGxlcnMoZWxlbWVudCk7XG5cbiAgICAgIGVhY2goaGFuZGxlcnMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiAoIWV2ZW50TmFtZSB8fCBpdGVtLmV2ZW50TmFtZSA9PT0gZXZlbnROYW1lKSAmJiAoIW5hbWVzcGFjZSB8fCBpdGVtLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlKSAmJiAoIWhhbmRsZXIgfHwgaXRlbS5oYW5kbGVyID09PSBoYW5kbGVyKSAmJiAoIXNlbGVjdG9yIHx8IGl0ZW0uc2VsZWN0b3IgPT09IHNlbGVjdG9yKTtcbiAgICAgIH0pLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbS5ldmVudE5hbWUsIGl0ZW0uZXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShoYW5kbGVycy5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWV2ZW50TmFtZSAmJiAhbmFtZXNwYWNlICYmICFzZWxlY3RvciAmJiAhaGFuZGxlcikge1xuICAgICAgICBjbGVhckhhbmRsZXJzKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY2xlYXJIYW5kbGVycyhlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBldmVudCBsaXN0ZW5lciBhbmQgZXhlY3V0ZSB0aGUgaGFuZGxlciBhdCBtb3N0IG9uY2UgcGVyIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZXNcbiAqIEBwYXJhbSBzZWxlY3RvclxuICogQHBhcmFtIGhhbmRsZXJcbiAqIEBwYXJhbSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5vbmUoJ2NsaWNrJywgY2FsbGJhY2spO1xuICovXG5cbnZhciBvbmUgPSBmdW5jdGlvbiAoZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgcmV0dXJuIG9uLmNhbGwodGhpcywgZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUsIDEpO1xufTtcblxuLyoqXG4gKiBHZXQgZXZlbnQgaGFuZGxlcnMgZnJvbSBhbiBlbGVtZW50XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxudmFyIGV2ZW50S2V5UHJvcCA9ICdfX2RvbXRhc3RpY19ldmVudF9fJztcbnZhciBpZCA9IDE7XG52YXIgaGFuZGxlcnMgPSB7fTtcbnZhciB1bnVzZWRLZXlzID0gW107XG5cbnZhciBnZXRIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudFtldmVudEtleVByb3BdKSB7XG4gICAgZWxlbWVudFtldmVudEtleVByb3BdID0gdW51c2VkS2V5cy5sZW5ndGggPT09IDAgPyArK2lkIDogdW51c2VkS2V5cy5wb3AoKTtcbiAgfVxuICB2YXIga2V5ID0gZWxlbWVudFtldmVudEtleVByb3BdO1xuICByZXR1cm4gaGFuZGxlcnNba2V5XSB8fCAoaGFuZGxlcnNba2V5XSA9IFtdKTtcbn07XG5cbi8qKlxuICogQ2xlYXIgZXZlbnQgaGFuZGxlcnMgZm9yIGFuIGVsZW1lbnRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKi9cblxudmFyIGNsZWFySGFuZGxlcnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIga2V5ID0gZWxlbWVudFtldmVudEtleVByb3BdO1xuICBpZiAoaGFuZGxlcnNba2V5XSkge1xuICAgIGhhbmRsZXJzW2tleV0gPSBudWxsO1xuICAgIGVsZW1lbnRbZXZlbnRLZXlQcm9wXSA9IG51bGw7XG4gICAgdW51c2VkS2V5cy5wdXNoKGtleSk7XG4gIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgaGFuZGxlciB0aGF0IGF1Z21lbnRzIHRoZSBldmVudCBvYmplY3Qgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMsXG4gKiBhbmQgZXhlY3V0ZXMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGV2ZW50IGFuZCB0aGUgZXZlbnQgZGF0YSAoaS5lLiBgZXZlbnQuZGV0YWlsYCkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBoYW5kbGVyIENhbGxiYWNrIHRvIGV4ZWN1dGUgYXMgYGhhbmRsZXIoZXZlbnQsIGRhdGEpYFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxudmFyIHByb3h5SGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZXR1cm4gaGFuZGxlci5jYWxsKHRoaXMsIGF1Z21lbnRFdmVudChldmVudCkpO1xuICB9O1xufTtcblxudmFyIGV2ZW50TWV0aG9kcyA9IHtcbiAgcHJldmVudERlZmF1bHQ6ICdpc0RlZmF1bHRQcmV2ZW50ZWQnLFxuICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246ICdpc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCcsXG4gIHN0b3BQcm9wYWdhdGlvbjogJ2lzUHJvcGFnYXRpb25TdG9wcGVkJ1xufTtcbnZhciByZXR1cm5UcnVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgcmV0dXJuRmFsc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQXR0ZW1wdCB0byBhdWdtZW50IGV2ZW50cyBhbmQgaW1wbGVtZW50IHNvbWV0aGluZyBjbG9zZXIgdG8gRE9NIExldmVsIDMgRXZlbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbnZhciBhdWdtZW50RXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQgfHwgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIHx8IGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGZvciAodmFyIG1ldGhvZE5hbWUgaW4gZXZlbnRNZXRob2RzKSB7XG4gICAgICAoZnVuY3Rpb24gKG1ldGhvZE5hbWUsIHRlc3RNZXRob2ROYW1lLCBvcmlnaW5hbE1ldGhvZCkge1xuICAgICAgICBldmVudFttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzW3Rlc3RNZXRob2ROYW1lXSA9IHJldHVyblRydWU7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTWV0aG9kICYmIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICAgIGV2ZW50W3Rlc3RNZXRob2ROYW1lXSA9IHJldHVybkZhbHNlO1xuICAgICAgfSkobWV0aG9kTmFtZSwgZXZlbnRNZXRob2RzW21ldGhvZE5hbWVdLCBldmVudFttZXRob2ROYW1lXSk7XG4gICAgfVxuICAgIGlmIChldmVudC5fcHJldmVudERlZmF1bHQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBldmVudDtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdGVzdCB3aGV0aGVyIGRlbGVnYXRlZCBldmVudHMgbWF0Y2ggdGhlIHByb3ZpZGVkIGBzZWxlY3RvcmAgKGZpbHRlciksXG4gKiBpZiB0aGUgZXZlbnQgcHJvcGFnYXRpb24gd2FzIHN0b3BwZWQsIGFuZCB0aGVuIGFjdHVhbGx5IGNhbGwgdGhlIHByb3ZpZGVkIGV2ZW50IGhhbmRsZXIuXG4gKiBVc2UgYHRoaXNgIGluc3RlYWQgb2YgYGV2ZW50LmN1cnJlbnRUYXJnZXRgIG9uIHRoZSBldmVudCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCB1bmRlbGVnYXRlIHRoZSBldmVudCB0byB0aGlzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cblxudmFyIGRlbGVnYXRlSGFuZGxlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgaGFuZGxlciwgZXZlbnQpIHtcbiAgdmFyIGV2ZW50VGFyZ2V0ID0gZXZlbnQuX3RhcmdldCB8fCBldmVudC50YXJnZXQ7XG4gIHZhciBjdXJyZW50VGFyZ2V0ID0gY2xvc2VzdC5jYWxsKFtldmVudFRhcmdldF0sIHNlbGVjdG9yLCB0aGlzKVswXTtcbiAgaWYgKGN1cnJlbnRUYXJnZXQgJiYgY3VycmVudFRhcmdldCAhPT0gdGhpcykge1xuICAgIGlmIChjdXJyZW50VGFyZ2V0ID09PSBldmVudFRhcmdldCB8fCAhKGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkICYmIGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkKCkpKSB7XG4gICAgICBoYW5kbGVyLmNhbGwoY3VycmVudFRhcmdldCwgZXZlbnQpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGJpbmQgPSBvbjtcbnZhciB1bmJpbmQgPSBvZmY7XG5cbnZhciBldmVudCA9IE9iamVjdC5mcmVlemUoe1xuXHRvbjogb24sXG5cdG9mZjogb2ZmLFxuXHRvbmU6IG9uZSxcblx0Z2V0SGFuZGxlcnM6IGdldEhhbmRsZXJzLFxuXHRjbGVhckhhbmRsZXJzOiBjbGVhckhhbmRsZXJzLFxuXHRwcm94eUhhbmRsZXI6IHByb3h5SGFuZGxlcixcblx0ZGVsZWdhdGVIYW5kbGVyOiBkZWxlZ2F0ZUhhbmRsZXIsXG5cdGJpbmQ6IGJpbmQsXG5cdHVuYmluZDogdW5iaW5kXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIHRyaWdnZXJcbiAqL1xuXG52YXIgcmVNb3VzZUV2ZW50ID0gL14oPzptb3VzZXxwb2ludGVyfGNvbnRleHRtZW51KXxjbGljay87XG52YXIgcmVLZXlFdmVudCA9IC9ea2V5LztcblxuLyoqXG4gKiBUcmlnZ2VyIGV2ZW50IGF0IGVsZW1lbnQocylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHRoZSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgRGF0YSB0byBiZSBzZW50IHdpdGggdGhlIGV2ZW50IChgcGFyYW1zLmRldGFpbGAgd2lsbCBiZSBzZXQgdG8gdGhpcykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gRXZlbnQgcGFyYW1ldGVycyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5idWJibGVzPXRydWUgRG9lcyB0aGUgZXZlbnQgYnViYmxlIHVwIHRocm91Z2ggdGhlIERPTSBvciBub3QuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5jYW5jZWxhYmxlPXRydWUgSXMgdGhlIGV2ZW50IGNhbmNlbGFibGUgb3Igbm90LlxuICogQHBhcmFtIHtNaXhlZH0gcGFyYW1zLmRldGFpbD11bmRlZmluZWQgQWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS50cmlnZ2VyKCdhbnlFdmVudFR5cGUnKTtcbiAqL1xuXG52YXIgdHJpZ2dlciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fSxcbiAgICAgIF9yZWYkYnViYmxlcyA9IF9yZWYuYnViYmxlcyxcbiAgICAgIGJ1YmJsZXMgPSBfcmVmJGJ1YmJsZXMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfcmVmJGJ1YmJsZXMsXG4gICAgICBfcmVmJGNhbmNlbGFibGUgPSBfcmVmLmNhbmNlbGFibGUsXG4gICAgICBjYW5jZWxhYmxlID0gX3JlZiRjYW5jZWxhYmxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3JlZiRjYW5jZWxhYmxlLFxuICAgICAgX3JlZiRwcmV2ZW50RGVmYXVsdCA9IF9yZWYucHJldmVudERlZmF1bHQsXG4gICAgICBwcmV2ZW50RGVmYXVsdCA9IF9yZWYkcHJldmVudERlZmF1bHQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRwcmV2ZW50RGVmYXVsdDtcblxuICB2YXIgRXZlbnRDb25zdHJ1Y3RvciA9IGdldEV2ZW50Q29uc3RydWN0b3IodHlwZSk7XG4gIHZhciBldmVudCA9IG5ldyBFdmVudENvbnN0cnVjdG9yKHR5cGUsIHtcbiAgICBidWJibGVzOiBidWJibGVzLFxuICAgIGNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG4gICAgcHJldmVudERlZmF1bHQ6IHByZXZlbnREZWZhdWx0LFxuICAgIGRldGFpbDogZGF0YVxuICB9KTtcblxuICBldmVudC5fcHJldmVudERlZmF1bHQgPSBwcmV2ZW50RGVmYXVsdDtcblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICghYnViYmxlcyB8fCBpc0V2ZW50QnViYmxpbmdJbkRldGFjaGVkVHJlZSB8fCBpc0F0dGFjaGVkVG9Eb2N1bWVudChlbGVtZW50KSkge1xuICAgICAgZGlzcGF0Y2hFdmVudChlbGVtZW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyaWdnZXJGb3JQYXRoKGVsZW1lbnQsIHR5cGUsIHtcbiAgICAgICAgYnViYmxlczogYnViYmxlcyxcbiAgICAgICAgY2FuY2VsYWJsZTogY2FuY2VsYWJsZSxcbiAgICAgICAgcHJldmVudERlZmF1bHQ6IHByZXZlbnREZWZhdWx0LFxuICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZ2V0RXZlbnRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiBzdXBwb3J0c090aGVyRXZlbnRDb25zdHJ1Y3RvcnMgPyByZU1vdXNlRXZlbnQudGVzdCh0eXBlKSA/IE1vdXNlRXZlbnQgOiByZUtleUV2ZW50LnRlc3QodHlwZSkgPyBLZXlib2FyZEV2ZW50IDogQ3VzdG9tRXZlbnQgOiBDdXN0b21FdmVudDtcbn07XG5cbi8qKlxuICogVHJpZ2dlciBldmVudCBhdCBmaXJzdCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLiBTaW1pbGFyIHRvIGB0cmlnZ2VyKClgLCBleGNlcHQ6XG4gKlxuICogLSBFdmVudCBkb2VzIG5vdCBidWJibGVcbiAqIC0gRGVmYXVsdCBldmVudCBiZWhhdmlvciBpcyBwcmV2ZW50ZWRcbiAqIC0gT25seSB0cmlnZ2VycyBoYW5kbGVyIGZvciBmaXJzdCBtYXRjaGluZyBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIERhdGEgdG8gYmUgc2VudCB3aXRoIHRoZSBldmVudFxuICogQGV4YW1wbGVcbiAqICAgICAkKCdmb3JtJykudHJpZ2dlckhhbmRsZXIoJ3N1Ym1pdCcpO1xuICovXG5cbnZhciB0cmlnZ2VySGFuZGxlciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gIGlmICh0aGlzWzBdKSB7XG4gICAgdHJpZ2dlci5jYWxsKHRoaXNbMF0sIHR5cGUsIGRhdGEsIHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6IHRydWVcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIHRvIG9yIGRldGFjaGVkIGZyb20pIHRoZSBkb2N1bWVudFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byB0ZXN0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbnZhciBpc0F0dGFjaGVkVG9Eb2N1bWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHwgZWxlbWVudCA9PT0gZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gY29udGFpbnMoZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgZWxlbWVudCk7XG59O1xuXG4vKipcbiAqIERpc3BhdGNoIHRoZSBldmVudCBhdCB0aGUgZWxlbWVudCBhbmQgaXRzIGFuY2VzdG9ycy5cbiAqIFJlcXVpcmVkIHRvIHN1cHBvcnQgZGVsZWdhdGVkIGV2ZW50cyBpbiBicm93c2VycyB0aGF0IGRvbid0IGJ1YmJsZSBldmVudHMgaW4gZGV0YWNoZWQgRE9NIHRyZWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRmlyc3QgZWxlbWVudCB0byBkaXNwYXRjaCB0aGUgZXZlbnQgYXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgb2YgdGhlIGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gRXZlbnQgcGFyYW1ldGVycyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5idWJibGVzPXRydWUgRG9lcyB0aGUgZXZlbnQgYnViYmxlIHVwIHRocm91Z2ggdGhlIERPTSBvciBub3QuXG4gKiBXaWxsIGJlIHNldCB0byBmYWxzZSAoYnV0IHNob3VsZG4ndCBtYXR0ZXIgc2luY2UgZXZlbnRzIGRvbid0IGJ1YmJsZSBhbnl3YXkpLlxuICogQHBhcmFtIHtCb29sZWFufSBwYXJhbXMuY2FuY2VsYWJsZT10cnVlIElzIHRoZSBldmVudCBjYW5jZWxhYmxlIG9yIG5vdC5cbiAqIEBwYXJhbSB7TWl4ZWR9IHBhcmFtcy5kZXRhaWw9dW5kZWZpbmVkIEFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGV2ZW50LlxuICovXG5cbnZhciB0cmlnZ2VyRm9yUGF0aCA9IGZ1bmN0aW9uIChlbGVtZW50LCB0eXBlKSB7XG4gIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHBhcmFtcy5idWJibGVzID0gZmFsc2U7XG4gIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMpO1xuICBldmVudC5fdGFyZ2V0ID0gZWxlbWVudDtcbiAgZG8ge1xuICAgIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgZXZlbnQpO1xuICB9IHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25kLWFzc2lnblxufTtcblxuLyoqXG4gKiBEaXNwYXRjaCBldmVudCB0byBlbGVtZW50LCBidXQgY2FsbCBkaXJlY3QgZXZlbnQgbWV0aG9kcyBpbnN0ZWFkIGlmIGF2YWlsYWJsZVxuICogKGUuZy4gXCJibHVyKClcIiwgXCJzdWJtaXQoKVwiKSBhbmQgaWYgdGhlIGV2ZW50IGlzIG5vbi1jYW5jZWxhYmxlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byBkaXNwYXRjaCB0aGUgZXZlbnQgYXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCB0byBkaXNwYXRjaFxuICovXG5cbnZhciBkaXJlY3RFdmVudE1ldGhvZHMgPSBbJ2JsdXInLCAnZm9jdXMnLCAnc2VsZWN0JywgJ3N1Ym1pdCddO1xuXG52YXIgZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudCkge1xuICBpZiAoZGlyZWN0RXZlbnRNZXRob2RzLmluZGV4T2YoZXZlbnQudHlwZSkgIT09IC0xICYmIHR5cGVvZiBlbGVtZW50W2V2ZW50LnR5cGVdID09PSAnZnVuY3Rpb24nICYmICFldmVudC5fcHJldmVudERlZmF1bHQgJiYgIWV2ZW50LmNhbmNlbGFibGUpIHtcbiAgICBlbGVtZW50W2V2ZW50LnR5cGVdKCk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxufTtcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgQ3VzdG9tRXZlbnQsIGJvcnJvd2VkIGZyb20gW01ETl0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50I1BvbHlmaWxsKS5cbiAqIE5lZWRlZCB0byBzdXBwb3J0IElFICg5LCAxMCwgMTEpICYgUGhhbnRvbUpTXG4gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIEN1c3RvbUV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHZhciBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGN1c3RvbUV2ZW50LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICByZXR1cm4gY3VzdG9tRXZlbnQ7XG4gIH07XG5cbiAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luLkN1c3RvbUV2ZW50ICYmIHdpbi5DdXN0b21FdmVudC5wcm90b3R5cGU7XG4gIHdpbi5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTtcblxuLypcbiAqIEFyZSBldmVudHMgYnViYmxpbmcgaW4gZGV0YWNoZWQgRE9NIHRyZWVzP1xuICogQHByaXZhdGVcbiAqL1xuXG52YXIgaXNFdmVudEJ1YmJsaW5nSW5EZXRhY2hlZFRyZWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpc0J1YmJsaW5nID0gZmFsc2U7XG4gIHZhciBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gIGlmIChkb2MpIHtcbiAgICB2YXIgcGFyZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjaGlsZCA9IHBhcmVudC5jbG9uZU5vZGUoKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgaXNCdWJibGluZyA9IHRydWU7XG4gICAgfSk7XG4gICAgY2hpbGQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICB9XG4gIHJldHVybiBpc0J1YmJsaW5nO1xufSgpO1xuXG52YXIgc3VwcG9ydHNPdGhlckV2ZW50Q29uc3RydWN0b3JzID0gZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIG5ldyBNb3VzZUV2ZW50KCdjbGljaycpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufSgpO1xuXG52YXIgZXZlbnRfdHJpZ2dlciA9IE9iamVjdC5mcmVlemUoe1xuXHR0cmlnZ2VyOiB0cmlnZ2VyLFxuXHR0cmlnZ2VySGFuZGxlcjogdHJpZ2dlckhhbmRsZXJcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgUmVhZHlcbiAqL1xuXG4vKipcbiAqIEV4ZWN1dGUgY2FsbGJhY2sgd2hlbiBgRE9NQ29udGVudExvYWRlZGAgZmlyZXMgZm9yIGBkb2N1bWVudGAsIG9yIGltbWVkaWF0ZWx5IGlmIGNhbGxlZCBhZnRlcndhcmRzLlxuICpcbiAqIEBwYXJhbSBoYW5kbGVyIENhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBpbml0aWFsIERPTSBjb250ZW50IGlzIGxvYWRlZC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKGRvY3VtZW50KS5yZWFkeShjYWxsYmFjayk7XG4gKi9cblxudmFyIHJlYWR5ID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgaWYgKC9jb21wbGV0ZXxsb2FkZWR8aW50ZXJhY3RpdmUvLnRlc3QoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICAgIGhhbmRsZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaGFuZGxlciwgZmFsc2UpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxudmFyIGV2ZW50X3JlYWR5ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdHJlYWR5OiByZWFkeVxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBub0NvbmZsaWN0XG4gKi9cblxuLypcbiAqIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBnbG9iYWwgYCRgIHZhcmlhYmxlLCBzbyB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCBsYXRlciBvbi5cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHByZXZpb3VzTGliID0gd2luLiQ7XG5cbi8qKlxuICogSW4gY2FzZSBhbm90aGVyIGxpYnJhcnkgc2V0cyB0aGUgZ2xvYmFsIGAkYCB2YXJpYWJsZSBiZWZvcmUgRE9NdGFzdGljIGRvZXMsXG4gKiB0aGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byByZXR1cm4gdGhlIGdsb2JhbCBgJGAgdG8gdGhhdCBvdGhlciBsaWJyYXJ5LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gUmVmZXJlbmNlIHRvIERPTXRhc3RpYy5cbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIGRvbXRhc3RpYyA9ICQubm9Db25mbGljdCgpO1xuICovXG5cbnZhciBub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICB3aW4uJCA9IHByZXZpb3VzTGliO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnZhciBub2NvbmZsaWN0ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3Rcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgU2VsZWN0b3IgKGV4dHJhKVxuICovXG5cbi8qKlxuICogUmV0dXJuIGNoaWxkcmVuIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLmNoaWxkcmVuKCk7XG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY2hpbGRyZW4oJy5maWx0ZXInKTtcbiAqL1xuXG52YXIgY2hpbGRyZW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgZWFjaChlbGVtZW50LmNoaWxkcmVuLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgaWYgKCFzZWxlY3RvciB8fCBzZWxlY3RvciAmJiBtYXRjaGVzKGNoaWxkLCBzZWxlY3RvcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIFJldHVybiBjaGlsZCBub2RlcyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIGluY2x1ZGluZyB0ZXh0IGFuZCBjb21tZW50IG5vZGVzLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5jb250ZW50cygpO1xuICovXG5cbnZhciBjb250ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbm9kZXMucHVzaC5hcHBseShub2RlcywgdG9BcnJheShlbGVtZW50LmNoaWxkTm9kZXMpKTtcbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgb25seSB0aGUgb25lIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZXEoMSlcbiAqICAgICAvLyBUaGUgc2Vjb25kIGl0ZW07IHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBkb2luZyAkKCQoJy5pdGVtcycpWzFdKTtcbiAqL1xuXG52YXIgZXEgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcywgaW5kZXgsIGluZGV4ICsgMSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGNvbGxlY3Rpb24gY29udGFpbmluZyBvbmx5IHRoZSBmaXJzdCBpdGVtLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5maXJzdCgpXG4gKiAgICAgLy8gVGhlIGZpcnN0IGl0ZW07IHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBkb2luZyAkKCQoJy5pdGVtcycpWzBdKTtcbiAqL1xuXG52YXIgZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzbGljZS5jYWxsKHRoaXMsIDAsIDEpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIERPTSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcmV0dXJuIHtOb2RlfSBFbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXhcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZ2V0KDEpXG4gKiAgICAgLy8gVGhlIHNlY29uZCBlbGVtZW50OyByZXN1bHQgaXMgdGhlIHNhbWUgYXMgZG9pbmcgJCgnLml0ZW1zJylbMV07XG4gKi9cblxudmFyIGdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICByZXR1cm4gdGhpc1tpbmRleF07XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgcGFyZW50IGVsZW1lbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLnBhcmVudCgpO1xuICogICAgICQoJy5zZWxlY3RvcicpLnBhcmVudCgnLmZpbHRlcicpO1xuICovXG5cbnZhciBwYXJlbnQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yICYmIG1hdGNoZXMoZWxlbWVudC5wYXJlbnROb2RlLCBzZWxlY3RvcikpIHtcbiAgICAgIG5vZGVzLnB1c2goZWxlbWVudC5wYXJlbnROb2RlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBzaWJsaW5nIGVsZW1lbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLnNpYmxpbmdzKCk7XG4gKiAgICAgJCgnLnNlbGVjdG9yJykuc2libGluZ3MoJy5maWx0ZXInKTtcbiAqL1xuXG52YXIgc2libGluZ3MgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWFjaChlbGVtZW50LnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICBpZiAoc2libGluZyAhPT0gZWxlbWVudCAmJiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yICYmIG1hdGNoZXMoc2libGluZywgc2VsZWN0b3IpKSkge1xuICAgICAgICBub2Rlcy5wdXNoKHNpYmxpbmcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldywgc2xpY2VkIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0XG4gKiBAcGFyYW0ge051bWJlcn0gZW5kXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuc2xpY2UoMSwgMylcbiAqICAgICAvLyBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgdGhlIHNlY29uZCwgdGhpcmQsIGFuZCBmb3VydGggZWxlbWVudC5cbiAqL1xuXG52YXIgc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkJDIoW10uc2xpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG59O1xuXG52YXIgc2VsZWN0b3JfZXh0cmEgPSBPYmplY3QuZnJlZXplKHtcblx0Y2hpbGRyZW46IGNoaWxkcmVuLFxuXHRjb250ZW50czogY29udGVudHMsXG5cdGVxOiBlcSxcblx0Zmlyc3Q6IGZpcnN0LFxuXHRnZXQ6IGdldCxcblx0cGFyZW50OiBwYXJlbnQsXG5cdHNpYmxpbmdzOiBzaWJsaW5ncyxcblx0c2xpY2U6IHNsaWNlXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIFR5cGVcbiAqL1xuXG4vKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBhcmd1bWVudCBwYXNzZWQgaXMgYSBKYXZhc2NyaXB0IGZ1bmN0aW9uIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29ial0gT2JqZWN0IHRvIHRlc3Qgd2hldGhlciBvciBub3QgaXQgaXMgYSBmdW5jdGlvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNGdW5jdGlvbihmdW5jdGlvbigpe30pO1xuICogICAgIC8vIHRydWVcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0Z1bmN0aW9uKHt9KTtcbiAqICAgICAvLyBmYWxzZVxuICovXG5cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbi8qXG4gKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdIE9iamVjdCB0byB0ZXN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIGFuIGFycmF5LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0FycmF5KFtdKTtcbiAqICAgICAvLyB0cnVlXG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNBcnJheSh7fSk7XG4gKiAgICAgLy8gZmFsc2VcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbnZhciB0eXBlID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG5cdGlzQXJyYXk6IGlzQXJyYXlcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgQVBJXG4gKi9cblxudmFyIGFwaSA9IHt9O1xudmFyICQkJDEgPSB7fTtcblxuLy8gSW1wb3J0IG1vZHVsZXMgdG8gYnVpbGQgdXAgdGhlIEFQSVxuXG5pZiAodHlwZW9mIHNlbGVjdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAkJCQxID0gJCQyO1xuICAkJCQxLm1hdGNoZXMgPSBtYXRjaGVzO1xuICBhcGkuZmluZCA9IGZpbmQ7XG59XG5cbmV4dGVuZCgkJCQxLCBkb21fY29udGFpbnMsIG5vY29uZmxpY3QsIHR5cGUpO1xuZXh0ZW5kKGFwaSwgYXJyYXksIGNzcyQxLCBkb21fYXR0ciwgZG9tLCBkb21fY2xhc3MsIGRvbV9kYXRhLCBkb21fZXh0cmEsIGRvbV9odG1sLCBldmVudCwgZXZlbnRfdHJpZ2dlciwgZXZlbnRfcmVhZHksIHNlbGVjdG9yX2Nsb3Nlc3QsIHNlbGVjdG9yX2V4dHJhKTtcblxuJCQkMS5mbiA9IGFwaTtcblxuLy8gVmVyc2lvblxuXG4kJCQxLnZlcnNpb24gPSAnMC4xNC4wJztcblxuLy8gVXRpbFxuXG4kJCQxLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gUHJvdmlkZSBiYXNlIGNsYXNzIHRvIGV4dGVuZCBmcm9tXG5cbmlmICh0eXBlb2YgQmFzZUNsYXNzICE9PSAndW5kZWZpbmVkJykge1xuICAkJCQxLkJhc2VDbGFzcyA9IEJhc2VDbGFzcygkJCQxLmZuKTtcbn1cblxuLy8gRXhwb3J0IGludGVyZmFjZVxuXG52YXIgJCQxID0gJCQkMTtcblxucmV0dXJuICQkMTtcblxufSkpKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbXRhc3RpYy5qcy5tYXBcbiIsInZhciBwcm9taXNlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3Byb21pc2UubWluJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2RvbXRhc3RpYycpO1xuXG5mdW5jdGlvbiBsYXRlKG4pIHtcbiAgICB2YXIgcCA9IG5ldyBwcm9taXNlLnByb21pc2UuUHJvbWlzZSgpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHAuZG9uZShudWxsLCBuKTtcbiAgICB9LCBuKTtcbiAgICByZXR1cm4gcDtcbn1cblxubGF0ZSgxMDApLnRoZW4oXG4gICAgZnVuY3Rpb24oZXJyLCBuKSB7XG4gICAgICAgIHJldHVybiBsYXRlKG4gKyAyMDApO1xuICAgIH1cbikudGhlbihcbiAgICBmdW5jdGlvbihlcnIsIG4pIHtcbiAgICAgICAgcmV0dXJuIGxhdGUobiArIDMwMCk7XG4gICAgfVxuKS50aGVuKFxuICAgIGZ1bmN0aW9uKGVyciwgbikge1xuICAgICAgICByZXR1cm4gbGF0ZShuICsgNDAwKTtcbiAgICB9XG4pLnRoZW4oXG4gICAgZnVuY3Rpb24oZXJyLCBuKSB7XG4gICAgICAgIGFsZXJ0KG4pO1xuICAgIH1cbik7IiwiLypcbiAqICBDb3B5cmlnaHQgMjAxMi0yMDEzIChjKSBQaWVycmUgRHVxdWVzbmUgPHN0YWNrcEBvbmxpbmUuZnI+XG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cbiAqICBodHRwczovL2dpdGh1Yi5jb20vc3RhY2twL3Byb21pc2Vqc1xuICovXG4oZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe3RoaXMuX2NhbGxiYWNrcz1bXTt9Yi5wcm90b3R5cGUudGhlbj1mdW5jdGlvbihhLGMpe3ZhciBkO2lmKHRoaXMuX2lzZG9uZSlkPWEuYXBwbHkoYyx0aGlzLnJlc3VsdCk7ZWxzZXtkPW5ldyBiKCk7dGhpcy5fY2FsbGJhY2tzLnB1c2goZnVuY3Rpb24oKXt2YXIgYj1hLmFwcGx5KGMsYXJndW1lbnRzKTtpZihiJiZ0eXBlb2YgYi50aGVuPT09J2Z1bmN0aW9uJyliLnRoZW4oZC5kb25lLGQpO30pO31yZXR1cm4gZDt9O2IucHJvdG90eXBlLmRvbmU9ZnVuY3Rpb24oKXt0aGlzLnJlc3VsdD1hcmd1bWVudHM7dGhpcy5faXNkb25lPXRydWU7Zm9yKHZhciBhPTA7YTx0aGlzLl9jYWxsYmFja3MubGVuZ3RoO2ErKyl0aGlzLl9jYWxsYmFja3NbYV0uYXBwbHkobnVsbCxhcmd1bWVudHMpO3RoaXMuX2NhbGxiYWNrcz1bXTt9O2Z1bmN0aW9uIGMoYSl7dmFyIGM9bmV3IGIoKTt2YXIgZD1bXTtpZighYXx8IWEubGVuZ3RoKXtjLmRvbmUoZCk7cmV0dXJuIGM7fXZhciBlPTA7dmFyIGY9YS5sZW5ndGg7ZnVuY3Rpb24gZyhhKXtyZXR1cm4gZnVuY3Rpb24oKXtlKz0xO2RbYV09QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtpZihlPT09ZiljLmRvbmUoZCk7fTt9Zm9yKHZhciBoPTA7aDxmO2grKylhW2hdLnRoZW4oZyhoKSk7cmV0dXJuIGM7fWZ1bmN0aW9uIGQoYSxjKXt2YXIgZT1uZXcgYigpO2lmKGEubGVuZ3RoPT09MCllLmRvbmUuYXBwbHkoZSxjKTtlbHNlIGFbMF0uYXBwbHkobnVsbCxjKS50aGVuKGZ1bmN0aW9uKCl7YS5zcGxpY2UoMCwxKTtkKGEsYXJndW1lbnRzKS50aGVuKGZ1bmN0aW9uKCl7ZS5kb25lLmFwcGx5KGUsYXJndW1lbnRzKTt9KTt9KTtyZXR1cm4gZTt9ZnVuY3Rpb24gZShhKXt2YXIgYj1cIlwiO2lmKHR5cGVvZiBhPT09XCJzdHJpbmdcIiliPWE7ZWxzZXt2YXIgYz1lbmNvZGVVUklDb21wb25lbnQ7dmFyIGQ9W107Zm9yKHZhciBlIGluIGEpaWYoYS5oYXNPd25Qcm9wZXJ0eShlKSlkLnB1c2goYyhlKSsnPScrYyhhW2VdKSk7Yj1kLmpvaW4oJyYnKTt9cmV0dXJuIGI7fWZ1bmN0aW9uIGYoKXt2YXIgYTtpZih3aW5kb3cuWE1MSHR0cFJlcXVlc3QpYT1uZXcgWE1MSHR0cFJlcXVlc3QoKTtlbHNlIGlmKHdpbmRvdy5BY3RpdmVYT2JqZWN0KXRyeXthPW5ldyBBY3RpdmVYT2JqZWN0KFwiTXN4bWwyLlhNTEhUVFBcIik7fWNhdGNoKGIpe2E9bmV3IEFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKTt9cmV0dXJuIGE7fWZ1bmN0aW9uIGcoYSxjLGQsZyl7dmFyIGg9bmV3IGIoKTt2YXIgaixrO2Q9ZHx8e307Zz1nfHx7fTt0cnl7aj1mKCk7fWNhdGNoKGwpe2guZG9uZShpLkVOT1hIUixcIlwiKTtyZXR1cm4gaDt9az1lKGQpO2lmKGE9PT0nR0VUJyYmayl7Yys9Jz8nK2s7az1udWxsO31qLm9wZW4oYSxjKTt2YXIgbT0nYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztmb3IodmFyIG4gaW4gZylpZihnLmhhc093blByb3BlcnR5KG4pKWlmKG4udG9Mb3dlckNhc2UoKT09PSdjb250ZW50LXR5cGUnKW09Z1tuXTtlbHNlIGouc2V0UmVxdWVzdEhlYWRlcihuLGdbbl0pO2ouc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJyxtKTtmdW5jdGlvbiBvKCl7ai5hYm9ydCgpO2guZG9uZShpLkVUSU1FT1VULFwiXCIsaik7fXZhciBwPWkuYWpheFRpbWVvdXQ7aWYocCl2YXIgcT1zZXRUaW1lb3V0KG8scCk7ai5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtpZihwKWNsZWFyVGltZW91dChxKTtpZihqLnJlYWR5U3RhdGU9PT00KXt2YXIgYT0oIWouc3RhdHVzfHwoai5zdGF0dXM8MjAwfHxqLnN0YXR1cz49MzAwKSYmai5zdGF0dXMhPT0zMDQpO2guZG9uZShhLGoucmVzcG9uc2VUZXh0LGopO319O2ouc2VuZChrKTtyZXR1cm4gaDt9ZnVuY3Rpb24gaChhKXtyZXR1cm4gZnVuY3Rpb24oYixjLGQpe3JldHVybiBnKGEsYixjLGQpO307fXZhciBpPXtQcm9taXNlOmIsam9pbjpjLGNoYWluOmQsYWpheDpnLGdldDpoKCdHRVQnKSxwb3N0OmgoJ1BPU1QnKSxwdXQ6aCgnUFVUJyksZGVsOmgoJ0RFTEVURScpLEVOT1hIUjoxLEVUSU1FT1VUOjIsYWpheFRpbWVvdXQ6MH07aWYodHlwZW9mIGRlZmluZT09PSdmdW5jdGlvbicmJmRlZmluZS5hbWQpZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGk7fSk7ZWxzZSBhLnByb21pc2U9aTt9KSh0aGlzKTsiXX0=
