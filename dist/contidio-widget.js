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
    itemClass: "contidio-item"
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

    var $;

    if (typeof jQuery === 'undefined') {
      $ = require('domtastic');
    }else {
      $ = jQuery;
    }

    require('whatwg-fetch');

    if (!window.Promise) {
      window.Promise = Promise;
    }

    var options = this.options;
    var that = this;

    var url = options.url ? options.url : '';

    fetch(url, {
      headers: {
        'x-contidio-sdk': '1.0-JS'
      }
    }).then(function (response) {
      return response.json();
    }).then(function (json) {

      that.extractItems(json);

      var renderer = new Renderer(options, $);

      var $itemList = $("<div class='contidio-item-list'></div>");

      for (var i = 0; i < that.items.length; i++) {
        $itemList.append(renderer.renderListView(that.items[i]));
      }

      $(options.container).append($itemList);

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

    json.entity.forEach(function (entity) {

      var item = {
        uuid: entity.uuid,
        name: entity.name ? entity.name : entity.uuid,
        type: that.defineType(entity.type),
        previewImage: that.getPreviewImage(entity)
      };

      if (entity.workingSetBinaryType) {
        item.binaryType = that.defineBinaryType(entity.workingSetBinaryType);
      }

      that.items.push(item);
    });
  };

  this.defineType = function (type) {

    /* TODO: switch to constants */

    switch (type) {
      case 1:
        return "collection";
      case 2:
        return "asset";
      default:
        return "undefined";
    }

  };

  this.defineBinaryType = function (binaryType) {

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

  this.getPreviewImage = function (entity) {
    var indexToUse = -1;

    if (entity.workingSetBinaryType == 2) {

      if (entity.previewBinarySet[0].calculatedBinary.length > 1) {

        for (var i = 0; i < entity.previewBinarySet[0].calculatedBinary.length; i++) {
          if (entity.previewBinarySet[0].calculatedBinary[i].binaryPurpose == 19000 &&
            entity.previewBinarySet[0].calculatedBinary[i].width >= 560
          ) {
            indexToUse = i;
          }
        }
      }

    } else {
      indexToUse = 0;
    }

    if (indexToUse > -1) {
      return entity.previewBinarySet[0].calculatedBinary[indexToUse].downloadLink;
    } else {
      return false;
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9tdGFzdGljL2Rpc3QvZG9tdGFzdGljLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC4kID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4vKlxuICogQG1vZHVsZSBVdGlsXG4gKi9cblxuLypcbiAqIFJlZmVyZW5jZSB0byB0aGUgd2luZG93IG9iamVjdFxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgd2luID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fTtcblxuLyoqXG4gKiBDb252ZXJ0IGBOb2RlTGlzdGAgdG8gYEFycmF5YC5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHRvQXJyYXkgPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gIHZhciByZXN1bHQgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHJlc3VsdFtpXSA9IGNvbGxlY3Rpb25baV07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRmFzdGVyIGFsdGVybmF0aXZlIHRvIFtdLmZvckVhY2ggbWV0aG9kXG4gKlxuICogQHBhcmFtIHtOb2RlfE5vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7Tm9kZXxOb2RlTGlzdHxBcnJheX1cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIGVhY2ggPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICBpZiAobGVuZ3RoICE9PSB1bmRlZmluZWQgJiYgY29sbGVjdGlvbi5ub2RlVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBjb2xsZWN0aW9uW2ldLCBpLCBjb2xsZWN0aW9uKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBjb2xsZWN0aW9uLCAwLCBjb2xsZWN0aW9uKTtcbiAgfVxuICByZXR1cm4gY29sbGVjdGlvbjtcbn07XG5cbi8qKlxuICogQXNzaWduIGVudW1lcmFibGUgcHJvcGVydGllcyBmcm9tIHNvdXJjZSBvYmplY3QocykgdG8gdGFyZ2V0IG9iamVjdFxuICpcbiAqIEBtZXRob2QgZXh0ZW5kXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0IE9iamVjdCB0byBleHRlbmRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbc291cmNlXSBPYmplY3QgdG8gZXh0ZW5kIGZyb21cbiAqIEByZXR1cm4ge09iamVjdH0gRXh0ZW5kZWQgb2JqZWN0XG4gKiBAZXhhbXBsZVxuICogICAgICQuZXh0ZW5kKHthOiAxfSwge2I6IDJ9KTtcbiAqICAgICAvLyB7YTogMSwgYjogMn1cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5leHRlbmQoe2E6IDF9LCB7YjogMn0sIHthOiAzfSk7XG4gKiAgICAgLy8ge2E6IDMsIGI6IDJ9XG4gKi9cblxudmFyIGV4dGVuZCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHNvdXJjZXMgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgc291cmNlc1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICBzb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNyYykge1xuICAgIGZvciAodmFyIHByb3AgaW4gc3JjKSB7XG4gICAgICB0YXJnZXRbcHJvcF0gPSBzcmNbcHJvcF07XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjb2xsZWN0aW9uIHdpdGhvdXQgZHVwbGljYXRlc1xuICpcbiAqIEBwYXJhbSBjb2xsZWN0aW9uIENvbGxlY3Rpb24gdG8gcmVtb3ZlIGR1cGxpY2F0ZXMgZnJvbVxuICogQHJldHVybiB7Tm9kZXxOb2RlTGlzdHxBcnJheX1cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIHVuaXEgPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uaW5kZXhPZihpdGVtKSA9PT0gaW5kZXg7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBAbW9kdWxlIFNlbGVjdG9yXG4gKi9cblxudmFyIGlzUHJvdG90eXBlU2V0ID0gZmFsc2U7XG5cbnZhciByZUZyYWdtZW50ID0gL15cXHMqPChcXHcrfCEpW14+XSo+LztcbnZhciByZVNpbmdsZVRhZyA9IC9ePChcXHcrKVxccypcXC8/Pig/OjxcXC9cXDE+fCkkLztcbnZhciByZVNpbXBsZVNlbGVjdG9yID0gL15bXFwuI10/W1xcdy1dKiQvO1xuXG4vKlxuICogVmVyc2F0aWxlIHdyYXBwZXIgZm9yIGBxdWVyeVNlbGVjdG9yQWxsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBzZWxlY3RvciBRdWVyeSBzZWxlY3RvciwgYE5vZGVgLCBgTm9kZUxpc3RgLCBhcnJheSBvZiBlbGVtZW50cywgb3IgSFRNTCBmcmFnbWVudCBzdHJpbmcuXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fSBjb250ZXh0PWRvY3VtZW50IFRoZSBjb250ZXh0IGZvciB0aGUgc2VsZWN0b3IgdG8gcXVlcnkgZWxlbWVudHMuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyICRpdGVtcyA9ICQoLml0ZW1zJyk7XG4gKiBAZXhhbXBsZVxuICogICAgIHZhciAkZWxlbWVudCA9ICQoZG9tRWxlbWVudCk7XG4gKiBAZXhhbXBsZVxuICogICAgIHZhciAkbGlzdCA9ICQobm9kZUxpc3QsIGRvY3VtZW50LmJvZHkpO1xuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGVsZW1lbnQgPSAkKCc8cD5ldmVyZ3JlZW48L3A+Jyk7XG4gKi9cblxudmFyICQkMiA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgY29udGV4dCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogZG9jdW1lbnQ7XG5cblxuICB2YXIgY29sbGVjdGlvbiA9IHZvaWQgMDtcblxuICBpZiAoIXNlbGVjdG9yKSB7XG5cbiAgICBjb2xsZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChudWxsKTtcbiAgfSBlbHNlIGlmIChzZWxlY3RvciBpbnN0YW5jZW9mIFdyYXBwZXIpIHtcblxuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnKSB7XG5cbiAgICBjb2xsZWN0aW9uID0gc2VsZWN0b3Iubm9kZVR5cGUgfHwgc2VsZWN0b3IgPT09IHdpbmRvdyA/IFtzZWxlY3Rvcl0gOiBzZWxlY3RvcjtcbiAgfSBlbHNlIGlmIChyZUZyYWdtZW50LnRlc3Qoc2VsZWN0b3IpKSB7XG5cbiAgICBjb2xsZWN0aW9uID0gY3JlYXRlRnJhZ21lbnQoc2VsZWN0b3IpO1xuICB9IGVsc2Uge1xuXG4gICAgY29udGV4dCA9IHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJyA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGV4dCkgOiBjb250ZXh0Lmxlbmd0aCA/IGNvbnRleHRbMF0gOiBjb250ZXh0O1xuXG4gICAgY29sbGVjdGlvbiA9IHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IsIGNvbnRleHQpO1xuICB9XG5cbiAgcmV0dXJuIHdyYXAoY29sbGVjdGlvbik7XG59O1xuXG4vKlxuICogRmluZCBkZXNjZW5kYW50cyBtYXRjaGluZyB0aGUgcHJvdmlkZWQgYHNlbGVjdG9yYCBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8QXJyYXl9IHNlbGVjdG9yIFF1ZXJ5IHNlbGVjdG9yLCBgTm9kZWAsIGBOb2RlTGlzdGAsIGFycmF5IG9mIGVsZW1lbnRzLCBvciBIVE1MIGZyYWdtZW50IHN0cmluZy5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5maW5kKCcuZGVlcCcpLiQoJy5kZWVwZXN0Jyk7XG4gKi9cblxudmFyIGZpbmQgPSBmdW5jdGlvbiAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gW107XG4gIGVhY2godGhpcywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICByZXR1cm4gZWFjaChxdWVyeVNlbGVjdG9yKHNlbGVjdG9yLCBub2RlKSwgZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICBpZiAobm9kZXMuaW5kZXhPZihjaGlsZCkgPT09IC0xKSB7XG4gICAgICAgIG5vZGVzLnB1c2goY2hpbGQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKlxuICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVsZW1lbnQgd291bGQgYmUgc2VsZWN0ZWQgYnkgdGhlIHNwZWNpZmllZCBzZWxlY3RvciBzdHJpbmc7IG90aGVyd2lzZSwgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudCBFbGVtZW50IHRvIHRlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBTZWxlY3RvciB0byBtYXRjaCBhZ2FpbnN0IGVsZW1lbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKlxuICogQGV4YW1wbGVcbiAqICAgICAkLm1hdGNoZXMoZWxlbWVudCwgJy5tYXRjaCcpO1xuICovXG5cbnZhciBtYXRjaGVzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY29udGV4dCA9IHR5cGVvZiBFbGVtZW50ICE9PSAndW5kZWZpbmVkJyA/IEVsZW1lbnQucHJvdG90eXBlIDogd2luO1xuICB2YXIgX21hdGNoZXMgPSBjb250ZXh0Lm1hdGNoZXMgfHwgY29udGV4dC5tYXRjaGVzU2VsZWN0b3IgfHwgY29udGV4dC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgY29udGV4dC5tc01hdGNoZXNTZWxlY3RvciB8fCBjb250ZXh0Lm9NYXRjaGVzU2VsZWN0b3IgfHwgY29udGV4dC53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gIHJldHVybiBmdW5jdGlvbiAoZWxlbWVudCwgc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gX21hdGNoZXMuY2FsbChlbGVtZW50LCBzZWxlY3Rvcik7XG4gIH07XG59KCk7XG5cbi8qXG4gKiBVc2UgdGhlIGZhc3RlciBgZ2V0RWxlbWVudEJ5SWRgLCBgZ2V0RWxlbWVudHNCeUNsYXNzTmFtZWAgb3IgYGdldEVsZW1lbnRzQnlUYWdOYW1lYCBvdmVyIGBxdWVyeVNlbGVjdG9yQWxsYCBpZiBwb3NzaWJsZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFF1ZXJ5IHNlbGVjdG9yLlxuICogQHBhcmFtIHtOb2RlfSBjb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgc2VsZWN0b3IgdG8gcXVlcnkgZWxlbWVudHMuXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5vZGVMaXN0LCBIVE1MQ29sbGVjdGlvbiwgb3IgQXJyYXkgb2YgbWF0Y2hpbmcgZWxlbWVudHMgKGRlcGVuZGluZyBvbiBtZXRob2QgdXNlZCkuXG4gKi9cblxudmFyIHF1ZXJ5U2VsZWN0b3IgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcblxuICB2YXIgaXNTaW1wbGVTZWxlY3RvciA9IHJlU2ltcGxlU2VsZWN0b3IudGVzdChzZWxlY3Rvcik7XG5cbiAgaWYgKGlzU2ltcGxlU2VsZWN0b3IpIHtcbiAgICBpZiAoc2VsZWN0b3JbMF0gPT09ICcjJykge1xuICAgICAgdmFyIGVsZW1lbnQgPSAoY29udGV4dC5nZXRFbGVtZW50QnlJZCA/IGNvbnRleHQgOiBkb2N1bWVudCkuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3Iuc2xpY2UoMSkpO1xuICAgICAgcmV0dXJuIGVsZW1lbnQgPyBbZWxlbWVudF0gOiBbXTtcbiAgICB9XG4gICAgaWYgKHNlbGVjdG9yWzBdID09PSAnLicpIHtcbiAgICAgIHJldHVybiBjb250ZXh0LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoc2VsZWN0b3Iuc2xpY2UoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZShzZWxlY3Rvcik7XG4gIH1cblxuICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbn07XG5cbi8qXG4gKiBDcmVhdGUgRE9NIGZyYWdtZW50IGZyb20gYW4gSFRNTCBzdHJpbmdcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWwgU3RyaW5nIHJlcHJlc2VudGluZyBIVE1MLlxuICogQHJldHVybiB7Tm9kZUxpc3R9XG4gKi9cblxudmFyIGNyZWF0ZUZyYWdtZW50ID0gZnVuY3Rpb24gKGh0bWwpIHtcblxuICBpZiAocmVTaW5nbGVUYWcudGVzdChodG1sKSkge1xuICAgIHJldHVybiBbZG9jdW1lbnQuY3JlYXRlRWxlbWVudChSZWdFeHAuJDEpXTtcbiAgfVxuXG4gIHZhciBlbGVtZW50cyA9IFtdO1xuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHZhciBjaGlsZHJlbiA9IGNvbnRhaW5lci5jaGlsZE5vZGVzO1xuXG4gIGNvbnRhaW5lci5pbm5lckhUTUwgPSBodG1sO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZWxlbWVudHMucHVzaChjaGlsZHJlbltpXSk7XG4gIH1cblxuICByZXR1cm4gZWxlbWVudHM7XG59O1xuXG4vKlxuICogQ2FsbGluZyBgJChzZWxlY3RvcilgIHJldHVybnMgYSB3cmFwcGVkIGNvbGxlY3Rpb24gb2YgZWxlbWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb24gRWxlbWVudChzKSB0byB3cmFwLlxuICogQHJldHVybiBPYmplY3QpIFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqL1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG5cbiAgaWYgKCFpc1Byb3RvdHlwZVNldCkge1xuICAgIFdyYXBwZXIucHJvdG90eXBlID0gJCQyLmZuO1xuICAgIFdyYXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gV3JhcHBlcjtcbiAgICBpc1Byb3RvdHlwZVNldCA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gbmV3IFdyYXBwZXIoY29sbGVjdGlvbik7XG59O1xuXG4vKlxuICogQ29uc3RydWN0b3IgZm9yIHRoZSBPYmplY3QucHJvdG90eXBlIHN0cmF0ZWd5XG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvbiBFbGVtZW50KHMpIHRvIHdyYXAuXG4gKi9cblxudmFyIFdyYXBwZXIgPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICB2YXIgaSA9IDA7XG4gIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgZm9yICg7IGkgPCBsZW5ndGg7KSB7XG4gICAgdGhpc1tpXSA9IGNvbGxlY3Rpb25baSsrXTtcbiAgfVxuICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbn07XG5cbnZhciBzZWxlY3RvciA9IE9iamVjdC5mcmVlemUoe1xuXHQkOiAkJDIsXG5cdGZpbmQ6IGZpbmQsXG5cdG1hdGNoZXM6IG1hdGNoZXMsXG5cdFdyYXBwZXI6IFdyYXBwZXJcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgQXJyYXlcbiAqL1xuXG52YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGNhbGxiYWNrIHJldHVybnMgYSB0cnVlKC1pc2gpIHZhbHVlIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBlbGVtZW50LCBpbnZva2VkIHdpdGggYGVsZW1lbnRgIGFzIGFyZ3VtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IFt0aGlzQXJnXSBWYWx1ZSB0byB1c2UgYXMgYHRoaXNgIHdoZW4gZXhlY3V0aW5nIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIGVhY2ggZWxlbWVudCBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5ldmVyeShmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIHJldHVybiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYWN0aXZlJylcbiAqICAgICB9KTtcbiAqICAgICAvLyB0cnVlL2ZhbHNlXG4gKi9cblxudmFyIGV2ZXJ5ID0gQXJyYXlQcm90by5ldmVyeTtcblxuLyoqXG4gKiBGaWx0ZXIgdGhlIGNvbGxlY3Rpb24gYnkgc2VsZWN0b3Igb3IgZnVuY3Rpb24sIGFuZCByZXR1cm4gYSBuZXcgY29sbGVjdGlvbiB3aXRoIHRoZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHNlbGVjdG9yIFNlbGVjdG9yIG9yIGZ1bmN0aW9uIHRvIGZpbHRlciB0aGUgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdGhpc0FyZ10gVmFsdWUgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICogQHJldHVybiB7T2JqZWN0fSBBIG5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZmlsdGVyKCcuYWN0aXZlJyk7XG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIHJldHVybiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYWN0aXZlJylcbiAqICAgICB9KTtcbiAqL1xuXG52YXIgZmlsdGVyID0gZnVuY3Rpb24gKHNlbGVjdG9yLCB0aGlzQXJnKSB7XG4gIHZhciBjYWxsYmFjayA9IHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJyA/IHNlbGVjdG9yIDogZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gbWF0Y2hlcyhlbGVtZW50LCBzZWxlY3Rvcik7XG4gIH07XG4gIHJldHVybiAkJDIoQXJyYXlQcm90by5maWx0ZXIuY2FsbCh0aGlzLCBjYWxsYmFjaywgdGhpc0FyZykpO1xufTtcblxuLyoqXG4gKiBFeGVjdXRlIGEgZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgZWxlbWVudC5zdHlsZS5jb2xvciA9ICdldmVyZ3JlZW4nO1xuICogICAgICk7XG4gKi9cblxudmFyIGZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgY2FsbGJhY2ssIHRoaXNBcmcpO1xufTtcblxudmFyIGVhY2gkMSA9IGZvckVhY2g7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW5kZXggb2YgYW4gZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIHplcm8tYmFzZWQgaW5kZXgsIC0xIGlmIG5vdCBmb3VuZC5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuaW5kZXhPZihlbGVtZW50KTtcbiAqICAgICAvLyAyXG4gKi9cblxudmFyIGluZGV4T2YgPSBBcnJheVByb3RvLmluZGV4T2Y7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGNvbGxlY3Rpb24gYnkgZXhlY3V0aW5nIHRoZSBjYWxsYmFjayBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggZWxlbWVudCwgaW52b2tlZCB3aXRoIGBlbGVtZW50YCBhcyBhcmd1bWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdGhpc0FyZ10gVmFsdWUgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICogQHJldHVybiB7QXJyYXl9IENvbGxlY3Rpb24gd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBleGVjdXRlZCBjYWxsYmFjayBmb3IgZWFjaCBlbGVtZW50LlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ25hbWUnKVxuICogICAgIH0pO1xuICogICAgIC8vIFsnZXZlcicsICdncmVlbiddXG4gKi9cblxudmFyIG1hcCA9IEFycmF5UHJvdG8ubWFwO1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGxhc3QgZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uLCBhbmQgcmV0dXJucyB0aGF0IGVsZW1lbnQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgbGFzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBsYXN0RWxlbWVudCA9ICQoJy5pdGVtcycpLnBvcCgpO1xuICovXG5cbnZhciBwb3AgPSBBcnJheVByb3RvLnBvcDtcblxuLyoqXG4gKiBBZGRzIG9uZSBvciBtb3JlIGVsZW1lbnRzIHRvIHRoZSBlbmQgb2YgdGhlIGNvbGxlY3Rpb24sIGFuZCByZXR1cm5zIHRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IEVsZW1lbnQocykgdG8gYWRkIHRvIHRoZSBjb2xsZWN0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBjb2xsZWN0aW9uXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnB1c2goZWxlbWVudCk7XG4gKi9cblxudmFyIHB1c2ggPSBBcnJheVByb3RvLnB1c2g7XG5cbi8qKlxuICogQXBwbHkgYSBmdW5jdGlvbiBhZ2FpbnN0IGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgYW5kIHRoaXMgYWNjdW11bGF0b3IgZnVuY3Rpb24gaGFzIHRvIHJlZHVjZSBpdFxuICogdG8gYSBzaW5nbGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheSwgdGFraW5nIGZvdXIgYXJndW1lbnRzIChzZWUgZXhhbXBsZSkuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsVmFsdWUgT2JqZWN0IHRvIHVzZSBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIGZpcnN0IGNhbGwgb2YgdGhlIGNhbGxiYWNrLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5yZWR1Y2UoZnVuY3Rpb24ocHJldmlvdXNWYWx1ZSwgZWxlbWVudCwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAqICAgICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWUgKyBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAqICAgICB9LCAwKTtcbiAqICAgICAvLyBbdG90YWwgaGVpZ2h0IG9mIGVsZW1lbnRzXVxuICovXG5cbnZhciByZWR1Y2UgPSBBcnJheVByb3RvLnJlZHVjZTtcblxuLyoqXG4gKiBBcHBseSBhIGZ1bmN0aW9uIGFnYWluc3QgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uIChmcm9tIHJpZ2h0LXRvLWxlZnQpLCBhbmQgdGhpcyBhY2N1bXVsYXRvciBmdW5jdGlvbiBoYXNcbiAqIHRvIHJlZHVjZSBpdCB0byBhIHNpbmdsZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5LCB0YWtpbmcgZm91ciBhcmd1bWVudHMgKHNlZSBleGFtcGxlKS5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxWYWx1ZSBPYmplY3QgdG8gdXNlIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgZmlyc3QgY2FsbCBvZiB0aGUgY2FsbGJhY2suXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnJlZHVjZVJpZ2h0KGZ1bmN0aW9uKHByZXZpb3VzVmFsdWUsIGVsZW1lbnQsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gKiAgICAgICAgIHJldHVybiBwcmV2aW91c1ZhbHVlICsgZWxlbWVudC50ZXh0Q29udGVudDtcbiAqICAgICB9LCAnJylcbiAqICAgICAvLyBbcmV2ZXJzZWQgdGV4dCBvZiBlbGVtZW50c11cbiAqL1xuXG52YXIgcmVkdWNlUmlnaHQgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0O1xuXG4vKipcbiAqIFJldmVyc2VzIGFuIGFycmF5IGluIHBsYWNlLiBUaGUgZmlyc3QgYXJyYXkgZWxlbWVudCBiZWNvbWVzIHRoZSBsYXN0IGFuZCB0aGUgbGFzdCBiZWNvbWVzIHRoZSBmaXJzdC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb24sIHJldmVyc2VkXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnJldmVyc2UoKTtcbiAqL1xuXG52YXIgcmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICQkMih0b0FycmF5KHRoaXMpLnJldmVyc2UoKSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZXMgdGhlIGZpcnN0IGVsZW1lbnQgZnJvbSB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhhdCBlbGVtZW50LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIGZpcnN0IGVsZW1lbnQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIGZpcnN0RWxlbWVudCA9ICQoJy5pdGVtcycpLnNoaWZ0KCk7XG4gKi9cblxudmFyIHNoaWZ0ID0gQXJyYXlQcm90by5zaGlmdDtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGNhbGxiYWNrIHJldHVybnMgYSB0cnVlKC1pc2gpIHZhbHVlIGZvciBhbnkgb2YgdGhlIGVsZW1lbnRzIGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggZWxlbWVudCwgaW52b2tlZCB3aXRoIGBlbGVtZW50YCBhcyBhcmd1bWVudC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgYW55IGVsZW1lbnQgcGFzc2VkIHRoZSBjYWxsYmFjayBjaGVjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuc29tZShmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIHJldHVybiBlbGVtZW50Lmhhc0F0dHJpYnV0ZSgnYWN0aXZlJylcbiAqICAgICB9KTtcbiAqICAgICAvLyB0cnVlL2ZhbHNlXG4gKi9cblxudmFyIHNvbWUgPSBBcnJheVByb3RvLnNvbWU7XG5cbi8qKlxuICogQWRkcyBvbmUgb3IgbW9yZSBlbGVtZW50cyB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZSBjb2xsZWN0aW9uLCBhbmQgcmV0dXJucyB0aGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBFbGVtZW50KHMpIHRvIGFkZCB0byB0aGUgY29sbGVjdGlvblxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgbmV3IGxlbmd0aCBvZiB0aGUgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS51bnNoaWZ0KGVsZW1lbnQpO1xuICovXG5cbnZhciB1bnNoaWZ0ID0gQXJyYXlQcm90by51bnNoaWZ0O1xuXG52YXIgYXJyYXkgPSBPYmplY3QuZnJlZXplKHtcblx0ZXZlcnk6IGV2ZXJ5LFxuXHRmaWx0ZXI6IGZpbHRlcixcblx0Zm9yRWFjaDogZm9yRWFjaCxcblx0ZWFjaDogZWFjaCQxLFxuXHRpbmRleE9mOiBpbmRleE9mLFxuXHRtYXA6IG1hcCxcblx0cG9wOiBwb3AsXG5cdHB1c2g6IHB1c2gsXG5cdHJlZHVjZTogcmVkdWNlLFxuXHRyZWR1Y2VSaWdodDogcmVkdWNlUmlnaHQsXG5cdHJldmVyc2U6IHJldmVyc2UsXG5cdHNoaWZ0OiBzaGlmdCxcblx0c29tZTogc29tZSxcblx0dW5zaGlmdDogdW5zaGlmdFxufSk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8qKlxuICogQG1vZHVsZSBCYXNlQ2xhc3NcbiAqL1xuXG52YXIgQmFzZUNsYXNzID0gZnVuY3Rpb24gKGFwaSkge1xuXG4gIC8qKlxuICAgKiBQcm92aWRlIHN1YmNsYXNzIGZvciBjbGFzc2VzIG9yIGNvbXBvbmVudHMgdG8gZXh0ZW5kIGZyb20uXG4gICAqIFRoZSBvcHBvc2l0ZSBhbmQgc3VjY2Vzc29yIG9mIHBsdWdpbnMgKG5vIG5lZWQgdG8gZXh0ZW5kIGAkLmZuYCBhbnltb3JlLCBjb21wbGV0ZSBjb250cm9sKS5cbiAgICpcbiAgICogQHJldHVybiB7Q2xhc3N9IFRoZSBjbGFzcyB0byBleHRlbmQgZnJvbSwgaW5jbHVkaW5nIGFsbCBgJC5mbmAgbWV0aG9kcy5cbiAgICogQGV4YW1wbGVcbiAgICogICAgIGltcG9ydCB7IEJhc2VDbGFzcyB9IGZyb20gICdkb210YXN0aWMnO1xuICAgKlxuICAgKiAgICAgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ2xhc3Mge1xuICAgKiAgICAgICAgIGRvU29tZXRoaW5nKCkge1xuICAgKiAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGRDbGFzcygnLmZvbycpO1xuICAgKiAgICAgICAgIH1cbiAgICogICAgIH1cbiAgICpcbiAgICogICAgIGxldCBjb21wb25lbnQgPSBuZXcgTXlDb21wb25lbnQoJ2JvZHknKTtcbiAgICogICAgIGNvbXBvbmVudC5kb1NvbWV0aGluZygpO1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgaW1wb3J0ICQgZnJvbSAgJ2RvbXRhc3RpYyc7XG4gICAqXG4gICAqICAgICBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzICQuQmFzZUNsYXNzIHtcbiAgICogICAgICAgICBwcm9ncmVzcyh2YWx1ZSkge1xuICAgKiAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdHRyKCdkYXRhLXByb2dyZXNzJywgdmFsdWUpO1xuICAgKiAgICAgICAgIH1cbiAgICogICAgIH1cbiAgICpcbiAgICogICAgIGxldCBjb21wb25lbnQgPSBuZXcgTXlDb21wb25lbnQoZG9jdW1lbnQuYm9keSk7XG4gICAqICAgICBjb21wb25lbnQucHJvZ3Jlc3MoJ2l2ZScpLmFwcGVuZCgnPHA+ZW5oYW5jZW1lbnQ8L3A+Jyk7XG4gICAqL1xuXG4gIHZhciBCYXNlQ2xhc3MgPSBmdW5jdGlvbiBCYXNlQ2xhc3MoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJhc2VDbGFzcyk7XG5cbiAgICBXcmFwcGVyLmNhbGwodGhpcywgJCQyLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgZXh0ZW5kKEJhc2VDbGFzcy5wcm90b3R5cGUsIGFwaSk7XG4gIHJldHVybiBCYXNlQ2xhc3M7XG59O1xuXG4vKipcbiAqIEBtb2R1bGUgQ1NTXG4gKi9cblxudmFyIGlzTnVtZXJpYyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQodmFsdWUpKSAmJiBpc0Zpbml0ZSh2YWx1ZSk7XG59O1xuXG52YXIgY2FtZWxpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLy0oW1xcZGEtel0pL2dpLCBmdW5jdGlvbiAobWF0Y2hlcywgbGV0dGVyKSB7XG4gICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICB9KTtcbn07XG5cbnZhciBkYXNoZXJpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoLyhbYS16XFxkXSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdmFsdWUgb2YgYSBzdHlsZSBwcm9wZXJ0eSBmb3IgdGhlIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBvbmUgb3IgbW9yZSBzdHlsZSBwcm9wZXJ0aWVzIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBrZXkgVGhlIG5hbWUgb2YgdGhlIHN0eWxlIHByb3BlcnR5IHRvIGdldCBvciBzZXQuIE9yIGFuIG9iamVjdCBjb250YWluaW5nIGtleS12YWx1ZSBwYWlycyB0byBzZXQgYXMgc3R5bGUgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdIFRoZSB2YWx1ZSBvZiB0aGUgc3R5bGUgcHJvcGVydHkgdG8gc2V0LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuY3NzKCdwYWRkaW5nLWxlZnQnKTsgLy8gZ2V0XG4gKiAgICAgJCgnLml0ZW0nKS5jc3MoJ2NvbG9yJywgJyNmMDAnKTsgLy8gc2V0XG4gKiAgICAgJCgnLml0ZW0nKS5jc3Moeydib3JkZXItd2lkdGgnOiAnMXB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9KTsgLy8gc2V0IG11bHRpcGxlXG4gKi9cblxudmFyIGNzcyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgdmFyIHN0eWxlUHJvcHMgPSB2b2lkIDAsXG4gICAgICBwcm9wID0gdm9pZCAwLFxuICAgICAgdmFsID0gdm9pZCAwO1xuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJykge1xuICAgIGtleSA9IGNhbWVsaXplKGtleSk7XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICB2YWwgPSBlbGVtZW50LnN0eWxlW2tleV07XG4gICAgICAgIHJldHVybiBpc051bWVyaWModmFsKSA/IHBhcnNlRmxvYXQodmFsKSA6IHZhbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgc3R5bGVQcm9wcyA9IHt9O1xuICAgIHN0eWxlUHJvcHNba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHN0eWxlUHJvcHMgPSBrZXk7XG4gICAgZm9yIChwcm9wIGluIHN0eWxlUHJvcHMpIHtcbiAgICAgIHZhbCA9IHN0eWxlUHJvcHNbcHJvcF07XG4gICAgICBkZWxldGUgc3R5bGVQcm9wc1twcm9wXTtcbiAgICAgIHN0eWxlUHJvcHNbY2FtZWxpemUocHJvcCldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBmb3IgKHByb3AgaW4gc3R5bGVQcm9wcykge1xuICAgICAgaWYgKHN0eWxlUHJvcHNbcHJvcF0gfHwgc3R5bGVQcm9wc1twcm9wXSA9PT0gMCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gc3R5bGVQcm9wc1twcm9wXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoZGFzaGVyaXplKHByb3ApKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxudmFyIGNzcyQxID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGNzczogY3NzXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIERPTVxuICovXG5cbnZhciBmb3JFYWNoJDEgPSBBcnJheS5wcm90b3R5cGUuZm9yRWFjaDtcblxuLyoqXG4gKiBBcHBlbmQgZWxlbWVudChzKSB0byBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBhcHBlbmQgdG8gdGhlIGVsZW1lbnQocykuXG4gKiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuYXBwZW5kKCc8cD5tb3JlPC9wPicpO1xuICovXG5cbnZhciBhcHBlbmQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gZWxlbWVudCBpbnN0YW5jZW9mIE5vZGVMaXN0ID8gdG9BcnJheShlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICAgIGZvckVhY2gkMS5jYWxsKGVsZW1lbnRzLCB0aGlzLmFwcGVuZENoaWxkLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBfZWFjaCh0aGlzLCBhcHBlbmQsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQbGFjZSBlbGVtZW50KHMpIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gcGxhY2UgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgZWxlbWVudChzKS5cbiAqIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5wcmVwZW5kKCc8c3Bhbj5zdGFydDwvc3Bhbj4nKTtcbiAqL1xuXG52YXIgcHJlcGVuZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB0aGlzLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLmZpcnN0Q2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gZWxlbWVudCBpbnN0YW5jZW9mIE5vZGVMaXN0ID8gdG9BcnJheShlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICAgIGZvckVhY2gkMS5jYWxsKGVsZW1lbnRzLnJldmVyc2UoKSwgcHJlcGVuZC5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgX2VhY2godGhpcywgcHJlcGVuZCwgZWxlbWVudCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBsYWNlIGVsZW1lbnQocykgYmVmb3JlIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIHBsYWNlIGFzIHNpYmxpbmcocykgYmVmb3JlIHRvIHRoZSBlbGVtZW50KHMpLlxuICogQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5iZWZvcmUoJzxwPnByZWZpeDwvcD4nKTtcbiAqL1xuXG52YXIgYmVmb3JlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgZWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgTm9kZSkge1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gZWxlbWVudCBpbnN0YW5jZW9mIE5vZGVMaXN0ID8gdG9BcnJheShlbGVtZW50KSA6IGVsZW1lbnQ7XG4gICAgICAgIGZvckVhY2gkMS5jYWxsKGVsZW1lbnRzLCBiZWZvcmUuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIGJlZm9yZSwgZWxlbWVudCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBsYWNlIGVsZW1lbnQocykgYWZ0ZXIgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gcGxhY2UgYXMgc2libGluZyhzKSBhZnRlciB0byB0aGUgZWxlbWVudChzKS4gQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5hZnRlcignPHNwYW4+c3VmPC9zcGFuPjxzcGFuPmZpeDwvc3Bhbj4nKTtcbiAqL1xuXG52YXIgYWZ0ZXIgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJlbmQnLCBlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcy5uZXh0U2libGluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBlbGVtZW50IGluc3RhbmNlb2YgTm9kZUxpc3QgPyB0b0FycmF5KGVsZW1lbnQpIDogZWxlbWVudDtcbiAgICAgICAgZm9yRWFjaCQxLmNhbGwoZWxlbWVudHMucmV2ZXJzZSgpLCBhZnRlci5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgX2VhY2godGhpcywgYWZ0ZXIsIGVsZW1lbnQpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbG9uZSBhIHdyYXBwZWQgb2JqZWN0LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gV3JhcHBlZCBjb2xsZWN0aW9uIG9mIGNsb25lZCBub2Rlcy5cbiAqIEBleGFtcGxlXG4gKiAgICAgJChlbGVtZW50KS5jbG9uZSgpO1xuICovXG5cbnZhciBjbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICQkMihfY2xvbmUodGhpcykpO1xufTtcblxuLyoqXG4gKiBDbG9uZSBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fEFycmF5fSBlbGVtZW50IFRoZSBlbGVtZW50KHMpIHRvIGNsb25lLlxuICogQHJldHVybiB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8QXJyYXl9IFRoZSBjbG9uZWQgZWxlbWVudChzKVxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgX2Nsb25lID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlbGVtZW50O1xuICB9IGVsc2UgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpO1xuICB9IGVsc2UgaWYgKCdsZW5ndGgnIGluIGVsZW1lbnQpIHtcbiAgICByZXR1cm4gW10ubWFwLmNhbGwoZWxlbWVudCwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICByZXR1cm4gZWwuY2xvbmVOb2RlKHRydWUpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBlbGVtZW50O1xufTtcblxuLyoqXG4gKiBTcGVjaWFsaXplZCBpdGVyYXRpb24sIGFwcGx5aW5nIGBmbmAgaW4gcmV2ZXJzZWQgbWFubmVyIHRvIGEgY2xvbmUgb2YgZWFjaCBlbGVtZW50LCBidXQgdGhlIHByb3ZpZGVkIG9uZS5cbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBfZWFjaCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmbiwgZWxlbWVudCkge1xuICB2YXIgbCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICB3aGlsZSAobC0tKSB7XG4gICAgdmFyIGVsbSA9IGwgPT09IDAgPyBlbGVtZW50IDogX2Nsb25lKGVsZW1lbnQpO1xuICAgIGZuLmNhbGwoY29sbGVjdGlvbltsXSwgZWxtKTtcbiAgfVxufTtcblxudmFyIGRvbSA9IE9iamVjdC5mcmVlemUoe1xuXHRhcHBlbmQ6IGFwcGVuZCxcblx0cHJlcGVuZDogcHJlcGVuZCxcblx0YmVmb3JlOiBiZWZvcmUsXG5cdGFmdGVyOiBhZnRlcixcblx0Y2xvbmU6IGNsb25lLFxuXHRfY2xvbmU6IF9jbG9uZSxcblx0X2VhY2g6IF9lYWNoXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEF0dHJcbiAqL1xuXG4vKipcbiAqIEdldCB0aGUgdmFsdWUgb2YgYW4gYXR0cmlidXRlIGZvciB0aGUgZmlyc3QgZWxlbWVudCwgb3Igc2V0IG9uZSBvciBtb3JlIGF0dHJpYnV0ZXMgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGtleSBUaGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlIHRvIGdldCBvciBzZXQuIE9yIGFuIG9iamVjdCBjb250YWluaW5nIGtleS12YWx1ZSBwYWlycyB0byBzZXQgYXMgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdIFRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlIHRvIHNldC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmF0dHIoJ2F0dHJOYW1lJyk7IC8vIGdldFxuICogICAgICQoJy5pdGVtJykuYXR0cignYXR0ck5hbWUnLCAnYXR0clZhbHVlJyk7IC8vIHNldFxuICogICAgICQoJy5pdGVtJykuYXR0cih7YXR0cjE6ICd2YWx1ZTEnLCAnYXR0ci0yJzogJ3ZhbHVlMid9KTsgLy8gc2V0IG11bHRpcGxlXG4gKi9cblxudmFyIGF0dHIgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgcmV0dXJuIGVsZW1lbnQgPyBlbGVtZW50LmdldEF0dHJpYnV0ZShrZXkpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIF9hdHRyIGluIGtleSkge1xuICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShfYXR0ciwga2V5W19hdHRyXSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhdHRyaWJ1dGUgZnJvbSBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBBdHRyaWJ1dGUgbmFtZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnJlbW92ZUF0dHIoJ2F0dHJOYW1lJyk7XG4gKi9cblxudmFyIHJlbW92ZUF0dHIgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gIH0pO1xufTtcblxudmFyIGRvbV9hdHRyID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGF0dHI6IGF0dHIsXG5cdHJlbW92ZUF0dHI6IHJlbW92ZUF0dHJcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgQ2xhc3NcbiAqL1xuXG4vKipcbiAqIEFkZCBhIGNsYXNzIHRvIHRoZSBlbGVtZW50KHMpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFNwYWNlLXNlcGFyYXRlZCBjbGFzcyBuYW1lKHMpIHRvIGFkZCB0byB0aGUgZWxlbWVudChzKS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmFkZENsYXNzKCdiYXInKTtcbiAqICAgICAkKCcuaXRlbScpLmFkZENsYXNzKCdiYXIgZm9vJyk7XG4gKi9cblxudmFyIGFkZENsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHtcbiAgICBlYWNoKHZhbHVlLnNwbGl0KCcgJyksIF9lYWNoJDEuYmluZCh0aGlzLCAnYWRkJykpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYSBjbGFzcyBmcm9tIHRoZSBlbGVtZW50KHMpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIFNwYWNlLXNlcGFyYXRlZCBjbGFzcyBuYW1lKHMpIHRvIHJlbW92ZSBmcm9tIHRoZSBlbGVtZW50KHMpLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnJlbW92ZUNsYXNzKCdiYXInKTtcbiAqICAgICAkKCcuaXRlbXMnKS5yZW1vdmVDbGFzcygnYmFyIGZvbycpO1xuICovXG5cbnZhciByZW1vdmVDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgZWFjaCh2YWx1ZS5zcGxpdCgnICcpLCBfZWFjaCQxLmJpbmQodGhpcywgJ3JlbW92ZScpKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG9nZ2xlIGEgY2xhc3MgYXQgdGhlIGVsZW1lbnQocylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgU3BhY2Utc2VwYXJhdGVkIGNsYXNzIG5hbWUocykgdG8gdG9nZ2xlIGF0IHRoZSBlbGVtZW50KHMpLlxuICogQHBhcmFtIHtCb29sZWFufSBbc3RhdGVdIEEgQm9vbGVhbiB2YWx1ZSB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgY2xhc3Mgc2hvdWxkIGJlIGFkZGVkIG9yIHJlbW92ZWQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS50b2dnbGVDbGFzcygnYmFyJyk7XG4gKiAgICAgJCgnLml0ZW0nKS50b2dnbGVDbGFzcygnYmFyIGZvbycpO1xuICogICAgICQoJy5pdGVtJykudG9nZ2xlQ2xhc3MoJ2JhcicsIHRydWUpO1xuICovXG5cbnZhciB0b2dnbGVDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhdGUpIHtcbiAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgIHZhciBhY3Rpb24gPSB0eXBlb2Ygc3RhdGUgPT09ICdib29sZWFuJyA/IHN0YXRlID8gJ2FkZCcgOiAncmVtb3ZlJyA6ICd0b2dnbGUnO1xuICAgIGVhY2godmFsdWUuc3BsaXQoJyAnKSwgX2VhY2gkMS5iaW5kKHRoaXMsIGFjdGlvbikpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZWxlbWVudChzKSBoYXZlIGEgY2xhc3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlIENoZWNrIGlmIHRoZSBET00gZWxlbWVudCBjb250YWlucyB0aGUgY2xhc3MgbmFtZS4gV2hlbiBhcHBsaWVkIHRvIG11bHRpcGxlIGVsZW1lbnRzLFxuICogcmV0dXJucyBgdHJ1ZWAgaWYgX2FueV8gb2YgdGhlbSBjb250YWlucyB0aGUgY2xhc3MgbmFtZS5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgdGhlIGVsZW1lbnQncyBjbGFzcyBhdHRyaWJ1dGUgY29udGFpbnMgdGhlIGNsYXNzIG5hbWUuXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuaGFzQ2xhc3MoJ2JhcicpO1xuICovXG5cbnZhciBoYXNDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gKHRoaXMubm9kZVR5cGUgPyBbdGhpc10gOiB0aGlzKS5zb21lKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHZhbHVlKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNwZWNpYWxpemVkIGl0ZXJhdGlvbiwgYXBwbHlpbmcgYGZuYCBvZiB0aGUgY2xhc3NMaXN0IEFQSSB0byBlYWNoIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZuTmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZVxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgX2VhY2gkMSA9IGZ1bmN0aW9uIChmbk5hbWUsIGNsYXNzTmFtZSkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdFtmbk5hbWVdKGNsYXNzTmFtZSk7XG4gIH0pO1xufTtcblxudmFyIGRvbV9jbGFzcyA9IE9iamVjdC5mcmVlemUoe1xuXHRhZGRDbGFzczogYWRkQ2xhc3MsXG5cdHJlbW92ZUNsYXNzOiByZW1vdmVDbGFzcyxcblx0dG9nZ2xlQ2xhc3M6IHRvZ2dsZUNsYXNzLFxuXHRoYXNDbGFzczogaGFzQ2xhc3Ncbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgY29udGFpbnNcbiAqL1xuXG4vKipcbiAqIFRlc3Qgd2hldGhlciBhbiBlbGVtZW50IGNvbnRhaW5zIGFub3RoZXIgZWxlbWVudCBpbiB0aGUgRE9NLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gY29udGFpbmVyIFRoZSBlbGVtZW50IHRoYXQgbWF5IGNvbnRhaW4gdGhlIG90aGVyIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdGhhdCBtYXkgYmUgYSBkZXNjZW5kYW50IG9mIHRoZSBvdGhlciBlbGVtZW50LlxuICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciB0aGUgYGNvbnRhaW5lcmAgZWxlbWVudCBjb250YWlucyB0aGUgYGVsZW1lbnRgLlxuICogQGV4YW1wbGVcbiAqICAgICAkLmNvbnRhaW5zKHBhcmVudEVsZW1lbnQsIGNoaWxkRWxlbWVudCk7XG4gKiAgICAgLy8gdHJ1ZS9mYWxzZVxuICovXG5cbnZhciBjb250YWlucyA9IGZ1bmN0aW9uIChjb250YWluZXIsIGVsZW1lbnQpIHtcbiAgaWYgKCFjb250YWluZXIgfHwgIWVsZW1lbnQgfHwgY29udGFpbmVyID09PSBlbGVtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2UgaWYgKGNvbnRhaW5lci5jb250YWlucykge1xuICAgIHJldHVybiBjb250YWluZXIuY29udGFpbnMoZWxlbWVudCk7XG4gIH0gZWxzZSBpZiAoY29udGFpbmVyLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuICEoY29udGFpbmVyLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGVsZW1lbnQpICYgTm9kZS5ET0NVTUVOVF9QT1NJVElPTl9ESVNDT05ORUNURUQpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbnZhciBkb21fY29udGFpbnMgPSBPYmplY3QuZnJlZXplKHtcblx0Y29udGFpbnM6IGNvbnRhaW5zXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIERhdGFcbiAqL1xuXG52YXIgaXNTdXBwb3J0c0RhdGFTZXQgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmICdkYXRhc2V0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG52YXIgREFUQUtFWVBST1AgPSBpc1N1cHBvcnRzRGF0YVNldCA/ICdkYXRhc2V0JyA6ICdfX0RPTVRBU1RJQ19EQVRBX18nO1xuXG4vKipcbiAqIEdldCBkYXRhIGZyb20gZmlyc3QgZWxlbWVudCwgb3Igc2V0IGRhdGEgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBrZXkgZm9yIHRoZSBkYXRhIHRvIGdldCBvciBzZXQuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgZGF0YSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5kYXRhKCdhdHRyTmFtZScpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLmRhdGEoJ2F0dHJOYW1lJywge2FueTogJ2RhdGEnfSk7IC8vIHNldFxuICovXG5cbnZhciBkYXRhID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgIHJldHVybiBlbGVtZW50ICYmIERBVEFLRVlQUk9QIGluIGVsZW1lbnQgPyBlbGVtZW50W0RBVEFLRVlQUk9QXVtrZXldIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoIWlzU3VwcG9ydHNEYXRhU2V0KSB7XG4gICAgICBlbGVtZW50W0RBVEFLRVlQUk9QXSA9IGVsZW1lbnRbREFUQUtFWVBST1BdIHx8IHt9O1xuICAgIH1cbiAgICBlbGVtZW50W0RBVEFLRVlQUk9QXVtrZXldID0gdmFsdWU7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBHZXQgcHJvcGVydHkgZnJvbSBmaXJzdCBlbGVtZW50LCBvciBzZXQgcHJvcGVydHkgb24gZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGdldCBvciBzZXQuXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXSBUaGUgdmFsdWUgb2YgdGhlIHByb3BlcnR5IHRvIHNldC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnByb3AoJ2F0dHJOYW1lJyk7IC8vIGdldFxuICogICAgICQoJy5pdGVtJykucHJvcCgnYXR0ck5hbWUnLCAnYXR0clZhbHVlJyk7IC8vIHNldFxuICovXG5cbnZhciBwcm9wID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgIHJldHVybiBlbGVtZW50ICYmIGVsZW1lbnQgPyBlbGVtZW50W2tleV0gOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG59O1xuXG52YXIgZG9tX2RhdGEgPSBPYmplY3QuZnJlZXplKHtcblx0ZGF0YTogZGF0YSxcblx0cHJvcDogcHJvcFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBET00gKGV4dHJhKVxuICovXG5cbi8qKlxuICogQXBwZW5kIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnQocykuXG4gKlxuICogQHBhcmFtIHtOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIGFwcGVuZCB0aGUgZWxlbWVudChzKSB0by4gQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmFwcGVuZFRvKGNvbnRhaW5lcik7XG4gKi9cblxudmFyIGFwcGVuZFRvID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIGNvbnRleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycgPyAkJDIoZWxlbWVudCkgOiBlbGVtZW50O1xuICBhcHBlbmQuY2FsbChjb250ZXh0LCB0aGlzKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKlxuICogRW1wdHkgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmVtcHR5KCk7XG4gKi9cblxudmFyIGVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICB9KTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBjb2xsZWN0aW9uIGZyb20gdGhlIERPTS5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgY29udGFpbmluZyB0aGUgcmVtb3ZlZCBlbGVtZW50c1xuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnJlbW92ZSgpO1xuICovXG5cbnZhciByZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vKipcbiAqIFJlcGxhY2UgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIG5ldyBjb250ZW50LCBhbmQgcmV0dXJuIHRoZSBhcnJheSBvZiBlbGVtZW50cyB0aGF0IHdlcmUgcmVwbGFjZWQuXG4gKlxuICogQHJldHVybiB7QXJyYXl9IEFycmF5IGNvbnRhaW5pbmcgdGhlIHJlcGxhY2VkIGVsZW1lbnRzXG4gKi9cblxudmFyIHJlcGxhY2VXaXRoID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gYmVmb3JlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykucmVtb3ZlKCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgYHRleHRDb250ZW50YCBmcm9tIHRoZSBmaXJzdCwgb3Igc2V0IHRoZSBgdGV4dENvbnRlbnRgIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykudGV4dCgnTmV3IGNvbnRlbnQnKTtcbiAqL1xuXG52YXIgdGV4dCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0udGV4dENvbnRlbnQ7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LnRleHRDb250ZW50ID0gJycgKyB2YWx1ZTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgYHZhbHVlYCBmcm9tIHRoZSBmaXJzdCwgb3Igc2V0IHRoZSBgdmFsdWVgIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3ZhbHVlXVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJ2lucHV0LmZpcnN0TmFtZScpLnZhbCgnTmV3IHZhbHVlJyk7XG4gKi9cblxudmFyIHZhbCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRoaXNbMF0udmFsdWU7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LnZhbHVlID0gdmFsdWU7XG4gIH0pO1xufTtcblxudmFyIGRvbV9leHRyYSA9IE9iamVjdC5mcmVlemUoe1xuXHRhcHBlbmRUbzogYXBwZW5kVG8sXG5cdGVtcHR5OiBlbXB0eSxcblx0cmVtb3ZlOiByZW1vdmUsXG5cdHJlcGxhY2VXaXRoOiByZXBsYWNlV2l0aCxcblx0dGV4dDogdGV4dCxcblx0dmFsOiB2YWxcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgSFRNTFxuICovXG5cbi8qXG4gKiBHZXQgdGhlIEhUTUwgY29udGVudHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQsIG9yIHNldCB0aGUgSFRNTCBjb250ZW50cyBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZnJhZ21lbnRdIEhUTUwgZnJhZ21lbnQgdG8gc2V0IGZvciB0aGUgZWxlbWVudC4gSWYgdGhpcyBhcmd1bWVudCBpcyBvbWl0dGVkLCB0aGUgSFRNTCBjb250ZW50cyBhcmUgcmV0dXJuZWQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5odG1sKCk7XG4gKiAgICAgJCgnLml0ZW0nKS5odG1sKCc8c3Bhbj5tb3JlPC9zcGFuPicpO1xuICovXG5cbnZhciBodG1sID0gZnVuY3Rpb24gKGZyYWdtZW50KSB7XG5cbiAgaWYgKHR5cGVvZiBmcmFnbWVudCAhPT0gJ3N0cmluZycpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCA/IGVsZW1lbnQuaW5uZXJIVE1MIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5pbm5lckhUTUwgPSBmcmFnbWVudDtcbiAgfSk7XG59O1xuXG52YXIgZG9tX2h0bWwgPSBPYmplY3QuZnJlZXplKHtcblx0aHRtbDogaHRtbFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBjbG9zZXN0XG4gKi9cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGNsb3Nlc3QgZWxlbWVudCBtYXRjaGluZyB0aGUgc2VsZWN0b3IgKHN0YXJ0aW5nIGJ5IGl0c2VsZikgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgRmlsdGVyXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdIElmIHByb3ZpZGVkLCBtYXRjaGluZyBlbGVtZW50cyBtdXN0IGJlIGEgZGVzY2VuZGFudCBvZiB0aGlzIGVsZW1lbnRcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvbiAoY29udGFpbmluZyB6ZXJvIG9yIG9uZSBlbGVtZW50KVxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5jbG9zZXN0KCcuY29udGFpbmVyJyk7XG4gKi9cblxudmFyIGNsb3Nlc3QgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGNsb3Nlc3QgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSBjb250ZXh0KSB7XG4gICAgICAgIGlmIChtYXRjaGVzKG5vZGUsIHNlbGVjdG9yKSkge1xuICAgICAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gJCQyKHVuaXEobm9kZXMpKTtcbiAgfTtcblxuICByZXR1cm4gdHlwZW9mIEVsZW1lbnQgPT09ICd1bmRlZmluZWQnIHx8ICFFbGVtZW50LnByb3RvdHlwZS5jbG9zZXN0ID8gY2xvc2VzdCA6IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgdmFyIG5vZGVzID0gW107XG4gICAgICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHZhciBuID0gbm9kZS5jbG9zZXN0KHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG4pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiAkJDIodW5pcShub2RlcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2xvc2VzdC5jYWxsKHRoaXMsIHNlbGVjdG9yLCBjb250ZXh0KTtcbiAgICB9XG4gIH07XG59KCk7XG5cbnZhciBzZWxlY3Rvcl9jbG9zZXN0ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGNsb3Nlc3Q6IGNsb3Nlc3Rcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgRXZlbnRzXG4gKi9cblxuLyoqXG4gKiBTaG9ydGhhbmQgZm9yIGBhZGRFdmVudExpc3RlbmVyYC4gU3VwcG9ydHMgZXZlbnQgZGVsZWdhdGlvbiBpZiBhIGZpbHRlciAoYHNlbGVjdG9yYCkgaXMgcHJvdmlkZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZXMgTGlzdCBvZiBzcGFjZS1zZXBhcmF0ZWQgZXZlbnQgdHlwZXMgdG8gYmUgYWRkZWQgdG8gdGhlIGVsZW1lbnQocylcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIFNlbGVjdG9yIHRvIGZpbHRlciBkZXNjZW5kYW50cyB0aGF0IGRlbGVnYXRlIHRoZSBldmVudCB0byB0aGlzIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIEV2ZW50IGhhbmRsZXJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdXNlQ2FwdHVyZT1mYWxzZVxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlPWZhbHNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5vbignY2xpY2snLCBjYWxsYmFjayk7XG4gKiAgICAgJCgnLmNvbnRhaW5lcicpLm9uKCdjbGljayBmb2N1cycsICcuaXRlbScsIGhhbmRsZXIpO1xuICovXG5cbnZhciBvbiA9IGZ1bmN0aW9uIChldmVudE5hbWVzLCBzZWxlY3RvciwgaGFuZGxlciwgdXNlQ2FwdHVyZSwgb25jZSkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBoYW5kbGVyID0gc2VsZWN0b3I7XG4gICAgc2VsZWN0b3IgPSBudWxsO1xuICB9XG5cbiAgdmFyIHBhcnRzID0gdm9pZCAwLFxuICAgICAgbmFtZXNwYWNlID0gdm9pZCAwLFxuICAgICAgZXZlbnRMaXN0ZW5lciA9IHZvaWQgMDtcblxuICBldmVudE5hbWVzLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG5cbiAgICBwYXJ0cyA9IGV2ZW50TmFtZS5zcGxpdCgnLicpO1xuICAgIGV2ZW50TmFtZSA9IHBhcnRzWzBdIHx8IG51bGw7XG4gICAgbmFtZXNwYWNlID0gcGFydHNbMV0gfHwgbnVsbDtcblxuICAgIGV2ZW50TGlzdGVuZXIgPSBwcm94eUhhbmRsZXIoaGFuZGxlcik7XG5cbiAgICBlYWNoKF90aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgZXZlbnRMaXN0ZW5lciA9IGRlbGVnYXRlSGFuZGxlci5iaW5kKGVsZW1lbnQsIHNlbGVjdG9yLCBldmVudExpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gZXZlbnRMaXN0ZW5lcjtcbiAgICAgICAgZXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIG9mZi5jYWxsKGVsZW1lbnQsIGV2ZW50TmFtZXMsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlKTtcbiAgICAgICAgICBsaXN0ZW5lci5jYWxsKGVsZW1lbnQsIGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lciwgdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG5cbiAgICAgIGdldEhhbmRsZXJzKGVsZW1lbnQpLnB1c2goe1xuICAgICAgICBldmVudE5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgZXZlbnRMaXN0ZW5lcjogZXZlbnRMaXN0ZW5lcixcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sIHRoaXMpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTaG9ydGhhbmQgZm9yIGByZW1vdmVFdmVudExpc3RlbmVyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lcyBMaXN0IG9mIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyB0byBiZSByZW1vdmVkIGZyb20gdGhlIGVsZW1lbnQocylcbiAqIEBwYXJhbSB7U3RyaW5nfSBbc2VsZWN0b3JdIFNlbGVjdG9yIHRvIGZpbHRlciBkZXNjZW5kYW50cyB0aGF0IHVuZGVsZWdhdGUgdGhlIGV2ZW50IHRvIHRoaXMgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgRXZlbnQgaGFuZGxlclxuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlPWZhbHNlXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5vZmYoJ2NsaWNrJywgY2FsbGJhY2spO1xuICogICAgICQoJyNteS1lbGVtZW50Jykub2ZmKCdteUV2ZW50IG15T3RoZXJFdmVudCcpO1xuICogICAgICQoJy5pdGVtJykub2ZmKCk7XG4gKi9cblxudmFyIG9mZiA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV2ZW50TmFtZXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6ICcnO1xuICB2YXIgc2VsZWN0b3IgPSBhcmd1bWVudHNbMV07XG5cbiAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgdmFyIGhhbmRsZXIgPSBhcmd1bWVudHNbMl07XG4gIHZhciB1c2VDYXB0dXJlID0gYXJndW1lbnRzWzNdO1xuXG5cbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICB2YXIgcGFydHMgPSB2b2lkIDAsXG4gICAgICBuYW1lc3BhY2UgPSB2b2lkIDAsXG4gICAgICBoYW5kbGVycyA9IHZvaWQgMDtcblxuICBldmVudE5hbWVzLnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG5cbiAgICBwYXJ0cyA9IGV2ZW50TmFtZS5zcGxpdCgnLicpO1xuICAgIGV2ZW50TmFtZSA9IHBhcnRzWzBdIHx8IG51bGw7XG4gICAgbmFtZXNwYWNlID0gcGFydHNbMV0gfHwgbnVsbDtcblxuICAgIHJldHVybiBlYWNoKF90aGlzMiwgZnVuY3Rpb24gKGVsZW1lbnQpIHtcblxuICAgICAgaGFuZGxlcnMgPSBnZXRIYW5kbGVycyhlbGVtZW50KTtcblxuICAgICAgZWFjaChoYW5kbGVycy5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuICghZXZlbnROYW1lIHx8IGl0ZW0uZXZlbnROYW1lID09PSBldmVudE5hbWUpICYmICghbmFtZXNwYWNlIHx8IGl0ZW0ubmFtZXNwYWNlID09PSBuYW1lc3BhY2UpICYmICghaGFuZGxlciB8fCBpdGVtLmhhbmRsZXIgPT09IGhhbmRsZXIpICYmICghc2VsZWN0b3IgfHwgaXRlbS5zZWxlY3RvciA9PT0gc2VsZWN0b3IpO1xuICAgICAgfSksIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihpdGVtLmV2ZW50TmFtZSwgaXRlbS5ldmVudExpc3RlbmVyLCB1c2VDYXB0dXJlIHx8IGZhbHNlKTtcbiAgICAgICAgaGFuZGxlcnMuc3BsaWNlKGhhbmRsZXJzLmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmICghZXZlbnROYW1lICYmICFuYW1lc3BhY2UgJiYgIXNlbGVjdG9yICYmICFoYW5kbGVyKSB7XG4gICAgICAgIGNsZWFySGFuZGxlcnMoZWxlbWVudCk7XG4gICAgICB9IGVsc2UgaWYgKGhhbmRsZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBjbGVhckhhbmRsZXJzKGVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGV2ZW50IGxpc3RlbmVyIGFuZCBleGVjdXRlIHRoZSBoYW5kbGVyIGF0IG1vc3Qgb25jZSBwZXIgZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0gZXZlbnROYW1lc1xuICogQHBhcmFtIHNlbGVjdG9yXG4gKiBAcGFyYW0gaGFuZGxlclxuICogQHBhcmFtIHVzZUNhcHR1cmVcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLm9uZSgnY2xpY2snLCBjYWxsYmFjayk7XG4gKi9cblxudmFyIG9uZSA9IGZ1bmN0aW9uIChldmVudE5hbWVzLCBzZWxlY3RvciwgaGFuZGxlciwgdXNlQ2FwdHVyZSkge1xuICByZXR1cm4gb24uY2FsbCh0aGlzLCBldmVudE5hbWVzLCBzZWxlY3RvciwgaGFuZGxlciwgdXNlQ2FwdHVyZSwgMSk7XG59O1xuXG4vKipcbiAqIEdldCBldmVudCBoYW5kbGVycyBmcm9tIGFuIGVsZW1lbnRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG52YXIgZXZlbnRLZXlQcm9wID0gJ19fZG9tdGFzdGljX2V2ZW50X18nO1xudmFyIGlkID0gMTtcbnZhciBoYW5kbGVycyA9IHt9O1xudmFyIHVudXNlZEtleXMgPSBbXTtcblxudmFyIGdldEhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50W2V2ZW50S2V5UHJvcF0pIHtcbiAgICBlbGVtZW50W2V2ZW50S2V5UHJvcF0gPSB1bnVzZWRLZXlzLmxlbmd0aCA9PT0gMCA/ICsraWQgOiB1bnVzZWRLZXlzLnBvcCgpO1xuICB9XG4gIHZhciBrZXkgPSBlbGVtZW50W2V2ZW50S2V5UHJvcF07XG4gIHJldHVybiBoYW5kbGVyc1trZXldIHx8IChoYW5kbGVyc1trZXldID0gW10pO1xufTtcblxuLyoqXG4gKiBDbGVhciBldmVudCBoYW5kbGVycyBmb3IgYW4gZWxlbWVudFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqL1xuXG52YXIgY2xlYXJIYW5kbGVycyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIHZhciBrZXkgPSBlbGVtZW50W2V2ZW50S2V5UHJvcF07XG4gIGlmIChoYW5kbGVyc1trZXldKSB7XG4gICAgaGFuZGxlcnNba2V5XSA9IG51bGw7XG4gICAgZWxlbWVudFtldmVudEtleVByb3BdID0gbnVsbDtcbiAgICB1bnVzZWRLZXlzLnB1c2goa2V5KTtcbiAgfVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBjcmVhdGUgYSBoYW5kbGVyIHRoYXQgYXVnbWVudHMgdGhlIGV2ZW50IG9iamVjdCB3aXRoIHNvbWUgZXh0cmEgbWV0aG9kcyxcbiAqIGFuZCBleGVjdXRlcyB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgZXZlbnQgYW5kIHRoZSBldmVudCBkYXRhIChpLmUuIGBldmVudC5kZXRhaWxgKS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIGhhbmRsZXIgQ2FsbGJhY2sgdG8gZXhlY3V0ZSBhcyBgaGFuZGxlcihldmVudCwgZGF0YSlgXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG52YXIgcHJveHlIYW5kbGVyID0gZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHJldHVybiBoYW5kbGVyLmNhbGwodGhpcywgYXVnbWVudEV2ZW50KGV2ZW50KSk7XG4gIH07XG59O1xuXG52YXIgZXZlbnRNZXRob2RzID0ge1xuICBwcmV2ZW50RGVmYXVsdDogJ2lzRGVmYXVsdFByZXZlbnRlZCcsXG4gIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbjogJ2lzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkJyxcbiAgc3RvcFByb3BhZ2F0aW9uOiAnaXNQcm9wYWdhdGlvblN0b3BwZWQnXG59O1xudmFyIHJldHVyblRydWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciByZXR1cm5GYWxzZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBBdHRlbXB0IHRvIGF1Z21lbnQgZXZlbnRzIGFuZCBpbXBsZW1lbnQgc29tZXRoaW5nIGNsb3NlciB0byBET00gTGV2ZWwgMyBFdmVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxudmFyIGF1Z21lbnRFdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICBpZiAoIWV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCB8fCBldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gfHwgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKSB7XG4gICAgZm9yICh2YXIgbWV0aG9kTmFtZSBpbiBldmVudE1ldGhvZHMpIHtcbiAgICAgIChmdW5jdGlvbiAobWV0aG9kTmFtZSwgdGVzdE1ldGhvZE5hbWUsIG9yaWdpbmFsTWV0aG9kKSB7XG4gICAgICAgIGV2ZW50W21ldGhvZE5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRoaXNbdGVzdE1ldGhvZE5hbWVdID0gcmV0dXJuVHJ1ZTtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxNZXRob2QgJiYgb3JpZ2luYWxNZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgZXZlbnRbdGVzdE1ldGhvZE5hbWVdID0gcmV0dXJuRmFsc2U7XG4gICAgICB9KShtZXRob2ROYW1lLCBldmVudE1ldGhvZHNbbWV0aG9kTmFtZV0sIGV2ZW50W21ldGhvZE5hbWVdKTtcbiAgICB9XG4gICAgaWYgKGV2ZW50Ll9wcmV2ZW50RGVmYXVsdCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGV2ZW50O1xufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byB0ZXN0IHdoZXRoZXIgZGVsZWdhdGVkIGV2ZW50cyBtYXRjaCB0aGUgcHJvdmlkZWQgYHNlbGVjdG9yYCAoZmlsdGVyKSxcbiAqIGlmIHRoZSBldmVudCBwcm9wYWdhdGlvbiB3YXMgc3RvcHBlZCwgYW5kIHRoZW4gYWN0dWFsbHkgY2FsbCB0aGUgcHJvdmlkZWQgZXZlbnQgaGFuZGxlci5cbiAqIFVzZSBgdGhpc2AgaW5zdGVhZCBvZiBgZXZlbnQuY3VycmVudFRhcmdldGAgb24gdGhlIGV2ZW50IG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFNlbGVjdG9yIHRvIGZpbHRlciBkZXNjZW5kYW50cyB0aGF0IHVuZGVsZWdhdGUgdGhlIGV2ZW50IHRvIHRoaXMgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgRXZlbnQgaGFuZGxlclxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuXG52YXIgZGVsZWdhdGVIYW5kbGVyID0gZnVuY3Rpb24gKHNlbGVjdG9yLCBoYW5kbGVyLCBldmVudCkge1xuICB2YXIgZXZlbnRUYXJnZXQgPSBldmVudC5fdGFyZ2V0IHx8IGV2ZW50LnRhcmdldDtcbiAgdmFyIGN1cnJlbnRUYXJnZXQgPSBjbG9zZXN0LmNhbGwoW2V2ZW50VGFyZ2V0XSwgc2VsZWN0b3IsIHRoaXMpWzBdO1xuICBpZiAoY3VycmVudFRhcmdldCAmJiBjdXJyZW50VGFyZ2V0ICE9PSB0aGlzKSB7XG4gICAgaWYgKGN1cnJlbnRUYXJnZXQgPT09IGV2ZW50VGFyZ2V0IHx8ICEoZXZlbnQuaXNQcm9wYWdhdGlvblN0b3BwZWQgJiYgZXZlbnQuaXNQcm9wYWdhdGlvblN0b3BwZWQoKSkpIHtcbiAgICAgIGhhbmRsZXIuY2FsbChjdXJyZW50VGFyZ2V0LCBldmVudCk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgYmluZCA9IG9uO1xudmFyIHVuYmluZCA9IG9mZjtcblxudmFyIGV2ZW50ID0gT2JqZWN0LmZyZWV6ZSh7XG5cdG9uOiBvbixcblx0b2ZmOiBvZmYsXG5cdG9uZTogb25lLFxuXHRnZXRIYW5kbGVyczogZ2V0SGFuZGxlcnMsXG5cdGNsZWFySGFuZGxlcnM6IGNsZWFySGFuZGxlcnMsXG5cdHByb3h5SGFuZGxlcjogcHJveHlIYW5kbGVyLFxuXHRkZWxlZ2F0ZUhhbmRsZXI6IGRlbGVnYXRlSGFuZGxlcixcblx0YmluZDogYmluZCxcblx0dW5iaW5kOiB1bmJpbmRcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgdHJpZ2dlclxuICovXG5cbnZhciByZU1vdXNlRXZlbnQgPSAvXig/Om1vdXNlfHBvaW50ZXJ8Y29udGV4dG1lbnUpfGNsaWNrLztcbnZhciByZUtleUV2ZW50ID0gL15rZXkvO1xuXG4vKipcbiAqIFRyaWdnZXIgZXZlbnQgYXQgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgb2YgdGhlIGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSBEYXRhIHRvIGJlIHNlbnQgd2l0aCB0aGUgZXZlbnQgKGBwYXJhbXMuZGV0YWlsYCB3aWxsIGJlIHNldCB0byB0aGlzKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcGFyYW1zXSBFdmVudCBwYXJhbWV0ZXJzIChvcHRpb25hbClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcGFyYW1zLmJ1YmJsZXM9dHJ1ZSBEb2VzIHRoZSBldmVudCBidWJibGUgdXAgdGhyb3VnaCB0aGUgRE9NIG9yIG5vdC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcGFyYW1zLmNhbmNlbGFibGU9dHJ1ZSBJcyB0aGUgZXZlbnQgY2FuY2VsYWJsZSBvciBub3QuXG4gKiBAcGFyYW0ge01peGVkfSBwYXJhbXMuZGV0YWlsPXVuZGVmaW5lZCBBZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBldmVudC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnRyaWdnZXIoJ2FueUV2ZW50VHlwZScpO1xuICovXG5cbnZhciB0cmlnZ2VyID0gZnVuY3Rpb24gKHR5cGUsIGRhdGEpIHtcbiAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IHt9LFxuICAgICAgX3JlZiRidWJibGVzID0gX3JlZi5idWJibGVzLFxuICAgICAgYnViYmxlcyA9IF9yZWYkYnViYmxlcyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9yZWYkYnViYmxlcyxcbiAgICAgIF9yZWYkY2FuY2VsYWJsZSA9IF9yZWYuY2FuY2VsYWJsZSxcbiAgICAgIGNhbmNlbGFibGUgPSBfcmVmJGNhbmNlbGFibGUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfcmVmJGNhbmNlbGFibGUsXG4gICAgICBfcmVmJHByZXZlbnREZWZhdWx0ID0gX3JlZi5wcmV2ZW50RGVmYXVsdCxcbiAgICAgIHByZXZlbnREZWZhdWx0ID0gX3JlZiRwcmV2ZW50RGVmYXVsdCA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfcmVmJHByZXZlbnREZWZhdWx0O1xuXG4gIHZhciBFdmVudENvbnN0cnVjdG9yID0gZ2V0RXZlbnRDb25zdHJ1Y3Rvcih0eXBlKTtcbiAgdmFyIGV2ZW50ID0gbmV3IEV2ZW50Q29uc3RydWN0b3IodHlwZSwge1xuICAgIGJ1YmJsZXM6IGJ1YmJsZXMsXG4gICAgY2FuY2VsYWJsZTogY2FuY2VsYWJsZSxcbiAgICBwcmV2ZW50RGVmYXVsdDogcHJldmVudERlZmF1bHQsXG4gICAgZGV0YWlsOiBkYXRhXG4gIH0pO1xuXG4gIGV2ZW50Ll9wcmV2ZW50RGVmYXVsdCA9IHByZXZlbnREZWZhdWx0O1xuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKCFidWJibGVzIHx8IGlzRXZlbnRCdWJibGluZ0luRGV0YWNoZWRUcmVlIHx8IGlzQXR0YWNoZWRUb0RvY3VtZW50KGVsZW1lbnQpKSB7XG4gICAgICBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIGV2ZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJpZ2dlckZvclBhdGgoZWxlbWVudCwgdHlwZSwge1xuICAgICAgICBidWJibGVzOiBidWJibGVzLFxuICAgICAgICBjYW5jZWxhYmxlOiBjYW5jZWxhYmxlLFxuICAgICAgICBwcmV2ZW50RGVmYXVsdDogcHJldmVudERlZmF1bHQsXG4gICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbnZhciBnZXRFdmVudENvbnN0cnVjdG9yID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgcmV0dXJuIHN1cHBvcnRzT3RoZXJFdmVudENvbnN0cnVjdG9ycyA/IHJlTW91c2VFdmVudC50ZXN0KHR5cGUpID8gTW91c2VFdmVudCA6IHJlS2V5RXZlbnQudGVzdCh0eXBlKSA/IEtleWJvYXJkRXZlbnQgOiBDdXN0b21FdmVudCA6IEN1c3RvbUV2ZW50O1xufTtcblxuLyoqXG4gKiBUcmlnZ2VyIGV2ZW50IGF0IGZpcnN0IGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uIFNpbWlsYXIgdG8gYHRyaWdnZXIoKWAsIGV4Y2VwdDpcbiAqXG4gKiAtIEV2ZW50IGRvZXMgbm90IGJ1YmJsZVxuICogLSBEZWZhdWx0IGV2ZW50IGJlaGF2aW9yIGlzIHByZXZlbnRlZFxuICogLSBPbmx5IHRyaWdnZXJzIGhhbmRsZXIgZm9yIGZpcnN0IG1hdGNoaW5nIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHRoZSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgRGF0YSB0byBiZSBzZW50IHdpdGggdGhlIGV2ZW50XG4gKiBAZXhhbXBsZVxuICogICAgICQoJ2Zvcm0nKS50cmlnZ2VySGFuZGxlcignc3VibWl0Jyk7XG4gKi9cblxudmFyIHRyaWdnZXJIYW5kbGVyID0gZnVuY3Rpb24gKHR5cGUsIGRhdGEpIHtcbiAgaWYgKHRoaXNbMF0pIHtcbiAgICB0cmlnZ2VyLmNhbGwodGhpc1swXSwgdHlwZSwgZGF0YSwge1xuICAgICAgYnViYmxlczogZmFsc2UsXG4gICAgICBwcmV2ZW50RGVmYXVsdDogdHJ1ZVxuICAgIH0pO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgYXR0YWNoZWQgdG8gb3IgZGV0YWNoZWQgZnJvbSkgdGhlIGRvY3VtZW50XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudCBFbGVtZW50IHRvIHRlc3RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxudmFyIGlzQXR0YWNoZWRUb0RvY3VtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQgPT09IHdpbmRvdyB8fCBlbGVtZW50ID09PSBkb2N1bWVudCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBjb250YWlucyhlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBlbGVtZW50KTtcbn07XG5cbi8qKlxuICogRGlzcGF0Y2ggdGhlIGV2ZW50IGF0IHRoZSBlbGVtZW50IGFuZCBpdHMgYW5jZXN0b3JzLlxuICogUmVxdWlyZWQgdG8gc3VwcG9ydCBkZWxlZ2F0ZWQgZXZlbnRzIGluIGJyb3dzZXJzIHRoYXQgZG9uJ3QgYnViYmxlIGV2ZW50cyBpbiBkZXRhY2hlZCBET00gdHJlZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudCBGaXJzdCBlbGVtZW50IHRvIGRpc3BhdGNoIHRoZSBldmVudCBhdFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbcGFyYW1zXSBFdmVudCBwYXJhbWV0ZXJzIChvcHRpb25hbClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcGFyYW1zLmJ1YmJsZXM9dHJ1ZSBEb2VzIHRoZSBldmVudCBidWJibGUgdXAgdGhyb3VnaCB0aGUgRE9NIG9yIG5vdC5cbiAqIFdpbGwgYmUgc2V0IHRvIGZhbHNlIChidXQgc2hvdWxkbid0IG1hdHRlciBzaW5jZSBldmVudHMgZG9uJ3QgYnViYmxlIGFueXdheSkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHBhcmFtcy5jYW5jZWxhYmxlPXRydWUgSXMgdGhlIGV2ZW50IGNhbmNlbGFibGUgb3Igbm90LlxuICogQHBhcmFtIHtNaXhlZH0gcGFyYW1zLmRldGFpbD11bmRlZmluZWQgQWRkaXRpb25hbCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgZXZlbnQuXG4gKi9cblxudmFyIHRyaWdnZXJGb3JQYXRoID0gZnVuY3Rpb24gKGVsZW1lbnQsIHR5cGUpIHtcbiAgdmFyIHBhcmFtcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgcGFyYW1zLmJ1YmJsZXMgPSBmYWxzZTtcbiAgdmFyIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIGV2ZW50Ll90YXJnZXQgPSBlbGVtZW50O1xuICBkbyB7XG4gICAgZGlzcGF0Y2hFdmVudChlbGVtZW50LCBldmVudCk7XG4gIH0gd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbmQtYXNzaWduXG59O1xuXG4vKipcbiAqIERpc3BhdGNoIGV2ZW50IHRvIGVsZW1lbnQsIGJ1dCBjYWxsIGRpcmVjdCBldmVudCBtZXRob2RzIGluc3RlYWQgaWYgYXZhaWxhYmxlXG4gKiAoZS5nLiBcImJsdXIoKVwiLCBcInN1Ym1pdCgpXCIpIGFuZCBpZiB0aGUgZXZlbnQgaXMgbm9uLWNhbmNlbGFibGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudCBFbGVtZW50IHRvIGRpc3BhdGNoIHRoZSBldmVudCBhdFxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IHRvIGRpc3BhdGNoXG4gKi9cblxudmFyIGRpcmVjdEV2ZW50TWV0aG9kcyA9IFsnYmx1cicsICdmb2N1cycsICdzZWxlY3QnLCAnc3VibWl0J107XG5cbnZhciBkaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGV2ZW50KSB7XG4gIGlmIChkaXJlY3RFdmVudE1ldGhvZHMuaW5kZXhPZihldmVudC50eXBlKSAhPT0gLTEgJiYgdHlwZW9mIGVsZW1lbnRbZXZlbnQudHlwZV0gPT09ICdmdW5jdGlvbicgJiYgIWV2ZW50Ll9wcmV2ZW50RGVmYXVsdCAmJiAhZXZlbnQuY2FuY2VsYWJsZSkge1xuICAgIGVsZW1lbnRbZXZlbnQudHlwZV0oKTtcbiAgfSBlbHNlIHtcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9XG59O1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBDdXN0b21FdmVudCwgYm9ycm93ZWQgZnJvbSBbTUROXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvQ3VzdG9tRXZlbnQjUG9seWZpbGwpLlxuICogTmVlZGVkIHRvIHN1cHBvcnQgSUUgKDksIDEwLCAxMSkgJiBQaGFudG9tSlNcbiAqL1xuXG4oZnVuY3Rpb24gKCkge1xuICB2YXIgQ3VzdG9tRXZlbnQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiB7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgZGV0YWlsOiB1bmRlZmluZWRcbiAgICB9O1xuXG4gICAgdmFyIGN1c3RvbUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgY3VzdG9tRXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUsIHBhcmFtcy5kZXRhaWwpO1xuICAgIHJldHVybiBjdXN0b21FdmVudDtcbiAgfTtcblxuICBDdXN0b21FdmVudC5wcm90b3R5cGUgPSB3aW4uQ3VzdG9tRXZlbnQgJiYgd2luLkN1c3RvbUV2ZW50LnByb3RvdHlwZTtcbiAgd2luLkN1c3RvbUV2ZW50ID0gQ3VzdG9tRXZlbnQ7XG59KSgpO1xuXG4vKlxuICogQXJlIGV2ZW50cyBidWJibGluZyBpbiBkZXRhY2hlZCBET00gdHJlZXM/XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBpc0V2ZW50QnViYmxpbmdJbkRldGFjaGVkVHJlZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGlzQnViYmxpbmcgPSBmYWxzZTtcbiAgdmFyIGRvYyA9IHdpbi5kb2N1bWVudDtcbiAgaWYgKGRvYykge1xuICAgIHZhciBwYXJlbnQgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGNoaWxkID0gcGFyZW50LmNsb25lTm9kZSgpO1xuICAgIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgcGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpc0J1YmJsaW5nID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBjaGlsZC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnZScsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIH1cbiAgcmV0dXJuIGlzQnViYmxpbmc7XG59KCk7XG5cbnZhciBzdXBwb3J0c090aGVyRXZlbnRDb25zdHJ1Y3RvcnMgPSBmdW5jdGlvbiAoKSB7XG4gIHRyeSB7XG4gICAgbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59KCk7XG5cbnZhciBldmVudF90cmlnZ2VyID0gT2JqZWN0LmZyZWV6ZSh7XG5cdHRyaWdnZXI6IHRyaWdnZXIsXG5cdHRyaWdnZXJIYW5kbGVyOiB0cmlnZ2VySGFuZGxlclxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBSZWFkeVxuICovXG5cbi8qKlxuICogRXhlY3V0ZSBjYWxsYmFjayB3aGVuIGBET01Db250ZW50TG9hZGVkYCBmaXJlcyBmb3IgYGRvY3VtZW50YCwgb3IgaW1tZWRpYXRlbHkgaWYgY2FsbGVkIGFmdGVyd2FyZHMuXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgQ2FsbGJhY2sgdG8gZXhlY3V0ZSB3aGVuIGluaXRpYWwgRE9NIGNvbnRlbnQgaXMgbG9hZGVkLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoZG9jdW1lbnQpLnJlYWR5KGNhbGxiYWNrKTtcbiAqL1xuXG52YXIgcmVhZHkgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICBpZiAoL2NvbXBsZXRlfGxvYWRlZHxpbnRlcmFjdGl2ZS8udGVzdChkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gICAgaGFuZGxlcigpO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBoYW5kbGVyLCBmYWxzZSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG52YXIgZXZlbnRfcmVhZHkgPSBPYmplY3QuZnJlZXplKHtcblx0cmVhZHk6IHJlYWR5XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIG5vQ29uZmxpY3RcbiAqL1xuXG4vKlxuICogU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGdsb2JhbCBgJGAgdmFyaWFibGUsIHNvIHRoYXQgaXQgY2FuIGJlIHJlc3RvcmVkIGxhdGVyIG9uLlxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgcHJldmlvdXNMaWIgPSB3aW4uJDtcblxuLyoqXG4gKiBJbiBjYXNlIGFub3RoZXIgbGlicmFyeSBzZXRzIHRoZSBnbG9iYWwgYCRgIHZhcmlhYmxlIGJlZm9yZSBET010YXN0aWMgZG9lcyxcbiAqIHRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIHRvIHJldHVybiB0aGUgZ2xvYmFsIGAkYCB0byB0aGF0IG90aGVyIGxpYnJhcnkuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBSZWZlcmVuY2UgdG8gRE9NdGFzdGljLlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgZG9tdGFzdGljID0gJC5ub0NvbmZsaWN0KCk7XG4gKi9cblxudmFyIG5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHdpbi4kID0gcHJldmlvdXNMaWI7XG4gIHJldHVybiB0aGlzO1xufTtcblxudmFyIG5vY29uZmxpY3QgPSBPYmplY3QuZnJlZXplKHtcblx0bm9Db25mbGljdDogbm9Db25mbGljdFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBTZWxlY3RvciAoZXh0cmEpXG4gKi9cblxuLyoqXG4gKiBSZXR1cm4gY2hpbGRyZW4gb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLCBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl0gRmlsdGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY2hpbGRyZW4oKTtcbiAqICAgICAkKCcuc2VsZWN0b3InKS5jaGlsZHJlbignLmZpbHRlcicpO1xuICovXG5cbnZhciBjaGlsZHJlbiA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICBlYWNoKGVsZW1lbnQuY2hpbGRyZW4sIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICBpZiAoIXNlbGVjdG9yIHx8IHNlbGVjdG9yICYmIG1hdGNoZXMoY2hpbGQsIHNlbGVjdG9yKSkge1xuICAgICAgICAgIG5vZGVzLnB1c2goY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGNoaWxkIG5vZGVzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbiwgaW5jbHVkaW5nIHRleHQgYW5kIGNvbW1lbnQgbm9kZXMuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLmNvbnRlbnRzKCk7XG4gKi9cblxudmFyIGNvbnRlbnRzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBub2Rlcy5wdXNoLmFwcGx5KG5vZGVzLCB0b0FycmF5KGVsZW1lbnQuY2hpbGROb2RlcykpO1xuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhIGNvbGxlY3Rpb24gY29udGFpbmluZyBvbmx5IHRoZSBvbmUgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5lcSgxKVxuICogICAgIC8vIFRoZSBzZWNvbmQgaXRlbTsgcmVzdWx0IGlzIHRoZSBzYW1lIGFzIGRvaW5nICQoJCgnLml0ZW1zJylbMV0pO1xuICovXG5cbnZhciBlcSA9IGZ1bmN0aW9uIChpbmRleCkge1xuICByZXR1cm4gc2xpY2UuY2FsbCh0aGlzLCBpbmRleCwgaW5kZXggKyAxKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgY29sbGVjdGlvbiBjb250YWluaW5nIG9ubHkgdGhlIGZpcnN0IGl0ZW0uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmZpcnN0KClcbiAqICAgICAvLyBUaGUgZmlyc3QgaXRlbTsgcmVzdWx0IGlzIHRoZSBzYW1lIGFzIGRvaW5nICQoJCgnLml0ZW1zJylbMF0pO1xuICovXG5cbnZhciBmaXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHNsaWNlLmNhbGwodGhpcywgMCwgMSk7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgRE9NIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBpbmRleC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEByZXR1cm4ge05vZGV9IEVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBpbmRleFxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5nZXQoMSlcbiAqICAgICAvLyBUaGUgc2Vjb25kIGVsZW1lbnQ7IHJlc3VsdCBpcyB0aGUgc2FtZSBhcyBkb2luZyAkKCcuaXRlbXMnKVsxXTtcbiAqL1xuXG52YXIgZ2V0ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIHJldHVybiB0aGlzW2luZGV4XTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBwYXJlbnQgZWxlbWVudHMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLCBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl0gRmlsdGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykucGFyZW50KCk7XG4gKiAgICAgJCgnLnNlbGVjdG9yJykucGFyZW50KCcuZmlsdGVyJyk7XG4gKi9cblxudmFyIHBhcmVudCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgJiYgbWF0Y2hlcyhlbGVtZW50LnBhcmVudE5vZGUsIHNlbGVjdG9yKSkge1xuICAgICAgbm9kZXMucHVzaChlbGVtZW50LnBhcmVudE5vZGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHNpYmxpbmcgZWxlbWVudHMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLCBvcHRpb25hbGx5IGZpbHRlcmVkIGJ5IGEgc2VsZWN0b3IuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl0gRmlsdGVyXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuc2libGluZ3MoKTtcbiAqICAgICAkKCcuc2VsZWN0b3InKS5zaWJsaW5ncygnLmZpbHRlcicpO1xuICovXG5cbnZhciBzaWJsaW5ncyA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlYWNoKGVsZW1lbnQucGFyZW50Tm9kZS5jaGlsZHJlbiwgZnVuY3Rpb24gKHNpYmxpbmcpIHtcbiAgICAgIGlmIChzaWJsaW5nICE9PSBlbGVtZW50ICYmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgJiYgbWF0Y2hlcyhzaWJsaW5nLCBzZWxlY3RvcikpKSB7XG4gICAgICAgIG5vZGVzLnB1c2goc2libGluZyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3LCBzbGljZWQgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc3RhcnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBlbmRcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5zbGljZSgxLCAzKVxuICogICAgIC8vIE5ldyB3cmFwcGVkIGNvbGxlY3Rpb24gY29udGFpbmluZyB0aGUgc2Vjb25kLCB0aGlyZCwgYW5kIGZvdXJ0aCBlbGVtZW50LlxuICovXG5cbnZhciBzbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgcmV0dXJuICQkMihbXS5zbGljZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbn07XG5cbnZhciBzZWxlY3Rvcl9leHRyYSA9IE9iamVjdC5mcmVlemUoe1xuXHRjaGlsZHJlbjogY2hpbGRyZW4sXG5cdGNvbnRlbnRzOiBjb250ZW50cyxcblx0ZXE6IGVxLFxuXHRmaXJzdDogZmlyc3QsXG5cdGdldDogZ2V0LFxuXHRwYXJlbnQ6IHBhcmVudCxcblx0c2libGluZ3M6IHNpYmxpbmdzLFxuXHRzbGljZTogc2xpY2Vcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgVHlwZVxuICovXG5cbi8qXG4gKiBEZXRlcm1pbmUgaWYgdGhlIGFyZ3VtZW50IHBhc3NlZCBpcyBhIEphdmFzY3JpcHQgZnVuY3Rpb24gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqXSBPYmplY3QgdG8gdGVzdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBhIGZ1bmN0aW9uLlxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0Z1bmN0aW9uKGZ1bmN0aW9uKCl7fSk7XG4gKiAgICAgLy8gdHJ1ZVxuICogQGV4YW1wbGVcbiAqICAgICAkLmlzRnVuY3Rpb24oe30pO1xuICogICAgIC8vIGZhbHNlXG4gKi9cblxudmFyIGlzRnVuY3Rpb24gPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nO1xufTtcblxuLypcbiAqIERldGVybWluZSB3aGV0aGVyIHRoZSBhcmd1bWVudCBpcyBhbiBhcnJheS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29ial0gT2JqZWN0IHRvIHRlc3Qgd2hldGhlciBvciBub3QgaXQgaXMgYW4gYXJyYXkuXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQGV4YW1wbGVcbiAqICAgICAkLmlzQXJyYXkoW10pO1xuICogICAgIC8vIHRydWVcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5pc0FycmF5KHt9KTtcbiAqICAgICAvLyBmYWxzZVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxudmFyIHR5cGUgPSBPYmplY3QuZnJlZXplKHtcblx0aXNGdW5jdGlvbjogaXNGdW5jdGlvbixcblx0aXNBcnJheTogaXNBcnJheVxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBBUElcbiAqL1xuXG52YXIgYXBpID0ge307XG52YXIgJCQkMSA9IHt9O1xuXG4vLyBJbXBvcnQgbW9kdWxlcyB0byBidWlsZCB1cCB0aGUgQVBJXG5cbmlmICh0eXBlb2Ygc2VsZWN0b3IgIT09ICd1bmRlZmluZWQnKSB7XG4gICQkJDEgPSAkJDI7XG4gICQkJDEubWF0Y2hlcyA9IG1hdGNoZXM7XG4gIGFwaS5maW5kID0gZmluZDtcbn1cblxuZXh0ZW5kKCQkJDEsIGRvbV9jb250YWlucywgbm9jb25mbGljdCwgdHlwZSk7XG5leHRlbmQoYXBpLCBhcnJheSwgY3NzJDEsIGRvbV9hdHRyLCBkb20sIGRvbV9jbGFzcywgZG9tX2RhdGEsIGRvbV9leHRyYSwgZG9tX2h0bWwsIGV2ZW50LCBldmVudF90cmlnZ2VyLCBldmVudF9yZWFkeSwgc2VsZWN0b3JfY2xvc2VzdCwgc2VsZWN0b3JfZXh0cmEpO1xuXG4kJCQxLmZuID0gYXBpO1xuXG4vLyBWZXJzaW9uXG5cbiQkJDEudmVyc2lvbiA9ICcwLjE0LjAnO1xuXG4vLyBVdGlsXG5cbiQkJDEuZXh0ZW5kID0gZXh0ZW5kO1xuXG4vLyBQcm92aWRlIGJhc2UgY2xhc3MgdG8gZXh0ZW5kIGZyb21cblxuaWYgKHR5cGVvZiBCYXNlQ2xhc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICQkJDEuQmFzZUNsYXNzID0gQmFzZUNsYXNzKCQkJDEuZm4pO1xufVxuXG4vLyBFeHBvcnQgaW50ZXJmYWNlXG5cbnZhciAkJDEgPSAkJCQxO1xuXG5yZXR1cm4gJCQxO1xuXG59KSkpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZG9tdGFzdGljLmpzLm1hcFxuIiwiKGZ1bmN0aW9uIChyb290KSB7XG5cbiAgLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBzZXRUaW1lb3V0RnVuYyA9IHNldFRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gIFxuICAvLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbiAgZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3Jyk7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgICB0aGlzLl9zdGF0ZSA9IDA7XG4gICAgdGhpcy5faGFuZGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gICAgZG9SZXNvbHZlKGZuLCB0aGlzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICAgIHdoaWxlIChzZWxmLl9zdGF0ZSA9PT0gMykge1xuICAgICAgc2VsZiA9IHNlbGYuX3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDApIHtcbiAgICAgIHNlbGYuX2RlZmVycmVkcy5wdXNoKGRlZmVycmVkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5faGFuZGxlZCA9IHRydWU7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHNlbGYuX3N0YXRlID09PSAxID8gcmVzb2x2ZSA6IHJlamVjdCkoZGVmZXJyZWQucHJvbWlzZSwgc2VsZi5fdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcmV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2Ioc2VsZi5fdmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgLy8gUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgICAgaWYgKG5ld1ZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgIHNlbGYuX3N0YXRlID0gMztcbiAgICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgIGZpbmFsZShzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkb1Jlc29sdmUoYmluZCh0aGVuLCBuZXdWYWx1ZSksIHNlbGYpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5fc3RhdGUgPSAxO1xuICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIGZpbmFsZShzZWxmKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3Qoc2VsZiwgZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgc2VsZi5fc3RhdGUgPSAyO1xuICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZmluYWxlKHNlbGYpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluYWxlKHNlbGYpIHtcbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghc2VsZi5faGFuZGxlZCkge1xuICAgICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbGYuX2RlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG4gICAgfVxuICAgIHNlbGYuX2RlZmVycmVkcyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gICAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbDtcbiAgICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAgICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gICAqXG4gICAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAgICovXG4gIGZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgICByZWplY3Qoc2VsZiwgZXgpO1xuICAgIH1cbiAgfVxuXG4gIFByb21pc2UucHJvdG90eXBlWydjYXRjaCddID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICB2YXIgcHJvbSA9IG5ldyAodGhpcy5jb25zdHJ1Y3Rvcikobm9vcCk7XG5cbiAgICBoYW5kbGUodGhpcywgbmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb20pKTtcbiAgICByZXR1cm4gcHJvbTtcbiAgfTtcblxuICBQcm9taXNlLmFsbCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICB0aGVuLmNhbGwodmFsLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgcmVzKGksIHZhbCk7XG4gICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYXJnc1tpXSA9IHZhbDtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlcyhpLCBhcmdzW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVqZWN0KHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2YWx1ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFsdWVzW2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBVc2UgcG9seWZpbGwgZm9yIHNldEltbWVkaWF0ZSBmb3IgcGVyZm9ybWFuY2UgZ2FpbnNcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4gPSAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfSkgfHxcbiAgICBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgICB9O1xuXG4gIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3VuaGFuZGxlZFJlamVjdGlvbkZuKGVycikge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgICAgY29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGltbWVkaWF0ZSBmdW5jdGlvbiB0byBleGVjdXRlIGNhbGxiYWNrc1xuICAgKiBAcGFyYW0gZm4ge2Z1bmN0aW9ufSBGdW5jdGlvbiB0byBleGVjdXRlXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBQcm9taXNlLl9zZXRJbW1lZGlhdGVGbiA9IGZ1bmN0aW9uIF9zZXRJbW1lZGlhdGVGbihmbikge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gZm47XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiB1bmhhbmRsZWQgcmVqZWN0aW9uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4oZm4pIHtcbiAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZuO1xuICB9O1xuICBcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuICB9IGVsc2UgaWYgKCFyb290LlByb21pc2UpIHtcbiAgICByb290LlByb21pc2UgPSBQcm9taXNlO1xuICB9XG5cbn0pKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBzZWFyY2hQYXJhbXM6ICdVUkxTZWFyY2hQYXJhbXMnIGluIHNlbGYsXG4gICAgaXRlcmFibGU6ICdTeW1ib2wnIGluIHNlbGYgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlcikge1xuICAgIHZhciB2aWV3Q2xhc3NlcyA9IFtcbiAgICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgICAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDY0QXJyYXldJ1xuICAgIF1cblxuICAgIHZhciBpc0RhdGFWaWV3ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbiAgICB9XG5cbiAgICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPSBBcnJheUJ1ZmZlci5pc1ZpZXcgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHZpZXdDbGFzc2VzLmluZGV4T2YoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikpID4gLTFcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvLyBCdWlsZCBhIGRlc3RydWN0aXZlIGl0ZXJhdG9yIGZvciB0aGUgdmFsdWUgbGlzdFxuICBmdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICAgIHZhciBpdGVyYXRvciA9IHtcbiAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiB7ZG9uZTogdmFsdWUgPT09IHVuZGVmaW5lZCwgdmFsdWU6IHZhbHVlfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gICAgICBpdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpdGVyYXRvclxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgICB0aGlzLmFwcGVuZChoZWFkZXJbMF0sIGhlYWRlclsxXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgICB0aGlzLm1hcFtuYW1lXSA9IG9sZFZhbHVlID8gb2xkVmFsdWUrJywnK3ZhbHVlIDogdmFsdWVcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHJldHVybiB0aGlzLmhhcyhuYW1lKSA/IHRoaXMubWFwW25hbWVdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm1hcCkge1xuICAgICAgaWYgKHRoaXMubWFwLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2gobmFtZSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkgeyBpdGVtcy5wdXNoKHZhbHVlKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaXRlbXMgPSBbXVxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyBpdGVtcy5wdXNoKFtuYW1lLCB2YWx1ZV0pIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICBIZWFkZXJzLnByb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdID0gSGVhZGVycy5wcm90b3R5cGUuZW50cmllc1xuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgdmFyIHByb21pc2UgPSBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEFycmF5QnVmZmVyQXNUZXh0KGJ1Zikge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIHZhciBjaGFycyA9IG5ldyBBcnJheSh2aWV3Lmxlbmd0aClcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gICAgfVxuICAgIHJldHVybiBjaGFycy5qb2luKCcnKVxuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyQ2xvbmUoYnVmKSB7XG4gICAgaWYgKGJ1Zi5zbGljZSkge1xuICAgICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zi5ieXRlTGVuZ3RoKVxuICAgICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICAgIHJldHVybiB2aWV3LmJ1ZmZlclxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIHN1cHBvcnQuYmxvYiAmJiBpc0RhdGFWaWV3KGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlBcnJheUJ1ZmZlciA9IGJ1ZmZlckNsb25lKGJvZHkuYnVmZmVyKVxuICAgICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IG5ldyBCbG9iKFt0aGlzLl9ib2R5QXJyYXlCdWZmZXJdKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIChBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSB8fCBpc0FycmF5QnVmZmVyVmlldyhib2R5KSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuc2VhcmNoUGFyYW1zICYmIFVSTFNlYXJjaFBhcmFtcy5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgICAgIHJldHVybiBjb25zdW1lZCh0aGlzKSB8fCBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUFycmF5QnVmZmVyKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuXG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSAmJiBpbnB1dC5fYm9keUluaXQgIT0gbnVsbCkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcywgeyBib2R5OiB0aGlzLl9ib2R5SW5pdCB9KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUhlYWRlcnMocmF3SGVhZGVycykge1xuICAgIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKVxuICAgIHJhd0hlYWRlcnMuc3BsaXQoL1xccj9cXG4vKS5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgaGVhZGVycy5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gJ3N0YXR1cycgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzIDogMjAwXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9ICdzdGF0dXNUZXh0JyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXNUZXh0IDogJ09LJ1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzXG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3RcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlXG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgICB9XG4gICAgICAgIG9wdGlvbnMudXJsID0gJ3Jlc3BvbnNlVVJMJyBpbiB4aHIgPyB4aHIucmVzcG9uc2VVUkwgOiBvcHRpb25zLmhlYWRlcnMuZ2V0KCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbnRpbWVvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsImZ1bmN0aW9uIENvbnRpZGlvV2lkZ2V0KCkge1xuXG4gIHRoaXMuZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgY29udGFpbmVyOiBcIi5jb250aWRpby13aWRnZXRcIixcbiAgICBpdGVtQ2xhc3M6IFwiY29udGlkaW8taXRlbVwiXG4gIH07XG5cbiAgdGhpcy5tZXJnZU9wdGlvbnMgPSBmdW5jdGlvbiAob2JqMSwgb2JqMikge1xuICAgIHZhciBvYmozID0ge307XG4gICAgZm9yICh2YXIgYXR0cm5hbWUgaW4gb2JqMSkge1xuICAgICAgb2JqM1thdHRybmFtZV0gPSBvYmoxW2F0dHJuYW1lXTtcbiAgICB9XG4gICAgZm9yICh2YXIgYXR0cm5hbWUgaW4gb2JqMikge1xuICAgICAgb2JqM1thdHRybmFtZV0gPSBvYmoyW2F0dHJuYW1lXTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajM7XG4gIH07XG5cbiAgdGhpcy5vcHRpb25zID0gKHR5cGVvZiBjb250aWRpb09wdGlvbnMgIT09IFwidW5kZWZpbmVkXCIpID8gdGhpcy5tZXJnZU9wdGlvbnModGhpcy5kZWZhdWx0T3B0aW9ucywgY29udGlkaW9PcHRpb25zKSA6IHRoaXMuZGVmYXVsdE9wdGlvbnM7XG4gIHRoaXMuaXRlbXMgPSBbXTtcblxuICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UtcG9seWZpbGwnKTtcblxuICAgIHZhciAkO1xuXG4gICAgaWYgKHR5cGVvZiBqUXVlcnkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAkID0gcmVxdWlyZSgnZG9tdGFzdGljJyk7XG4gICAgfWVsc2Uge1xuICAgICAgJCA9IGpRdWVyeTtcbiAgICB9XG5cbiAgICByZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcblxuICAgIGlmICghd2luZG93LlByb21pc2UpIHtcbiAgICAgIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZTtcbiAgICB9XG5cbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB2YXIgdXJsID0gb3B0aW9ucy51cmwgPyBvcHRpb25zLnVybCA6ICcnO1xuXG4gICAgZmV0Y2godXJsLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICd4LWNvbnRpZGlvLXNkayc6ICcxLjAtSlMnXG4gICAgICB9XG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XG4gICAgfSkudGhlbihmdW5jdGlvbiAoanNvbikge1xuXG4gICAgICB0aGF0LmV4dHJhY3RJdGVtcyhqc29uKTtcblxuICAgICAgdmFyIHJlbmRlcmVyID0gbmV3IFJlbmRlcmVyKG9wdGlvbnMsICQpO1xuXG4gICAgICB2YXIgJGl0ZW1MaXN0ID0gJChcIjxkaXYgY2xhc3M9J2NvbnRpZGlvLWl0ZW0tbGlzdCc+PC9kaXY+XCIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoYXQuaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgJGl0ZW1MaXN0LmFwcGVuZChyZW5kZXJlci5yZW5kZXJMaXN0Vmlldyh0aGF0Lml0ZW1zW2ldKSk7XG4gICAgICB9XG5cbiAgICAgICQob3B0aW9ucy5jb250YWluZXIpLmFwcGVuZCgkaXRlbUxpc3QpO1xuXG4gICAgICBpZiAocmVuZGVyZXIucmVzaXplKSB7XG5cbiAgICAgICAgcmVuZGVyZXIucmVzaXplKCk7XG4gICAgICAgIHRoYXQuYWRkRXZlbnQod2luZG93LCBcInJlc2l6ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmVuZGVyZXIucmVzaXplKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG5cbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmV4dHJhY3RJdGVtcyA9IGZ1bmN0aW9uIChqc29uKSB7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBqc29uLmVudGl0eS5mb3JFYWNoKGZ1bmN0aW9uIChlbnRpdHkpIHtcblxuICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgIHV1aWQ6IGVudGl0eS51dWlkLFxuICAgICAgICBuYW1lOiBlbnRpdHkubmFtZSA/IGVudGl0eS5uYW1lIDogZW50aXR5LnV1aWQsXG4gICAgICAgIHR5cGU6IHRoYXQuZGVmaW5lVHlwZShlbnRpdHkudHlwZSksXG4gICAgICAgIHByZXZpZXdJbWFnZTogdGhhdC5nZXRQcmV2aWV3SW1hZ2UoZW50aXR5KVxuICAgICAgfTtcblxuICAgICAgaWYgKGVudGl0eS53b3JraW5nU2V0QmluYXJ5VHlwZSkge1xuICAgICAgICBpdGVtLmJpbmFyeVR5cGUgPSB0aGF0LmRlZmluZUJpbmFyeVR5cGUoZW50aXR5LndvcmtpbmdTZXRCaW5hcnlUeXBlKTtcbiAgICAgIH1cblxuICAgICAgdGhhdC5pdGVtcy5wdXNoKGl0ZW0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHRoaXMuZGVmaW5lVHlwZSA9IGZ1bmN0aW9uICh0eXBlKSB7XG5cbiAgICAvKiBUT0RPOiBzd2l0Y2ggdG8gY29uc3RhbnRzICovXG5cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIFwiY29sbGVjdGlvblwiO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJhc3NldFwiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5kZWZpbmVCaW5hcnlUeXBlID0gZnVuY3Rpb24gKGJpbmFyeVR5cGUpIHtcblxuICAgIC8qIFRPRE86IHN3aXRjaCB0byBjb25zdGFudHMgKi9cblxuICAgIHN3aXRjaCAoYmluYXJ5VHlwZSkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gXCJpbWFnZVwiO1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gXCJhdWRpb1wiO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gXCJ2aWRlb1wiO1xuICAgICAgY2FzZSA0OlxuICAgICAgICByZXR1cm4gXCJkb2N1bWVudFwiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgfVxuXG4gIH07XG5cbiAgdGhpcy5nZXRQcmV2aWV3SW1hZ2UgPSBmdW5jdGlvbiAoZW50aXR5KSB7XG4gICAgdmFyIGluZGV4VG9Vc2UgPSAtMTtcblxuICAgIGlmIChlbnRpdHkud29ya2luZ1NldEJpbmFyeVR5cGUgPT0gMikge1xuXG4gICAgICBpZiAoZW50aXR5LnByZXZpZXdCaW5hcnlTZXRbMF0uY2FsY3VsYXRlZEJpbmFyeS5sZW5ndGggPiAxKSB7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnRpdHkucHJldmlld0JpbmFyeVNldFswXS5jYWxjdWxhdGVkQmluYXJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGVudGl0eS5wcmV2aWV3QmluYXJ5U2V0WzBdLmNhbGN1bGF0ZWRCaW5hcnlbaV0uYmluYXJ5UHVycG9zZSA9PSAxOTAwMCAmJlxuICAgICAgICAgICAgZW50aXR5LnByZXZpZXdCaW5hcnlTZXRbMF0uY2FsY3VsYXRlZEJpbmFyeVtpXS53aWR0aCA+PSA1NjBcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGluZGV4VG9Vc2UgPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4VG9Vc2UgPSAwO1xuICAgIH1cblxuICAgIGlmIChpbmRleFRvVXNlID4gLTEpIHtcbiAgICAgIHJldHVybiBlbnRpdHkucHJldmlld0JpbmFyeVNldFswXS5jYWxjdWxhdGVkQmluYXJ5W2luZGV4VG9Vc2VdLmRvd25sb2FkTGluaztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICB9O1xuXG4gIHRoaXMuYWRkRXZlbnQgPSBmdW5jdGlvbiAob2JqZWN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCB8fCB0eXBlb2Yob2JqZWN0KSA9PSAndW5kZWZpbmVkJykgcmV0dXJuO1xuICAgIGlmIChvYmplY3QuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgb2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKG9iamVjdC5hdHRhY2hFdmVudCkge1xuICAgICAgb2JqZWN0LmF0dGFjaEV2ZW50KFwib25cIiArIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqZWN0W1wib25cIiArIHR5cGVdID0gY2FsbGJhY2s7XG4gICAgfVxuICB9O1xuXG59XG5cbnZhciBjdyA9IG5ldyBDb250aWRpb1dpZGdldCgpO1xuY3cuaW5pdCgpO1xuXG5cbiJdfQ==
