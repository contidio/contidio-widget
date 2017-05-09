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
var Promise = require('promise-polyfill');
require('whatwg-fetch');

if (!window.Promise) {
  window.Promise = Promise;
}

var options = (typeof contidioOptions !== "undefined") ? contidioOptions : {};

var url = options.url ? options.url : '';

fetch(url, {
  headers: {
    'x-contidio-sdk': '1.0-JS'
  }
}).then(function (response) {
  return response.json();
}).then(function (json) {

  var renderer = new Renderer($, json, options);

  renderer.init();

});

var $ = require('domtastic');


},{"domtastic":1,"promise-polyfill":2,"whatwg-fetch":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9tdGFzdGljL2Rpc3QvZG9tdGFzdGljLmpzIiwibm9kZV9tb2R1bGVzL3Byb21pc2UtcG9seWZpbGwvcHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJzcmMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLiQgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbi8qXG4gKiBAbW9kdWxlIFV0aWxcbiAqL1xuXG4vKlxuICogUmVmZXJlbmNlIHRvIHRoZSB3aW5kb3cgb2JqZWN0XG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciB3aW4gPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9O1xuXG4vKipcbiAqIENvbnZlcnQgYE5vZGVMaXN0YCB0byBgQXJyYXlgLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb25cbiAqIEByZXR1cm4ge0FycmF5fVxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgdG9BcnJheSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgdmFyIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgcmVzdWx0W2ldID0gY29sbGVjdGlvbltpXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBGYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gW10uZm9yRWFjaCBtZXRob2RcbiAqXG4gKiBAcGFyYW0ge05vZGV8Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtOb2RlfE5vZGVMaXN0fEFycmF5fVxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgZWFjaCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICB2YXIgbGVuZ3RoID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gIGlmIChsZW5ndGggIT09IHVuZGVmaW5lZCAmJiBjb2xsZWN0aW9uLm5vZGVUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGNvbGxlY3Rpb25baV0sIGksIGNvbGxlY3Rpb24pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGNvbGxlY3Rpb24sIDAsIGNvbGxlY3Rpb24pO1xuICB9XG4gIHJldHVybiBjb2xsZWN0aW9uO1xufTtcblxuLyoqXG4gKiBBc3NpZ24gZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGZyb20gc291cmNlIG9iamVjdChzKSB0byB0YXJnZXQgb2JqZWN0XG4gKlxuICogQG1ldGhvZCBleHRlbmRcbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXQgT2JqZWN0IHRvIGV4dGVuZFxuICogQHBhcmFtIHtPYmplY3R9IFtzb3VyY2VdIE9iamVjdCB0byBleHRlbmQgZnJvbVxuICogQHJldHVybiB7T2JqZWN0fSBFeHRlbmRlZCBvYmplY3RcbiAqIEBleGFtcGxlXG4gKiAgICAgJC5leHRlbmQoe2E6IDF9LCB7YjogMn0pO1xuICogICAgIC8vIHthOiAxLCBiOiAyfVxuICogQGV4YW1wbGVcbiAqICAgICAkLmV4dGVuZCh7YTogMX0sIHtiOiAyfSwge2E6IDN9KTtcbiAqICAgICAvLyB7YTogMywgYjogMn1cbiAqL1xuXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgc291cmNlcyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBzb3VyY2VzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc3JjKSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBzcmMpIHtcbiAgICAgIHRhcmdldFtwcm9wXSA9IHNyY1twcm9wXTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gdGFyZ2V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGNvbGxlY3Rpb24gd2l0aG91dCBkdXBsaWNhdGVzXG4gKlxuICogQHBhcmFtIGNvbGxlY3Rpb24gQ29sbGVjdGlvbiB0byByZW1vdmUgZHVwbGljYXRlcyBmcm9tXG4gKiBAcmV0dXJuIHtOb2RlfE5vZGVMaXN0fEFycmF5fVxuICogQHByaXZhdGVcbiAqL1xuXG52YXIgdW5pcSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihmdW5jdGlvbiAoaXRlbSwgaW5kZXgpIHtcbiAgICByZXR1cm4gY29sbGVjdGlvbi5pbmRleE9mKGl0ZW0pID09PSBpbmRleDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEBtb2R1bGUgU2VsZWN0b3JcbiAqL1xuXG52YXIgaXNQcm90b3R5cGVTZXQgPSBmYWxzZTtcblxudmFyIHJlRnJhZ21lbnQgPSAvXlxccyo8KFxcdyt8ISlbXj5dKj4vO1xudmFyIHJlU2luZ2xlVGFnID0gL148KFxcdyspXFxzKlxcLz8+KD86PFxcL1xcMT58KSQvO1xudmFyIHJlU2ltcGxlU2VsZWN0b3IgPSAvXltcXC4jXT9bXFx3LV0qJC87XG5cbi8qXG4gKiBWZXJzYXRpbGUgd3JhcHBlciBmb3IgYHF1ZXJ5U2VsZWN0b3JBbGxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8QXJyYXl9IHNlbGVjdG9yIFF1ZXJ5IHNlbGVjdG9yLCBgTm9kZWAsIGBOb2RlTGlzdGAsIGFycmF5IG9mIGVsZW1lbnRzLCBvciBIVE1MIGZyYWdtZW50IHN0cmluZy5cbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R9IGNvbnRleHQ9ZG9jdW1lbnQgVGhlIGNvbnRleHQgZm9yIHRoZSBzZWxlY3RvciB0byBxdWVyeSBlbGVtZW50cy5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgJGl0ZW1zID0gJCguaXRlbXMnKTtcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyICRlbGVtZW50ID0gJChkb21FbGVtZW50KTtcbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyICRsaXN0ID0gJChub2RlTGlzdCwgZG9jdW1lbnQuYm9keSk7XG4gKiBAZXhhbXBsZVxuICogICAgIHZhciAkZWxlbWVudCA9ICQoJzxwPmV2ZXJncmVlbjwvcD4nKTtcbiAqL1xuXG52YXIgJCQyID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBjb250ZXh0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBkb2N1bWVudDtcblxuXG4gIHZhciBjb2xsZWN0aW9uID0gdm9pZCAwO1xuXG4gIGlmICghc2VsZWN0b3IpIHtcblxuICAgIGNvbGxlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKG51bGwpO1xuICB9IGVsc2UgaWYgKHNlbGVjdG9yIGluc3RhbmNlb2YgV3JhcHBlcikge1xuXG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcblxuICAgIGNvbGxlY3Rpb24gPSBzZWxlY3Rvci5ub2RlVHlwZSB8fCBzZWxlY3RvciA9PT0gd2luZG93ID8gW3NlbGVjdG9yXSA6IHNlbGVjdG9yO1xuICB9IGVsc2UgaWYgKHJlRnJhZ21lbnQudGVzdChzZWxlY3RvcikpIHtcblxuICAgIGNvbGxlY3Rpb24gPSBjcmVhdGVGcmFnbWVudChzZWxlY3Rvcik7XG4gIH0gZWxzZSB7XG5cbiAgICBjb250ZXh0ID0gdHlwZW9mIGNvbnRleHQgPT09ICdzdHJpbmcnID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250ZXh0KSA6IGNvbnRleHQubGVuZ3RoID8gY29udGV4dFswXSA6IGNvbnRleHQ7XG5cbiAgICBjb2xsZWN0aW9uID0gcXVlcnlTZWxlY3RvcihzZWxlY3RvciwgY29udGV4dCk7XG4gIH1cblxuICByZXR1cm4gd3JhcChjb2xsZWN0aW9uKTtcbn07XG5cbi8qXG4gKiBGaW5kIGRlc2NlbmRhbnRzIG1hdGNoaW5nIHRoZSBwcm92aWRlZCBgc2VsZWN0b3JgIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gc2VsZWN0b3IgUXVlcnkgc2VsZWN0b3IsIGBOb2RlYCwgYE5vZGVMaXN0YCwgYXJyYXkgb2YgZWxlbWVudHMsIG9yIEhUTUwgZnJhZ21lbnQgc3RyaW5nLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLmZpbmQoJy5kZWVwJykuJCgnLmRlZXBlc3QnKTtcbiAqL1xuXG52YXIgZmluZCA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAobm9kZSkge1xuICAgIHJldHVybiBlYWNoKHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IsIG5vZGUpLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIGlmIChub2Rlcy5pbmRleE9mKGNoaWxkKSA9PT0gLTEpIHtcbiAgICAgICAgbm9kZXMucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qXG4gKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZWxlbWVudCB3b3VsZCBiZSBzZWxlY3RlZCBieSB0aGUgc3BlY2lmaWVkIHNlbGVjdG9yIHN0cmluZzsgb3RoZXJ3aXNlLCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50IEVsZW1lbnQgdG8gdGVzdFxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yIFNlbGVjdG9yIHRvIG1hdGNoIGFnYWluc3QgZWxlbWVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqXG4gKiBAZXhhbXBsZVxuICogICAgICQubWF0Y2hlcyhlbGVtZW50LCAnLm1hdGNoJyk7XG4gKi9cblxudmFyIG1hdGNoZXMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb250ZXh0ID0gdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnID8gRWxlbWVudC5wcm90b3R5cGUgOiB3aW47XG4gIHZhciBfbWF0Y2hlcyA9IGNvbnRleHQubWF0Y2hlcyB8fCBjb250ZXh0Lm1hdGNoZXNTZWxlY3RvciB8fCBjb250ZXh0Lm1vek1hdGNoZXNTZWxlY3RvciB8fCBjb250ZXh0Lm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGNvbnRleHQub01hdGNoZXNTZWxlY3RvciB8fCBjb250ZXh0LndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbGVtZW50LCBzZWxlY3Rvcikge1xuICAgIHJldHVybiBfbWF0Y2hlcy5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfTtcbn0oKTtcblxuLypcbiAqIFVzZSB0aGUgZmFzdGVyIGBnZXRFbGVtZW50QnlJZGAsIGBnZXRFbGVtZW50c0J5Q2xhc3NOYW1lYCBvciBgZ2V0RWxlbWVudHNCeVRhZ05hbWVgIG92ZXIgYHF1ZXJ5U2VsZWN0b3JBbGxgIGlmIHBvc3NpYmxlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgUXVlcnkgc2VsZWN0b3IuXG4gKiBAcGFyYW0ge05vZGV9IGNvbnRleHQgVGhlIGNvbnRleHQgZm9yIHRoZSBzZWxlY3RvciB0byBxdWVyeSBlbGVtZW50cy5cbiAqIEByZXR1cm4ge09iamVjdH0gTm9kZUxpc3QsIEhUTUxDb2xsZWN0aW9uLCBvciBBcnJheSBvZiBtYXRjaGluZyBlbGVtZW50cyAoZGVwZW5kaW5nIG9uIG1ldGhvZCB1c2VkKS5cbiAqL1xuXG52YXIgcXVlcnlTZWxlY3RvciA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuXG4gIHZhciBpc1NpbXBsZVNlbGVjdG9yID0gcmVTaW1wbGVTZWxlY3Rvci50ZXN0KHNlbGVjdG9yKTtcblxuICBpZiAoaXNTaW1wbGVTZWxlY3Rvcikge1xuICAgIGlmIChzZWxlY3RvclswXSA9PT0gJyMnKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IChjb250ZXh0LmdldEVsZW1lbnRCeUlkID8gY29udGV4dCA6IGRvY3VtZW50KS5nZXRFbGVtZW50QnlJZChzZWxlY3Rvci5zbGljZSgxKSk7XG4gICAgICByZXR1cm4gZWxlbWVudCA/IFtlbGVtZW50XSA6IFtdO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0b3JbMF0gPT09ICcuJykge1xuICAgICAgcmV0dXJuIGNvbnRleHQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShzZWxlY3Rvci5zbGljZSgxKSk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0LmdldEVsZW1lbnRzQnlUYWdOYW1lKHNlbGVjdG9yKTtcbiAgfVxuXG4gIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xufTtcblxuLypcbiAqIENyZWF0ZSBET00gZnJhZ21lbnQgZnJvbSBhbiBIVE1MIHN0cmluZ1xuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCBTdHJpbmcgcmVwcmVzZW50aW5nIEhUTUwuXG4gKiBAcmV0dXJuIHtOb2RlTGlzdH1cbiAqL1xuXG52YXIgY3JlYXRlRnJhZ21lbnQgPSBmdW5jdGlvbiAoaHRtbCkge1xuXG4gIGlmIChyZVNpbmdsZVRhZy50ZXN0KGh0bWwpKSB7XG4gICAgcmV0dXJuIFtkb2N1bWVudC5jcmVhdGVFbGVtZW50KFJlZ0V4cC4kMSldO1xuICB9XG5cbiAgdmFyIGVsZW1lbnRzID0gW107XG4gIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkTm9kZXM7XG5cbiAgY29udGFpbmVyLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBlbGVtZW50cy5wdXNoKGNoaWxkcmVuW2ldKTtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50cztcbn07XG5cbi8qXG4gKiBDYWxsaW5nIGAkKHNlbGVjdG9yKWAgcmV0dXJucyBhIHdyYXBwZWQgY29sbGVjdGlvbiBvZiBlbGVtZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlTGlzdHxBcnJheX0gY29sbGVjdGlvbiBFbGVtZW50KHMpIHRvIHdyYXAuXG4gKiBAcmV0dXJuIE9iamVjdCkgVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICovXG5cbnZhciB3cmFwID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcblxuICBpZiAoIWlzUHJvdG90eXBlU2V0KSB7XG4gICAgV3JhcHBlci5wcm90b3R5cGUgPSAkJDIuZm47XG4gICAgV3JhcHBlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBXcmFwcGVyO1xuICAgIGlzUHJvdG90eXBlU2V0ID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgV3JhcHBlcihjb2xsZWN0aW9uKTtcbn07XG5cbi8qXG4gKiBDb25zdHJ1Y3RvciBmb3IgdGhlIE9iamVjdC5wcm90b3R5cGUgc3RyYXRlZ3lcbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGVMaXN0fEFycmF5fSBjb2xsZWN0aW9uIEVsZW1lbnQocykgdG8gd3JhcC5cbiAqL1xuXG52YXIgV3JhcHBlciA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gIHZhciBpID0gMDtcbiAgdmFyIGxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuICBmb3IgKDsgaSA8IGxlbmd0aDspIHtcbiAgICB0aGlzW2ldID0gY29sbGVjdGlvbltpKytdO1xuICB9XG4gIHRoaXMubGVuZ3RoID0gbGVuZ3RoO1xufTtcblxudmFyIHNlbGVjdG9yID0gT2JqZWN0LmZyZWV6ZSh7XG5cdCQ6ICQkMixcblx0ZmluZDogZmluZCxcblx0bWF0Y2hlczogbWF0Y2hlcyxcblx0V3JhcHBlcjogV3JhcHBlclxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBBcnJheVxuICovXG5cbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gY2FsbGJhY2sgcmV0dXJucyBhIHRydWUoLWlzaCkgdmFsdWUgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIGZvciBlYWNoIGVsZW1lbnQsIGludm9rZWQgd2l0aCBgZWxlbWVudGAgYXMgYXJndW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gW3RoaXNBcmddIFZhbHVlIHRvIHVzZSBhcyBgdGhpc2Agd2hlbiBleGVjdXRpbmcgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFdoZXRoZXIgZWFjaCBlbGVtZW50IHBhc3NlZCB0aGUgY2FsbGJhY2sgY2hlY2suXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmV2ZXJ5KGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhY3RpdmUnKVxuICogICAgIH0pO1xuICogICAgIC8vIHRydWUvZmFsc2VcbiAqL1xuXG52YXIgZXZlcnkgPSBBcnJheVByb3RvLmV2ZXJ5O1xuXG4vKipcbiAqIEZpbHRlciB0aGUgY29sbGVjdGlvbiBieSBzZWxlY3RvciBvciBmdW5jdGlvbiwgYW5kIHJldHVybiBhIG5ldyBjb2xsZWN0aW9uIHdpdGggdGhlIHJlc3VsdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xGdW5jdGlvbn0gc2VsZWN0b3IgU2VsZWN0b3Igb3IgZnVuY3Rpb24gdG8gZmlsdGVyIHRoZSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IFt0aGlzQXJnXSBWYWx1ZSB0byB1c2UgYXMgYHRoaXNgIHdoZW4gZXhlY3V0aW5nIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5maWx0ZXIoJy5hY3RpdmUnKTtcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhY3RpdmUnKVxuICogICAgIH0pO1xuICovXG5cbnZhciBmaWx0ZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIHRoaXNBcmcpIHtcbiAgdmFyIGNhbGxiYWNrID0gdHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nID8gc2VsZWN0b3IgOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBtYXRjaGVzKGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgfTtcbiAgcmV0dXJuICQkMihBcnJheVByb3RvLmZpbHRlci5jYWxsKHRoaXMsIGNhbGxiYWNrLCB0aGlzQXJnKSk7XG59O1xuXG4vKipcbiAqIEV4ZWN1dGUgYSBmdW5jdGlvbiBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgZm9yIGVhY2ggZWxlbWVudCwgaW52b2tlZCB3aXRoIGBlbGVtZW50YCBhcyBhcmd1bWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdGhpc0FyZ10gVmFsdWUgdG8gdXNlIGFzIGB0aGlzYCB3aGVuIGV4ZWN1dGluZyBgY2FsbGJhY2tgLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICogICAgICAgICBlbGVtZW50LnN0eWxlLmNvbG9yID0gJ2V2ZXJncmVlbic7XG4gKiAgICAgKTtcbiAqL1xuXG52YXIgZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgdGhpc0FyZykge1xuICByZXR1cm4gZWFjaCh0aGlzLCBjYWxsYmFjaywgdGhpc0FyZyk7XG59O1xuXG52YXIgZWFjaCQxID0gZm9yRWFjaDtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbmRleCBvZiBhbiBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICogQHJldHVybiB7TnVtYmVyfSBUaGUgemVyby1iYXNlZCBpbmRleCwgLTEgaWYgbm90IGZvdW5kLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5pbmRleE9mKGVsZW1lbnQpO1xuICogICAgIC8vIDJcbiAqL1xuXG52YXIgaW5kZXhPZiA9IEFycmF5UHJvdG8uaW5kZXhPZjtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY29sbGVjdGlvbiBieSBleGVjdXRpbmcgdGhlIGNhbGxiYWNrIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBlbGVtZW50LCBpbnZva2VkIHdpdGggYGVsZW1lbnRgIGFzIGFyZ3VtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IFt0aGlzQXJnXSBWYWx1ZSB0byB1c2UgYXMgYHRoaXNgIHdoZW4gZXhlY3V0aW5nIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJuIHtBcnJheX0gQ29sbGVjdGlvbiB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGV4ZWN1dGVkIGNhbGxiYWNrIGZvciBlYWNoIGVsZW1lbnQuXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLm1hcChmdW5jdGlvbihlbGVtZW50KSB7XG4gKiAgICAgICAgIHJldHVybiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnbmFtZScpXG4gKiAgICAgfSk7XG4gKiAgICAgLy8gWydldmVyJywgJ2dyZWVuJ11cbiAqL1xuXG52YXIgbWFwID0gQXJyYXlQcm90by5tYXA7XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgbGFzdCBlbGVtZW50IGZyb20gdGhlIGNvbGxlY3Rpb24sIGFuZCByZXR1cm5zIHRoYXQgZWxlbWVudC5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBsYXN0IGVsZW1lbnQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAqIEBleGFtcGxlXG4gKiAgICAgdmFyIGxhc3RFbGVtZW50ID0gJCgnLml0ZW1zJykucG9wKCk7XG4gKi9cblxudmFyIHBvcCA9IEFycmF5UHJvdG8ucG9wO1xuXG4vKipcbiAqIEFkZHMgb25lIG9yIG1vcmUgZWxlbWVudHMgdG8gdGhlIGVuZCBvZiB0aGUgY29sbGVjdGlvbiwgYW5kIHJldHVybnMgdGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgRWxlbWVudChzKSB0byBhZGQgdG8gdGhlIGNvbGxlY3Rpb25cbiAqIEByZXR1cm4ge051bWJlcn0gVGhlIG5ldyBsZW5ndGggb2YgdGhlIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucHVzaChlbGVtZW50KTtcbiAqL1xuXG52YXIgcHVzaCA9IEFycmF5UHJvdG8ucHVzaDtcblxuLyoqXG4gKiBBcHBseSBhIGZ1bmN0aW9uIGFnYWluc3QgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLCBhbmQgdGhpcyBhY2N1bXVsYXRvciBmdW5jdGlvbiBoYXMgdG8gcmVkdWNlIGl0XG4gKiB0byBhIHNpbmdsZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBGdW5jdGlvbiB0byBleGVjdXRlIG9uIGVhY2ggdmFsdWUgaW4gdGhlIGFycmF5LCB0YWtpbmcgZm91ciBhcmd1bWVudHMgKHNlZSBleGFtcGxlKS5cbiAqIEBwYXJhbSB7TWl4ZWR9IGluaXRpYWxWYWx1ZSBPYmplY3QgdG8gdXNlIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgZmlyc3QgY2FsbCBvZiB0aGUgY2FsbGJhY2suXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnJlZHVjZShmdW5jdGlvbihwcmV2aW91c1ZhbHVlLCBlbGVtZW50LCBpbmRleCwgY29sbGVjdGlvbikge1xuICogICAgICAgICByZXR1cm4gcHJldmlvdXNWYWx1ZSArIGVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICogICAgIH0sIDApO1xuICogICAgIC8vIFt0b3RhbCBoZWlnaHQgb2YgZWxlbWVudHNdXG4gKi9cblxudmFyIHJlZHVjZSA9IEFycmF5UHJvdG8ucmVkdWNlO1xuXG4vKipcbiAqIEFwcGx5IGEgZnVuY3Rpb24gYWdhaW5zdCBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24gKGZyb20gcmlnaHQtdG8tbGVmdCksIGFuZCB0aGlzIGFjY3VtdWxhdG9yIGZ1bmN0aW9uIGhhc1xuICogdG8gcmVkdWNlIGl0IHRvIGEgc2luZ2xlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXksIHRha2luZyBmb3VyIGFyZ3VtZW50cyAoc2VlIGV4YW1wbGUpLlxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFZhbHVlIE9iamVjdCB0byB1c2UgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBmaXJzdCBjYWxsIG9mIHRoZSBjYWxsYmFjay5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmVkdWNlUmlnaHQoZnVuY3Rpb24ocHJldmlvdXNWYWx1ZSwgZWxlbWVudCwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAqICAgICAgICAgcmV0dXJuIHByZXZpb3VzVmFsdWUgKyBlbGVtZW50LnRleHRDb250ZW50O1xuICogICAgIH0sICcnKVxuICogICAgIC8vIFtyZXZlcnNlZCB0ZXh0IG9mIGVsZW1lbnRzXVxuICovXG5cbnZhciByZWR1Y2VSaWdodCA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQ7XG5cbi8qKlxuICogUmV2ZXJzZXMgYW4gYXJyYXkgaW4gcGxhY2UuIFRoZSBmaXJzdCBhcnJheSBlbGVtZW50IGJlY29tZXMgdGhlIGxhc3QgYW5kIHRoZSBsYXN0IGJlY29tZXMgdGhlIGZpcnN0LlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvbiwgcmV2ZXJzZWRcbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmV2ZXJzZSgpO1xuICovXG5cbnZhciByZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJCQyKHRvQXJyYXkodGhpcykucmV2ZXJzZSgpKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlcyB0aGUgZmlyc3QgZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uLCBhbmQgcmV0dXJucyB0aGF0IGVsZW1lbnQuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgZmlyc3QgZWxlbWVudCBmcm9tIHRoZSBjb2xsZWN0aW9uLlxuICogQGV4YW1wbGVcbiAqICAgICB2YXIgZmlyc3RFbGVtZW50ID0gJCgnLml0ZW1zJykuc2hpZnQoKTtcbiAqL1xuXG52YXIgc2hpZnQgPSBBcnJheVByb3RvLnNoaWZ0O1xuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gY2FsbGJhY2sgcmV0dXJucyBhIHRydWUoLWlzaCkgdmFsdWUgZm9yIGFueSBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gZXhlY3V0ZSBmb3IgZWFjaCBlbGVtZW50LCBpbnZva2VkIHdpdGggYGVsZW1lbnRgIGFzIGFyZ3VtZW50LlxuICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciBhbnkgZWxlbWVudCBwYXNzZWQgdGhlIGNhbGxiYWNrIGNoZWNrLlxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbXMnKS5zb21lKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAqICAgICAgICAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKCdhY3RpdmUnKVxuICogICAgIH0pO1xuICogICAgIC8vIHRydWUvZmFsc2VcbiAqL1xuXG52YXIgc29tZSA9IEFycmF5UHJvdG8uc29tZTtcblxuLyoqXG4gKiBBZGRzIG9uZSBvciBtb3JlIGVsZW1lbnRzIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNvbGxlY3Rpb24sIGFuZCByZXR1cm5zIHRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IEVsZW1lbnQocykgdG8gYWRkIHRvIHRoZSBjb2xsZWN0aW9uXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFRoZSBuZXcgbGVuZ3RoIG9mIHRoZSBjb2xsZWN0aW9uXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnVuc2hpZnQoZWxlbWVudCk7XG4gKi9cblxudmFyIHVuc2hpZnQgPSBBcnJheVByb3RvLnVuc2hpZnQ7XG5cbnZhciBhcnJheSA9IE9iamVjdC5mcmVlemUoe1xuXHRldmVyeTogZXZlcnksXG5cdGZpbHRlcjogZmlsdGVyLFxuXHRmb3JFYWNoOiBmb3JFYWNoLFxuXHRlYWNoOiBlYWNoJDEsXG5cdGluZGV4T2Y6IGluZGV4T2YsXG5cdG1hcDogbWFwLFxuXHRwb3A6IHBvcCxcblx0cHVzaDogcHVzaCxcblx0cmVkdWNlOiByZWR1Y2UsXG5cdHJlZHVjZVJpZ2h0OiByZWR1Y2VSaWdodCxcblx0cmV2ZXJzZTogcmV2ZXJzZSxcblx0c2hpZnQ6IHNoaWZ0LFxuXHRzb21lOiBzb21lLFxuXHR1bnNoaWZ0OiB1bnNoaWZ0XG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuLyoqXG4gKiBAbW9kdWxlIEJhc2VDbGFzc1xuICovXG5cbnZhciBCYXNlQ2xhc3MgPSBmdW5jdGlvbiAoYXBpKSB7XG5cbiAgLyoqXG4gICAqIFByb3ZpZGUgc3ViY2xhc3MgZm9yIGNsYXNzZXMgb3IgY29tcG9uZW50cyB0byBleHRlbmQgZnJvbS5cbiAgICogVGhlIG9wcG9zaXRlIGFuZCBzdWNjZXNzb3Igb2YgcGx1Z2lucyAobm8gbmVlZCB0byBleHRlbmQgYCQuZm5gIGFueW1vcmUsIGNvbXBsZXRlIGNvbnRyb2wpLlxuICAgKlxuICAgKiBAcmV0dXJuIHtDbGFzc30gVGhlIGNsYXNzIHRvIGV4dGVuZCBmcm9tLCBpbmNsdWRpbmcgYWxsIGAkLmZuYCBtZXRob2RzLlxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgaW1wb3J0IHsgQmFzZUNsYXNzIH0gZnJvbSAgJ2RvbXRhc3RpYyc7XG4gICAqXG4gICAqICAgICBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzIEJhc2VDbGFzcyB7XG4gICAqICAgICAgICAgZG9Tb21ldGhpbmcoKSB7XG4gICAqICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZENsYXNzKCcuZm9vJyk7XG4gICAqICAgICAgICAgfVxuICAgKiAgICAgfVxuICAgKlxuICAgKiAgICAgbGV0IGNvbXBvbmVudCA9IG5ldyBNeUNvbXBvbmVudCgnYm9keScpO1xuICAgKiAgICAgY29tcG9uZW50LmRvU29tZXRoaW5nKCk7XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICAgICBpbXBvcnQgJCBmcm9tICAnZG9tdGFzdGljJztcbiAgICpcbiAgICogICAgIGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgJC5CYXNlQ2xhc3Mge1xuICAgKiAgICAgICAgIHByb2dyZXNzKHZhbHVlKSB7XG4gICAqICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0dHIoJ2RhdGEtcHJvZ3Jlc3MnLCB2YWx1ZSk7XG4gICAqICAgICAgICAgfVxuICAgKiAgICAgfVxuICAgKlxuICAgKiAgICAgbGV0IGNvbXBvbmVudCA9IG5ldyBNeUNvbXBvbmVudChkb2N1bWVudC5ib2R5KTtcbiAgICogICAgIGNvbXBvbmVudC5wcm9ncmVzcygnaXZlJykuYXBwZW5kKCc8cD5lbmhhbmNlbWVudDwvcD4nKTtcbiAgICovXG5cbiAgdmFyIEJhc2VDbGFzcyA9IGZ1bmN0aW9uIEJhc2VDbGFzcygpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQmFzZUNsYXNzKTtcblxuICAgIFdyYXBwZXIuY2FsbCh0aGlzLCAkJDIuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcblxuICBleHRlbmQoQmFzZUNsYXNzLnByb3RvdHlwZSwgYXBpKTtcbiAgcmV0dXJuIEJhc2VDbGFzcztcbn07XG5cbi8qKlxuICogQG1vZHVsZSBDU1NcbiAqL1xuXG52YXIgaXNOdW1lcmljID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdCh2YWx1ZSkpICYmIGlzRmluaXRlKHZhbHVlKTtcbn07XG5cbnZhciBjYW1lbGl6ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvLShbXFxkYS16XSkvZ2ksIGZ1bmN0aW9uIChtYXRjaGVzLCBsZXR0ZXIpIHtcbiAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XG4gIH0pO1xufTtcblxudmFyIGRhc2hlcml6ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUucmVwbGFjZSgvKFthLXpcXGRdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZSBvZiBhIHN0eWxlIHByb3BlcnR5IGZvciB0aGUgZmlyc3QgZWxlbWVudCwgb3Igc2V0IG9uZSBvciBtb3JlIHN0eWxlIHByb3BlcnRpZXMgZm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IGtleSBUaGUgbmFtZSBvZiB0aGUgc3R5bGUgcHJvcGVydHkgdG8gZ2V0IG9yIHNldC4gT3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcga2V5LXZhbHVlIHBhaXJzIHRvIHNldCBhcyBzdHlsZSBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIHZhbHVlIG9mIHRoZSBzdHlsZSBwcm9wZXJ0eSB0byBzZXQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5jc3MoJ3BhZGRpbmctbGVmdCcpOyAvLyBnZXRcbiAqICAgICAkKCcuaXRlbScpLmNzcygnY29sb3InLCAnI2YwMCcpOyAvLyBzZXRcbiAqICAgICAkKCcuaXRlbScpLmNzcyh7J2JvcmRlci13aWR0aCc6ICcxcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30pOyAvLyBzZXQgbXVsdGlwbGVcbiAqL1xuXG52YXIgY3NzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcblxuICB2YXIgc3R5bGVQcm9wcyA9IHZvaWQgMCxcbiAgICAgIHByb3AgPSB2b2lkIDAsXG4gICAgICB2YWwgPSB2b2lkIDA7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAga2V5ID0gY2FtZWxpemUoa2V5KTtcblxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIHZhbCA9IGVsZW1lbnQuc3R5bGVba2V5XTtcbiAgICAgICAgcmV0dXJuIGlzTnVtZXJpYyh2YWwpID8gcGFyc2VGbG9hdCh2YWwpIDogdmFsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBzdHlsZVByb3BzID0ge307XG4gICAgc3R5bGVQcm9wc1trZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGVQcm9wcyA9IGtleTtcbiAgICBmb3IgKHByb3AgaW4gc3R5bGVQcm9wcykge1xuICAgICAgdmFsID0gc3R5bGVQcm9wc1twcm9wXTtcbiAgICAgIGRlbGV0ZSBzdHlsZVByb3BzW3Byb3BdO1xuICAgICAgc3R5bGVQcm9wc1tjYW1lbGl6ZShwcm9wKV0gPSB2YWw7XG4gICAgfVxuICB9XG5cbiAgZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGZvciAocHJvcCBpbiBzdHlsZVByb3BzKSB7XG4gICAgICBpZiAoc3R5bGVQcm9wc1twcm9wXSB8fCBzdHlsZVByb3BzW3Byb3BdID09PSAwKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGVbcHJvcF0gPSBzdHlsZVByb3BzW3Byb3BdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShkYXNoZXJpemUocHJvcCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG52YXIgY3NzJDEgPSBPYmplY3QuZnJlZXplKHtcblx0Y3NzOiBjc3Ncbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgRE9NXG4gKi9cblxudmFyIGZvckVhY2gkMSA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoO1xuXG4vKipcbiAqIEFwcGVuZCBlbGVtZW50KHMpIHRvIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOb2RlfE5vZGVMaXN0fE9iamVjdH0gZWxlbWVudCBXaGF0IHRvIGFwcGVuZCB0byB0aGUgZWxlbWVudChzKS5cbiAqIENsb25lcyBlbGVtZW50cyBhcyBuZWNlc3NhcnkuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5hcHBlbmQoJzxwPm1vcmU8L3A+Jyk7XG4gKi9cblxudmFyIGFwcGVuZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBlbGVtZW50IGluc3RhbmNlb2YgTm9kZUxpc3QgPyB0b0FycmF5KGVsZW1lbnQpIDogZWxlbWVudDtcbiAgICAgICAgZm9yRWFjaCQxLmNhbGwoZWxlbWVudHMsIHRoaXMuYXBwZW5kQ2hpbGQuYmluZCh0aGlzKSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIF9lYWNoKHRoaXMsIGFwcGVuZCwgZWxlbWVudCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFBsYWNlIGVsZW1lbnQocykgYXQgdGhlIGJlZ2lubmluZyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBwbGFjZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBlbGVtZW50KHMpLlxuICogQ2xvbmVzIGVsZW1lbnRzIGFzIG5lY2Vzc2FyeS5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnByZXBlbmQoJzxzcGFuPnN0YXJ0PC9zcGFuPicpO1xuICovXG5cbnZhciBwcmVwZW5kID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgaWYgKHRoaXMgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHRoaXMuaW5zZXJ0QmVmb3JlKGVsZW1lbnQsIHRoaXMuZmlyc3RDaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBlbGVtZW50IGluc3RhbmNlb2YgTm9kZUxpc3QgPyB0b0FycmF5KGVsZW1lbnQpIDogZWxlbWVudDtcbiAgICAgICAgZm9yRWFjaCQxLmNhbGwoZWxlbWVudHMucmV2ZXJzZSgpLCBwcmVwZW5kLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBfZWFjaCh0aGlzLCBwcmVwZW5kLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGxhY2UgZWxlbWVudChzKSBiZWZvcmUgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gcGxhY2UgYXMgc2libGluZyhzKSBiZWZvcmUgdG8gdGhlIGVsZW1lbnQocykuXG4gKiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmJlZm9yZSgnPHA+cHJlZml4PC9wPicpO1xuICovXG5cbnZhciBiZWZvcmUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodGhpcyBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBlbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWxlbWVudCwgdGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBlbGVtZW50IGluc3RhbmNlb2YgTm9kZUxpc3QgPyB0b0FycmF5KGVsZW1lbnQpIDogZWxlbWVudDtcbiAgICAgICAgZm9yRWFjaCQxLmNhbGwoZWxlbWVudHMsIGJlZm9yZS5iaW5kKHRoaXMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgX2VhY2godGhpcywgYmVmb3JlLCBlbGVtZW50KTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGxhY2UgZWxlbWVudChzKSBhZnRlciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxPYmplY3R9IGVsZW1lbnQgV2hhdCB0byBwbGFjZSBhcyBzaWJsaW5nKHMpIGFmdGVyIHRvIHRoZSBlbGVtZW50KHMpLiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmFmdGVyKCc8c3Bhbj5zdWY8L3NwYW4+PHNwYW4+Zml4PC9zcGFuPicpO1xuICovXG5cbnZhciBhZnRlciA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGlmICh0aGlzIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmVuZCcsIGVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbGVtZW50LCB0aGlzLm5leHRTaWJsaW5nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGVsZW1lbnQgaW5zdGFuY2VvZiBOb2RlTGlzdCA/IHRvQXJyYXkoZWxlbWVudCkgOiBlbGVtZW50O1xuICAgICAgICBmb3JFYWNoJDEuY2FsbChlbGVtZW50cy5yZXZlcnNlKCksIGFmdGVyLmJpbmQodGhpcykpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBfZWFjaCh0aGlzLCBhZnRlciwgZWxlbWVudCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENsb25lIGEgd3JhcHBlZCBvYmplY3QuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBXcmFwcGVkIGNvbGxlY3Rpb24gb2YgY2xvbmVkIG5vZGVzLlxuICogQGV4YW1wbGVcbiAqICAgICAkKGVsZW1lbnQpLmNsb25lKCk7XG4gKi9cblxudmFyIGNsb25lID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJCQyKF9jbG9uZSh0aGlzKSk7XG59O1xuXG4vKipcbiAqIENsb25lIGFuIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE5vZGV8Tm9kZUxpc3R8QXJyYXl9IGVsZW1lbnQgVGhlIGVsZW1lbnQocykgdG8gY2xvbmUuXG4gKiBAcmV0dXJuIHtTdHJpbmd8Tm9kZXxOb2RlTGlzdHxBcnJheX0gVGhlIGNsb25lZCBlbGVtZW50KHMpXG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBfY2xvbmUgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAodHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH0gZWxzZSBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gIH0gZWxzZSBpZiAoJ2xlbmd0aCcgaW4gZWxlbWVudCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChlbGVtZW50LCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIHJldHVybiBlbC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGVsZW1lbnQ7XG59O1xuXG4vKipcbiAqIFNwZWNpYWxpemVkIGl0ZXJhdGlvbiwgYXBwbHlpbmcgYGZuYCBpbiByZXZlcnNlZCBtYW5uZXIgdG8gYSBjbG9uZSBvZiBlYWNoIGVsZW1lbnQsIGJ1dCB0aGUgcHJvdmlkZWQgb25lLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R8QXJyYXl9IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIF9lYWNoID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZuLCBlbGVtZW50KSB7XG4gIHZhciBsID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gIHdoaWxlIChsLS0pIHtcbiAgICB2YXIgZWxtID0gbCA9PT0gMCA/IGVsZW1lbnQgOiBfY2xvbmUoZWxlbWVudCk7XG4gICAgZm4uY2FsbChjb2xsZWN0aW9uW2xdLCBlbG0pO1xuICB9XG59O1xuXG52YXIgZG9tID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFwcGVuZDogYXBwZW5kLFxuXHRwcmVwZW5kOiBwcmVwZW5kLFxuXHRiZWZvcmU6IGJlZm9yZSxcblx0YWZ0ZXI6IGFmdGVyLFxuXHRjbG9uZTogY2xvbmUsXG5cdF9jbG9uZTogX2Nsb25lLFxuXHRfZWFjaDogX2VhY2hcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgQXR0clxuICovXG5cbi8qKlxuICogR2V0IHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgZm9yIHRoZSBmaXJzdCBlbGVtZW50LCBvciBzZXQgb25lIG9yIG1vcmUgYXR0cmlidXRlcyBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0ga2V5IFRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgdG8gZ2V0IG9yIHNldC4gT3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcga2V5LXZhbHVlIHBhaXJzIHRvIHNldCBhcyBhdHRyaWJ1dGVzLlxuICogQHBhcmFtIHtTdHJpbmd9IFt2YWx1ZV0gVGhlIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGUgdG8gc2V0LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuYXR0cignYXR0ck5hbWUnKTsgLy8gZ2V0XG4gKiAgICAgJCgnLml0ZW0nKS5hdHRyKCdhdHRyTmFtZScsICdhdHRyVmFsdWUnKTsgLy8gc2V0XG4gKiAgICAgJCgnLml0ZW0nKS5hdHRyKHthdHRyMTogJ3ZhbHVlMScsICdhdHRyLTInOiAndmFsdWUyJ30pOyAvLyBzZXQgbXVsdGlwbGVcbiAqL1xuXG52YXIgYXR0ciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMubm9kZVR5cGUgPyB0aGlzIDogdGhpc1swXTtcbiAgICByZXR1cm4gZWxlbWVudCA/IGVsZW1lbnQuZ2V0QXR0cmlidXRlKGtleSkgOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgX2F0dHIgaW4ga2V5KSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKF9hdHRyLCBrZXlbX2F0dHJdKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGF0dHJpYnV0ZSBmcm9tIGVhY2ggZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IEF0dHJpYnV0ZSBuYW1lXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmVtb3ZlQXR0cignYXR0ck5hbWUnKTtcbiAqL1xuXG52YXIgcmVtb3ZlQXR0ciA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgfSk7XG59O1xuXG52YXIgZG9tX2F0dHIgPSBPYmplY3QuZnJlZXplKHtcblx0YXR0cjogYXR0cixcblx0cmVtb3ZlQXR0cjogcmVtb3ZlQXR0clxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBDbGFzc1xuICovXG5cbi8qKlxuICogQWRkIGEgY2xhc3MgdG8gdGhlIGVsZW1lbnQocylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgU3BhY2Utc2VwYXJhdGVkIGNsYXNzIG5hbWUocykgdG8gYWRkIHRvIHRoZSBlbGVtZW50KHMpLlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuYWRkQ2xhc3MoJ2JhcicpO1xuICogICAgICQoJy5pdGVtJykuYWRkQ2xhc3MoJ2JhciBmb28nKTtcbiAqL1xuXG52YXIgYWRkQ2xhc3MgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlICYmIHZhbHVlLmxlbmd0aCkge1xuICAgIGVhY2godmFsdWUuc3BsaXQoJyAnKSwgX2VhY2gkMS5iaW5kKHRoaXMsICdhZGQnKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhIGNsYXNzIGZyb20gdGhlIGVsZW1lbnQocylcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgU3BhY2Utc2VwYXJhdGVkIGNsYXNzIG5hbWUocykgdG8gcmVtb3ZlIGZyb20gdGhlIGVsZW1lbnQocykuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykucmVtb3ZlQ2xhc3MoJ2JhcicpO1xuICogICAgICQoJy5pdGVtcycpLnJlbW92ZUNsYXNzKCdiYXIgZm9vJyk7XG4gKi9cblxudmFyIHJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHtcbiAgICBlYWNoKHZhbHVlLnNwbGl0KCcgJyksIF9lYWNoJDEuYmluZCh0aGlzLCAncmVtb3ZlJykpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUb2dnbGUgYSBjbGFzcyBhdCB0aGUgZWxlbWVudChzKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSBTcGFjZS1zZXBhcmF0ZWQgY2xhc3MgbmFtZShzKSB0byB0b2dnbGUgYXQgdGhlIGVsZW1lbnQocykuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzdGF0ZV0gQSBCb29sZWFuIHZhbHVlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBjbGFzcyBzaG91bGQgYmUgYWRkZWQgb3IgcmVtb3ZlZC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLnRvZ2dsZUNsYXNzKCdiYXInKTtcbiAqICAgICAkKCcuaXRlbScpLnRvZ2dsZUNsYXNzKCdiYXIgZm9vJyk7XG4gKiAgICAgJCgnLml0ZW0nKS50b2dnbGVDbGFzcygnYmFyJywgdHJ1ZSk7XG4gKi9cblxudmFyIHRvZ2dsZUNsYXNzID0gZnVuY3Rpb24gKHZhbHVlLCBzdGF0ZSkge1xuICBpZiAodmFsdWUgJiYgdmFsdWUubGVuZ3RoKSB7XG4gICAgdmFyIGFjdGlvbiA9IHR5cGVvZiBzdGF0ZSA9PT0gJ2Jvb2xlYW4nID8gc3RhdGUgPyAnYWRkJyA6ICdyZW1vdmUnIDogJ3RvZ2dsZSc7XG4gICAgZWFjaCh2YWx1ZS5zcGxpdCgnICcpLCBfZWFjaCQxLmJpbmQodGhpcywgYWN0aW9uKSk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBlbGVtZW50KHMpIGhhdmUgYSBjbGFzcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWUgQ2hlY2sgaWYgdGhlIERPTSBlbGVtZW50IGNvbnRhaW5zIHRoZSBjbGFzcyBuYW1lLiBXaGVuIGFwcGxpZWQgdG8gbXVsdGlwbGUgZWxlbWVudHMsXG4gKiByZXR1cm5zIGB0cnVlYCBpZiBfYW55XyBvZiB0aGVtIGNvbnRhaW5zIHRoZSBjbGFzcyBuYW1lLlxuICogQHJldHVybiB7Qm9vbGVhbn0gV2hldGhlciB0aGUgZWxlbWVudCdzIGNsYXNzIGF0dHJpYnV0ZSBjb250YWlucyB0aGUgY2xhc3MgbmFtZS5cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS5oYXNDbGFzcygnYmFyJyk7XG4gKi9cblxudmFyIGhhc0NsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiAodGhpcy5ub2RlVHlwZSA/IFt0aGlzXSA6IHRoaXMpLnNvbWUoZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModmFsdWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICogU3BlY2lhbGl6ZWQgaXRlcmF0aW9uLCBhcHBseWluZyBgZm5gIG9mIHRoZSBjbGFzc0xpc3QgQVBJIHRvIGVhY2ggZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZm5OYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xhc3NOYW1lXG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBfZWFjaCQxID0gZnVuY3Rpb24gKGZuTmFtZSwgY2xhc3NOYW1lKSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0W2ZuTmFtZV0oY2xhc3NOYW1lKTtcbiAgfSk7XG59O1xuXG52YXIgZG9tX2NsYXNzID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFkZENsYXNzOiBhZGRDbGFzcyxcblx0cmVtb3ZlQ2xhc3M6IHJlbW92ZUNsYXNzLFxuXHR0b2dnbGVDbGFzczogdG9nZ2xlQ2xhc3MsXG5cdGhhc0NsYXNzOiBoYXNDbGFzc1xufSk7XG5cbi8qKlxuICogQG1vZHVsZSBjb250YWluc1xuICovXG5cbi8qKlxuICogVGVzdCB3aGV0aGVyIGFuIGVsZW1lbnQgY29udGFpbnMgYW5vdGhlciBlbGVtZW50IGluIHRoZSBET00uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBjb250YWluZXIgVGhlIGVsZW1lbnQgdGhhdCBtYXkgY29udGFpbiB0aGUgb3RoZXIgZWxlbWVudC5cbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IG1heSBiZSBhIGRlc2NlbmRhbnQgb2YgdGhlIG90aGVyIGVsZW1lbnQuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBXaGV0aGVyIHRoZSBgY29udGFpbmVyYCBlbGVtZW50IGNvbnRhaW5zIHRoZSBgZWxlbWVudGAuXG4gKiBAZXhhbXBsZVxuICogICAgICQuY29udGFpbnMocGFyZW50RWxlbWVudCwgY2hpbGRFbGVtZW50KTtcbiAqICAgICAvLyB0cnVlL2ZhbHNlXG4gKi9cblxudmFyIGNvbnRhaW5zID0gZnVuY3Rpb24gKGNvbnRhaW5lciwgZWxlbWVudCkge1xuICBpZiAoIWNvbnRhaW5lciB8fCAhZWxlbWVudCB8fCBjb250YWluZXIgPT09IGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gZWxzZSBpZiAoY29udGFpbmVyLmNvbnRhaW5zKSB7XG4gICAgcmV0dXJuIGNvbnRhaW5lci5jb250YWlucyhlbGVtZW50KTtcbiAgfSBlbHNlIGlmIChjb250YWluZXIuY29tcGFyZURvY3VtZW50UG9zaXRpb24pIHtcbiAgICByZXR1cm4gIShjb250YWluZXIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZWxlbWVudCkgJiBOb2RlLkRPQ1VNRU5UX1BPU0lUSU9OX0RJU0NPTk5FQ1RFRCk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIGRvbV9jb250YWlucyA9IE9iamVjdC5mcmVlemUoe1xuXHRjb250YWluczogY29udGFpbnNcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgRGF0YVxuICovXG5cbnZhciBpc1N1cHBvcnRzRGF0YVNldCA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2RhdGFzZXQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbnZhciBEQVRBS0VZUFJPUCA9IGlzU3VwcG9ydHNEYXRhU2V0ID8gJ2RhdGFzZXQnIDogJ19fRE9NVEFTVElDX0RBVEFfXyc7XG5cbi8qKlxuICogR2V0IGRhdGEgZnJvbSBmaXJzdCBlbGVtZW50LCBvciBzZXQgZGF0YSBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXkgVGhlIGtleSBmb3IgdGhlIGRhdGEgdG8gZ2V0IG9yIHNldC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdIFRoZSBkYXRhIHRvIHNldC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmRhdGEoJ2F0dHJOYW1lJyk7IC8vIGdldFxuICogICAgICQoJy5pdGVtJykuZGF0YSgnYXR0ck5hbWUnLCB7YW55OiAnZGF0YSd9KTsgLy8gc2V0XG4gKi9cblxudmFyIGRhdGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgcmV0dXJuIGVsZW1lbnQgJiYgREFUQUtFWVBST1AgaW4gZWxlbWVudCA/IGVsZW1lbnRbREFUQUtFWVBST1BdW2tleV0gOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIGlmICghaXNTdXBwb3J0c0RhdGFTZXQpIHtcbiAgICAgIGVsZW1lbnRbREFUQUtFWVBST1BdID0gZWxlbWVudFtEQVRBS0VZUFJPUF0gfHwge307XG4gICAgfVxuICAgIGVsZW1lbnRbREFUQUtFWVBST1BdW2tleV0gPSB2YWx1ZTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIEdldCBwcm9wZXJ0eSBmcm9tIGZpcnN0IGVsZW1lbnQsIG9yIHNldCBwcm9wZXJ0eSBvbiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0IG9yIHNldC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdIFRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgdG8gc2V0LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykucHJvcCgnYXR0ck5hbWUnKTsgLy8gZ2V0XG4gKiAgICAgJCgnLml0ZW0nKS5wcm9wKCdhdHRyTmFtZScsICdhdHRyVmFsdWUnKTsgLy8gc2V0XG4gKi9cblxudmFyIHByb3AgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXG4gIGlmICh0eXBlb2Yga2V5ID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLm5vZGVUeXBlID8gdGhpcyA6IHRoaXNbMF07XG4gICAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudCA/IGVsZW1lbnRba2V5XSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnRba2V5XSA9IHZhbHVlO1xuICB9KTtcbn07XG5cbnZhciBkb21fZGF0YSA9IE9iamVjdC5mcmVlemUoe1xuXHRkYXRhOiBkYXRhLFxuXHRwcm9wOiBwcm9wXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIERPTSAoZXh0cmEpXG4gKi9cblxuLyoqXG4gKiBBcHBlbmQgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uIHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudChzKS5cbiAqXG4gKiBAcGFyYW0ge05vZGV8Tm9kZUxpc3R8T2JqZWN0fSBlbGVtZW50IFdoYXQgdG8gYXBwZW5kIHRoZSBlbGVtZW50KHMpIHRvLiBDbG9uZXMgZWxlbWVudHMgYXMgbmVjZXNzYXJ5LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuYXBwZW5kVG8oY29udGFpbmVyKTtcbiAqL1xuXG52YXIgYXBwZW5kVG8gPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICB2YXIgY29udGV4dCA9IHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyA/ICQkMihlbGVtZW50KSA6IGVsZW1lbnQ7XG4gIGFwcGVuZC5jYWxsKGNvbnRleHQsIHRoaXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qXG4gKiBFbXB0eSBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykuZW1wdHkoKTtcbiAqL1xuXG52YXIgZW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGNvbGxlY3Rpb24gZnJvbSB0aGUgRE9NLlxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBBcnJheSBjb250YWluaW5nIHRoZSByZW1vdmVkIGVsZW1lbnRzXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykucmVtb3ZlKCk7XG4gKi9cblxudmFyIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogUmVwbGFjZSBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgbmV3IGNvbnRlbnQsIGFuZCByZXR1cm4gdGhlIGFycmF5IG9mIGVsZW1lbnRzIHRoYXQgd2VyZSByZXBsYWNlZC5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX0gQXJyYXkgY29udGFpbmluZyB0aGUgcmVwbGFjZWQgZWxlbWVudHNcbiAqL1xuXG52YXIgcmVwbGFjZVdpdGggPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBiZWZvcmUuYXBwbHkodGhpcywgYXJndW1lbnRzKS5yZW1vdmUoKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBgdGV4dENvbnRlbnRgIGZyb20gdGhlIGZpcnN0LCBvciBzZXQgdGhlIGB0ZXh0Q29udGVudGAgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW0nKS50ZXh0KCdOZXcgY29udGVudCcpO1xuICovXG5cbnZhciB0ZXh0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdGhpc1swXS50ZXh0Q29udGVudDtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQudGV4dENvbnRlbnQgPSAnJyArIHZhbHVlO1xuICB9KTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBgdmFsdWVgIGZyb20gdGhlIGZpcnN0LCBvciBzZXQgdGhlIGB2YWx1ZWAgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBbdmFsdWVdXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnaW5wdXQuZmlyc3ROYW1lJykudmFsKCdOZXcgdmFsdWUnKTtcbiAqL1xuXG52YXIgdmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gdGhpc1swXS52YWx1ZTtcbiAgfVxuXG4gIHJldHVybiBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsZW1lbnQudmFsdWUgPSB2YWx1ZTtcbiAgfSk7XG59O1xuXG52YXIgZG9tX2V4dHJhID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGFwcGVuZFRvOiBhcHBlbmRUbyxcblx0ZW1wdHk6IGVtcHR5LFxuXHRyZW1vdmU6IHJlbW92ZSxcblx0cmVwbGFjZVdpdGg6IHJlcGxhY2VXaXRoLFxuXHR0ZXh0OiB0ZXh0LFxuXHR2YWw6IHZhbFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBIVE1MXG4gKi9cblxuLypcbiAqIEdldCB0aGUgSFRNTCBjb250ZW50cyBvZiB0aGUgZmlyc3QgZWxlbWVudCwgb3Igc2V0IHRoZSBIVE1MIGNvbnRlbnRzIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtmcmFnbWVudF0gSFRNTCBmcmFnbWVudCB0byBzZXQgZm9yIHRoZSBlbGVtZW50LiBJZiB0aGlzIGFyZ3VtZW50IGlzIG9taXR0ZWQsIHRoZSBIVE1MIGNvbnRlbnRzIGFyZSByZXR1cm5lZC5cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLmh0bWwoKTtcbiAqICAgICAkKCcuaXRlbScpLmh0bWwoJzxzcGFuPm1vcmU8L3NwYW4+Jyk7XG4gKi9cblxudmFyIGh0bWwgPSBmdW5jdGlvbiAoZnJhZ21lbnQpIHtcblxuICBpZiAodHlwZW9mIGZyYWdtZW50ICE9PSAnc3RyaW5nJykge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5ub2RlVHlwZSA/IHRoaXMgOiB0aGlzWzBdO1xuICAgIHJldHVybiBlbGVtZW50ID8gZWxlbWVudC5pbm5lckhUTUwgOiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gZWFjaCh0aGlzLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiBlbGVtZW50LmlubmVySFRNTCA9IGZyYWdtZW50O1xuICB9KTtcbn07XG5cbnZhciBkb21faHRtbCA9IE9iamVjdC5mcmVlemUoe1xuXHRodG1sOiBodG1sXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIGNsb3Nlc3RcbiAqL1xuXG4vKipcbiAqIFJldHVybiB0aGUgY2xvc2VzdCBlbGVtZW50IG1hdGNoaW5nIHRoZSBzZWxlY3RvciAoc3RhcnRpbmcgYnkgaXRzZWxmKSBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzZWxlY3RvciBGaWx0ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dF0gSWYgcHJvdmlkZWQsIG1hdGNoaW5nIGVsZW1lbnRzIG11c3QgYmUgYSBkZXNjZW5kYW50IG9mIHRoaXMgZWxlbWVudFxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uIChjb250YWluaW5nIHplcm8gb3Igb25lIGVsZW1lbnQpXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5zZWxlY3RvcicpLmNsb3Nlc3QoJy5jb250YWluZXInKTtcbiAqL1xuXG52YXIgY2xvc2VzdCA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgY2xvc2VzdCA9IGZ1bmN0aW9uIChzZWxlY3RvciwgY29udGV4dCkge1xuICAgIHZhciBub2RlcyA9IFtdO1xuICAgIGVhY2godGhpcywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIHdoaWxlIChub2RlICYmIG5vZGUgIT09IGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMobm9kZSwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50O1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiAkJDIodW5pcShub2RlcykpO1xuICB9O1xuXG4gIHJldHVybiB0eXBlb2YgRWxlbWVudCA9PT0gJ3VuZGVmaW5lZCcgfHwgIUVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgPyBjbG9zZXN0IDogZnVuY3Rpb24gKHNlbGVjdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFjb250ZXh0KSB7XG4gICAgICB2YXIgbm9kZXMgPSBbXTtcbiAgICAgIGVhY2godGhpcywgZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdmFyIG4gPSBub2RlLmNsb3Nlc3Qoc2VsZWN0b3IpO1xuICAgICAgICBpZiAobikge1xuICAgICAgICAgIG5vZGVzLnB1c2gobik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICQkMih1bmlxKG5vZGVzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjbG9zZXN0LmNhbGwodGhpcywgc2VsZWN0b3IsIGNvbnRleHQpO1xuICAgIH1cbiAgfTtcbn0oKTtcblxudmFyIHNlbGVjdG9yX2Nsb3Nlc3QgPSBPYmplY3QuZnJlZXplKHtcblx0Y2xvc2VzdDogY2xvc2VzdFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBFdmVudHNcbiAqL1xuXG4vKipcbiAqIFNob3J0aGFuZCBmb3IgYGFkZEV2ZW50TGlzdGVuZXJgLiBTdXBwb3J0cyBldmVudCBkZWxlZ2F0aW9uIGlmIGEgZmlsdGVyIChgc2VsZWN0b3JgKSBpcyBwcm92aWRlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lcyBMaXN0IG9mIHNwYWNlLXNlcGFyYXRlZCBldmVudCB0eXBlcyB0byBiZSBhZGRlZCB0byB0aGUgZWxlbWVudChzKVxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl0gU2VsZWN0b3IgdG8gZmlsdGVyIGRlc2NlbmRhbnRzIHRoYXQgZGVsZWdhdGUgdGhlIGV2ZW50IHRvIHRoaXMgZWxlbWVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXIgRXZlbnQgaGFuZGxlclxuICogQHBhcmFtIHtCb29sZWFufSB1c2VDYXB0dXJlPWZhbHNlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2U9ZmFsc2VcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLm9uKCdjbGljaycsIGNhbGxiYWNrKTtcbiAqICAgICAkKCcuY29udGFpbmVyJykub24oJ2NsaWNrIGZvY3VzJywgJy5pdGVtJywgaGFuZGxlcik7XG4gKi9cblxudmFyIG9uID0gZnVuY3Rpb24gKGV2ZW50TmFtZXMsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlLCBvbmNlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICB2YXIgcGFydHMgPSB2b2lkIDAsXG4gICAgICBuYW1lc3BhY2UgPSB2b2lkIDAsXG4gICAgICBldmVudExpc3RlbmVyID0gdm9pZCAwO1xuXG4gIGV2ZW50TmFtZXMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcblxuICAgIHBhcnRzID0gZXZlbnROYW1lLnNwbGl0KCcuJyk7XG4gICAgZXZlbnROYW1lID0gcGFydHNbMF0gfHwgbnVsbDtcbiAgICBuYW1lc3BhY2UgPSBwYXJ0c1sxXSB8fCBudWxsO1xuXG4gICAgZXZlbnRMaXN0ZW5lciA9IHByb3h5SGFuZGxlcihoYW5kbGVyKTtcblxuICAgIGVhY2goX3RoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cbiAgICAgIGlmIChzZWxlY3Rvcikge1xuICAgICAgICBldmVudExpc3RlbmVyID0gZGVsZWdhdGVIYW5kbGVyLmJpbmQoZWxlbWVudCwgc2VsZWN0b3IsIGV2ZW50TGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICBpZiAob25jZSkge1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBldmVudExpc3RlbmVyO1xuICAgICAgICBldmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgb2ZmLmNhbGwoZWxlbWVudCwgZXZlbnROYW1lcywgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGwoZWxlbWVudCwgZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudExpc3RlbmVyLCB1c2VDYXB0dXJlIHx8IGZhbHNlKTtcblxuICAgICAgZ2V0SGFuZGxlcnMoZWxlbWVudCkucHVzaCh7XG4gICAgICAgIGV2ZW50TmFtZTogZXZlbnROYW1lLFxuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICBldmVudExpc3RlbmVyOiBldmVudExpc3RlbmVyLFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgIG5hbWVzcGFjZTogbmFtZXNwYWNlXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNob3J0aGFuZCBmb3IgYHJlbW92ZUV2ZW50TGlzdGVuZXJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWVzIExpc3Qgb2Ygc3BhY2Utc2VwYXJhdGVkIGV2ZW50IHR5cGVzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgZWxlbWVudChzKVxuICogQHBhcmFtIHtTdHJpbmd9IFtzZWxlY3Rvcl0gU2VsZWN0b3IgdG8gZmlsdGVyIGRlc2NlbmRhbnRzIHRoYXQgdW5kZWxlZ2F0ZSB0aGUgZXZlbnQgdG8gdGhpcyBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBFdmVudCBoYW5kbGVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHVzZUNhcHR1cmU9ZmFsc2VcbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuaXRlbScpLm9mZignY2xpY2snLCBjYWxsYmFjayk7XG4gKiAgICAgJCgnI215LWVsZW1lbnQnKS5vZmYoJ215RXZlbnQgbXlPdGhlckV2ZW50Jyk7XG4gKiAgICAgJCgnLml0ZW0nKS5vZmYoKTtcbiAqL1xuXG52YXIgb2ZmID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZXZlbnROYW1lcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogJyc7XG4gIHZhciBzZWxlY3RvciA9IGFyZ3VtZW50c1sxXTtcblxuICB2YXIgX3RoaXMyID0gdGhpcztcblxuICB2YXIgaGFuZGxlciA9IGFyZ3VtZW50c1syXTtcbiAgdmFyIHVzZUNhcHR1cmUgPSBhcmd1bWVudHNbM107XG5cblxuICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgaGFuZGxlciA9IHNlbGVjdG9yO1xuICAgIHNlbGVjdG9yID0gbnVsbDtcbiAgfVxuXG4gIHZhciBwYXJ0cyA9IHZvaWQgMCxcbiAgICAgIG5hbWVzcGFjZSA9IHZvaWQgMCxcbiAgICAgIGhhbmRsZXJzID0gdm9pZCAwO1xuXG4gIGV2ZW50TmFtZXMuc3BsaXQoJyAnKS5mb3JFYWNoKGZ1bmN0aW9uIChldmVudE5hbWUpIHtcblxuICAgIHBhcnRzID0gZXZlbnROYW1lLnNwbGl0KCcuJyk7XG4gICAgZXZlbnROYW1lID0gcGFydHNbMF0gfHwgbnVsbDtcbiAgICBuYW1lc3BhY2UgPSBwYXJ0c1sxXSB8fCBudWxsO1xuXG4gICAgcmV0dXJuIGVhY2goX3RoaXMyLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuXG4gICAgICBoYW5kbGVycyA9IGdldEhhbmRsZXJzKGVsZW1lbnQpO1xuXG4gICAgICBlYWNoKGhhbmRsZXJzLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gKCFldmVudE5hbWUgfHwgaXRlbS5ldmVudE5hbWUgPT09IGV2ZW50TmFtZSkgJiYgKCFuYW1lc3BhY2UgfHwgaXRlbS5uYW1lc3BhY2UgPT09IG5hbWVzcGFjZSkgJiYgKCFoYW5kbGVyIHx8IGl0ZW0uaGFuZGxlciA9PT0gaGFuZGxlcikgJiYgKCFzZWxlY3RvciB8fCBpdGVtLnNlbGVjdG9yID09PSBzZWxlY3Rvcik7XG4gICAgICB9KSwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGl0ZW0uZXZlbnROYW1lLCBpdGVtLmV2ZW50TGlzdGVuZXIsIHVzZUNhcHR1cmUgfHwgZmFsc2UpO1xuICAgICAgICBoYW5kbGVycy5zcGxpY2UoaGFuZGxlcnMuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFldmVudE5hbWUgJiYgIW5hbWVzcGFjZSAmJiAhc2VsZWN0b3IgJiYgIWhhbmRsZXIpIHtcbiAgICAgICAgY2xlYXJIYW5kbGVycyhlbGVtZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNsZWFySGFuZGxlcnMoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sIHRoaXMpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgZXZlbnQgbGlzdGVuZXIgYW5kIGV4ZWN1dGUgdGhlIGhhbmRsZXIgYXQgbW9zdCBvbmNlIHBlciBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSBldmVudE5hbWVzXG4gKiBAcGFyYW0gc2VsZWN0b3JcbiAqIEBwYXJhbSBoYW5kbGVyXG4gKiBAcGFyYW0gdXNlQ2FwdHVyZVxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykub25lKCdjbGljaycsIGNhbGxiYWNrKTtcbiAqL1xuXG52YXIgb25lID0gZnVuY3Rpb24gKGV2ZW50TmFtZXMsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlKSB7XG4gIHJldHVybiBvbi5jYWxsKHRoaXMsIGV2ZW50TmFtZXMsIHNlbGVjdG9yLCBoYW5kbGVyLCB1c2VDYXB0dXJlLCAxKTtcbn07XG5cbi8qKlxuICogR2V0IGV2ZW50IGhhbmRsZXJzIGZyb20gYW4gZWxlbWVudFxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbnZhciBldmVudEtleVByb3AgPSAnX19kb210YXN0aWNfZXZlbnRfXyc7XG52YXIgaWQgPSAxO1xudmFyIGhhbmRsZXJzID0ge307XG52YXIgdW51c2VkS2V5cyA9IFtdO1xuXG52YXIgZ2V0SGFuZGxlcnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnRbZXZlbnRLZXlQcm9wXSkge1xuICAgIGVsZW1lbnRbZXZlbnRLZXlQcm9wXSA9IHVudXNlZEtleXMubGVuZ3RoID09PSAwID8gKytpZCA6IHVudXNlZEtleXMucG9wKCk7XG4gIH1cbiAgdmFyIGtleSA9IGVsZW1lbnRbZXZlbnRLZXlQcm9wXTtcbiAgcmV0dXJuIGhhbmRsZXJzW2tleV0gfHwgKGhhbmRsZXJzW2tleV0gPSBbXSk7XG59O1xuXG4vKipcbiAqIENsZWFyIGV2ZW50IGhhbmRsZXJzIGZvciBhbiBlbGVtZW50XG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICovXG5cbnZhciBjbGVhckhhbmRsZXJzID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIGtleSA9IGVsZW1lbnRbZXZlbnRLZXlQcm9wXTtcbiAgaWYgKGhhbmRsZXJzW2tleV0pIHtcbiAgICBoYW5kbGVyc1trZXldID0gbnVsbDtcbiAgICBlbGVtZW50W2V2ZW50S2V5UHJvcF0gPSBudWxsO1xuICAgIHVudXNlZEtleXMucHVzaChrZXkpO1xuICB9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGNyZWF0ZSBhIGhhbmRsZXIgdGhhdCBhdWdtZW50cyB0aGUgZXZlbnQgb2JqZWN0IHdpdGggc29tZSBleHRyYSBtZXRob2RzLFxuICogYW5kIGV4ZWN1dGVzIHRoZSBjYWxsYmFjayB3aXRoIHRoZSBldmVudCBhbmQgdGhlIGV2ZW50IGRhdGEgKGkuZS4gYGV2ZW50LmRldGFpbGApLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gaGFuZGxlciBDYWxsYmFjayB0byBleGVjdXRlIGFzIGBoYW5kbGVyKGV2ZW50LCBkYXRhKWBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbnZhciBwcm94eUhhbmRsZXIgPSBmdW5jdGlvbiAoaGFuZGxlcikge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgcmV0dXJuIGhhbmRsZXIuY2FsbCh0aGlzLCBhdWdtZW50RXZlbnQoZXZlbnQpKTtcbiAgfTtcbn07XG5cbnZhciBldmVudE1ldGhvZHMgPSB7XG4gIHByZXZlbnREZWZhdWx0OiAnaXNEZWZhdWx0UHJldmVudGVkJyxcbiAgc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uOiAnaXNJbW1lZGlhdGVQcm9wYWdhdGlvblN0b3BwZWQnLFxuICBzdG9wUHJvcGFnYXRpb246ICdpc1Byb3BhZ2F0aW9uU3RvcHBlZCdcbn07XG52YXIgcmV0dXJuVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIHJldHVybkZhbHNlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIEF0dGVtcHQgdG8gYXVnbWVudCBldmVudHMgYW5kIGltcGxlbWVudCBzb21ldGhpbmcgY2xvc2VyIHRvIERPTSBMZXZlbCAzIEV2ZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG52YXIgYXVnbWVudEV2ZW50ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGlmICghZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkIHx8IGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiB8fCBldmVudC5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICBmb3IgKHZhciBtZXRob2ROYW1lIGluIGV2ZW50TWV0aG9kcykge1xuICAgICAgKGZ1bmN0aW9uIChtZXRob2ROYW1lLCB0ZXN0TWV0aG9kTmFtZSwgb3JpZ2luYWxNZXRob2QpIHtcbiAgICAgICAgZXZlbnRbbWV0aG9kTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdGhpc1t0ZXN0TWV0aG9kTmFtZV0gPSByZXR1cm5UcnVlO1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbE1ldGhvZCAmJiBvcmlnaW5hbE1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgICBldmVudFt0ZXN0TWV0aG9kTmFtZV0gPSByZXR1cm5GYWxzZTtcbiAgICAgIH0pKG1ldGhvZE5hbWUsIGV2ZW50TWV0aG9kc1ttZXRob2ROYW1lXSwgZXZlbnRbbWV0aG9kTmFtZV0pO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuX3ByZXZlbnREZWZhdWx0KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXZlbnQ7XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIHRlc3Qgd2hldGhlciBkZWxlZ2F0ZWQgZXZlbnRzIG1hdGNoIHRoZSBwcm92aWRlZCBgc2VsZWN0b3JgIChmaWx0ZXIpLFxuICogaWYgdGhlIGV2ZW50IHByb3BhZ2F0aW9uIHdhcyBzdG9wcGVkLCBhbmQgdGhlbiBhY3R1YWxseSBjYWxsIHRoZSBwcm92aWRlZCBldmVudCBoYW5kbGVyLlxuICogVXNlIGB0aGlzYCBpbnN0ZWFkIG9mIGBldmVudC5jdXJyZW50VGFyZ2V0YCBvbiB0aGUgZXZlbnQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VsZWN0b3IgU2VsZWN0b3IgdG8gZmlsdGVyIGRlc2NlbmRhbnRzIHRoYXQgdW5kZWxlZ2F0ZSB0aGUgZXZlbnQgdG8gdGhpcyBlbGVtZW50LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlciBFdmVudCBoYW5kbGVyXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICovXG5cbnZhciBkZWxlZ2F0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoc2VsZWN0b3IsIGhhbmRsZXIsIGV2ZW50KSB7XG4gIHZhciBldmVudFRhcmdldCA9IGV2ZW50Ll90YXJnZXQgfHwgZXZlbnQudGFyZ2V0O1xuICB2YXIgY3VycmVudFRhcmdldCA9IGNsb3Nlc3QuY2FsbChbZXZlbnRUYXJnZXRdLCBzZWxlY3RvciwgdGhpcylbMF07XG4gIGlmIChjdXJyZW50VGFyZ2V0ICYmIGN1cnJlbnRUYXJnZXQgIT09IHRoaXMpIHtcbiAgICBpZiAoY3VycmVudFRhcmdldCA9PT0gZXZlbnRUYXJnZXQgfHwgIShldmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCAmJiBldmVudC5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpKSkge1xuICAgICAgaGFuZGxlci5jYWxsKGN1cnJlbnRUYXJnZXQsIGV2ZW50KTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBiaW5kID0gb247XG52YXIgdW5iaW5kID0gb2ZmO1xuXG52YXIgZXZlbnQgPSBPYmplY3QuZnJlZXplKHtcblx0b246IG9uLFxuXHRvZmY6IG9mZixcblx0b25lOiBvbmUsXG5cdGdldEhhbmRsZXJzOiBnZXRIYW5kbGVycyxcblx0Y2xlYXJIYW5kbGVyczogY2xlYXJIYW5kbGVycyxcblx0cHJveHlIYW5kbGVyOiBwcm94eUhhbmRsZXIsXG5cdGRlbGVnYXRlSGFuZGxlcjogZGVsZWdhdGVIYW5kbGVyLFxuXHRiaW5kOiBiaW5kLFxuXHR1bmJpbmQ6IHVuYmluZFxufSk7XG5cbi8qKlxuICogQG1vZHVsZSB0cmlnZ2VyXG4gKi9cblxudmFyIHJlTW91c2VFdmVudCA9IC9eKD86bW91c2V8cG9pbnRlcnxjb250ZXh0bWVudSl8Y2xpY2svO1xudmFyIHJlS2V5RXZlbnQgPSAvXmtleS87XG5cbi8qKlxuICogVHJpZ2dlciBldmVudCBhdCBlbGVtZW50KHMpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgVHlwZSBvZiB0aGUgZXZlbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIERhdGEgdG8gYmUgc2VudCB3aXRoIHRoZSBldmVudCAoYHBhcmFtcy5kZXRhaWxgIHdpbGwgYmUgc2V0IHRvIHRoaXMpLlxuICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIEV2ZW50IHBhcmFtZXRlcnMgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtCb29sZWFufSBwYXJhbXMuYnViYmxlcz10cnVlIERvZXMgdGhlIGV2ZW50IGJ1YmJsZSB1cCB0aHJvdWdoIHRoZSBET00gb3Igbm90LlxuICogQHBhcmFtIHtCb29sZWFufSBwYXJhbXMuY2FuY2VsYWJsZT10cnVlIElzIHRoZSBldmVudCBjYW5jZWxhYmxlIG9yIG5vdC5cbiAqIEBwYXJhbSB7TWl4ZWR9IHBhcmFtcy5kZXRhaWw9dW5kZWZpbmVkIEFkZGl0aW9uYWwgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGV2ZW50LlxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtJykudHJpZ2dlcignYW55RXZlbnRUeXBlJyk7XG4gKi9cblxudmFyIHRyaWdnZXIgPSBmdW5jdGlvbiAodHlwZSwgZGF0YSkge1xuICB2YXIgX3JlZiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge30sXG4gICAgICBfcmVmJGJ1YmJsZXMgPSBfcmVmLmJ1YmJsZXMsXG4gICAgICBidWJibGVzID0gX3JlZiRidWJibGVzID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3JlZiRidWJibGVzLFxuICAgICAgX3JlZiRjYW5jZWxhYmxlID0gX3JlZi5jYW5jZWxhYmxlLFxuICAgICAgY2FuY2VsYWJsZSA9IF9yZWYkY2FuY2VsYWJsZSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9yZWYkY2FuY2VsYWJsZSxcbiAgICAgIF9yZWYkcHJldmVudERlZmF1bHQgPSBfcmVmLnByZXZlbnREZWZhdWx0LFxuICAgICAgcHJldmVudERlZmF1bHQgPSBfcmVmJHByZXZlbnREZWZhdWx0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9yZWYkcHJldmVudERlZmF1bHQ7XG5cbiAgdmFyIEV2ZW50Q29uc3RydWN0b3IgPSBnZXRFdmVudENvbnN0cnVjdG9yKHR5cGUpO1xuICB2YXIgZXZlbnQgPSBuZXcgRXZlbnRDb25zdHJ1Y3Rvcih0eXBlLCB7XG4gICAgYnViYmxlczogYnViYmxlcyxcbiAgICBjYW5jZWxhYmxlOiBjYW5jZWxhYmxlLFxuICAgIHByZXZlbnREZWZhdWx0OiBwcmV2ZW50RGVmYXVsdCxcbiAgICBkZXRhaWw6IGRhdGFcbiAgfSk7XG5cbiAgZXZlbnQuX3ByZXZlbnREZWZhdWx0ID0gcHJldmVudERlZmF1bHQ7XG5cbiAgcmV0dXJuIGVhY2godGhpcywgZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICBpZiAoIWJ1YmJsZXMgfHwgaXNFdmVudEJ1YmJsaW5nSW5EZXRhY2hlZFRyZWUgfHwgaXNBdHRhY2hlZFRvRG9jdW1lbnQoZWxlbWVudCkpIHtcbiAgICAgIGRpc3BhdGNoRXZlbnQoZWxlbWVudCwgZXZlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmlnZ2VyRm9yUGF0aChlbGVtZW50LCB0eXBlLCB7XG4gICAgICAgIGJ1YmJsZXM6IGJ1YmJsZXMsXG4gICAgICAgIGNhbmNlbGFibGU6IGNhbmNlbGFibGUsXG4gICAgICAgIHByZXZlbnREZWZhdWx0OiBwcmV2ZW50RGVmYXVsdCxcbiAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxudmFyIGdldEV2ZW50Q29uc3RydWN0b3IgPSBmdW5jdGlvbiAodHlwZSkge1xuICByZXR1cm4gc3VwcG9ydHNPdGhlckV2ZW50Q29uc3RydWN0b3JzID8gcmVNb3VzZUV2ZW50LnRlc3QodHlwZSkgPyBNb3VzZUV2ZW50IDogcmVLZXlFdmVudC50ZXN0KHR5cGUpID8gS2V5Ym9hcmRFdmVudCA6IEN1c3RvbUV2ZW50IDogQ3VzdG9tRXZlbnQ7XG59O1xuXG4vKipcbiAqIFRyaWdnZXIgZXZlbnQgYXQgZmlyc3QgZWxlbWVudCBpbiB0aGUgY29sbGVjdGlvbi4gU2ltaWxhciB0byBgdHJpZ2dlcigpYCwgZXhjZXB0OlxuICpcbiAqIC0gRXZlbnQgZG9lcyBub3QgYnViYmxlXG4gKiAtIERlZmF1bHQgZXZlbnQgYmVoYXZpb3IgaXMgcHJldmVudGVkXG4gKiAtIE9ubHkgdHJpZ2dlcnMgaGFuZGxlciBmb3IgZmlyc3QgbWF0Y2hpbmcgZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgb2YgdGhlIGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YSBEYXRhIHRvIGJlIHNlbnQgd2l0aCB0aGUgZXZlbnRcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnZm9ybScpLnRyaWdnZXJIYW5kbGVyKCdzdWJtaXQnKTtcbiAqL1xuXG52YXIgdHJpZ2dlckhhbmRsZXIgPSBmdW5jdGlvbiAodHlwZSwgZGF0YSkge1xuICBpZiAodGhpc1swXSkge1xuICAgIHRyaWdnZXIuY2FsbCh0aGlzWzBdLCB0eXBlLCBkYXRhLCB7XG4gICAgICBidWJibGVzOiBmYWxzZSxcbiAgICAgIHByZXZlbnREZWZhdWx0OiB0cnVlXG4gICAgfSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZWxlbWVudCBpcyBhdHRhY2hlZCB0byBvciBkZXRhY2hlZCBmcm9tKSB0aGUgZG9jdW1lbnRcbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50IEVsZW1lbnQgdG8gdGVzdFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgaXNBdHRhY2hlZFRvRG9jdW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudCA9PT0gd2luZG93IHx8IGVsZW1lbnQgPT09IGRvY3VtZW50KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGNvbnRhaW5zKGVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGVsZW1lbnQpO1xufTtcblxuLyoqXG4gKiBEaXNwYXRjaCB0aGUgZXZlbnQgYXQgdGhlIGVsZW1lbnQgYW5kIGl0cyBhbmNlc3RvcnMuXG4gKiBSZXF1aXJlZCB0byBzdXBwb3J0IGRlbGVnYXRlZCBldmVudHMgaW4gYnJvd3NlcnMgdGhhdCBkb24ndCBidWJibGUgZXZlbnRzIGluIGRldGFjaGVkIERPTSB0cmVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50IEZpcnN0IGVsZW1lbnQgdG8gZGlzcGF0Y2ggdGhlIGV2ZW50IGF0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHRoZSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IFtwYXJhbXNdIEV2ZW50IHBhcmFtZXRlcnMgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtCb29sZWFufSBwYXJhbXMuYnViYmxlcz10cnVlIERvZXMgdGhlIGV2ZW50IGJ1YmJsZSB1cCB0aHJvdWdoIHRoZSBET00gb3Igbm90LlxuICogV2lsbCBiZSBzZXQgdG8gZmFsc2UgKGJ1dCBzaG91bGRuJ3QgbWF0dGVyIHNpbmNlIGV2ZW50cyBkb24ndCBidWJibGUgYW55d2F5KS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcGFyYW1zLmNhbmNlbGFibGU9dHJ1ZSBJcyB0aGUgZXZlbnQgY2FuY2VsYWJsZSBvciBub3QuXG4gKiBAcGFyYW0ge01peGVkfSBwYXJhbXMuZGV0YWlsPXVuZGVmaW5lZCBBZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IHRoZSBldmVudC5cbiAqL1xuXG52YXIgdHJpZ2dlckZvclBhdGggPSBmdW5jdGlvbiAoZWxlbWVudCwgdHlwZSkge1xuICB2YXIgcGFyYW1zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcblxuICBwYXJhbXMuYnViYmxlcyA9IGZhbHNlO1xuICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgcGFyYW1zKTtcbiAgZXZlbnQuX3RhcmdldCA9IGVsZW1lbnQ7XG4gIGRvIHtcbiAgICBkaXNwYXRjaEV2ZW50KGVsZW1lbnQsIGV2ZW50KTtcbiAgfSB3aGlsZSAoZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uZC1hc3NpZ25cbn07XG5cbi8qKlxuICogRGlzcGF0Y2ggZXZlbnQgdG8gZWxlbWVudCwgYnV0IGNhbGwgZGlyZWN0IGV2ZW50IG1ldGhvZHMgaW5zdGVhZCBpZiBhdmFpbGFibGVcbiAqIChlLmcuIFwiYmx1cigpXCIsIFwic3VibWl0KClcIikgYW5kIGlmIHRoZSBldmVudCBpcyBub24tY2FuY2VsYWJsZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50IEVsZW1lbnQgdG8gZGlzcGF0Y2ggdGhlIGV2ZW50IGF0XG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgdG8gZGlzcGF0Y2hcbiAqL1xuXG52YXIgZGlyZWN0RXZlbnRNZXRob2RzID0gWydibHVyJywgJ2ZvY3VzJywgJ3NlbGVjdCcsICdzdWJtaXQnXTtcblxudmFyIGRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgZXZlbnQpIHtcbiAgaWYgKGRpcmVjdEV2ZW50TWV0aG9kcy5pbmRleE9mKGV2ZW50LnR5cGUpICE9PSAtMSAmJiB0eXBlb2YgZWxlbWVudFtldmVudC50eXBlXSA9PT0gJ2Z1bmN0aW9uJyAmJiAhZXZlbnQuX3ByZXZlbnREZWZhdWx0ICYmICFldmVudC5jYW5jZWxhYmxlKSB7XG4gICAgZWxlbWVudFtldmVudC50eXBlXSgpO1xuICB9IGVsc2Uge1xuICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gIH1cbn07XG5cbi8qKlxuICogUG9seWZpbGwgZm9yIEN1c3RvbUV2ZW50LCBib3Jyb3dlZCBmcm9tIFtNRE5dKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9DdXN0b21FdmVudCNQb2x5ZmlsbCkuXG4gKiBOZWVkZWQgdG8gc3VwcG9ydCBJRSAoOSwgMTAsIDExKSAmIFBoYW50b21KU1xuICovXG5cbihmdW5jdGlvbiAoKSB7XG4gIHZhciBDdXN0b21FdmVudCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgIHZhciBwYXJhbXMgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IHtcbiAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICBkZXRhaWw6IHVuZGVmaW5lZFxuICAgIH07XG5cbiAgICB2YXIgY3VzdG9tRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICBjdXN0b21FdmVudC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgcmV0dXJuIGN1c3RvbUV2ZW50O1xuICB9O1xuXG4gIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbi5DdXN0b21FdmVudCAmJiB3aW4uQ3VzdG9tRXZlbnQucHJvdG90eXBlO1xuICB3aW4uQ3VzdG9tRXZlbnQgPSBDdXN0b21FdmVudDtcbn0pKCk7XG5cbi8qXG4gKiBBcmUgZXZlbnRzIGJ1YmJsaW5nIGluIGRldGFjaGVkIERPTSB0cmVlcz9cbiAqIEBwcml2YXRlXG4gKi9cblxudmFyIGlzRXZlbnRCdWJibGluZ0luRGV0YWNoZWRUcmVlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaXNCdWJibGluZyA9IGZhbHNlO1xuICB2YXIgZG9jID0gd2luLmRvY3VtZW50O1xuICBpZiAoZG9jKSB7XG4gICAgdmFyIHBhcmVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgY2hpbGQgPSBwYXJlbnQuY2xvbmVOb2RlKCk7XG4gICAgcGFyZW50LmFwcGVuZENoaWxkKGNoaWxkKTtcbiAgICBwYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlzQnViYmxpbmcgPSB0cnVlO1xuICAgIH0pO1xuICAgIGNoaWxkLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KCdlJywgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgfVxuICByZXR1cm4gaXNCdWJibGluZztcbn0oKTtcblxudmFyIHN1cHBvcnRzT3RoZXJFdmVudENvbnN0cnVjdG9ycyA9IGZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICBuZXcgTW91c2VFdmVudCgnY2xpY2snKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn0oKTtcblxudmFyIGV2ZW50X3RyaWdnZXIgPSBPYmplY3QuZnJlZXplKHtcblx0dHJpZ2dlcjogdHJpZ2dlcixcblx0dHJpZ2dlckhhbmRsZXI6IHRyaWdnZXJIYW5kbGVyXG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIFJlYWR5XG4gKi9cblxuLyoqXG4gKiBFeGVjdXRlIGNhbGxiYWNrIHdoZW4gYERPTUNvbnRlbnRMb2FkZWRgIGZpcmVzIGZvciBgZG9jdW1lbnRgLCBvciBpbW1lZGlhdGVseSBpZiBjYWxsZWQgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBAcGFyYW0gaGFuZGxlciBDYWxsYmFjayB0byBleGVjdXRlIHdoZW4gaW5pdGlhbCBET00gY29udGVudCBpcyBsb2FkZWQuXG4gKiBAcmV0dXJuIHtPYmplY3R9IFRoZSB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJChkb2N1bWVudCkucmVhZHkoY2FsbGJhY2spO1xuICovXG5cbnZhciByZWFkeSA9IGZ1bmN0aW9uIChoYW5kbGVyKSB7XG4gIGlmICgvY29tcGxldGV8bG9hZGVkfGludGVyYWN0aXZlLy50ZXN0KGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgICBoYW5kbGVyKCk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGhhbmRsZXIsIGZhbHNlKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbnZhciBldmVudF9yZWFkeSA9IE9iamVjdC5mcmVlemUoe1xuXHRyZWFkeTogcmVhZHlcbn0pO1xuXG4vKipcbiAqIEBtb2R1bGUgbm9Db25mbGljdFxuICovXG5cbi8qXG4gKiBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgZ2xvYmFsIGAkYCB2YXJpYWJsZSwgc28gdGhhdCBpdCBjYW4gYmUgcmVzdG9yZWQgbGF0ZXIgb24uXG4gKiBAcHJpdmF0ZVxuICovXG5cbnZhciBwcmV2aW91c0xpYiA9IHdpbi4kO1xuXG4vKipcbiAqIEluIGNhc2UgYW5vdGhlciBsaWJyYXJ5IHNldHMgdGhlIGdsb2JhbCBgJGAgdmFyaWFibGUgYmVmb3JlIERPTXRhc3RpYyBkb2VzLFxuICogdGhpcyBtZXRob2QgY2FuIGJlIHVzZWQgdG8gcmV0dXJuIHRoZSBnbG9iYWwgYCRgIHRvIHRoYXQgb3RoZXIgbGlicmFyeS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IFJlZmVyZW5jZSB0byBET010YXN0aWMuXG4gKiBAZXhhbXBsZVxuICogICAgIHZhciBkb210YXN0aWMgPSAkLm5vQ29uZmxpY3QoKTtcbiAqL1xuXG52YXIgbm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgd2luLiQgPSBwcmV2aW91c0xpYjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG52YXIgbm9jb25mbGljdCA9IE9iamVjdC5mcmVlemUoe1xuXHRub0NvbmZsaWN0OiBub0NvbmZsaWN0XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIFNlbGVjdG9yIChleHRyYSlcbiAqL1xuXG4vKipcbiAqIFJldHVybiBjaGlsZHJlbiBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIG9wdGlvbmFsbHkgZmlsdGVyZWQgYnkgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBGaWx0ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5jaGlsZHJlbigpO1xuICogICAgICQoJy5zZWxlY3RvcicpLmNoaWxkcmVuKCcuZmlsdGVyJyk7XG4gKi9cblxudmFyIGNoaWxkcmVuID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKGVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgIGVhY2goZWxlbWVudC5jaGlsZHJlbiwgZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgIGlmICghc2VsZWN0b3IgfHwgc2VsZWN0b3IgJiYgbWF0Y2hlcyhjaGlsZCwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgbm9kZXMucHVzaChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gY2hpbGQgbm9kZXMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjb2xsZWN0aW9uLCBpbmNsdWRpbmcgdGV4dCBhbmQgY29tbWVudCBub2Rlcy5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLnNlbGVjdG9yJykuY29udGVudHMoKTtcbiAqL1xuXG52YXIgY29udGVudHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIG5vZGVzLnB1c2guYXBwbHkobm9kZXMsIHRvQXJyYXkoZWxlbWVudC5jaGlsZE5vZGVzKSk7XG4gIH0pO1xuICByZXR1cm4gJCQyKG5vZGVzKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGEgY29sbGVjdGlvbiBjb250YWluaW5nIG9ubHkgdGhlIG9uZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAY2hhaW5hYmxlXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmVxKDEpXG4gKiAgICAgLy8gVGhlIHNlY29uZCBpdGVtOyByZXN1bHQgaXMgdGhlIHNhbWUgYXMgZG9pbmcgJCgkKCcuaXRlbXMnKVsxXSk7XG4gKi9cblxudmFyIGVxID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gIHJldHVybiBzbGljZS5jYWxsKHRoaXMsIGluZGV4LCBpbmRleCArIDEpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYSBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgb25seSB0aGUgZmlyc3QgaXRlbS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IE5ldyB3cmFwcGVkIGNvbGxlY3Rpb25cbiAqIEBjaGFpbmFibGVcbiAqIEBleGFtcGxlXG4gKiAgICAgJCgnLml0ZW1zJykuZmlyc3QoKVxuICogICAgIC8vIFRoZSBmaXJzdCBpdGVtOyByZXN1bHQgaXMgdGhlIHNhbWUgYXMgZG9pbmcgJCgkKCcuaXRlbXMnKVswXSk7XG4gKi9cblxudmFyIGZpcnN0ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gc2xpY2UuY2FsbCh0aGlzLCAwLCAxKTtcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBET00gZWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHJldHVybiB7Tm9kZX0gRWxlbWVudCBhdCB0aGUgc3BlY2lmaWVkIGluZGV4XG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLmdldCgxKVxuICogICAgIC8vIFRoZSBzZWNvbmQgZWxlbWVudDsgcmVzdWx0IGlzIHRoZSBzYW1lIGFzIGRvaW5nICQoJy5pdGVtcycpWzFdO1xuICovXG5cbnZhciBnZXQgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgcmV0dXJuIHRoaXNbaW5kZXhdO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHBhcmVudCBlbGVtZW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIG9wdGlvbmFsbHkgZmlsdGVyZWQgYnkgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBGaWx0ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5wYXJlbnQoKTtcbiAqICAgICAkKCcuc2VsZWN0b3InKS5wYXJlbnQoJy5maWx0ZXInKTtcbiAqL1xuXG52YXIgcGFyZW50ID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgaWYgKCFzZWxlY3RvciB8fCBzZWxlY3RvciAmJiBtYXRjaGVzKGVsZW1lbnQucGFyZW50Tm9kZSwgc2VsZWN0b3IpKSB7XG4gICAgICBub2Rlcy5wdXNoKGVsZW1lbnQucGFyZW50Tm9kZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuICQkMihub2Rlcyk7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgc2libGluZyBlbGVtZW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24sIG9wdGlvbmFsbHkgZmlsdGVyZWQgYnkgYSBzZWxlY3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gW3NlbGVjdG9yXSBGaWx0ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gTmV3IHdyYXBwZWQgY29sbGVjdGlvblxuICogQGNoYWluYWJsZVxuICogQGV4YW1wbGVcbiAqICAgICAkKCcuc2VsZWN0b3InKS5zaWJsaW5ncygpO1xuICogICAgICQoJy5zZWxlY3RvcicpLnNpYmxpbmdzKCcuZmlsdGVyJyk7XG4gKi9cblxudmFyIHNpYmxpbmdzID0gZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG4gIHZhciBub2RlcyA9IFtdO1xuICBlYWNoKHRoaXMsIGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgcmV0dXJuIGVhY2goZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkcmVuLCBmdW5jdGlvbiAoc2libGluZykge1xuICAgICAgaWYgKHNpYmxpbmcgIT09IGVsZW1lbnQgJiYgKCFzZWxlY3RvciB8fCBzZWxlY3RvciAmJiBtYXRjaGVzKHNpYmxpbmcsIHNlbGVjdG9yKSkpIHtcbiAgICAgICAgbm9kZXMucHVzaChzaWJsaW5nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkJDIobm9kZXMpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcsIHNsaWNlZCBjb2xsZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydFxuICogQHBhcmFtIHtOdW1iZXJ9IGVuZFxuICogQHJldHVybiB7T2JqZWN0fSBOZXcgd3JhcHBlZCBjb2xsZWN0aW9uXG4gKiBAZXhhbXBsZVxuICogICAgICQoJy5pdGVtcycpLnNsaWNlKDEsIDMpXG4gKiAgICAgLy8gTmV3IHdyYXBwZWQgY29sbGVjdGlvbiBjb250YWluaW5nIHRoZSBzZWNvbmQsIHRoaXJkLCBhbmQgZm91cnRoIGVsZW1lbnQuXG4gKi9cblxudmFyIHNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gJCQyKFtdLnNsaWNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xufTtcblxudmFyIHNlbGVjdG9yX2V4dHJhID0gT2JqZWN0LmZyZWV6ZSh7XG5cdGNoaWxkcmVuOiBjaGlsZHJlbixcblx0Y29udGVudHM6IGNvbnRlbnRzLFxuXHRlcTogZXEsXG5cdGZpcnN0OiBmaXJzdCxcblx0Z2V0OiBnZXQsXG5cdHBhcmVudDogcGFyZW50LFxuXHRzaWJsaW5nczogc2libGluZ3MsXG5cdHNsaWNlOiBzbGljZVxufSk7XG5cbi8qKlxuICogQG1vZHVsZSBUeXBlXG4gKi9cblxuLypcbiAqIERldGVybWluZSBpZiB0aGUgYXJndW1lbnQgcGFzc2VkIGlzIGEgSmF2YXNjcmlwdCBmdW5jdGlvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmpdIE9iamVjdCB0byB0ZXN0IHdoZXRoZXIgb3Igbm90IGl0IGlzIGEgZnVuY3Rpb24uXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICogQGV4YW1wbGVcbiAqICAgICAkLmlzRnVuY3Rpb24oZnVuY3Rpb24oKXt9KTtcbiAqICAgICAvLyB0cnVlXG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNGdW5jdGlvbih7fSk7XG4gKiAgICAgLy8gZmFsc2VcbiAqL1xuXG52YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG59O1xuXG4vKlxuICogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGFyZ3VtZW50IGlzIGFuIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqXSBPYmplY3QgdG8gdGVzdCB3aGV0aGVyIG9yIG5vdCBpdCBpcyBhbiBhcnJheS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAZXhhbXBsZVxuICogICAgICQuaXNBcnJheShbXSk7XG4gKiAgICAgLy8gdHJ1ZVxuICogQGV4YW1wbGVcbiAqICAgICAkLmlzQXJyYXkoe30pO1xuICogICAgIC8vIGZhbHNlXG4gKi9cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG52YXIgdHlwZSA9IE9iamVjdC5mcmVlemUoe1xuXHRpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuXHRpc0FycmF5OiBpc0FycmF5XG59KTtcblxuLyoqXG4gKiBAbW9kdWxlIEFQSVxuICovXG5cbnZhciBhcGkgPSB7fTtcbnZhciAkJCQxID0ge307XG5cbi8vIEltcG9ydCBtb2R1bGVzIHRvIGJ1aWxkIHVwIHRoZSBBUElcblxuaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgJCQkMSA9ICQkMjtcbiAgJCQkMS5tYXRjaGVzID0gbWF0Y2hlcztcbiAgYXBpLmZpbmQgPSBmaW5kO1xufVxuXG5leHRlbmQoJCQkMSwgZG9tX2NvbnRhaW5zLCBub2NvbmZsaWN0LCB0eXBlKTtcbmV4dGVuZChhcGksIGFycmF5LCBjc3MkMSwgZG9tX2F0dHIsIGRvbSwgZG9tX2NsYXNzLCBkb21fZGF0YSwgZG9tX2V4dHJhLCBkb21faHRtbCwgZXZlbnQsIGV2ZW50X3RyaWdnZXIsIGV2ZW50X3JlYWR5LCBzZWxlY3Rvcl9jbG9zZXN0LCBzZWxlY3Rvcl9leHRyYSk7XG5cbiQkJDEuZm4gPSBhcGk7XG5cbi8vIFZlcnNpb25cblxuJCQkMS52ZXJzaW9uID0gJzAuMTQuMCc7XG5cbi8vIFV0aWxcblxuJCQkMS5leHRlbmQgPSBleHRlbmQ7XG5cbi8vIFByb3ZpZGUgYmFzZSBjbGFzcyB0byBleHRlbmQgZnJvbVxuXG5pZiAodHlwZW9mIEJhc2VDbGFzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgJCQkMS5CYXNlQ2xhc3MgPSBCYXNlQ2xhc3MoJCQkMS5mbik7XG59XG5cbi8vIEV4cG9ydCBpbnRlcmZhY2VcblxudmFyICQkMSA9ICQkJDE7XG5cbnJldHVybiAkJDE7XG5cbn0pKSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kb210YXN0aWMuanMubWFwXG4iLCIoZnVuY3Rpb24gKHJvb3QpIHtcblxuICAvLyBTdG9yZSBzZXRUaW1lb3V0IHJlZmVyZW5jZSBzbyBwcm9taXNlLXBvbHlmaWxsIHdpbGwgYmUgdW5hZmZlY3RlZCBieVxuICAvLyBvdGhlciBjb2RlIG1vZGlmeWluZyBzZXRUaW1lb3V0IChsaWtlIHNpbm9uLnVzZUZha2VUaW1lcnMoKSlcbiAgdmFyIHNldFRpbWVvdXRGdW5jID0gc2V0VGltZW91dDtcblxuICBmdW5jdGlvbiBub29wKCkge31cbiAgXG4gIC8vIFBvbHlmaWxsIGZvciBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuICBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdvYmplY3QnKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdQcm9taXNlcyBtdXN0IGJlIGNvbnN0cnVjdGVkIHZpYSBuZXcnKTtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdub3QgYSBmdW5jdGlvbicpO1xuICAgIHRoaXMuX3N0YXRlID0gMDtcbiAgICB0aGlzLl9oYW5kbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fZGVmZXJyZWRzID0gW107XG5cbiAgICBkb1Jlc29sdmUoZm4sIHRoaXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlKHNlbGYsIGRlZmVycmVkKSB7XG4gICAgd2hpbGUgKHNlbGYuX3N0YXRlID09PSAzKSB7XG4gICAgICBzZWxmID0gc2VsZi5fdmFsdWU7XG4gICAgfVxuICAgIGlmIChzZWxmLl9zdGF0ZSA9PT0gMCkge1xuICAgICAgc2VsZi5fZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZWxmLl9oYW5kbGVkID0gdHJ1ZTtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2IgPSBzZWxmLl9zdGF0ZSA9PT0gMSA/IGRlZmVycmVkLm9uRnVsZmlsbGVkIDogZGVmZXJyZWQub25SZWplY3RlZDtcbiAgICAgIGlmIChjYiA9PT0gbnVsbCkge1xuICAgICAgICAoc2VsZi5fc3RhdGUgPT09IDEgPyByZXNvbHZlIDogcmVqZWN0KShkZWZlcnJlZC5wcm9taXNlLCBzZWxmLl92YWx1ZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciByZXQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXQgPSBjYihzZWxmLl92YWx1ZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJlamVjdChkZWZlcnJlZC5wcm9taXNlLCBlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZShkZWZlcnJlZC5wcm9taXNlLCByZXQpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzb2x2ZShzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHRyeSB7XG4gICAgICAvLyBQcm9taXNlIFJlc29sdXRpb24gUHJvY2VkdXJlOiBodHRwczovL2dpdGh1Yi5jb20vcHJvbWlzZXMtYXBsdXMvcHJvbWlzZXMtc3BlYyN0aGUtcHJvbWlzZS1yZXNvbHV0aW9uLXByb2NlZHVyZVxuICAgICAgaWYgKG5ld1ZhbHVlID09PSBzZWxmKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHByb21pc2UgY2Fubm90IGJlIHJlc29sdmVkIHdpdGggaXRzZWxmLicpO1xuICAgICAgaWYgKG5ld1ZhbHVlICYmICh0eXBlb2YgbmV3VmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBuZXdWYWx1ZS50aGVuO1xuICAgICAgICBpZiAobmV3VmFsdWUgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgICAgc2VsZi5fc3RhdGUgPSAzO1xuICAgICAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgZmluYWxlKHNlbGYpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGRvUmVzb2x2ZShiaW5kKHRoZW4sIG5ld1ZhbHVlKSwgc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZWxmLl9zdGF0ZSA9IDE7XG4gICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgZmluYWxlKHNlbGYpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJlamVjdChzZWxmLCBlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWplY3Qoc2VsZiwgbmV3VmFsdWUpIHtcbiAgICBzZWxmLl9zdGF0ZSA9IDI7XG4gICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICBmaW5hbGUoc2VsZik7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5hbGUoc2VsZikge1xuICAgIGlmIChzZWxmLl9zdGF0ZSA9PT0gMiAmJiBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBQcm9taXNlLl9pbW1lZGlhdGVGbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9oYW5kbGVkKSB7XG4gICAgICAgICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4oc2VsZi5fdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsZi5fZGVmZXJyZWRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBoYW5kbGUoc2VsZiwgc2VsZi5fZGVmZXJyZWRzW2ldKTtcbiAgICB9XG4gICAgc2VsZi5fZGVmZXJyZWRzID0gbnVsbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb21pc2UpIHtcbiAgICB0aGlzLm9uRnVsZmlsbGVkID0gdHlwZW9mIG9uRnVsZmlsbGVkID09PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiBudWxsO1xuICAgIHRoaXMub25SZWplY3RlZCA9IHR5cGVvZiBvblJlamVjdGVkID09PSAnZnVuY3Rpb24nID8gb25SZWplY3RlZCA6IG51bGw7XG4gICAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlIGEgcG90ZW50aWFsbHkgbWlzYmVoYXZpbmcgcmVzb2x2ZXIgZnVuY3Rpb24gYW5kIG1ha2Ugc3VyZVxuICAgKiBvbkZ1bGZpbGxlZCBhbmQgb25SZWplY3RlZCBhcmUgb25seSBjYWxsZWQgb25jZS5cbiAgICpcbiAgICogTWFrZXMgbm8gZ3VhcmFudGVlcyBhYm91dCBhc3luY2hyb255LlxuICAgKi9cbiAgZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBzZWxmKSB7XG4gICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICB0cnkge1xuICAgICAgZm4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKHNlbGYsIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlamVjdChzZWxmLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICBkb25lID0gdHJ1ZTtcbiAgICAgIHJlamVjdChzZWxmLCBleCk7XG4gICAgfVxuICB9XG5cbiAgUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG4gIH07XG5cbiAgUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgIHZhciBwcm9tID0gbmV3ICh0aGlzLmNvbnN0cnVjdG9yKShub29wKTtcblxuICAgIGhhbmRsZSh0aGlzLCBuZXcgSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbSkpO1xuICAgIHJldHVybiBwcm9tO1xuICB9O1xuXG4gIFByb21pc2UuYWxsID0gZnVuY3Rpb24gKGFycikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJyKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiByZXNvbHZlKFtdKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSBhcmdzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gcmVzKGksIHZhbCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh2YWwgJiYgKHR5cGVvZiB2YWwgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgICB2YXIgdGhlbiA9IHZhbC50aGVuO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgIHRoZW4uY2FsbCh2YWwsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICByZXMoaSwgdmFsKTtcbiAgICAgICAgICAgICAgfSwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdzW2ldID0gdmFsO1xuICAgICAgICAgIGlmICgtLXJlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgcmVqZWN0KGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzKGksIGFyZ3NbaV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlLmNvbnN0cnVjdG9yID09PSBQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWplY3QodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmFjZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHZhbHVlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YWx1ZXNbaV0udGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIFVzZSBwb2x5ZmlsbCBmb3Igc2V0SW1tZWRpYXRlIGZvciBwZXJmb3JtYW5jZSBnYWluc1xuICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9ICh0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIGZ1bmN0aW9uIChmbikgeyBzZXRJbW1lZGlhdGUoZm4pOyB9KSB8fFxuICAgIGZ1bmN0aW9uIChmbikge1xuICAgICAgc2V0VGltZW91dEZ1bmMoZm4sIDApO1xuICAgIH07XG5cbiAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfdW5oYW5kbGVkUmVqZWN0aW9uRm4oZXJyKSB7XG4gICAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Bvc3NpYmxlIFVuaGFuZGxlZCBQcm9taXNlIFJlamVjdGlvbjonLCBlcnIpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgaW1tZWRpYXRlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgY2FsbGJhY2tzXG4gICAqIEBwYXJhbSBmbiB7ZnVuY3Rpb259IEZ1bmN0aW9uIHRvIGV4ZWN1dGVcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldEltbWVkaWF0ZUZuID0gZnVuY3Rpb24gX3NldEltbWVkaWF0ZUZuKGZuKSB7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4gPSBmbjtcbiAgfTtcblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBmdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiB1bmhhbmRsZWQgcmVqZWN0aW9uXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBQcm9taXNlLl9zZXRVbmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF9zZXRVbmhhbmRsZWRSZWplY3Rpb25Gbihmbikge1xuICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZm47XG4gIH07XG4gIFxuICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4gIH0gZWxzZSBpZiAoIXJvb3QuUHJvbWlzZSkge1xuICAgIHJvb3QuUHJvbWlzZSA9IFByb21pc2U7XG4gIH1cblxufSkodGhpcyk7XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgcmF3SGVhZGVycy5zcGxpdCgvXFxyP1xcbi8pLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgdmFyIHBhcnRzID0gbGluZS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gcGFydHMuc2hpZnQoKS50cmltKClcbiAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGFydHMuam9pbignOicpLnRyaW0oKVxuICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRlcnNcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSAnc3RhdHVzJyBpbiBvcHRpb25zID8gb3B0aW9ucy5zdGF0dXMgOiAyMDBcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gJ3N0YXR1c1RleHQnIGluIG9wdGlvbnMgPyBvcHRpb25zLnN0YXR1c1RleHQgOiAnT0snXG4gICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnNcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdFxuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2VcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiB4aHIuc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkgfHwgJycpXG4gICAgICAgIH1cbiAgICAgICAgb3B0aW9ucy51cmwgPSAncmVzcG9uc2VVUkwnIGluIHhociA/IHhoci5yZXNwb25zZVVSTCA6IG9wdGlvbnMuaGVhZGVycy5nZXQoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9udGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwidmFyIFByb21pc2UgPSByZXF1aXJlKCdwcm9taXNlLXBvbHlmaWxsJyk7XHJcbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xyXG5cclxuaWYgKCF3aW5kb3cuUHJvbWlzZSkge1xyXG4gIHdpbmRvdy5Qcm9taXNlID0gUHJvbWlzZTtcclxufVxyXG5cclxudmFyIG9wdGlvbnMgPSAodHlwZW9mIGNvbnRpZGlvT3B0aW9ucyAhPT0gXCJ1bmRlZmluZWRcIikgPyBjb250aWRpb09wdGlvbnMgOiB7fTtcclxuXHJcbnZhciB1cmwgPSBvcHRpb25zLnVybCA/IG9wdGlvbnMudXJsIDogJyc7XHJcblxyXG5mZXRjaCh1cmwsIHtcclxuICBoZWFkZXJzOiB7XHJcbiAgICAneC1jb250aWRpby1zZGsnOiAnMS4wLUpTJ1xyXG4gIH1cclxufSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG59KS50aGVuKGZ1bmN0aW9uIChqc29uKSB7XHJcblxyXG4gIHZhciByZW5kZXJlciA9IG5ldyBSZW5kZXJlcigkLCBqc29uLCBvcHRpb25zKTtcclxuXHJcbiAgcmVuZGVyZXIuaW5pdCgpO1xyXG5cclxufSk7XHJcblxyXG52YXIgJCA9IHJlcXVpcmUoJ2RvbXRhc3RpYycpO1xyXG5cclxuIl19
