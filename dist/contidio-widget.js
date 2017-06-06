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
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}],3:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    rawHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = 'status' in options ? options.status : 200
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],4:[function(require,module,exports){
function ContidioWidget() {

  this.defaultOptions = {
    container: ".contidio-widget",
    itemClass: "contidio-item",
    translations: {
      detailLink: "more"
    },
    onListClick: null,
    beforeRender: null,
    afterRender: null
  };

  this.mergeOptions = function (obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname];
    }
    return obj3;
  };

  this.options = (typeof contidioOptions !== "undefined") ? this.mergeOptions(this.defaultOptions, contidioOptions) : this.defaultOptions;
  this.items = [];

  this.init = function () {

    var Promise = require('promise-polyfill');

    require('whatwg-fetch');

    if (!window.Promise) {
      window.Promise = Promise;
    }

    var url = this.options.url ? this.options.url : '';

    this.fetchUrl(url);

  };

  this.fetchUrl = function (url) {

    var $;
    this.items = [];

    if (typeof jQuery === 'undefined') {
      $ = require('domtastic');
    } else {
      $ = jQuery;
    }

    var options = this.options;
    var renderer = new Renderer(this, $);
    var that = this;

    fetch(url, {
      headers: {
        'x-contidio-sdk': '1.0-JS'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {

      that.extractItems(json);

      if (typeof options.beforeRender === "function") {
        options.beforeRender(that.items);
      }

      if (json.entity) {

        var $itemList = $("<div class='contidio-item-list contidio-container'></div>");

        for (var i = 0; i < that.items.length; i++) {
          $itemList.append(renderer.renderListView(that.items[i]));
        }

        $(options.container)[0].innerHTML = "";
        $(options.container).html("").append($itemList);

      } else {

        $(options.container).html("").append(renderer.renderDetailView(that.items[0]));

      }

      if (typeof options.afterRender === "function") {
        options.afterRender(that.items);
      }

      if (renderer.resize) {

        renderer.resize();
        that.addEvent(window, "resize", function () {
          renderer.resize();
        });

      }

    });
  };

  this.extractItems = function (json) {

    var that = this;

    if (json.entity) {
      json.entity.forEach(function (entity) {
        that.items.push(that.getItemData(entity, false));
      });
    } else {
      that.items.push(that.getItemData(json, true));
    }

  };

  this.getItemData = function (entity, isDetail) {

    var item = {
      uuid: entity.uuid,
      name: entity.name ? entity.name : entity.uuid,
      description: entity.description || false,
      editorial: entity.editorial || false,
      type: this.getType(entity.type),
      url: "https://www.contidio.com/" + this.getType(entity.type) + "/" + entity.uuid
    };

    if (entity.workingSetBinaryType) {
      item.binaryType = this.getBinaryType(entity.workingSetBinaryType);
    }

    if (entity.resolvedInheritedData && entity.resolvedInheritedData.tags && entity.resolvedInheritedData.tags.tag && entity.resolvedInheritedData.tags.tag.length) {
      item.tags = entity.resolvedInheritedData.tags.tag;
    }

    if (entity.previewBinarySet && entity.previewBinarySet[0].author) {
      item.author = entity.previewBinarySet[0].author;
    }

    var timeStampForDate = entity.lastUpdatedTimestamp || entity.createdTimestamp;

    var date = new Date(timeStampForDate);

    item.date = (date.getDate() < 10 ? "0" : 0) + date.getDate() + "." + (date.getMonth() < 9 ? "0" : 0) + (date.getMonth() + 1) + "." + date.getFullYear();

    var width = isDetail ? 875 : 350;
    var previewBinaryPurpose = 19000;

    if (isDetail) {
      previewBinaryPurpose = item.type == "folder" ? 1200 : 19001;

      if (item.binaryType) {
        switch (item.binaryType) {
          case "image":
            previewBinaryPurpose = 19001;
            break;
          case "audio":
            previewBinaryPurpose = 19006;
            item.audioSrc = this.getBinarySrc(entity, 19005, -1);
            break;
          case "video":
            previewBinaryPurpose = 19004;
            item.videoSrc = this.getBinarySrc(entity, 19005, width);
            break;
          case "document":
            //check if document is richtext story
            if (entity.asset && entity.asset.type && entity.asset.type === 2) {
              item.isStory = true;
              item.coverImage = this.getBinarySrc(entity, 19008, 1920);

              if (item.coverImage.indexOf("placeholder") > -1) {
                item.coverImage = false;
              }

              var htmlSrc = this.getBinarySrc(entity, 10001, -2);
              previewBinaryPurpose = 19010;
              width = 875;

              item.html = fetch(htmlSrc, {
                headers: {
                  'x-contidio-sdk': '1.0-JS'
                }
              }).then(function (response) {
                return response.text();
              }).then(function (text) {
                return text;
              });

            } else {
              item.isStory = false;
              previewBinaryPurpose = 19002;
              item.pdfSrc = this.getBinarySrc(entity, 10001, -2);
              width = 700;

            }
            break;
        }
      }
    } else {
      previewBinaryPurpose = item.type == "folder" ? 1200 : 19000;

      switch (item.type) {
        case "brand":
          previewBinaryPurpose = 100;
          break;
        case "folder":
          previewBinaryPurpose = 1200;
          break;
      }

      if (item.binaryType) {
        switch (item.binaryType) {
          case "video":
            previewBinaryPurpose = 19002;
            break;
          case "document":
            previewBinaryPurpose = (entity.asset && entity.asset.type === 2) ? 19000 : 19002;
            break;
        }
      }
    }

    item.previewImage = this.getBinarySrc(entity, previewBinaryPurpose, width);

    return item;
  };

  this.getType = function (type) {

    /* TODO: switch to constants */

    switch (type) {
      case 0:
        return "brand";
      case 1:
        return "folder";
      case 2:
        return "asset";
      default:
        return "undefined";
    }

  };

  this.getBinaryType = function (binaryType) {

    /* TODO: switch to constants */

    switch (binaryType) {
      case 1:
        return "image";
      case 2:
        return "audio";
      case 3:
        return "video";
      case 4:
        return "document";
      default:
        return "undefined";
    }

  };

  this.getBinarySrc = function (entity, binaryPurpose, width) {
    var indexToUse = -1;

    if (!entity.previewBinarySet || entity.previewBinarySet.length === 0) {
      return this.getPlaceholderSrc(entity);
    }

    var bP = binaryPurpose ? binaryPurpose : 19000;
    var w = width ? width : 560;

    for (var i = 0; i < entity.previewBinarySet[0].calculatedBinary.length; i++) {
      if (entity.previewBinarySet[0].calculatedBinary[i].binaryPurpose === bP &&
        entity.previewBinarySet[0].calculatedBinary[i].outputId >= w
      ) {
        indexToUse = i;
      }
    }

    if (indexToUse > -1) {
      return entity.previewBinarySet[0].calculatedBinary[indexToUse].downloadLink;
    } else {
      return this.getPlaceholderSrc(entity);
    }

  };

  this.getPlaceholderSrc = function (entity) {
    var type = this.getType(entity.type);
    var binaryType = this.getBinaryType(entity.workingSetBinaryType);

    if (type === "folder") {
      return "https://www.contidio.com/assets/placeholders/folder_gray.png";
    }

    if (binaryType === "document") {
      return "https://www.contidio.com/assets/placeholders/document_landscape.png";
    }

    return "https://www.contidio.com/assets/placeholders/" + binaryType + "_gray.png";
  };

  this.addEvent = function (object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
      object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
      object.attachEvent("on" + type, callback);
    } else {
      object["on" + type] = callback;
    }
  };

}

var cw = new ContidioWidget();

cw.init();



},{"domtastic":1,"promise-polyfill":2,"whatwg-fetch":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9tdGFzdGljL2Rpc3QvZG9tdGFzdGljLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuJCA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuLypcbiAqIEBtb2R1bGUgVXRpbFxuICovXG5cbi8qXG4gKiBSZWZlcmVuY2UgdG8gdGhlIHdpbmRvdyBvYmplY3RcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHdpbiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge307XG5cbi8qKlxuICogQ29udmVydCBgTm9kZUxpc3RgIHRvIGBBcnJheWAuXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciB0b0FycmF5ID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICB2YXIgcmVzdWx0ID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICByZXN1bHRbaV0gPSBjb2xsZWN0aW9uW2ldO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEZhc3RlciBhbHRlcm5hdGl2ZSB0byBbXS5mb3JFYWNoIG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7Tm9kZXxOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm4ge05vZGV8Tm9kZUxpc3R8QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBlYWNoID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgaWYgKGxlbmd0aCAhPT0gdW5kZWZpbmVkICYmIGNvbGxlY3Rpb24ubm9kZVR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgY29sbGVjdGlvbltpXSwgaSwgY29sbGVjdGlvbik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgY29sbGVjdGlvbiwgMCwgY29sbGVjdGlvbik7XG4gIH1cbiAgcmV0dXJuIGNvbGxlY3Rpb247XG59O1xuXG4vKipcbiAqIEFzc2lnbiBlbnVtZXJhYmxlIHByb3BlcnRpZXMgZnJvbSBzb3VyY2Ugb2JqZWN0KHMpIHRvIHRhcmdldCBvYmplY3RcbiAqXG4gKiBAbWV0aG9kIGV4dGVuZFxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldCBPYmplY3QgdG8gZXh0ZW5kXG4gKiBAcGFyYW0ge09iamVjdH0gW3NvdXJjZV0gT2JqZWN0IHRvIGV4dGVuZCBmcm9tXG4gKiBAcmV0dXJuIHtPYmplY3R9IEV4dGVuZGVkIG9iamVjdFxuICogQGV4YW1wbGVcbiAqICAgICAkLmV4dGVuZCh7YTogMX0sIHtiOiAyfSk7XG4gKiAgICAgLy8ge2E6IDEsIGI6IDJ9XG4gKiBAZXhhbXBsZVxuICogICAgICQuZXh0ZW5kKHthOiAxfSwge2I6IDJ9LCB7YTogM30pO1xuICogICAgIC8vIHthOiAzLCBiOiAyfVxuICovXG5cbnZhciBleHRlbmQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBzb3VyY2VzID0gQXJyYXkoX2xlbiA+IDEgPyBfbGVuIC0gMSA6IDApLCBfa2V5ID0gMTsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIHNvdXJjZXNbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgc291cmNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcmMpIHtcbiAgICBmb3IgKHZhciBwcm9wIGluIHNyYykge1xuICAgICAgdGFyZ2V0W3Byb3BdID0gc3JjW3Byb3BdO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB0YXJnZXQ7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgY29sbGVjdGlvbiB3aXRob3V0IGR1cGxpY2F0ZXNcbiAqXG4gKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIHRvIHJlbW92ZSBkdXBsaWNhdGVzIGZyb21cbiAqIEByZXR1cm4ge05vZGV8Tm9kZUxpc3R8QXJyYXl9XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciB1bmlxID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uIChpdGVtLCBpbmRleCkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uLmluZGV4T2YoaXRlbSkgPT09IGluZGV4O1xuICB9KTtcbn07XG5cbi8qKlxuICogQG1vZHVsZSBTZWxlY3RvclxuICovXG5cbnZhciBpc1Byb3RvdHlwZVNldCA9IGZhbHNlO1xuXG52YXIgcmVGcmFnbWVudCA9IC9eXFxzKjwoXFx3K3whKVtePl0qPi87XG52YXIgcmVTaW5nbGVUYWcgPSAvXjwoXFx3KylcXHMqXFwvPz4oPzo8XFwvXFwxPnwpJC87XG52YXIgcmVTaW1wbGVTZWxlY3RvciA9IC9eW1xcLiNdP1tcXHctXSokLztcblxuLypcbiAqIFZlcnNhdGlsZSB3cmFwcGVyIGZvciBgcXVlcnlTZWxlY3RvckFsbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gc2VsZWN0b3IgUXVlcnkgc2VsZWN0b3IsIGBOb2RlYCwgYE5vZGVMaXN0YCwgYXJyYXkgb2YgZWxlbWVudHMsIG9yIEhUTUwgZnJhZ21lbnQgc3RyaW5nLlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdH0gY29udGV4dD1kb2N1bWVudCBUaGUgY29udGV4dCBmb3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5IGVsZW1lbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciAkaXRlbXMgPSAkKC5pdGVtcycpO1xuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGVsZW1lbnQgPSAkKGRvbUVsZW1lbnQpO1xuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGxpc3QgPSAkKG5vZGVMaXN0LCBkb2N1bWVudC5ib2R5KTtcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyICRlbGVtZW50ID0gJCgnPHA+ZXZlcmdyZWVuPC9wPicpO1xuICovXG5cbnZhciAkJDIgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIGNvbnRleHQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IGRvY3VtZW50O1xuXG5cbiAgdmFyIGNvbGxlY3Rpb24gPSB2b2lkIDA7XG5cbiAgaWYgKCFzZWxlY3Rvcikge1xuXG4gICAgY29sbGVjdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwobnVsbCk7XG4gIH0gZWxzZSBpZiAoc2VsZWN0b3IgaW5zdGFuY2VvZiBXcmFwcGVyKSB7XG5cbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuXG4gICAgY29sbGVjdGlvbiA9IHNlbGVjdG9yLm5vZGVUeXBlIHx8IHNlbGVjdG9yID09PSB3aW5kb3cgPyBbc2VsZWN0b3JdIDogc2VsZWN0b3I7XG4gIH0gZWxzZSBpZiAocmVGcmFnbWVudC50ZXN0KHNlbGVjdG9yKSkge1xuXG4gICAgY29sbGVjdGlvbiA9IGNyZWF0ZUZyYWdtZW50KHNlbGVjdG9yKTtcbiAgfSBlbHNlIHtcblxuICAgIGNvbnRleHQgPSB0eXBlb2YgY29udGV4dCA9PT0gJ3N0cmluZycgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRleHQpIDogY29udGV4dC5sZW5ndGggPyBjb250ZXh0WzBdIDogY29udGV4dDtcblxuICAgIGNvbGxlY3Rpb24gPSBxdWVyeVNlbGVjdG9yKHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgfVxuXG4gIHJldHVybiB3cmFwKGNvbGxlY3Rpb24pO1xufTtcblxuLypcbiAqIEZpbmQgZGVzY2VuZGFudHMgbWF0Y2hpbmcgdGhlIHByb3ZpZGVkIGBzZWxlY3RvcmAgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBzZWxlY3RvciBRdWVyeSBzZWxlY3RvciwgYE5vZGVgLCBgTm9kZUxpc3RgLCBhcnJheSBvZiBlbGVtZW50cywgb3IgSFRNTCBmcmFnbWVudCBzdHJpbmcuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuZmluZCgnLmRlZXAnKS4kKCcuZGVlcGVzdCcpO1xuICovXG5cbnZhciBmaW5kID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgcmV0dXJuIGVhY2gocXVlcnlTZWxlY3RvcihzZWxlY3Rvciwgbm9kZSksIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgaWYgKG5vZGVzLmluZGV4T2YoY2hpbGQpID09PSAtMSkge1xuICAgICAgICBub2Rlcy5wdXNoKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLypcbiAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBlbGVtZW50IHdvdWxkIGJlIHNlbGVjdGVkIGJ5IHRoZSBzcGVjaWZpZWQgc2VsZWN0b3Igc3RyaW5nOyBvdGhlcndpc2UsIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byB0ZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgU2VsZWN0b3IgdG8gbWF0Y2ggYWdhaW5zdCBlbGVtZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICpcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5tYXRjaGVzKGVsZW1lbnQsICcubWF0Y2gnKTtcbiAqL1xuXG52YXIgbWF0Y2hlcyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNvbnRleHQgPSB0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBFbGVtZW50LnByb3RvdHlwZSA6IHdpbjtcbiAgdmFyIF9tYXRjaGVzID0gY29udGV4dC5tYXRjaGVzIHx8IGNvbnRleHQubWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQubXNNYXRjaGVzU2VsZWN0b3IgfHwgY29udGV4dC5vTWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICByZXR1cm4gZnVuY3Rpb24gKGVsZW1lbnQsIHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIF9tYXRjaGVzLmNhbGwoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9O1xufSgpO1xuXG4vKlxuICogVXNlIHRoZSBmYXN0ZXIgYGdldEVsZW1lbnRCeUlkYCwgYGdldEVsZW1lbnRzQnlDbGFzc05hbWVgIG9yIGBnZXRFbGVtZW50c0J5VGFnTmFtZWAgb3ZlciBgcXVlcnlTZWxlY3RvckFsbGAgaWYgcG9zc2libGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBRdWVyeSBzZWxlY3Rvci5cbiAqIEBwYXJhbSB7Tm9kZX0gY29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHNlbGVjdG9yIHRvIHF1ZXJ5IGVsZW1lbnRzLlxuICogQHJldHVybiB7T2JqZWN0fSBOb2RlTGlzdCwgSFRNTENvbGxlY3Rpb24sIG9yIEFycmF5IG9mIG1hdGNoaW5nIGVsZW1lbnRzIChkZXBlbmRpbmcgb24gbWV0aG9kIHVzZWQpLlxuICovXG5cbnZhciBxdWVyeVNlbGVjdG9yID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG5cbiAgdmFyIGlzU2ltcGxlU2VsZWN0b3IgPSByZVNpbXBsZVNlbGVjdG9yLnRlc3Qoc2VsZWN0b3IpO1xuXG4gIGlmIChpc1NpbXBsZVNlbGVjdG9yKSB7XG4gICAgaWYgKHNlbGVjdG9yWzBdID09PSAnIycpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gKGNvbnRleHQuZ2V0RWxlbWVudEJ5SWQgPyBjb250ZXh0IDogZG9jdW1lbnQpLmdldEVsZW1lbnRCeUlkKHNlbGVjdG9yLnNsaWNlKDEpKTtcbiAgICAgIHJldHVybiBlbGVtZW50ID8gW2VsZW1lbnRdIDogW107XG4gICAgfVxuICAgIGlmIChzZWxlY3RvclswXSA9PT0gJy4nKSB7XG4gICAgICByZXR1cm4gY29udGV4dC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKHNlbGVjdG9yLnNsaWNlKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoc2VsZWN0b3IpO1xuICB9XG5cbiAgcmV0dXJuIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG4vKlxuICogQ3JlYXRlIERPTSBmcmFnbWVudCBmcm9tIGFuIEhUTUwgc3RyaW5nXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sIFN0cmluZyByZXByZXNlbnRpbmcgSFRNTC5cbiAqIEByZXR1cm4ge05vZGVMaXN0fVxuICovXG5cbnZhciBjcmVhdGVGcmFnbWVudCA9IGZ1bmN0aW9uIChodG1sKSB7XG5cbiAgaWYgKHJlU2luZ2xlVGFnLnRlc3QoaHRtbCkpIHtcbiAgICByZXR1cm4gW2RvY3VtZW50LmNyZWF0ZUVsZW1lbnQoUmVnRXhwLiQxKV07XG4gIH1cblxuICB2YXIgZWxlbWVudHMgPSBbXTtcbiAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB2YXIgY2hpbGRyZW4gPSBjb250YWluZXIuY2hpbGROb2RlcztcblxuICBjb250YWluZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGVsZW1lbnRzLnB1c2goY2hpbGRyZW5baV0pO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnRzO1xufTtcblxuLypcbiAqIENhbGxpbmcgYCQoc2VsZWN0b3IpYCByZXR1cm5zIGEgd3JhcHBlZCBjb2xsZWN0aW9uIG9mIGVsZW1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uIEVsZW1lbnQocykgdG8gd3JhcC5cbiAqIEByZXR1cm4gT2JqZWN0KSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKi9cblxudmFyIHdyYXAgPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuXG4gIGlmICghaXNQcm90b3R5cGVTZXQpIHtcbiAgICBXcmFwcGVyLnByb3RvdHlwZSA9ICQkMi5mbjtcbiAgICBXcmFwcGVyLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFdyYXBwZXI7XG4gICAgaXNQcm90b3R5cGVTZXQgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBXcmFwcGVyKGNvbGxlY3Rpb24pO1xufTtcblxuLypcbiAqIENvbnN0cnVjdG9yIGZvciB0aGUgT2JqZWN0LnByb3RvdHlwZSBzdHJhdGVneVxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb24gRWxlbWVudChzKSB0byB3cmFwLlxuICovXG5cbnZhciBXcmFwcGVyID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgdmFyIGkgPSAwO1xuICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gIGZvciAoOyBpIDwgbGVuZ3RoOykge1xuICAgIHRoaXNbaV0gPSBjb2xsZWN0aW9uW2krK107XG4gIH1cbiAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG59O1xuXG52YXIgc2VsZWN0b3IgPSBPYmplY3QuZnJlZXplKHtcblx0JDogJCQyLFxuXHRmaW5kOiBmaW5kLFxuXHRtYXRjaGVzOiBtYXRjaGVzLFxuXHRXcmFwcGVyOiBXcmFwcGVyXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEFycmF5XG4gKi9cblxudmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjYWxsYmFjayByZXR1cm5zIGEgdHJ1ZSgtaXNoKSB2YWx1ZSBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggZWxlbWVudCwgaW52b2tlZCB3aXRoIGBlbGVtZW50YCBhcyBhcmd1bWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdGhpc0FyZ10gVmFsdWUgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciBlYWNoIGVsZW1lbnQgcGFzc2VkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZXZlcnkoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKiAgICAgLy8gdHJ1ZS9mYWxzZVxuICovXG5cbnZhciBldmVyeSA9IEFycmF5UHJvdG8uZXZlcnk7XG5cbi8qKlxuICogRmlsdGVyIHRoZSBjb2xsZWN0aW9uIGJ5IHNlbGVjdG9yIG9yIGZ1bmN0aW9uLCBhbmQgcmV0dXJuIGEgbmV3IGNvbGxlY3Rpb24gd2l0aCB0aGUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBzZWxlY3RvciBTZWxlY3RvciBvciBmdW5jdGlvbiB0byBmaWx0ZXIgdGhlIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge09iamVjdH0gQSBuZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmZpbHRlcignLmFjdGl2ZScpO1xuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKi9cblxudmFyIGZpbHRlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgdGhpc0FyZykge1xuICB2YXIgY2FsbGJhY2sgPSB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicgPyBzZWxlY3RvciA6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIG1hdGNoZXMoZWxlbWVudCwgc2VsZWN0b3IpO1xuICB9O1xuICByZXR1cm4gJCQyKEFycmF5UHJvdG8uZmlsdGVyLmNhbGwodGhpcywgY2FsbGJhY2ssIHRoaXNBcmcpKTtcbn07XG5cbi8qKlxuICogRXhlY3V0ZSBhIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBlbGVtZW50LCBpbnZva2VkIHdpdGggYGVsZW1lbnRgIGFzIGFyZ3VtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IFt0aGlzQXJnXSBWYWx1ZSB0byB1c2UgYXMgYHRoaXNgIHdoZW4gZXhlY3V0aW5nIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIGVsZW1lbnQuc3R5bGUuY29sb3IgPSAnZXZlcmdyZWVuJztcbiAqICAgICApO1xuICovXG5cbnZhciBmb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGNhbGxiYWNrLCB0aGlzQXJnKTtcbn07XG5cbnZhciBlYWNoJDEgPSBmb3JFYWNoO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGluZGV4IG9mIGFuIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSB6ZXJvLWJhc2VkIGluZGV4LCAtMSBpZiBub3QgZm91bmQuXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmluZGV4T2YoZWxlbWVudCk7XG4gKiAgICAgLy8gMlxuICovXG5cbnZhciBpbmRleE9mID0gQXJyYXlQcm90by5pbmRleE9mO1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBjb2xsZWN0aW9uIGJ5IGV4ZWN1dGluZyB0aGUgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge0FycmF5fSBDb2xsZWN0aW9uIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZXhlY3V0ZWQgY2FsbGJhY2sgZm9yIGVhY2ggZWxlbWVudC5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCduYW1lJylcbiAqICAgICB9KTtcbiAqICAgICAvLyBbJ2V2ZXInLCAnZ3JlZW4nXVxuICovXG5cbnZhciBtYXAgPSBBcnJheVByb3RvLm1hcDtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBsYXN0IGVsZW1lbnQgZnJvbSB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhhdCBlbGVtZW50LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGxhc3QgZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgbGFzdEVsZW1lbnQgPSAkKCcuaXRlbXMnKS5wb3AoKTtcbiAqL1xuXG52YXIgcG9wID0gQXJyYXlQcm90by5wb3A7XG5cbi8qKlxuICogQWRkcyBvbmUgb3IgbW9yZSBlbGVtZW50cyB0byB0aGUgZW5kIG9mIHRoZSBjb2xsZWN0aW9uLCBhbmQgcmV0dXJucyB0aGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBFbGVtZW50KHMpIHRvIGFkZCB0byB0aGUgY29sbGVjdGlvblxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5wdXNoKGVsZW1lbnQpO1xuICovXG5cbnZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoO1xuXG4vKipcbiAqIEFwcGx5IGEgZnVuY3Rpb24gYWdhaW5zdCBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIGFuZCB0aGlzIGFjY3VtdWxhdG9yIGZ1bmN0aW9uIGhhcyB0byByZWR1Y2UgaXRcbiAqIHRvIGEgc2luZ2xlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXksIHRha2luZyBmb3VyIGFyZ3VtZW50cyAoc2VlIGV4YW1wbGUpLlxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFZhbHVlIE9iamVjdCB0byB1c2UgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBmaXJzdCBjYWxsIG9mIHRoZSBjYWxsYmFjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmVkdWNlKGZ1bmN0aW9uKHByZXZpb3VzVmFsdWUsIGVsZW1lbnQsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gKiAgICAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlICsgZWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gKiAgICAgfSwgMCk7XG4gKiAgICAgLy8gW3RvdGFsIGhlaWdodCBvZiBlbGVtZW50c11cbiAqL1xuXG52YXIgcmVkdWNlID0gQXJyYXlQcm90by5yZWR1Y2U7XG5cbi8qKlxuICogQXBwbHkgYSBmdW5jdGlvbiBhZ2FpbnN0IGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiAoZnJvbSByaWdodC10by1sZWZ0KSwgYW5kIHRoaXMgYWNjdW11bGF0b3IgZnVuY3Rpb24gaGFzXG4gKiB0byByZWR1Y2UgaXQgdG8gYSBzaW5nbGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheSwgdGFraW5nIGZvdXIgYXJndW1lbnRzIChzZWUgZXhhbXBsZSkuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsVmFsdWUgT2JqZWN0IHRvIHVzZSBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIGZpcnN0IGNhbGwgb2YgdGhlIGNhbGxiYWNrLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZWR1Y2VSaWdodChmdW5jdGlvbihwcmV2aW91c1ZhbHVlLCBlbGVtZW50LCBpbmRleCwgY29sbGVjdGlvbikge1xuICogICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZSArIGVsZW1lbnQudGV4dENvbnRlbnQ7XG4gKiAgICAgfSwgJycpXG4gKiAgICAgLy8gW3JldmVyc2VkIHRleHQgb2YgZWxlbWVudHNdXG4gKi9cblxudmFyIHJlZHVjZVJpZ2h0ID0gQXJyYXlQcm90by5yZWR1Y2VSaWdodDtcblxuLyoqXG4gKiBSZXZlcnNlcyBhbiBhcnJheSBpbiBwbGFjZS4gVGhlIGZpcnN0IGFycmF5IGVsZW1lbnQgYmVjb21lcyB0aGUgbGFzdCBhbmQgdGhlIGxhc3QgYmVjb21lcyB0aGUgZmlyc3QuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uLCByZXZlcnNlZFxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZXZlcnNlKCk7XG4gKi9cblxudmFyIHJldmVyc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAkJDIodG9BcnJheSh0aGlzKS5yZXZlcnNlKCkpO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24sIGFuZCByZXR1cm5zIHRoYXQgZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBmaXJzdEVsZW1lbnQgPSAkKCcuaXRlbXMnKS5zaGlmdCgpO1xuICovXG5cbnZhciBzaGlmdCA9IEFycmF5UHJvdG8uc2hpZnQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjYWxsYmFjayByZXR1cm5zIGEgdHJ1ZSgtaXNoKSB2YWx1ZSBmb3IgYW55IG9mIHRoZSBlbGVtZW50cyBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIGFueSBlbGVtZW50IHBhc3NlZCB0aGUgY2FsbGJhY2sgY2hlY2suXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnNvbWUoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2FjdGl2ZScpXG4gKiAgICAgfSk7XG4gKiAgICAgLy8gdHJ1ZS9mYWxzZVxuICovXG5cbnZhciBzb21lID0gQXJyYXlQcm90by5zb21lO1xuXG4vKipcbiAqIEFkZHMgb25lIG9yIG1vcmUgZWxlbWVudHMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgRWxlbWVudChzKSB0byBhZGQgdG8gdGhlIGNvbGxlY3Rpb25cbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykudW5zaGlmdChlbGVtZW50KTtcbiAqL1xuXG52YXIgdW5zaGlmdCA9IEFycmF5UHJvdG8udW5zaGlmdDtcblxudmFyIGFycmF5ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGV2ZXJ5OiBldmVyeSxcblx0ZmlsdGVyOiBmaWx0ZXIsXG5cdGZvckVhY2g6IGZvckVhY2gsXG5cdGVhY2g6IGVhY2gkMSxcblx0aW5kZXhPZjogaW5kZXhPZixcblx0bWFwOiBtYXAsXG5cdHBvcDogcG9wLFxuXHRwdXNoOiBwdXNoLFxuXHRyZWR1Y2U6IHJlZHVjZSxcblx0cmVkdWNlUmlnaHQ6IHJlZHVjZVJpZ2h0LFxuXHRyZXZlcnNlOiByZXZlcnNlLFxuXHRzaGlmdDogc2hpZnQsXG5cdHNvbWU6IHNvbWUsXG5cdHVuc2hpZnQ6IHVuc2hpZnRcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vKipcbiAqIEBtb2R1bGUgQmFzZUNsYXNzXG4gKi9cblxudmFyIEJhc2VDbGFzcyA9IGZ1bmN0aW9uIChhcGkpIHtcblxuICAvKipcbiAgICogUHJvdmlkZSBzdWJjbGFzcyBmb3IgY2xhc3NlcyBvciBjb21wb25lbnRzIHRvIGV4dGVuZCBmcm9tLlxuICAgKiBUaGUgb3Bwb3NpdGUgYW5kIHN1Y2Nlc3NvciBvZiBwbHVnaW5zIChubyBuZWVkIHRvIGV4dGVuZCBgJC5mbmAgYW55bW9yZSwgY29tcGxldGUgY29udHJvbCkuXG4gICAqXG4gICAqIEByZXR1cm4ge0NsYXNzfSBUaGUgY2xhc3MgdG8gZXh0ZW5kIGZyb20sIGluY2x1ZGluZyBhbGwgYCQuZm5gIG1ldGhvZHMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBpbXBvcnQgeyBCYXNlQ2xhc3MgfSBmcm9tICAnZG9tdGFzdGljJztcbiAgICpcbiAgICogICAgIGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgQmFzZUNsYXNzIHtcbiAgICogICAgICAgICBkb1NvbWV0aGluZygpIHtcbiAgICogICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ2xhc3MoJy5mb28nKTtcbiAgICogICAgICAgICB9XG4gICAqICAgICB9XG4gICAqXG4gICAqICAgICBsZXQgY29tcG9uZW50ID0gbmV3IE15Q29tcG9uZW50KCdib2R5Jyk7XG4gICAqICAgICBjb21wb25lbnQuZG9Tb21ldGhpbmcoKTtcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgIGltcG9ydCAkIGZyb20gICdkb210YXN0aWMnO1xuICAgKlxuICAgKiAgICAgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyAkLkJhc2VDbGFzcyB7XG4gICAqICAgICAgICAgcHJvZ3Jlc3ModmFsdWUpIHtcbiAgICogICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXR0cignZGF0YS1wcm9ncmVzcycsIHZhbHVlKTtcbiAgICogICAgICAgICB9XG4gICAqICAgICB9XG4gICAqXG4gICAqICAgICBsZXQgY29tcG9uZW50ID0gbmV3IE15Q29tcG9uZW50KGRvY3VtZW50LmJvZHkpO1xuICAgKiAgICAgY29tcG9uZW50LnByb2dyZXNzKCdpdmUnKS5hcHBlbmQoJzxwPmVuaGFuY2VtZW50PC9wPicpO1xuICAgKi9cblxuICB2YXIgQmFzZUNsYXNzID0gZnVuY3Rpb24gQmFzZUNsYXNzKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBCYXNlQ2xhc3MpO1xuXG4gICAgV3JhcHBlci5jYWxsKHRoaXMsICQkMi5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIGV4dGVuZChCYXNlQ2xhc3MucHJvdG90eXBlLCBhcGkpO1xuICByZXR1cm4gQmFzZUNsYXNzO1xufTtcblxuLyoqXG4gKiBAbW9kdWxlIENTU1xuICovXG5cbnZhciBpc051bWVyaWMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KHZhbHVlKSkgJiYgaXNGaW5pdGUodmFsdWUpO1xufTtcblxudmFyIGNhbWVsaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8tKFtcXGRhLXpdKS9naSwgZnVuY3Rpb24gKG1hdGNoZXMsIGxldHRlcikge1xuICAgIHJldHVybiBsZXR0ZXIudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59O1xuXG52YXIgZGFzaGVyaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGEgc3R5bGUgcHJvcGVydHkgZm9yIHRoZSBmaXJzdCBlbGVtZW50LCBvciBzZXQgb25lIG9yIG1vcmUgc3R5bGUgcHJvcGVydGllcyBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0ga2V5IFRoZSBuYW1lIG9mIHRoZSBzdHlsZSBwcm9wZXJ0eSB0byBnZXQgb3Igc2V0LiBPciBhbiBvYmplY3QgY29udGFpbmluZyBrZXktdmFsdWUgcGFpcnMgdG8gc2V0IGFzIHN0eWxlIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgdmFsdWUgb2YgdGhlIHN0eWxlIHByb3BlcnR5IHRvIHNldC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmNzcygncGFkZGluZy1sZWZ0Jyk7IC8vIGdldFxuICogICAgICQoJy5pdGVtJykuY3NzKCdjb2xvcicsICcjZjAwJyk7IC8vIHNldFxuICogICAgICQoJy5pdGVtJykuY3NzKHsnYm9yZGVyLXdpZHRoJzogJzFweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSk7IC8vIHNldCBtdWx0aXBsZVxuICovXG5cbnZhciBjc3MgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gIHZhciBzdHlsZVByb3BzID0gdm9pZCAwLFxuICAgICAgcHJvcCA9IHZvaWQgMCxcbiAgICAgIHZhbCA9IHZvaWQgMDtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpIHtcbiAgICBrZXkgPSBjYW1lbGl6ZShrZXkpO1xuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdmFsID0gZWxlbWVudC5zdHlsZVtrZXldO1xuICAgICAgICByZXR1cm4gaXNOdW1lcmljKHZhbCkgPyBwYXJzZUZsb2F0KHZhbCkgOiB2YWw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHN0eWxlUHJvcHMgPSB7fTtcbiAgICBzdHlsZVByb3BzW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBzdHlsZVByb3BzID0ga2V5O1xuICAgIGZvciAocHJvcCBpbiBzdHlsZVByb3BzKSB7XG4gICAgICB2YWwgPSBzdHlsZVByb3BzW3Byb3BdO1xuICAgICAgZGVsZXRlIHN0eWxlUHJvcHNbcHJvcF07XG4gICAgICBzdHlsZVByb3BzW2NhbWVsaXplKHByb3ApXSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgZm9yIChwcm9wIGluIHN0eWxlUHJvcHMpIHtcbiAgICAgIGlmIChzdHlsZVByb3BzW3Byb3BdIHx8IHN0eWxlUHJvcHNbcHJvcF0gPT09IDApIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZVtwcm9wXSA9IHN0eWxlUHJvcHNbcHJvcF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KGRhc2hlcml6ZShwcm9wKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnZhciBjc3MkMSA9IE9iamVjdC5mcmVlemUoe1xuXHRjc3M6IGNzc1xufSk7XG5cbi8qKlxuICogQG1vZHVsZSBET01cbiAqL1xuXG52YXIgZm9yRWFjaCQxID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG5cbi8qKlxuICogQXBwZW5kIGVsZW1lbnQocykgdG8gZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gYXBwZW5kIHRvIHRoZSBlbGVtZW50KHMpLlxuICogQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmFwcGVuZCgnPHA+bW9yZTwvcD4nKTtcbiAqL1xuXG52YXIgYXBwZW5kID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cywgdGhpcy5hcHBlbmRDaGlsZC5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgX2VhY2godGhpcywgYXBwZW5kLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGxhY2UgZWxlbWVudChzKSBhdCB0aGUgYmVnaW5uaW5nIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIHBsYWNlIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGVsZW1lbnQocykuXG4gKiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykucHJlcGVuZCgnPHNwYW4+c3RhcnQ8L3NwYW4+Jyk7XG4gKi9cblxudmFyIHByZXBlbmQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5maXJzdENoaWxkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cy5yZXZlcnNlKCksIHByZXBlbmQuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIHByZXBlbmQsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGFjZSBlbGVtZW50KHMpIGJlZm9yZSBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBwbGFjZSBhcyBzaWJsaW5nKHMpIGJlZm9yZSB0byB0aGUgZWxlbWVudChzKS5cbiAqIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuYmVmb3JlKCc8cD5wcmVmaXg8L3A+Jyk7XG4gKi9cblxudmFyIGJlZm9yZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cywgYmVmb3JlLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBfZWFjaCh0aGlzLCBiZWZvcmUsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGFjZSBlbGVtZW50KHMpIGFmdGVyIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIHBsYWNlIGFzIHNpYmxpbmcocykgYWZ0ZXIgdG8gdGhlIGVsZW1lbnQocykuIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuYWZ0ZXIoJzxzcGFuPnN1Zjwvc3Bhbj48c3Bhbj5maXg8L3NwYW4+Jyk7XG4gKi9cblxudmFyIGFmdGVyID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyZW5kJywgZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMubmV4dFNpYmxpbmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gZWxlbWVudCBpbnN0YW5jZW9mIE5vZGVMaXN0ID8gdG9BcnJheShlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICAgIGZvckVhY2gkMS5jYWxsKGVsZW1lbnRzLnJldmVyc2UoKSwgYWZ0ZXIuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIGFmdGVyLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xvbmUgYSB3cmFwcGVkIG9iamVjdC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFdyYXBwZWQgY29sbGVjdGlvbiBvZiBjbG9uZWQgbm9kZXMuXG4gKiBAZXhhbXBsZVxuICogICAgICQoZWxlbWVudCkuY2xvbmUoKTtcbiAqL1xuXG52YXIgY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAkJDIoX2Nsb25lKHRoaXMpKTtcbn07XG5cbi8qKlxuICogQ2xvbmUgYW4gb2JqZWN0XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gZWxlbWVudCBUaGUgZWxlbWVudChzKSB0byBjbG9uZS5cbiAqIEByZXR1cm4ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBUaGUgY2xvbmVkIGVsZW1lbnQocylcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIF9jbG9uZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfSBlbHNlIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgIHJldHVybiBlbGVtZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgfSBlbHNlIGlmICgnbGVuZ3RoJyBpbiBlbGVtZW50KSB7XG4gICAgcmV0dXJuIFtdLm1hcC5jYWxsKGVsZW1lbnQsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgcmV0dXJuIGVsLmNsb25lTm9kZSh0cnVlKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gZWxlbWVudDtcbn07XG5cbi8qKlxuICogU3BlY2lhbGl6ZWQgaXRlcmF0aW9uLCBhcHBseWluZyBgZm5gIGluIHJldmVyc2VkIG1hbm5lciB0byBhIGNsb25lIG9mIGVhY2ggZWxlbWVudCwgYnV0IHRoZSBwcm92aWRlZCBvbmUuXG4gKlxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgX2VhY2ggPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZm4sIGVsZW1lbnQpIHtcbiAgdmFyIGwgPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgd2hpbGUgKGwtLSkge1xuICAgIHZhciBlbG0gPSBsID09PSAwID8gZWxlbWVudCA6IF9jbG9uZShlbGVtZW50KTtcbiAgICBmbi5jYWxsKGNvbGxlY3Rpb25bbF0sIGVsbSk7XG4gIH1cbn07XG5cbnZhciBkb20gPSBPYmplY3QuZnJlZXplKHtcblx0YXBwZW5kOiBhcHBlbmQsXG5cdHByZXBlbmQ6IHByZXBlbmQsXG5cdGJlZm9yZTogYmVmb3JlLFxuXHRhZnRlcjogYWZ0ZXIsXG5cdGNsb25lOiBjbG9uZSxcblx0X2Nsb25lOiBfY2xvbmUsXG5cdF9lYWNoOiBfZWFjaFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBBdHRyXG4gKi9cblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBmb3IgdGhlIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBvbmUgb3IgbW9yZSBhdHRyaWJ1dGVzIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBrZXkgVGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB0byBnZXQgb3Igc2V0LiBPciBhbiBvYmplY3QgY29udGFpbmluZyBrZXktdmFsdWUgcGFpcnMgdG8gc2V0IGFzIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hdHRyKCdhdHRyTmFtZScpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLmF0dHIoJ2F0dHJOYW1lJywgJ2F0dHJWYWx1ZScpOyAvLyBzZXRcbiAqICAgICAkKCcuaXRlbScpLmF0dHIoe2F0dHIxOiAndmFsdWUxJywgJ2F0dHItMic6ICd2YWx1ZTInfSk7IC8vIHNldCBtdWx0aXBsZVxuICovXG5cbnZhciBhdHRyID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgIHJldHVybiBlbGVtZW50ID8gZWxlbWVudC5nZXRBdHRyaWJ1dGUoa2V5KSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBfYXR0ciBpbiBrZXkpIHtcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoX2F0dHIsIGtleVtfYXR0cl0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYXR0cmlidXRlIGZyb20gZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgQXR0cmlidXRlIG5hbWVcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZW1vdmVBdHRyKCdhdHRyTmFtZScpO1xuICovXG5cbnZhciByZW1vdmVBdHRyID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICB9KTtcbn07XG5cbnZhciBkb21fYXR0ciA9IE9iamVjdC5mcmVlemUoe1xuXHRhdHRyOiBhdHRyLFxuXHRyZW1vdmVBdHRyOiByZW1vdmVBdHRyXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIENsYXNzXG4gKi9cblxuLyoqXG4gKiBBZGQgYSBjbGFzcyB0byB0aGUgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBTcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZShzKSB0byBhZGQgdG8gdGhlIGVsZW1lbnQocykuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hZGRDbGFzcygnYmFyJyk7XG4gKiAgICAgJCgnLml0ZW0nKS5hZGRDbGFzcygnYmFyIGZvbycpO1xuICovXG5cbnZhciBhZGRDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgZWFjaCh2YWx1ZS5zcGxpdCgnICcpLCBfZWFjaCQxLmJpbmQodGhpcywgJ2FkZCcpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGEgY2xhc3MgZnJvbSB0aGUgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBTcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZShzKSB0byByZW1vdmUgZnJvbSB0aGUgZWxlbWVudChzKS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZW1vdmVDbGFzcygnYmFyJyk7XG4gKiAgICAgJCgnLml0ZW1zJykucmVtb3ZlQ2xhc3MoJ2JhciBmb28nKTtcbiAqL1xuXG52YXIgcmVtb3ZlQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgIGVhY2godmFsdWUuc3BsaXQoJyAnKSwgX2VhY2gkMS5iaW5kKHRoaXMsICdyZW1vdmUnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFRvZ2dsZSBhIGNsYXNzIGF0IHRoZSBlbGVtZW50KHMpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFNwYWNlLXNlcGFyYXRlZCBjbGFzcyBuYW1lKHMpIHRvIHRvZ2dsZSBhdCB0aGUgZWxlbWVudChzKS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3N0YXRlXSBBIEJvb2xlYW4gdmFsdWUgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGNsYXNzIHNob3VsZCBiZSBhZGRlZCBvciByZW1vdmVkLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykudG9nZ2xlQ2xhc3MoJ2JhcicpO1xuICogICAgICQoJy5pdGVtJykudG9nZ2xlQ2xhc3MoJ2JhciBmb28nKTtcbiAqICAgICAkKCcuaXRlbScpLnRvZ2dsZUNsYXNzKCdiYXInLCB0cnVlKTtcbiAqL1xuXG52YXIgdG9nZ2xlQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXRlKSB7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHtcbiAgICB2YXIgYWN0aW9uID0gdHlwZW9mIHN0YXRlID09PSAnYm9vbGVhbicgPyBzdGF0ZSA/ICdhZGQnIDogJ3JlbW92ZScgOiAndG9nZ2xlJztcbiAgICBlYWNoKHZhbHVlLnNwbGl0KCcgJyksIF9lYWNoJDEuYmluZCh0aGlzLCBhY3Rpb24pKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGVsZW1lbnQocykgaGF2ZSBhIGNsYXNzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBDaGVjayBpZiB0aGUgRE9NIGVsZW1lbnQgY29udGFpbnMgdGhlIGNsYXNzIG5hbWUuIFdoZW4gYXBwbGllZCB0byBtdWx0aXBsZSBlbGVtZW50cyxcbiAqIHJldHVybnMgYHRydWVgIGlmIF9hbnlfIG9mIHRoZW0gY29udGFpbnMgdGhlIGNsYXNzIG5hbWUuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIHRoZSBlbGVtZW50J3MgY2xhc3MgYXR0cmlidXRlIGNvbnRhaW5zIHRoZSBjbGFzcyBuYW1lLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmhhc0NsYXNzKCdiYXInKTtcbiAqL1xuXG52YXIgaGFzQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICh0aGlzLm5vZGVUeXBlID8gW3RoaXNdIDogdGhpcykuc29tZShmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh2YWx1ZSk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTcGVjaWFsaXplZCBpdGVyYXRpb24sIGFwcGx5aW5nIGBmbmAgb2YgdGhlIGNsYXNzTGlzdCBBUEkgdG8gZWFjaCBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmbk5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIF9lYWNoJDEgPSBmdW5jdGlvbiAoZm5OYW1lLCBjbGFzc05hbWUpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3RbZm5OYW1lXShjbGFzc05hbWUpO1xuICB9KTtcbn07XG5cbnZhciBkb21fY2xhc3MgPSBPYmplY3QuZnJlZXplKHtcblx0YWRkQ2xhc3M6IGFkZENsYXNzLFxuXHRyZW1vdmVDbGFzczogcmVtb3ZlQ2xhc3MsXG5cdHRvZ2dsZUNsYXNzOiB0b2dnbGVDbGFzcyxcblx0aGFzQ2xhc3M6IGhhc0NsYXNzXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIGNvbnRhaW5zXG4gKi9cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYW4gZWxlbWVudCBjb250YWlucyBhbm90aGVyIGVsZW1lbnQgaW4gdGhlIERPTS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNvbnRhaW5lciBUaGUgZWxlbWVudCB0aGF0IG1heSBjb250YWluIHRoZSBvdGhlciBlbGVtZW50LlxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgbWF5IGJlIGEgZGVzY2VuZGFudCBvZiB0aGUgb3RoZXIgZWxlbWVudC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgdGhlIGBjb250YWluZXJgIGVsZW1lbnQgY29udGFpbnMgdGhlIGBlbGVtZW50YC5cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5jb250YWlucyhwYXJlbnRFbGVtZW50LCBjaGlsZEVsZW1lbnQpO1xuICogICAgIC8vIHRydWUvZmFsc2VcbiAqL1xuXG52YXIgY29udGFpbnMgPSBmdW5jdGlvbiAoY29udGFpbmVyLCBlbGVtZW50KSB7XG4gIGlmICghY29udGFpbmVyIHx8ICFlbGVtZW50IHx8IGNvbnRhaW5lciA9PT0gZWxlbWVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBlbHNlIGlmIChjb250YWluZXIuY29udGFpbnMpIHtcbiAgICByZXR1cm4gY29udGFpbmVyLmNvbnRhaW5zKGVsZW1lbnQpO1xuICB9IGVsc2UgaWYgKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbikge1xuICAgIHJldHVybiAhKGNvbnRhaW5lci5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihlbGVtZW50KSAmIE5vZGUuRE9DVU1FTlRfUE9TSVRJT05fRElTQ09OTkVDVEVEKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgZG9tX2NvbnRhaW5zID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGNvbnRhaW5zOiBjb250YWluc1xufSk7XG5cbi8qKlxuICogQG1vZHVsZSBEYXRhXG4gKi9cblxudmFyIGlzU3VwcG9ydHNEYXRhU2V0ID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiAnZGF0YXNldCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xudmFyIERBVEFLRVlQUk9QID0gaXNTdXBwb3J0c0RhdGFTZXQgPyAnZGF0YXNldCcgOiAnX19ET01UQVNUSUNfREFUQV9fJztcblxuLyoqXG4gKiBHZXQgZGF0YSBmcm9tIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBkYXRhIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUga2V5IGZvciB0aGUgZGF0YSB0byBnZXQgb3Igc2V0LlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIGRhdGEgdG8gc2V0LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuZGF0YSgnYXR0ck5hbWUnKTsgLy8gZ2V0XG4gKiAgICAgJCgnLml0ZW0nKS5kYXRhKCdhdHRyTmFtZScsIHthbnk6ICdkYXRhJ30pOyAvLyBzZXRcbiAqL1xuXG52YXIgZGF0YSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCAmJiBEQVRBS0VZUFJPUCBpbiBlbGVtZW50ID8gZWxlbWVudFtEQVRBS0VZUFJPUF1ba2V5XSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKCFpc1N1cHBvcnRzRGF0YVNldCkge1xuICAgICAgZWxlbWVudFtEQVRBS0VZUFJPUF0gPSBlbGVtZW50W0RBVEFLRVlQUk9QXSB8fCB7fTtcbiAgICB9XG4gICAgZWxlbWVudFtEQVRBS0VZUFJPUF1ba2V5XSA9IHZhbHVlO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHByb3BlcnR5IGZyb20gZmlyc3QgZWxlbWVudCwgb3Igc2V0IHByb3BlcnR5IG9uIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQgb3Igc2V0LlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5wcm9wKCdhdHRyTmFtZScpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLnByb3AoJ2F0dHJOYW1lJywgJ2F0dHJWYWx1ZScpOyAvLyBzZXRcbiAqL1xuXG52YXIgcHJvcCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCAmJiBlbGVtZW50ID8gZWxlbWVudFtrZXldIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudFtrZXldID0gdmFsdWU7XG4gIH0pO1xufTtcblxudmFyIGRvbV9kYXRhID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGRhdGE6IGRhdGEsXG5cdHByb3A6IHByb3Bcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgRE9NIChleHRyYSlcbiAqL1xuXG4vKipcbiAqIEFwcGVuZCBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24gdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50KHMpLlxuICpcbiAqIEBwYXJhbSB7Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBhcHBlbmQgdGhlIGVsZW1lbnQocykgdG8uIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hcHBlbmRUbyhjb250YWluZXIpO1xuICovXG5cbnZhciBhcHBlbmRUbyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBjb250ZXh0ID0gdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnID8gJCQyKGVsZW1lbnQpIDogZWxlbWVudDtcbiAgYXBwZW5kLmNhbGwoY29udGV4dCwgdGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLypcbiAqIEVtcHR5IGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5lbXB0eSgpO1xuICovXG5cbnZhciBlbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgY29sbGVjdGlvbiBmcm9tIHRoZSBET00uXG4gKlxuICogQHJldHVybiB7QXJyYXl9IEFycmF5IGNvbnRhaW5pbmcgdGhlIHJlbW92ZWQgZWxlbWVudHNcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5yZW1vdmUoKTtcbiAqL1xuXG52YXIgcmVtb3ZlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIGVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZXBsYWNlIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBuZXcgY29udGVudCwgYW5kIHJldHVybiB0aGUgYXJyYXkgb2YgZWxlbWVudHMgdGhhdCB3ZXJlIHJlcGxhY2VkLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBjb250YWluaW5nIHRoZSByZXBsYWNlZCBlbGVtZW50c1xuICovXG5cbnZhciByZXBsYWNlV2l0aCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGJlZm9yZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnJlbW92ZSgpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGB0ZXh0Q29udGVudGAgZnJvbSB0aGUgZmlyc3QsIG9yIHNldCB0aGUgYHRleHRDb250ZW50YCBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV1cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnRleHQoJ05ldyBjb250ZW50Jyk7XG4gKi9cblxudmFyIHRleHQgPSBmdW5jdGlvbiAodmFsdWUpIHtcblxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzWzBdLnRleHRDb250ZW50O1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC50ZXh0Q29udGVudCA9ICcnICsgdmFsdWU7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGB2YWx1ZWAgZnJvbSB0aGUgZmlyc3QsIG9yIHNldCB0aGUgYHZhbHVlYCBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV1cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCdpbnB1dC5maXJzdE5hbWUnKS52YWwoJ05ldyB2YWx1ZScpO1xuICovXG5cbnZhciB2YWwgPSBmdW5jdGlvbiAodmFsdWUpIHtcblxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzWzBdLnZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC52YWx1ZSA9IHZhbHVlO1xuICB9KTtcbn07XG5cbnZhciBkb21fZXh0cmEgPSBPYmplY3QuZnJlZXplKHtcblx0YXBwZW5kVG86IGFwcGVuZFRvLFxuXHRlbXB0eTogZW1wdHksXG5cdHJlbW92ZTogcmVtb3ZlLFxuXHRyZXBsYWNlV2l0aDogcmVwbGFjZVdpdGgsXG5cdHRleHQ6IHRleHQsXG5cdHZhbDogdmFsXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEhUTUxcbiAqL1xuXG4vKlxuICogR2V0IHRoZSBIVE1MIGNvbnRlbnRzIG9mIHRoZSBmaXJzdCBlbGVtZW50LCBvciBzZXQgdGhlIEhUTUwgY29udGVudHMgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW2ZyYWdtZW50XSBIVE1MIGZyYWdtZW50IHRvIHNldCBmb3IgdGhlIGVsZW1lbnQuIElmIHRoaXMgYXJndW1lbnQgaXMgb21pdHRlZCwgdGhlIEhUTUwgY29udGVudHMgYXJlIHJldHVybmVkLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuaHRtbCgpO1xuICogICAgICQoJy5pdGVtJykuaHRtbCgnPHNwYW4+bW9yZTwvc3Bhbj4nKTtcbiAqL1xuXG52YXIgaHRtbCA9IGZ1bmN0aW9uIChmcmFnbWVudCkge1xuXG4gIGlmICh0eXBlb2YgZnJhZ21lbnQgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBlbGVtZW50LmlubmVySFRNTCA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuaW5uZXJIVE1MID0gZnJhZ21lbnQ7XG4gIH0pO1xufTtcblxudmFyIGRvbV9odG1sID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGh0bWw6IGh0bWxcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgY2xvc2VzdFxuICovXG5cbi8qKlxuICogUmV0dXJuIHRoZSBjbG9zZXN0IGVsZW1lbnQgbWF0Y2hpbmcgdGhlIHNlbGVjdG9yIChzdGFydGluZyBieSBpdHNlbGYpIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIEZpbHRlclxuICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0XSBJZiBwcm92aWRlZCwgbWF0Y2hpbmcgZWxlbWVudHMgbXVzdCBiZSBhIGRlc2NlbmRhbnQgb2YgdGhpcyBlbGVtZW50XG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb24gKGNvbnRhaW5pbmcgemVybyBvciBvbmUgZWxlbWVudClcbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY2xvc2VzdCgnLmNvbnRhaW5lcicpO1xuICovXG5cbnZhciBjbG9zZXN0ID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBjbG9zZXN0ID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgZWFjaCh0aGlzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gY29udGV4dCkge1xuICAgICAgICBpZiAobWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuICQkMih1bmlxKG5vZGVzKSk7XG4gIH07XG5cbiAgcmV0dXJuIHR5cGVvZiBFbGVtZW50ID09PSAndW5kZWZpbmVkJyB8fCAhRWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA/IGNsb3Nlc3QgOiBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWNvbnRleHQpIHtcbiAgICAgIHZhciBub2RlcyA9IFtdO1xuICAgICAgZWFjaCh0aGlzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICB2YXIgbiA9IG5vZGUuY2xvc2VzdChzZWxlY3Rvcik7XG4gICAgICAgIGlmIChuKSB7XG4gICAgICAgICAgbm9kZXMucHVzaChuKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gJCQyKHVuaXEobm9kZXMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNsb3Nlc3QuY2FsbCh0aGlzLCBzZWxlY3RvciwgY29udGV4dCk7XG4gICAgfVxuICB9O1xufSgpO1xuXG52YXIgc2VsZWN0b3JfY2xvc2VzdCA9IE9iamVjdC5mcmVlemUoe1xuXHRjbG9zZXN0OiBjbG9zZXN0XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEV2ZW50c1xuICovXG5cbi8qKlxuICogU2hvcnRoYW5kIGZvciBgYWRkRXZlbnRMaXN0ZW5lcmAuIFN1cHBvcnRzIGV2ZW50IGRlbGVnYXRpb24gaWYgYSBmaWx0ZXIgKGBzZWxlY3RvcmApIGlzIHByb3ZpZGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVzIExpc3Qgb2Ygc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIHRvIGJlIGFkZGVkIHRvIHRoZSBlbGVtZW50KHMpXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCBkZWxlZ2F0ZSB0aGUgZXZlbnQgdG8gdGhpcyBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBFdmVudCBoYW5kbGVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmU9ZmFsc2VcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZT1mYWxzZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykub24oJ2NsaWNrJywgY2FsbGJhY2spO1xuICogICAgICQoJy5jb250YWluZXInKS5vbignY2xpY2sgZm9jdXMnLCAnLml0ZW0nLCBoYW5kbGVyKTtcbiAqL1xuXG52YXIgb24gPSBmdW5jdGlvbiAoZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUsIG9uY2UpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IHNlbGVjdG9yO1xuICAgIHNlbGVjdG9yID0gbnVsbDtcbiAgfVxuXG4gIHZhciBwYXJ0cyA9IHZvaWQgMCxcbiAgICAgIG5hbWVzcGFjZSA9IHZvaWQgMCxcbiAgICAgIGV2ZW50TGlzdGVuZXIgPSB2b2lkIDA7XG5cbiAgZXZlbnROYW1lcy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuXG4gICAgcGFydHMgPSBldmVudE5hbWUuc3BsaXQoJy4nKTtcbiAgICBldmVudE5hbWUgPSBwYXJ0c1swXSB8fCBudWxsO1xuICAgIG5hbWVzcGFjZSA9IHBhcnRzWzFdIHx8IG51bGw7XG5cbiAgICBldmVudExpc3RlbmVyID0gcHJveHlIYW5kbGVyKGhhbmRsZXIpO1xuXG4gICAgZWFjaChfdGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcblxuICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIgPSBkZWxlZ2F0ZUhhbmRsZXIuYmluZChlbGVtZW50LCBzZWxlY3RvciwgZXZlbnRMaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGV2ZW50TGlzdGVuZXI7XG4gICAgICAgIGV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBvZmYuY2FsbChlbGVtZW50LCBldmVudE5hbWVzLCBzZWxlY3RvciwgaGFuZGxlciwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChlbGVtZW50LCBldmVudCk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUgfHwgZmFsc2UpO1xuXG4gICAgICBnZXRIYW5kbGVycyhlbGVtZW50KS5wdXNoKHtcbiAgICAgICAgZXZlbnROYW1lOiBldmVudE5hbWUsXG4gICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgIGV2ZW50TGlzdGVuZXI6IGV2ZW50TGlzdGVuZXIsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2VcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2hvcnRoYW5kIGZvciBgcmVtb3ZlRXZlbnRMaXN0ZW5lcmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZXMgTGlzdCBvZiBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBlbGVtZW50KHMpXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCB1bmRlbGVnYXRlIHRoZSBldmVudCB0byB0aGlzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZT1mYWxzZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykub2ZmKCdjbGljaycsIGNhbGxiYWNrKTtcbiAqICAgICAkKCcjbXktZWxlbWVudCcpLm9mZignbXlFdmVudCBteU90aGVyRXZlbnQnKTtcbiAqICAgICAkKCcuaXRlbScpLm9mZigpO1xuICovXG5cbnZhciBvZmYgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBldmVudE5hbWVzID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMF0gOiAnJztcbiAgdmFyIHNlbGVjdG9yID0gYXJndW1lbnRzWzFdO1xuXG4gIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gIHZhciBoYW5kbGVyID0gYXJndW1lbnRzWzJdO1xuICB2YXIgdXNlQ2FwdHVyZSA9IGFyZ3VtZW50c1szXTtcblxuXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0gc2VsZWN0b3I7XG4gICAgc2VsZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgdmFyIHBhcnRzID0gdm9pZCAwLFxuICAgICAgbmFtZXNwYWNlID0gdm9pZCAwLFxuICAgICAgaGFuZGxlcnMgPSB2b2lkIDA7XG5cbiAgZXZlbnROYW1lcy5zcGxpdCgnICcpLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50TmFtZSkge1xuXG4gICAgcGFydHMgPSBldmVudE5hbWUuc3BsaXQoJy4nKTtcbiAgICBldmVudE5hbWUgPSBwYXJ0c1swXSB8fCBudWxsO1xuICAgIG5hbWVzcGFjZSA9IHBhcnRzWzFdIHx8IG51bGw7XG5cbiAgICByZXR1cm4gZWFjaChfdGhpczIsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgIGhhbmRsZXJzID0gZ2V0SGFuZGxlcnMoZWxlbWVudCk7XG5cbiAgICAgIGVhY2goaGFuZGxlcnMuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiAoIWV2ZW50TmFtZSB8fCBpdGVtLmV2ZW50TmFtZSA9PT0gZXZlbnROYW1lKSAmJiAoIW5hbWVzcGFjZSB8fCBpdGVtLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlKSAmJiAoIWhhbmRsZXIgfHwgaXRlbS5oYW5kbGVyID09PSBoYW5kbGVyKSAmJiAoIXNlbGVjdG9yIHx8IGl0ZW0uc2VsZWN0b3IgPT09IHNlbGVjdG9yKTtcbiAgICAgIH0pLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoaXRlbS5ldmVudE5hbWUsIGl0ZW0uZXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG4gICAgICAgIGhhbmRsZXJzLnNwbGljZShoYW5kbGVycy5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIWV2ZW50TmFtZSAmJiAhbmFtZXNwYWNlICYmICFzZWxlY3RvciAmJiAhaGFuZGxlcikge1xuICAgICAgICBjbGVhckhhbmRsZXJzKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChoYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgY2xlYXJIYW5kbGVycyhlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBldmVudCBsaXN0ZW5lciBhbmQgZXhlY3V0ZSB0aGUgaGFuZGxlciBhdCBtb3N0IG9uY2UgcGVyIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIGV2ZW50TmFtZXNcbiAqIEBwYXJhbSBzZWxlY3RvclxuICogQHBhcmFtIGhhbmRsZXJcbiAqIEBwYXJhbSB1c2VDYXB0dXJlXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5vbmUoJ2NsaWNrJywgY2FsbGJhY2spO1xuICovXG5cbnZhciBvbmUgPSBmdW5jdGlvbiAoZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgcmV0dXJuIG9uLmNhbGwodGhpcywgZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUsIDEpO1xufTtcblxuLyoqXG4gKiBHZXQgZXZlbnQgaGFuZGxlcnMgZnJvbSBhbiBlbGVtZW50XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxudmFyIGV2ZW50S2V5UHJvcCA9ICdfX2RvbXRhc3RpY19ldmVudF9fJztcbnZhciBpZCA9IDE7XG52YXIgaGFuZGxlcnMgPSB7fTtcbnZhciB1bnVzZWRLZXlzID0gW107XG5cbnZhciBnZXRIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudFtldmVudEtleVByb3BdKSB7XG4gICAgZWxlbWVudFtldmVudEtleVByb3BdID0gdW51c2VkS2V5cy5sZW5ndGggPT09IDAgPyArK2lkIDogdW51c2VkS2V5cy5wb3AoKTtcbiAgfVxuICB2YXIga2V5ID0gZWxlbWVudFtldmVudEtleVByb3BdO1xuICByZXR1cm4gaGFuZGxlcnNba2V5XSB8fCAoaGFuZGxlcnNba2V5XSA9IFtdKTtcbn07XG5cbi8qKlxuICogQ2xlYXIgZXZlbnQgaGFuZGxlcnMgZm9yIGFuIGVsZW1lbnRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKi9cblxudmFyIGNsZWFySGFuZGxlcnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIga2V5ID0gZWxlbWVudFtldmVudEtleVByb3BdO1xuICBpZiAoaGFuZGxlcnNba2V5XSkge1xuICAgIGhhbmRsZXJzW2tleV0gPSBudWxsO1xuICAgIGVsZW1lbnRbZXZlbnRLZXlQcm9wXSA9IG51bGw7XG4gICAgdW51c2VkS2V5cy5wdXNoKGtleSk7XG4gIH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY3JlYXRlIGEgaGFuZGxlciB0aGF0IGF1Z21lbnRzIHRoZSBldmVudCBvYmplY3Qgd2l0aCBzb21lIGV4dHJhIG1ldGhvZHMsXG4gKiBhbmQgZXhlY3V0ZXMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIGV2ZW50IGFuZCB0aGUgZXZlbnQgZGF0YSAoaS5lLiBgZXZlbnQuZGV0YWlsYCkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBoYW5kbGVyIENhbGxiYWNrIHRvIGV4ZWN1dGUgYXMgYGhhbmRsZXIoZXZlbnQsIGRhdGEpYFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxudmFyIHByb3h5SGFuZGxlciA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICByZXR1cm4gaGFuZGxlci5jYWxsKHRoaXMsIGF1Z21lbnRFdmVudChldmVudCkpO1xuICB9O1xufTtcblxudmFyIGV2ZW50TWV0aG9kcyA9IHtcbiAgcHJldmVudERlZmF1bHQ6ICdpc0RlZmF1bHRQcmV2ZW50ZWQnLFxuICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246ICdpc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCcsXG4gIHN0b3BQcm9wYWdhdGlvbjogJ2lzUHJvcGFnYXRpb25TdG9wcGVkJ1xufTtcbnZhciByZXR1cm5UcnVlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgcmV0dXJuRmFsc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQXR0ZW1wdCB0byBhdWdtZW50IGV2ZW50cyBhbmQgaW1wbGVtZW50IHNvbWV0aGluZyBjbG9zZXIgdG8gRE9NIExldmVsIDMgRXZlbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbnZhciBhdWdtZW50RXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKCFldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQgfHwgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIHx8IGV2ZW50LnN0b3BQcm9wYWdhdGlvbikge1xuICAgIGZvciAodmFyIG1ldGhvZE5hbWUgaW4gZXZlbnRNZXRob2RzKSB7XG4gICAgICAoZnVuY3Rpb24gKG1ldGhvZE5hbWUsIHRlc3RNZXRob2ROYW1lLCBvcmlnaW5hbE1ldGhvZCkge1xuICAgICAgICBldmVudFttZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0aGlzW3Rlc3RNZXRob2ROYW1lXSA9IHJldHVyblRydWU7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsTWV0aG9kICYmIG9yaWdpbmFsTWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICAgIGV2ZW50W3Rlc3RNZXRob2ROYW1lXSA9IHJldHVybkZhbHNlO1xuICAgICAgfSkobWV0aG9kTmFtZSwgZXZlbnRNZXRob2RzW21ldGhvZE5hbWVdLCBldmVudFttZXRob2ROYW1lXSk7XG4gICAgfVxuICAgIGlmIChldmVudC5fcHJldmVudERlZmF1bHQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBldmVudDtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gdGVzdCB3aGV0aGVyIGRlbGVnYXRlZCBldmVudHMgbWF0Y2ggdGhlIHByb3ZpZGVkIGBzZWxlY3RvcmAgKGZpbHRlciksXG4gKiBpZiB0aGUgZXZlbnQgcHJvcGFnYXRpb24gd2FzIHN0b3BwZWQsIGFuZCB0aGVuIGFjdHVhbGx5IGNhbGwgdGhlIHByb3ZpZGVkIGV2ZW50IGhhbmRsZXIuXG4gKiBVc2UgYHRoaXNgIGluc3RlYWQgb2YgYGV2ZW50LmN1cnJlbnRUYXJnZXRgIG9uIHRoZSBldmVudCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBTZWxlY3RvciB0byBmaWx0ZXIgZGVzY2VuZGFudHMgdGhhdCB1bmRlbGVnYXRlIHRoZSBldmVudCB0byB0aGlzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cblxudmFyIGRlbGVnYXRlSGFuZGxlciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgaGFuZGxlciwgZXZlbnQpIHtcbiAgdmFyIGV2ZW50VGFyZ2V0ID0gZXZlbnQuX3RhcmdldCB8fCBldmVudC50YXJnZXQ7XG4gIHZhciBjdXJyZW50VGFyZ2V0ID0gY2xvc2VzdC5jYWxsKFtldmVudFRhcmdldF0sIHNlbGVjdG9yLCB0aGlzKVswXTtcbiAgaWYgKGN1cnJlbnRUYXJnZXQgJiYgY3VycmVudFRhcmdldCAhPT0gdGhpcykge1xuICAgIGlmIChjdXJyZW50VGFyZ2V0ID09PSBldmVudFRhcmdldCB8fCAhKGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkICYmIGV2ZW50LmlzUHJvcGFnYXRpb25TdG9wcGVkKCkpKSB7XG4gICAgICBoYW5kbGVyLmNhbGwoY3VycmVudFRhcmdldCwgZXZlbnQpO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGJpbmQgPSBvbjtcbnZhciB1bmJpbmQgPSBvZmY7XG5cbnZhciBldmVudCA9IE9iamVjdC5mcmVlemUoe1xuXHRvbjogb24sXG5cdG9mZjogb2ZmLFxuXHRvbmU6IG9uZSxcblx0Z2V0SGFuZGxlcnM6IGdldEhhbmRsZXJzLFxuXHRjbGVhckhhbmRsZXJzOiBjbGVhckhhbmRsZXJzLFxuXHRwcm94eUhhbmRsZXI6IHByb3h5SGFuZGxlcixcblx0ZGVsZWdhdGVIYW5kbGVyOiBkZWxlZ2F0ZUhhbmRsZXIsXG5cdGJpbmQ6IGJpbmQsXG5cdHVuYmluZDogdW5iaW5kXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIHRyaWdnZXJcbiAqL1xuXG52YXIgcmVNb3VzZUV2ZW50ID0gL14oPzptb3VzZXxwb2ludGVyfGNvbnRleHRtZW51KXxjbGljay87XG52YXIgcmVLZXlFdmVudCA9IC9ea2V5LztcblxuLyoqXG4gKiBUcmlnZ2VyIGV2ZW50IGF0IGVsZW1lbnQocylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHRoZSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgRGF0YSB0byBiZSBzZW50IHdpdGggdGhlIGV2ZW50IChgcGFyYW1zLmRldGFpbGAgd2lsbCBiZSBzZXQgdG8gdGhpcykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gRXZlbnQgcGFyYW1ldGVycyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5idWJibGVzPXRydWUgRG9lcyB0aGUgZXZlbnQgYnViYmxlIHVwIHRocm91Z2ggdGhlIERPTSBvciBub3QuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5jYW5jZWxhYmxlPXRydWUgSXMgdGhlIGV2ZW50IGNhbmNlbGFibGUgb3Igbm90LlxuICogQHBhcmFtIHtNaXhlZH0gcGFyYW1zLmRldGFpbD11bmRlZmluZWQgQWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZXZlbnQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS50cmlnZ2VyKCdhbnlFdmVudFR5cGUnKTtcbiAqL1xuXG52YXIgdHJpZ2dlciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fSxcbiAgICAgIF9yZWYkYnViYmxlcyA9IF9yZWYuYnViYmxlcyxcbiAgICAgIGJ1YmJsZXMgPSBfcmVmJGJ1YmJsZXMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfcmVmJGJ1YmJsZXMsXG4gICAgICBfcmVmJGNhbmNlbGFibGUgPSBfcmVmLmNhbmNlbGFibGUsXG4gICAgICBjYW5jZWxhYmxlID0gX3JlZiRjYW5jZWxhYmxlID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3JlZiRjYW5jZWxhYmxlLFxuICAgICAgX3JlZiRwcmV2ZW50RGVmYXVsdCA9IF9yZWYucHJldmVudERlZmF1bHQsXG4gICAgICBwcmV2ZW50RGVmYXVsdCA9IF9yZWYkcHJldmVudERlZmF1bHQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogX3JlZiRwcmV2ZW50RGVmYXVsdDtcblxuICB2YXIgRXZlbnRDb25zdHJ1Y3RvciA9IGdldEV2ZW50Q29uc3RydWN0b3IodHlwZSk7XG4gIHZhciBldmVudCA9IG5ldyBFdmVudENvbnN0cnVjdG9yKHR5cGUsIHtcbiAgICBidWJibGVzOiBidWJibGVzLFxuICAgIGNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG4gICAgcHJldmVudERlZmF1bHQ6IHByZXZlbnREZWZhdWx0LFxuICAgIGRldGFpbDogZGF0YVxuICB9KTtcblxuICBldmVudC5fcHJldmVudERlZmF1bHQgPSBwcmV2ZW50RGVmYXVsdDtcblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICghYnViYmxlcyB8fCBpc0V2ZW50QnViYmxpbmdJbkRldGFjaGVkVHJlZSB8fCBpc0F0dGFjaGVkVG9Eb2N1bWVudChlbGVtZW50KSkge1xuICAgICAgZGlzcGF0Y2hFdmVudChlbGVtZW50LCBldmVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyaWdnZXJGb3JQYXRoKGVsZW1lbnQsIHR5cGUsIHtcbiAgICAgICAgYnViYmxlczogYnViYmxlcyxcbiAgICAgICAgY2FuY2VsYWJsZTogY2FuY2VsYWJsZSxcbiAgICAgICAgcHJldmVudERlZmF1bHQ6IHByZXZlbnREZWZhdWx0LFxuICAgICAgICBkZXRhaWw6IGRhdGFcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgZ2V0RXZlbnRDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIHJldHVybiBzdXBwb3J0c090aGVyRXZlbnRDb25zdHJ1Y3RvcnMgPyByZU1vdXNlRXZlbnQudGVzdCh0eXBlKSA/IE1vdXNlRXZlbnQgOiByZUtleUV2ZW50LnRlc3QodHlwZSkgPyBLZXlib2FyZEV2ZW50IDogQ3VzdG9tRXZlbnQgOiBDdXN0b21FdmVudDtcbn07XG5cbi8qKlxuICogVHJpZ2dlciBldmVudCBhdCBmaXJzdCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLiBTaW1pbGFyIHRvIGB0cmlnZ2VyKClgLCBleGNlcHQ6XG4gKlxuICogLSBFdmVudCBkb2VzIG5vdCBidWJibGVcbiAqIC0gRGVmYXVsdCBldmVudCBiZWhhdmlvciBpcyBwcmV2ZW50ZWRcbiAqIC0gT25seSB0cmlnZ2VycyBoYW5kbGVyIGZvciBmaXJzdCBtYXRjaGluZyBlbGVtZW50XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIERhdGEgdG8gYmUgc2VudCB3aXRoIHRoZSBldmVudFxuICogQGV4YW1wbGVcbiAqICAgICAkKCdmb3JtJykudHJpZ2dlckhhbmRsZXIoJ3N1Ym1pdCcpO1xuICovXG5cbnZhciB0cmlnZ2VySGFuZGxlciA9IGZ1bmN0aW9uICh0eXBlLCBkYXRhKSB7XG4gIGlmICh0aGlzWzBdKSB7XG4gICAgdHJpZ2dlci5jYWxsKHRoaXNbMF0sIHR5cGUsIGRhdGEsIHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgcHJldmVudERlZmF1bHQ6IHRydWVcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGF0dGFjaGVkIHRvIG9yIGRldGFjaGVkIGZyb20pIHRoZSBkb2N1bWVudFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byB0ZXN0XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbnZhciBpc0F0dGFjaGVkVG9Eb2N1bWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50ID09PSB3aW5kb3cgfHwgZWxlbWVudCA9PT0gZG9jdW1lbnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gY29udGFpbnMoZWxlbWVudC5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgZWxlbWVudCk7XG59O1xuXG4vKipcbiAqIERpc3BhdGNoIHRoZSBldmVudCBhdCB0aGUgZWxlbWVudCBhbmQgaXRzIGFuY2VzdG9ycy5cbiAqIFJlcXVpcmVkIHRvIHN1cHBvcnQgZGVsZWdhdGVkIGV2ZW50cyBpbiBicm93c2VycyB0aGF0IGRvbid0IGJ1YmJsZSBldmVudHMgaW4gZGV0YWNoZWQgRE9NIHRyZWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRmlyc3QgZWxlbWVudCB0byBkaXNwYXRjaCB0aGUgZXZlbnQgYXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgb2YgdGhlIGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW3BhcmFtc10gRXZlbnQgcGFyYW1ldGVycyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5idWJibGVzPXRydWUgRG9lcyB0aGUgZXZlbnQgYnViYmxlIHVwIHRocm91Z2ggdGhlIERPTSBvciBub3QuXG4gKiBXaWxsIGJlIHNldCB0byBmYWxzZSAoYnV0IHNob3VsZG4ndCBtYXR0ZXIgc2luY2UgZXZlbnRzIGRvbid0IGJ1YmJsZSBhbnl3YXkpLlxuICogQHBhcmFtIHtCb29sZWFufSBwYXJhbXMuY2FuY2VsYWJsZT10cnVlIElzIHRoZSBldmVudCBjYW5jZWxhYmxlIG9yIG5vdC5cbiAqIEBwYXJhbSB7TWl4ZWR9IHBhcmFtcy5kZXRhaWw9dW5kZWZpbmVkIEFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGV2ZW50LlxuICovXG5cbnZhciB0cmlnZ2VyRm9yUGF0aCA9IGZ1bmN0aW9uIChlbGVtZW50LCB0eXBlKSB7XG4gIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuXG4gIHBhcmFtcy5idWJibGVzID0gZmFsc2U7XG4gIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCBwYXJhbXMpO1xuICBldmVudC5fdGFyZ2V0ID0gZWxlbWVudDtcbiAgZG8ge1xuICAgIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgZXZlbnQpO1xuICB9IHdoaWxlIChlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25kLWFzc2lnblxufTtcblxuLyoqXG4gKiBEaXNwYXRjaCBldmVudCB0byBlbGVtZW50LCBidXQgY2FsbCBkaXJlY3QgZXZlbnQgbWV0aG9kcyBpbnN0ZWFkIGlmIGF2YWlsYWJsZVxuICogKGUuZy4gXCJibHVyKClcIiwgXCJzdWJtaXQoKVwiKSBhbmQgaWYgdGhlIGV2ZW50IGlzIG5vbi1jYW5jZWxhYmxlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnQgRWxlbWVudCB0byBkaXNwYXRjaCB0aGUgZXZlbnQgYXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCB0byBkaXNwYXRjaFxuICovXG5cbnZhciBkaXJlY3RFdmVudE1ldGhvZHMgPSBbJ2JsdXInLCAnZm9jdXMnLCAnc2VsZWN0JywgJ3N1Ym1pdCddO1xuXG52YXIgZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCBldmVudCkge1xuICBpZiAoZGlyZWN0RXZlbnRNZXRob2RzLmluZGV4T2YoZXZlbnQudHlwZSkgIT09IC0xICYmIHR5cGVvZiBlbGVtZW50W2V2ZW50LnR5cGVdID09PSAnZnVuY3Rpb24nICYmICFldmVudC5fcHJldmVudERlZmF1bHQgJiYgIWV2ZW50LmNhbmNlbGFibGUpIHtcbiAgICBlbGVtZW50W2V2ZW50LnR5cGVdKCk7XG4gIH0gZWxzZSB7XG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgfVxufTtcblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgQ3VzdG9tRXZlbnQsIGJvcnJvd2VkIGZyb20gW01ETl0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50L0N1c3RvbUV2ZW50I1BvbHlmaWxsKS5cbiAqIE5lZWRlZCB0byBzdXBwb3J0IElFICg5LCAxMCwgMTEpICYgUGhhbnRvbUpTXG4gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgdmFyIEN1c3RvbUV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBjYW5jZWxhYmxlOiBmYWxzZSxcbiAgICAgIGRldGFpbDogdW5kZWZpbmVkXG4gICAgfTtcblxuICAgIHZhciBjdXN0b21FdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xuICAgIGN1c3RvbUV2ZW50LmluaXRDdXN0b21FdmVudChldmVudCwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlLCBwYXJhbXMuZGV0YWlsKTtcbiAgICByZXR1cm4gY3VzdG9tRXZlbnQ7XG4gIH07XG5cbiAgQ3VzdG9tRXZlbnQucHJvdG90eXBlID0gd2luLkN1c3RvbUV2ZW50ICYmIHdpbi5DdXN0b21FdmVudC5wcm90b3R5cGU7XG4gIHdpbi5DdXN0b21FdmVudCA9IEN1c3RvbUV2ZW50O1xufSkoKTtcblxuLypcbiAqIEFyZSBldmVudHMgYnViYmxpbmcgaW4gZGV0YWNoZWQgRE9NIHRyZWVzP1xuICogQHByaXZhdGVcbiAqL1xuXG52YXIgaXNFdmVudEJ1YmJsaW5nSW5EZXRhY2hlZFRyZWUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpc0J1YmJsaW5nID0gZmFsc2U7XG4gIHZhciBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gIGlmIChkb2MpIHtcbiAgICB2YXIgcGFyZW50ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHZhciBjaGlsZCA9IHBhcmVudC5jbG9uZU5vZGUoKTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgIHBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgaXNCdWJibGluZyA9IHRydWU7XG4gICAgfSk7XG4gICAgY2hpbGQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ2UnLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICB9XG4gIHJldHVybiBpc0J1YmJsaW5nO1xufSgpO1xuXG52YXIgc3VwcG9ydHNPdGhlckV2ZW50Q29uc3RydWN0b3JzID0gZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIG5ldyBNb3VzZUV2ZW50KCdjbGljaycpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufSgpO1xuXG52YXIgZXZlbnRfdHJpZ2dlciA9IE9iamVjdC5mcmVlemUoe1xuXHR0cmlnZ2VyOiB0cmlnZ2VyLFxuXHR0cmlnZ2VySGFuZGxlcjogdHJpZ2dlckhhbmRsZXJcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgUmVhZHlcbiAqL1xuXG4vKipcbiAqIEV4ZWN1dGUgY2FsbGJhY2sgd2hlbiBgRE9NQ29udGVudExvYWRlZGAgZmlyZXMgZm9yIGBkb2N1bWVudGAsIG9yIGltbWVkaWF0ZWx5IGlmIGNhbGxlZCBhZnRlcndhcmRzLlxuICpcbiAqIEBwYXJhbSBoYW5kbGVyIENhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBpbml0aWFsIERPTSBjb250ZW50IGlzIGxvYWRlZC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKGRvY3VtZW50KS5yZWFkeShjYWxsYmFjayk7XG4gKi9cblxudmFyIHJlYWR5ID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgaWYgKC9jb21wbGV0ZXxsb2FkZWR8aW50ZXJhY3RpdmUvLnRlc3QoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICAgIGhhbmRsZXIoKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaGFuZGxlciwgZmFsc2UpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxudmFyIGV2ZW50X3JlYWR5ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdHJlYWR5OiByZWFkeVxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBub0NvbmZsaWN0XG4gKi9cblxuLypcbiAqIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBnbG9iYWwgYCRgIHZhcmlhYmxlLCBzbyB0aGF0IGl0IGNhbiBiZSByZXN0b3JlZCBsYXRlciBvbi5cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHByZXZpb3VzTGliID0gd2luLiQ7XG5cbi8qKlxuICogSW4gY2FzZSBhbm90aGVyIGxpYnJhcnkgc2V0cyB0aGUgZ2xvYmFsIGAkYCB2YXJpYWJsZSBiZWZvcmUgRE9NdGFzdGljIGRvZXMsXG4gKiB0aGlzIG1ldGhvZCBjYW4gYmUgdXNlZCB0byByZXR1cm4gdGhlIGdsb2JhbCBgJGAgdG8gdGhhdCBvdGhlciBsaWJyYXJ5LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gUmVmZXJlbmNlIHRvIERPTXRhc3RpYy5cbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIGRvbXRhc3RpYyA9ICQubm9Db25mbGljdCgpO1xuICovXG5cbnZhciBub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICB3aW4uJCA9IHByZXZpb3VzTGliO1xuICByZXR1cm4gdGhpcztcbn07XG5cbnZhciBub2NvbmZsaWN0ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3Rcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgU2VsZWN0b3IgKGV4dHJhKVxuICovXG5cbi8qKlxuICogUmV0dXJuIGNoaWxkcmVuIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLmNoaWxkcmVuKCk7XG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY2hpbGRyZW4oJy5maWx0ZXInKTtcbiAqL1xuXG52YXIgY2hpbGRyZW4gPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5jaGlsZHJlbikge1xuICAgICAgZWFjaChlbGVtZW50LmNoaWxkcmVuLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgICAgaWYgKCFzZWxlY3RvciB8fCBzZWxlY3RvciAmJiBtYXRjaGVzKGNoaWxkLCBzZWxlY3RvcikpIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIFJldHVybiBjaGlsZCBub2RlcyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIGluY2x1ZGluZyB0ZXh0IGFuZCBjb21tZW50IG5vZGVzLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5jb250ZW50cygpO1xuICovXG5cbnZhciBjb250ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbm9kZXMucHVzaC5hcHBseShub2RlcywgdG9BcnJheShlbGVtZW50LmNoaWxkTm9kZXMpKTtcbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgb25seSB0aGUgb25lIGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZXEoMSlcbiAqICAgICAvLyBUaGUgc2Vjb25kIGl0ZW07IHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBkb2luZyAkKCQoJy5pdGVtcycpWzFdKTtcbiAqL1xuXG52YXIgZXEgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcywgaW5kZXgsIGluZGV4ICsgMSk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGNvbGxlY3Rpb24gY29udGFpbmluZyBvbmx5IHRoZSBmaXJzdCBpdGVtLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5maXJzdCgpXG4gKiAgICAgLy8gVGhlIGZpcnN0IGl0ZW07IHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBkb2luZyAkKCQoJy5pdGVtcycpWzBdKTtcbiAqL1xuXG52YXIgZmlyc3QgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBzbGljZS5jYWxsKHRoaXMsIDAsIDEpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIERPTSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXguXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcmV0dXJuIHtOb2RlfSBFbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgaW5kZXhcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZ2V0KDEpXG4gKiAgICAgLy8gVGhlIHNlY29uZCBlbGVtZW50OyByZXN1bHQgaXMgdGhlIHNhbWUgYXMgZG9pbmcgJCgnLml0ZW1zJylbMV07XG4gKi9cblxudmFyIGdldCA9IGZ1bmN0aW9uIChpbmRleCkge1xuICByZXR1cm4gdGhpc1tpbmRleF07XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgcGFyZW50IGVsZW1lbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLnBhcmVudCgpO1xuICogICAgICQoJy5zZWxlY3RvcicpLnBhcmVudCgnLmZpbHRlcicpO1xuICovXG5cbnZhciBwYXJlbnQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yICYmIG1hdGNoZXMoZWxlbWVudC5wYXJlbnROb2RlLCBzZWxlY3RvcikpIHtcbiAgICAgIG5vZGVzLnB1c2goZWxlbWVudC5wYXJlbnROb2RlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBzaWJsaW5nIGVsZW1lbnRzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgb3B0aW9uYWxseSBmaWx0ZXJlZCBieSBhIHNlbGVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIEZpbHRlclxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLnNpYmxpbmdzKCk7XG4gKiAgICAgJCgnLnNlbGVjdG9yJykuc2libGluZ3MoJy5maWx0ZXInKTtcbiAqL1xuXG52YXIgc2libGluZ3MgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWFjaChlbGVtZW50LnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uIChzaWJsaW5nKSB7XG4gICAgICBpZiAoc2libGluZyAhPT0gZWxlbWVudCAmJiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yICYmIG1hdGNoZXMoc2libGluZywgc2VsZWN0b3IpKSkge1xuICAgICAgICBub2Rlcy5wdXNoKHNpYmxpbmcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldywgc2xpY2VkIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0XG4gKiBAcGFyYW0ge051bWJlcn0gZW5kXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuc2xpY2UoMSwgMylcbiAqICAgICAvLyBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgdGhlIHNlY29uZCwgdGhpcmQsIGFuZCBmb3VydGggZWxlbWVudC5cbiAqL1xuXG52YXIgc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkJDIoW10uc2xpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG59O1xuXG52YXIgc2VsZWN0b3JfZXh0cmEgPSBPYmplY3QuZnJlZXplKHtcblx0Y2hpbGRyZW46IGNoaWxkcmVuLFxuXHRjb250ZW50czogY29udGVudHMsXG5cdGVxOiBlcSxcblx0Zmlyc3Q6IGZpcnN0LFxuXHRnZXQ6IGdldCxcblx0cGFyZW50OiBwYXJlbnQsXG5cdHNpYmxpbmdzOiBzaWJsaW5ncyxcblx0c2xpY2U6IHNsaWNlXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIFR5cGVcbiAqL1xuXG4vKlxuICogRGV0ZXJtaW5lIGlmIHRoZSBhcmd1bWVudCBwYXNzZWQgaXMgYSBKYXZhc2NyaXB0IGZ1bmN0aW9uIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29ial0gT2JqZWN0IHRvIHRlc3Qgd2hldGhlciBvciBub3QgaXQgaXMgYSBmdW5jdGlvbi5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNGdW5jdGlvbihmdW5jdGlvbigpe30pO1xuICogICAgIC8vIHRydWVcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0Z1bmN0aW9uKHt9KTtcbiAqICAgICAvLyBmYWxzZVxuICovXG5cbnZhciBpc0Z1bmN0aW9uID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbn07XG5cbi8qXG4gKiBEZXRlcm1pbmUgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYW4gYXJyYXkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdIE9iamVjdCB0byB0ZXN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIGFuIGFycmF5LlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0FycmF5KFtdKTtcbiAqICAgICAvLyB0cnVlXG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNBcnJheSh7fSk7XG4gKiAgICAgLy8gZmFsc2VcbiAqL1xuXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbnZhciB0eXBlID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG5cdGlzQXJyYXk6IGlzQXJyYXlcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgQVBJXG4gKi9cblxudmFyIGFwaSA9IHt9O1xudmFyICQkJDEgPSB7fTtcblxuLy8gSW1wb3J0IG1vZHVsZXMgdG8gYnVpbGQgdXAgdGhlIEFQSVxuXG5pZiAodHlwZW9mIHNlbGVjdG9yICE9PSAndW5kZWZpbmVkJykge1xuICAkJCQxID0gJCQyO1xuICAkJCQxLm1hdGNoZXMgPSBtYXRjaGVzO1xuICBhcGkuZmluZCA9IGZpbmQ7XG59XG5cbmV4dGVuZCgkJCQxLCBkb21fY29udGFpbnMsIG5vY29uZmxpY3QsIHR5cGUpO1xuZXh0ZW5kKGFwaSwgYXJyYXksIGNzcyQxLCBkb21fYXR0ciwgZG9tLCBkb21fY2xhc3MsIGRvbV9kYXRhLCBkb21fZXh0cmEsIGRvbV9odG1sLCBldmVudCwgZXZlbnRfdHJpZ2dlciwgZXZlbnRfcmVhZHksIHNlbGVjdG9yX2Nsb3Nlc3QsIHNlbGVjdG9yX2V4dHJhKTtcblxuJCQkMS5mbiA9IGFwaTtcblxuLy8gVmVyc2lvblxuXG4kJCQxLnZlcnNpb24gPSAnMC4xNC4wJztcblxuLy8gVXRpbFxuXG4kJCQxLmV4dGVuZCA9IGV4dGVuZDtcblxuLy8gUHJvdmlkZSBiYXNlIGNsYXNzIHRvIGV4dGVuZCBmcm9tXG5cbmlmICh0eXBlb2YgQmFzZUNsYXNzICE9PSAndW5kZWZpbmVkJykge1xuICAkJCQxLkJhc2VDbGFzcyA9IEJhc2VDbGFzcygkJCQxLmZuKTtcbn1cblxuLy8gRXhwb3J0IGludGVyZmFjZVxuXG52YXIgJCQxID0gJCQkMTtcblxucmV0dXJuICQkMTtcblxufSkpKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRvbXRhc3RpYy5qcy5tYXBcbiIsIihmdW5jdGlvbiAocm9vdCkge1xuXG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4gIC8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxuICB2YXIgc2V0VGltZW91dEZ1bmMgPSBzZXRUaW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICBcbiAgLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gIGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gICAgdGhpcy5fc3RhdGUgPSAwO1xuICAgIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICAgIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICAgIHNlbGYgPSBzZWxmLl92YWx1ZTtcbiAgICB9XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgICBzZWxmLl9kZWZlcnJlZHMucHVzaChkZWZlcnJlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuX2hhbmRsZWQgPSB0cnVlO1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHJldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFByb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICBpZiAobmV3VmFsdWUgJiYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG5ld1ZhbHVlID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICBzZWxmLl9zdGF0ZSA9IDM7XG4gICAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuX3N0YXRlID0gMTtcbiAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICBmaW5hbGUoc2VsZik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KHNlbGYsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHNlbGYuX3N0YXRlID0gMjtcbiAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGZpbmFsZShzZWxmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXNlbGYuX2hhbmRsZWQpIHtcbiAgICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGhhbmRsZShzZWxmLCBzZWxmLl9kZWZlcnJlZHNbaV0pO1xuICAgIH1cbiAgICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gICAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gICAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICAgKlxuICAgKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gICAqL1xuICBmdW5jdGlvbiBkb1Jlc29sdmUoZm4sIHNlbGYpIHtcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBmbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgICB9XG4gIH1cblxuICBQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgdmFyIHByb20gPSBuZXcgKHRoaXMuY29uc3RydWN0b3IpKG5vb3ApO1xuXG4gICAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gICAgcmV0dXJuIHByb207XG4gIH07XG5cbiAgUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW47XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICByZWplY3QoZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IFByb21pc2UpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlamVjdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmFsdWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhbHVlc1tpXS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH0pIHx8XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG4gICAgfTtcblxuICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0IHRoZSBpbW1lZGlhdGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBjYWxsYmFja3NcbiAgICogQHBhcmFtIGZuIHtmdW5jdGlvbn0gRnVuY3Rpb24gdG8gZXhlY3V0ZVxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0SW1tZWRpYXRlRm4gPSBmdW5jdGlvbiBfc2V0SW1tZWRpYXRlRm4oZm4pIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuKGZuKSB7XG4gICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmbjtcbiAgfTtcbiAgXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiAgfSBlbHNlIGlmICghcm9vdC5Qcm9taXNlKSB7XG4gICAgcm9vdC5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfVxuXG59KSh0aGlzKTtcbiIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgc2VhcmNoUGFyYW1zOiAnVVJMU2VhcmNoUGFyYW1zJyBpbiBzZWxmLFxuICAgIGl0ZXJhYmxlOiAnU3ltYm9sJyBpbiBzZWxmICYmICdpdGVyYXRvcicgaW4gU3ltYm9sLFxuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdmlld0NsYXNzZXMgPSBbXG4gICAgICAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQ2NEFycmF5XSdcbiAgICBdXG5cbiAgICB2YXIgaXNEYXRhVmlldyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiBEYXRhVmlldy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihvYmopXG4gICAgfVxuXG4gICAgdmFyIGlzQXJyYXlCdWZmZXJWaWV3ID0gQXJyYXlCdWZmZXIuaXNWaWV3IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgLy8gQnVpbGQgYSBkZXN0cnVjdGl2ZSBpdGVyYXRvciBmb3IgdGhlIHZhbHVlIGxpc3RcbiAgZnVuY3Rpb24gaXRlcmF0b3JGb3IoaXRlbXMpIHtcbiAgICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gaXRlbXMuc2hpZnQoKVxuICAgICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgICAgaXRlcmF0b3JbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlcmF0b3JcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaGVhZGVycykpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMubWFwW25hbWVdXG4gICAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlKycsJyt2YWx1ZSA6IHZhbHVlXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICAgIGlmICh0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHRoaXMubWFwW25hbWVdLCBuYW1lLCB0aGlzKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKG5hbWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUudmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHsgaXRlbXMucHVzaCh2YWx1ZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgSGVhZGVycy5wcm90b3R5cGVbU3ltYm9sLml0ZXJhdG9yXSA9IEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlckFzVGV4dChidWYpIHtcbiAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZpZXcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXJzW2ldID0gU3RyaW5nLmZyb21DaGFyQ29kZSh2aWV3W2ldKVxuICAgIH1cbiAgICByZXR1cm4gY2hhcnMuam9pbignJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICAgIGlmIChidWYuc2xpY2UpIHtcbiAgICAgIHJldHVybiBidWYuc2xpY2UoMClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYuYnl0ZUxlbmd0aClcbiAgICAgIHZpZXcuc2V0KG5ldyBVaW50OEFycmF5KGJ1ZikpXG4gICAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5LnRvU3RyaW5nKClcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5LmJ1ZmZlcilcbiAgICAgICAgLy8gSUUgMTAtMTEgY2FuJ3QgaGFuZGxlIGEgRGF0YVZpZXcgYm9keS5cbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiAoQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkgfHwgaXNBcnJheUJ1ZmZlclZpZXcoYm9keSkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3VtZWQodGhpcykgfHwgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWRBcnJheUJ1ZmZlckFzVGV4dCh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcblxuICAgIGlmIChpbnB1dCBpbnN0YW5jZW9mIFJlcXVlc3QpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBTdHJpbmcoaW5wdXQpXG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMsIHsgYm9keTogdGhpcy5fYm9keUluaXQgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgICB2YXIgaGVhZGVycyA9IG5ldyBIZWFkZXJzKClcbiAgICByYXdIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9ICdzdGF0dXMnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1cyA6IDIwMFxuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCJmdW5jdGlvbiBDb250aWRpb1dpZGdldCgpIHtcblxuICB0aGlzLmRlZmF1bHRPcHRpb25zID0ge1xuICAgIGNvbnRhaW5lcjogXCIuY29udGlkaW8td2lkZ2V0XCIsXG4gICAgaXRlbUNsYXNzOiBcImNvbnRpZGlvLWl0ZW1cIixcbiAgICB0cmFuc2xhdGlvbnM6IHtcbiAgICAgIGRldGFpbExpbms6IFwibW9yZVwiXG4gICAgfSxcbiAgICBvbkxpc3RDbGljazogbnVsbCxcbiAgICBiZWZvcmVSZW5kZXI6IG51bGwsXG4gICAgYWZ0ZXJSZW5kZXI6IG51bGxcbiAgfTtcblxuICB0aGlzLm1lcmdlT3B0aW9ucyA9IGZ1bmN0aW9uIChvYmoxLCBvYmoyKSB7XG4gICAgdmFyIG9iajMgPSB7fTtcbiAgICBmb3IgKHZhciBhdHRybmFtZSBpbiBvYmoxKSB7XG4gICAgICBvYmozW2F0dHJuYW1lXSA9IG9iajFbYXR0cm5hbWVdO1xuICAgIH1cbiAgICBmb3IgKHZhciBhdHRybmFtZSBpbiBvYmoyKSB7XG4gICAgICBvYmozW2F0dHJuYW1lXSA9IG9iajJbYXR0cm5hbWVdO1xuICAgIH1cbiAgICByZXR1cm4gb2JqMztcbiAgfTtcblxuICB0aGlzLm9wdGlvbnMgPSAodHlwZW9mIGNvbnRpZGlvT3B0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikgPyB0aGlzLm1lcmdlT3B0aW9ucyh0aGlzLmRlZmF1bHRPcHRpb25zLCBjb250aWRpb09wdGlvbnMpIDogdGhpcy5kZWZhdWx0T3B0aW9ucztcbiAgdGhpcy5pdGVtcyA9IFtdO1xuXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZS1wb2x5ZmlsbCcpO1xuXG4gICAgcmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5cbiAgICBpZiAoIXdpbmRvdy5Qcm9taXNlKSB7XG4gICAgICB3aW5kb3cuUHJvbWlzZSA9IFByb21pc2U7XG4gICAgfVxuXG4gICAgdmFyIHVybCA9IHRoaXMub3B0aW9ucy51cmwgPyB0aGlzLm9wdGlvbnMudXJsIDogJyc7XG5cbiAgICB0aGlzLmZldGNoVXJsKHVybCk7XG5cbiAgfTtcblxuICB0aGlzLmZldGNoVXJsID0gZnVuY3Rpb24gKHVybCkge1xuXG4gICAgdmFyICQ7XG4gICAgdGhpcy5pdGVtcyA9IFtdO1xuXG4gICAgaWYgKHR5cGVvZiBqUXVlcnkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkID0gcmVxdWlyZSgnZG9tdGFzdGljJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQgPSBqUXVlcnk7XG4gICAgfVxuXG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdmFyIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKHRoaXMsICQpO1xuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGZldGNoKHVybCwge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICAneC1jb250aWRpby1zZGsnOiAnMS4wLUpTJ1xuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcblxuICAgICAgdGhhdC5leHRyYWN0SXRlbXMoanNvbik7XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5iZWZvcmVSZW5kZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBvcHRpb25zLmJlZm9yZVJlbmRlcih0aGF0Lml0ZW1zKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGpzb24uZW50aXR5KSB7XG5cbiAgICAgICAgdmFyICRpdGVtTGlzdCA9ICQoXCI8ZGl2IGNsYXNzPSdjb250aWRpby1pdGVtLWxpc3QgY29udGlkaW8tY29udGFpbmVyJz48L2Rpdj5cIik7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGF0Lml0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgJGl0ZW1MaXN0LmFwcGVuZChyZW5kZXJlci5yZW5kZXJMaXN0Vmlldyh0aGF0Lml0ZW1zW2ldKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKVswXS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKS5odG1sKFwiXCIpLmFwcGVuZCgkaXRlbUxpc3QpO1xuXG4gICAgICB9IGVsc2Uge1xuXG4gICAgICAgICQob3B0aW9ucy5jb250YWluZXIpLmh0bWwoXCJcIikuYXBwZW5kKHJlbmRlcmVyLnJlbmRlckRldGFpbFZpZXcodGhhdC5pdGVtc1swXSkpO1xuXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5hZnRlclJlbmRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG9wdGlvbnMuYWZ0ZXJSZW5kZXIodGhhdC5pdGVtcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZW5kZXJlci5yZXNpemUpIHtcblxuICAgICAgICByZW5kZXJlci5yZXNpemUoKTtcbiAgICAgICAgdGhhdC5hZGRFdmVudCh3aW5kb3csIFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZW5kZXJlci5yZXNpemUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cblxuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZXh0cmFjdEl0ZW1zID0gZnVuY3Rpb24gKGpzb24pIHtcblxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGlmIChqc29uLmVudGl0eSkge1xuICAgICAganNvbi5lbnRpdHkuZm9yRWFjaChmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgICAgIHRoYXQuaXRlbXMucHVzaCh0aGF0LmdldEl0ZW1EYXRhKGVudGl0eSwgZmFsc2UpKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0Lml0ZW1zLnB1c2godGhhdC5nZXRJdGVtRGF0YShqc29uLCB0cnVlKSk7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5nZXRJdGVtRGF0YSA9IGZ1bmN0aW9uIChlbnRpdHksIGlzRGV0YWlsKSB7XG5cbiAgICB2YXIgaXRlbSA9IHtcbiAgICAgIHV1aWQ6IGVudGl0eS51dWlkLFxuICAgICAgbmFtZTogZW50aXR5Lm5hbWUgPyBlbnRpdHkubmFtZSA6IGVudGl0eS51dWlkLFxuICAgICAgZGVzY3JpcHRpb246IGVudGl0eS5kZXNjcmlwdGlvbiB8fCBmYWxzZSxcbiAgICAgIGVkaXRvcmlhbDogZW50aXR5LmVkaXRvcmlhbCB8fCBmYWxzZSxcbiAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZShlbnRpdHkudHlwZSksXG4gICAgICB1cmw6IFwiaHR0cHM6Ly93d3cuY29udGlkaW8uY29tL1wiICsgdGhpcy5nZXRUeXBlKGVudGl0eS50eXBlKSArIFwiL1wiICsgZW50aXR5LnV1aWRcbiAgICB9O1xuXG4gICAgaWYgKGVudGl0eS53b3JraW5nU2V0QmluYXJ5VHlwZSkge1xuICAgICAgaXRlbS5iaW5hcnlUeXBlID0gdGhpcy5nZXRCaW5hcnlUeXBlKGVudGl0eS53b3JraW5nU2V0QmluYXJ5VHlwZSk7XG4gICAgfVxuXG4gICAgaWYgKGVudGl0eS5yZXNvbHZlZEluaGVyaXRlZERhdGEgJiYgZW50aXR5LnJlc29sdmVkSW5oZXJpdGVkRGF0YS50YWdzICYmIGVudGl0eS5yZXNvbHZlZEluaGVyaXRlZERhdGEudGFncy50YWcgJiYgZW50aXR5LnJlc29sdmVkSW5oZXJpdGVkRGF0YS50YWdzLnRhZy5sZW5ndGgpIHtcbiAgICAgIGl0ZW0udGFncyA9IGVudGl0eS5yZXNvbHZlZEluaGVyaXRlZERhdGEudGFncy50YWc7XG4gICAgfVxuXG4gICAgaWYgKGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0ICYmIGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0WzBdLmF1dGhvcikge1xuICAgICAgaXRlbS5hdXRob3IgPSBlbnRpdHkucHJldmlld0JpbmFyeVNldFswXS5hdXRob3I7XG4gICAgfVxuXG4gICAgdmFyIHRpbWVTdGFtcEZvckRhdGUgPSBlbnRpdHkubGFzdFVwZGF0ZWRUaW1lc3RhbXAgfHwgZW50aXR5LmNyZWF0ZWRUaW1lc3RhbXA7XG5cbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWVTdGFtcEZvckRhdGUpO1xuXG4gICAgaXRlbS5kYXRlID0gKGRhdGUuZ2V0RGF0ZSgpIDwgMTAgPyBcIjBcIiA6IDApICsgZGF0ZS5nZXREYXRlKCkgKyBcIi5cIiArIChkYXRlLmdldE1vbnRoKCkgPCA5ID8gXCIwXCIgOiAwKSArIChkYXRlLmdldE1vbnRoKCkgKyAxKSArIFwiLlwiICsgZGF0ZS5nZXRGdWxsWWVhcigpO1xuXG4gICAgdmFyIHdpZHRoID0gaXNEZXRhaWwgPyA4NzUgOiAzNTA7XG4gICAgdmFyIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gMTkwMDA7XG5cbiAgICBpZiAoaXNEZXRhaWwpIHtcbiAgICAgIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gaXRlbS50eXBlID09IFwiZm9sZGVyXCIgPyAxMjAwIDogMTkwMDE7XG5cbiAgICAgIGlmIChpdGVtLmJpbmFyeVR5cGUpIHtcbiAgICAgICAgc3dpdGNoIChpdGVtLmJpbmFyeVR5cGUpIHtcbiAgICAgICAgICBjYXNlIFwiaW1hZ2VcIjpcbiAgICAgICAgICAgIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gMTkwMDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiYXVkaW9cIjpcbiAgICAgICAgICAgIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gMTkwMDY7XG4gICAgICAgICAgICBpdGVtLmF1ZGlvU3JjID0gdGhpcy5nZXRCaW5hcnlTcmMoZW50aXR5LCAxOTAwNSwgLTEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInZpZGVvXCI6XG4gICAgICAgICAgICBwcmV2aWV3QmluYXJ5UHVycG9zZSA9IDE5MDA0O1xuICAgICAgICAgICAgaXRlbS52aWRlb1NyYyA9IHRoaXMuZ2V0QmluYXJ5U3JjKGVudGl0eSwgMTkwMDUsIHdpZHRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJkb2N1bWVudFwiOlxuICAgICAgICAgICAgLy9jaGVjayBpZiBkb2N1bWVudCBpcyByaWNodGV4dCBzdG9yeVxuICAgICAgICAgICAgaWYgKGVudGl0eS5hc3NldCAmJiBlbnRpdHkuYXNzZXQudHlwZSAmJiBlbnRpdHkuYXNzZXQudHlwZSA9PT0gMikge1xuICAgICAgICAgICAgICBpdGVtLmlzU3RvcnkgPSB0cnVlO1xuICAgICAgICAgICAgICBpdGVtLmNvdmVySW1hZ2UgPSB0aGlzLmdldEJpbmFyeVNyYyhlbnRpdHksIDE5MDA4LCAxOTIwKTtcblxuICAgICAgICAgICAgICBpZiAoaXRlbS5jb3ZlckltYWdlLmluZGV4T2YoXCJwbGFjZWhvbGRlclwiKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgaXRlbS5jb3ZlckltYWdlID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB2YXIgaHRtbFNyYyA9IHRoaXMuZ2V0QmluYXJ5U3JjKGVudGl0eSwgMTAwMDEsIC0yKTtcbiAgICAgICAgICAgICAgcHJldmlld0JpbmFyeVB1cnBvc2UgPSAxOTAxMDtcbiAgICAgICAgICAgICAgd2lkdGggPSA4NzU7XG5cbiAgICAgICAgICAgICAgaXRlbS5odG1sID0gZmV0Y2goaHRtbFNyYywge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICd4LWNvbnRpZGlvLXNkayc6ICcxLjAtSlMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dDtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGl0ZW0uaXNTdG9yeSA9IGZhbHNlO1xuICAgICAgICAgICAgICBwcmV2aWV3QmluYXJ5UHVycG9zZSA9IDE5MDAyO1xuICAgICAgICAgICAgICBpdGVtLnBkZlNyYyA9IHRoaXMuZ2V0QmluYXJ5U3JjKGVudGl0eSwgMTAwMDEsIC0yKTtcbiAgICAgICAgICAgICAgd2lkdGggPSA3MDA7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gaXRlbS50eXBlID09IFwiZm9sZGVyXCIgPyAxMjAwIDogMTkwMDA7XG5cbiAgICAgIHN3aXRjaCAoaXRlbS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJicmFuZFwiOlxuICAgICAgICAgIHByZXZpZXdCaW5hcnlQdXJwb3NlID0gMTAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZm9sZGVyXCI6XG4gICAgICAgICAgcHJldmlld0JpbmFyeVB1cnBvc2UgPSAxMjAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbS5iaW5hcnlUeXBlKSB7XG4gICAgICAgIHN3aXRjaCAoaXRlbS5iaW5hcnlUeXBlKSB7XG4gICAgICAgICAgY2FzZSBcInZpZGVvXCI6XG4gICAgICAgICAgICBwcmV2aWV3QmluYXJ5UHVycG9zZSA9IDE5MDAyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImRvY3VtZW50XCI6XG4gICAgICAgICAgICBwcmV2aWV3QmluYXJ5UHVycG9zZSA9IChlbnRpdHkuYXNzZXQgJiYgZW50aXR5LmFzc2V0LnR5cGUgPT09IDIpID8gMTkwMDAgOiAxOTAwMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaXRlbS5wcmV2aWV3SW1hZ2UgPSB0aGlzLmdldEJpbmFyeVNyYyhlbnRpdHksIHByZXZpZXdCaW5hcnlQdXJwb3NlLCB3aWR0aCk7XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfTtcblxuICB0aGlzLmdldFR5cGUgPSBmdW5jdGlvbiAodHlwZSkge1xuXG4gICAgLyogVE9ETzogc3dpdGNoIHRvIGNvbnN0YW50cyAqL1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiBcImJyYW5kXCI7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJldHVybiBcImZvbGRlclwiO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJhc3NldFwiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5nZXRCaW5hcnlUeXBlID0gZnVuY3Rpb24gKGJpbmFyeVR5cGUpIHtcblxuICAgIC8qIFRPRE86IHN3aXRjaCB0byBjb25zdGFudHMgKi9cblxuICAgIHN3aXRjaCAoYmluYXJ5VHlwZSkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gXCJpbWFnZVwiO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJhdWRpb1wiO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gXCJ2aWRlb1wiO1xuICAgICAgY2FzZSA0OlxuICAgICAgICByZXR1cm4gXCJkb2N1bWVudFwiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5nZXRCaW5hcnlTcmMgPSBmdW5jdGlvbiAoZW50aXR5LCBiaW5hcnlQdXJwb3NlLCB3aWR0aCkge1xuICAgIHZhciBpbmRleFRvVXNlID0gLTE7XG5cbiAgICBpZiAoIWVudGl0eS5wcmV2aWV3QmluYXJ5U2V0IHx8IGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGxhY2Vob2xkZXJTcmMoZW50aXR5KTtcbiAgICB9XG5cbiAgICB2YXIgYlAgPSBiaW5hcnlQdXJwb3NlID8gYmluYXJ5UHVycG9zZSA6IDE5MDAwO1xuICAgIHZhciB3ID0gd2lkdGggPyB3aWR0aCA6IDU2MDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW50aXR5LnByZXZpZXdCaW5hcnlTZXRbMF0uY2FsY3VsYXRlZEJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0WzBdLmNhbGN1bGF0ZWRCaW5hcnlbaV0uYmluYXJ5UHVycG9zZSA9PT0gYlAgJiZcbiAgICAgICAgZW50aXR5LnByZXZpZXdCaW5hcnlTZXRbMF0uY2FsY3VsYXRlZEJpbmFyeVtpXS5vdXRwdXRJZCA+PSB3XG4gICAgICApIHtcbiAgICAgICAgaW5kZXhUb1VzZSA9IGk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGluZGV4VG9Vc2UgPiAtMSkge1xuICAgICAgcmV0dXJuIGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0WzBdLmNhbGN1bGF0ZWRCaW5hcnlbaW5kZXhUb1VzZV0uZG93bmxvYWRMaW5rO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQbGFjZWhvbGRlclNyYyhlbnRpdHkpO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuZ2V0UGxhY2Vob2xkZXJTcmMgPSBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgdmFyIHR5cGUgPSB0aGlzLmdldFR5cGUoZW50aXR5LnR5cGUpO1xuICAgIHZhciBiaW5hcnlUeXBlID0gdGhpcy5nZXRCaW5hcnlUeXBlKGVudGl0eS53b3JraW5nU2V0QmluYXJ5VHlwZSk7XG5cbiAgICBpZiAodHlwZSA9PT0gXCJmb2xkZXJcIikge1xuICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cuY29udGlkaW8uY29tL2Fzc2V0cy9wbGFjZWhvbGRlcnMvZm9sZGVyX2dyYXkucG5nXCI7XG4gICAgfVxuXG4gICAgaWYgKGJpbmFyeVR5cGUgPT09IFwiZG9jdW1lbnRcIikge1xuICAgICAgcmV0dXJuIFwiaHR0cHM6Ly93d3cuY29udGlkaW8uY29tL2Fzc2V0cy9wbGFjZWhvbGRlcnMvZG9jdW1lbnRfbGFuZHNjYXBlLnBuZ1wiO1xuICAgIH1cblxuICAgIHJldHVybiBcImh0dHBzOi8vd3d3LmNvbnRpZGlvLmNvbS9hc3NldHMvcGxhY2Vob2xkZXJzL1wiICsgYmluYXJ5VHlwZSArIFwiX2dyYXkucG5nXCI7XG4gIH07XG5cbiAgdGhpcy5hZGRFdmVudCA9IGZ1bmN0aW9uIChvYmplY3QsIHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsIHx8IHR5cGVvZihvYmplY3QpID09ICd1bmRlZmluZWQnKSByZXR1cm47XG4gICAgaWYgKG9iamVjdC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgIH0gZWxzZSBpZiAob2JqZWN0LmF0dGFjaEV2ZW50KSB7XG4gICAgICBvYmplY3QuYXR0YWNoRXZlbnQoXCJvblwiICsgdHlwZSwgY2FsbGJhY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmplY3RbXCJvblwiICsgdHlwZV0gPSBjYWxsYmFjaztcbiAgICB9XG4gIH07XG5cbn1cblxudmFyIGN3ID0gbmV3IENvbnRpZGlvV2lkZ2V0KCk7XG5cbmN3LmluaXQoKTtcblxuXG4iXX0=
