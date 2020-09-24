(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash -o ./dist/lodash.compat.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used internally to indicate various things */
  var indicatorObject = {};

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to fix the JScript [[DontEnum]] bug */
  var shadowedProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      errorClass = '[object Error]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used as the data object for `iteratorTemplate` */
  var iteratorData = {
    'args': '',
    'array': null,
    'bottom': '',
    'firstArg': '',
    'init': '',
    'keys': null,
    'loop': '',
    'shadowedProps': null,
    'support': null,
    'top': '',
    'useHas': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Checks if `value` is a DOM node in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.
   */
  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Error = context.Error,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var errorProto = Error.prototype,
        objectProto = Object.prototype,
        stringProto = String.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /** Used to avoid iterating non-enumerable properties in IE < 9 */
    var nonEnumProps = {};
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
    nonEnumProps[objectClass] = { 'constructor': true };

    (function() {
      var length = shadowedProps.length;
      while (length--) {
        var key = shadowedProps[length];
        for (var className in nonEnumProps) {
          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
            nonEnumProps[className][key] = false;
          }
        }
      }
    }());

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    (function() {
      var ctor = function() { this.x = 1; },
          object = { '0': 1, 'length': 1 },
          props = [];

      ctor.prototype = { 'valueOf': 1, 'y': 1 };
      for (var key in new ctor) { props.push(key); }
      for (key in arguments) { }

      /**
       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.argsClass = toString.call(arguments) == argsClass;

      /**
       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);

      /**
       * Detect if `name` or `message` properties of `Error.prototype` are
       * enumerable by default. (IE < 9, Safari < 5.1)
       *
       * @memberOf _.support
       * @type boolean
       */
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

      /**
       * Detect if `prototype` properties are enumerable by default.
       *
       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
       * (if the prototype or a property on the prototype has been set)
       * incorrectly sets a function's `prototype` property [[Enumerable]]
       * value to `true`.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

      /**
       * Detect if functions can be decompiled by `Function#toString`
       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

      /**
       * Detect if `Function#name` is supported (all but IE).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.funcNames = typeof Function.name == 'string';

      /**
       * Detect if `arguments` object indexes are non-enumerable
       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.nonEnumArgs = key != 0;

      /**
       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
       *
       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are
       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.nonEnumShadows = !/valueOf/.test(props);

      /**
       * Detect if own properties are iterated after inherited properties (all but IE < 9).
       *
       * @memberOf _.support
       * @type boolean
       */
      support.ownLast = props[0] != 'x';

      /**
       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.
       *
       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`
       * and `splice()` functions that fail to remove the last element, `value[0]`,
       * of array-like objects even though the `length` property is set to `0`.
       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`
       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);

      /**
       * Detect lack of support for accessing string characters by index.
       *
       * IE < 8 can't access characters by index and IE 8 can only access
       * characters by index on string literals.
       *
       * @memberOf _.support
       * @type boolean
       */
      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';

      /**
       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)
       * and that the JS engine errors when attempting to coerce an object to
       * a string without a `toString` function.
       *
       * @memberOf _.support
       * @type boolean
       */
      try {
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
      } catch(e) {
        support.nodeClass = true;
      }
    }(1));

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The template used to create iterator functions.
     *
     * @private
     * @param {Object} data The data object used to populate the text.
     * @returns {string} Returns the interpolated text.
     */
    var iteratorTemplate = function(obj) {

      var __p = 'var index, iterable = ' +
      (obj.firstArg) +
      ', result = ' +
      (obj.init) +
      ';\nif (!iterable) return result;\n' +
      (obj.top) +
      ';';
       if (obj.array) {
      __p += '\nvar length = iterable.length; index = -1;\nif (' +
      (obj.array) +
      ') {  ';
       if (support.unindexedChars) {
      __p += '\n  if (isString(iterable)) {\n    iterable = iterable.split(\'\')\n  }  ';
       }
      __p += '\n  while (++index < length) {\n    ' +
      (obj.loop) +
      ';\n  }\n}\nelse {  ';
       } else if (support.nonEnumArgs) {
      __p += '\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += \'\';\n      ' +
      (obj.loop) +
      ';\n    }\n  } else {  ';
       }

       if (support.enumPrototypes) {
      __p += '\n  var skipProto = typeof iterable == \'function\';\n  ';
       }

       if (support.enumErrorProps) {
      __p += '\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ';
       }

          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == "prototype")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == "message" || index == "name"))'); }

       if (obj.useHas && obj.keys) {
      __p += '\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n';
          if (conditions.length) {
      __p += '    if (' +
      (conditions.join(' && ')) +
      ') {\n  ';
       }
      __p +=
      (obj.loop) +
      ';    ';
       if (conditions.length) {
      __p += '\n    }';
       }
      __p += '\n  }  ';
       } else {
      __p += '\n  for (index in iterable) {\n';
          if (obj.useHas) { conditions.push("hasOwnProperty.call(iterable, index)"); }    if (conditions.length) {
      __p += '    if (' +
      (conditions.join(' && ')) +
      ') {\n  ';
       }
      __p +=
      (obj.loop) +
      ';    ';
       if (conditions.length) {
      __p += '\n    }';
       }
      __p += '\n  }    ';
       if (support.nonEnumShadows) {
      __p += '\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ';
       for (k = 0; k < 7; k++) {
      __p += '\n    index = \'' +
      (obj.shadowedProps[k]) +
      '\';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';
              if (!obj.useHas) {
      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';
       }
      __p += ') {\n      ' +
      (obj.loop) +
      ';\n    }      ';
       }
      __p += '\n  }    ';
       }

       }

       if (obj.array || support.nonEnumArgs) {
      __p += '\n}';
       }
      __p +=
      (obj.bottom) +
      ';\nreturn result';

      return __p
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? baseEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        if (isArray(collection)) {
          var index = -1,
              length = collection.length;

          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          baseEach(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Creates compiled iteration functions.
     *
     * @private
     * @param {...Object} [options] The compile options object(s).
     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.
     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.
     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.
     * @param {string} [options.args] A comma separated string of iteration function arguments.
     * @param {string} [options.top] Code to execute before the iteration branches.
     * @param {string} [options.loop] Code to execute in the object loop.
     * @param {string} [options.bottom] Code to execute after the iteration branches.
     * @returns {Function} Returns the compiled function.
     */
    function createIterator() {
      // data properties
      iteratorData.shadowedProps = shadowedProps;

      // iterator options
      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';
      iteratorData.init = 'iterable';
      iteratorData.useHas = true;

      // merge options into a template data object
      for (var object, index = 0; object = arguments[index]; index++) {
        for (var key in object) {
          iteratorData[key] = object[key];
        }
      }
      var args = iteratorData.args;
      iteratorData.firstArg = /^[^,]+/.exec(args)[0];

      // create the function factory
      var factory = Function(
          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +
          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +
          'objectTypes, nonEnumProps, stringClass, stringProto, toString',
        'return function(' + args + ') {\n' + iteratorTemplate(iteratorData) + '\n}'
      );

      // return the compiled function
      return factory(
        baseCreateCallback, errorClass, errorProto, hasOwnProperty,
        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,
        objectTypes, nonEnumProps, stringClass, stringProto, toString
      );
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||
          (!support.argsClass && isArguments(value)) ||
          (!support.nodeClass && isNode(value))) {
        return false;
      }
      // IE < 9 iterates inherited properties before own properties. If the first
      // iterated property is an object's own property then there are no inherited
      // enumerable properties.
      if (support.ownLast) {
        forIn(value, function(value, key, object) {
          result = hasOwnProperty.call(object, key);
          return false;
        });
        return result !== false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }
    // fallback for browsers that can't detect `arguments` objects by [[Class]]
    if (!support.argsClass) {
      isArguments = function(value) {
        return value && typeof value == 'object' && typeof value.length == 'number' &&
          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;
      };
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = createIterator({
      'args': 'object',
      'init': '[]',
      'top': 'if (!(objectTypes[typeof object])) return result',
      'loop': 'result.push(index)'
    });

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      if ((support.enumPrototypes && typeof object == 'function') ||
          (support.nonEnumArgs && object.length && isArguments(object))) {
        return shimKeys(object);
      }
      return nativeKeys(object);
    };

    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */
    var eachIteratorOptions = {
      'args': 'collection, callback, thisArg',
      'top': "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
      'array': "typeof length == 'number'",
      'keys': keys,
      'loop': 'if (callback(iterable[index], index, collection) === false) return result'
    };

    /** Reusable iterator options for `assign` and `defaults` */
    var defaultsIteratorOptions = {
      'args': 'object, source, guard',
      'top':
        'var args = arguments,\n' +
        '    argsIndex = 0,\n' +
        "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" +
        'while (++argsIndex < argsLength) {\n' +
        '  iterable = args[argsIndex];\n' +
        '  if (iterable && objectTypes[typeof iterable]) {',
      'keys': keys,
      'loop': "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
      'bottom': '  }\n}'
    };

    /** Reusable iterator options for `forIn` and `forOwn` */
    var forOwnIteratorOptions = {
      'top': 'if (!objectTypes[typeof iterable]) return result;\n' + eachIteratorOptions.top,
      'array': false
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /**
     * A function compiled to iterate `arguments` objects, arrays, objects, and
     * strings consistenly across environments, executing the callback for each
     * element in the collection. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index|key, collection). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @private
     * @type Function
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     */
    var baseEach = createIterator(eachIteratorOptions);

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = createIterator(defaultsIteratorOptions, {
      'top':
        defaultsIteratorOptions.top.replace(';',
          ';\n' +
          "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" +
          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n' +
          "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" +
          '  callback = args[--argsLength];\n' +
          '}'
        ),
      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'
    });

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = createIterator(defaultsIteratorOptions);

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
      'useHas': false
    });

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass ||
          (support.argsClass ? className == argsClass : isArguments(value))) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }
    // fallback for older versions of Chrome and Safari
    if (isFunction(/x/)) {
      isFunction = function(value) {
        return typeof value == 'function' && toString.call(value) == funcClass;
      };
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? baseEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        baseEach(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        baseEach(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        baseEach(collection, callback, thisArg);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var iterable = collection,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (isArray(collection)) {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        if (typeof length != 'number') {
          var props = keys(collection);
          length = props.length;
        } else if (support.unindexedChars && isString(collection)) {
          iterable = collection.split('');
        }
        baseEach(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(iterable[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      callback = lodash.createCallback(callback, thisArg, 3);
      if (isArray(collection)) {
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        baseEach(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        baseEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        baseEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      } else if (support.unindexedChars && isString(collection)) {
        collection = collection.split('');
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        baseEach(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return (support.unindexedChars && isString(collection))
          ? collection.split('')
          : slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    baseEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    baseEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    // avoid array-like object bugs with `Array#shift` and `Array#splice`
    // in IE < 9, Firefox < 10, Narwhal, and RingoJS
    if (!support.spliceObjects) {
      baseEach(['pop', 'shift', 'splice'], function(methodName) {
        var func = arrayRef[methodName],
            isSplice = methodName == 'splice';

        lodash.prototype[methodName] = function() {
          var chainAll = this.__chain__,
              value = this.__wrapped__,
              result = func.apply(value, arguments);

          if (value.length === 0) {
            delete value[0];
          }
          return (chainAll || isSplice)
            ? new lodashWrapper(result, chainAll)
            : result;
        };
      });
    }

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
!function(){"use strict";var VERSION="2.0.1";var ENTITIES={};var latin_map={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","ẞ":"SS","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ß":"ss","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};function initialize(object,s){if(s!==null&&s!==undefined){if(typeof s==="string")object.s=s;else object.s=s.toString()}else{object.s=s}object.orig=s;if(s!==null&&s!==undefined){if(object.__defineGetter__){object.__defineGetter__("length",function(){return object.s.length})}else{object.length=s.length}}else{object.length=-1}}function S(s){initialize(this,s)}var __nsp=String.prototype;var __sp=S.prototype={between:function(left,right){var s=this.s;var startPos=s.indexOf(left);var endPos=s.indexOf(right,startPos+left.length);if(endPos==-1&&right!=null)return new this.constructor("");else if(endPos==-1&&right==null)return new this.constructor(s.substring(startPos+left.length));else return new this.constructor(s.slice(startPos+left.length,endPos))},camelize:function(){var s=this.trim().s.replace(/(\-|_|\s)+(.)?/g,function(mathc,sep,c){return c?c.toUpperCase():""});return new this.constructor(s)},capitalize:function(){return new this.constructor(this.s.substr(0,1).toUpperCase()+this.s.substring(1).toLowerCase())},charAt:function(index){return this.s.charAt(index)},chompLeft:function(prefix){var s=this.s;if(s.indexOf(prefix)===0){s=s.slice(prefix.length);return new this.constructor(s)}else{return this}},chompRight:function(suffix){if(this.endsWith(suffix)){var s=this.s;s=s.slice(0,s.length-suffix.length);return new this.constructor(s)}else{return this}},collapseWhitespace:function(){var s=this.s.replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"");return new this.constructor(s)},contains:function(ss){return this.s.indexOf(ss)>=0},count:function(ss){var count=0,pos=this.s.indexOf(ss);while(pos>=0){count+=1;pos=this.s.indexOf(ss,pos+1)}return count},dasherize:function(){var s=this.trim().s.replace(/[_\s]+/g,"-").replace(/([A-Z])/g,"-$1").replace(/-+/g,"-").toLowerCase();return new this.constructor(s)},latinise:function(){var s=this.replace(/[^A-Za-z0-9\[\] ]/g,function(x){return latin_map[x]||x});return new this.constructor(s)},decodeHtmlEntities:function(){var s=this.s;s=s.replace(/&#(\d+);?/g,function(_,code){return String.fromCharCode(code)}).replace(/&#[xX]([A-Fa-f0-9]+);?/g,function(_,hex){return String.fromCharCode(parseInt(hex,16))}).replace(/&([^;\W]+;?)/g,function(m,e){var ee=e.replace(/;$/,"");var target=ENTITIES[e]||e.match(/;$/)&&ENTITIES[ee];if(typeof target==="number"){return String.fromCharCode(target)}else if(typeof target==="string"){return target}else{return m}});return new this.constructor(s)},endsWith:function(suffix){var l=this.s.length-suffix.length;return l>=0&&this.s.indexOf(suffix,l)===l},escapeHTML:function(){return new this.constructor(this.s.replace(/[&<>"']/g,function(m){return"&"+reversedEscapeChars[m]+";"}))},ensureLeft:function(prefix){var s=this.s;if(s.indexOf(prefix)===0){return this}else{return new this.constructor(prefix+s)}},ensureRight:function(suffix){var s=this.s;if(this.endsWith(suffix)){return this}else{return new this.constructor(s+suffix)}},humanize:function(){if(this.s===null||this.s===undefined)return new this.constructor("");var s=this.underscore().replace(/_id$/,"").replace(/_/g," ").trim().capitalize();return new this.constructor(s)},isAlpha:function(){return!/[^a-z\xDF-\xFF]|^$/.test(this.s.toLowerCase())},isAlphaNumeric:function(){return!/[^0-9a-z\xDF-\xFF]/.test(this.s.toLowerCase())},isEmpty:function(){return this.s===null||this.s===undefined?true:/^[\s\xa0]*$/.test(this.s)},isLower:function(){return this.isAlpha()&&this.s.toLowerCase()===this.s},isNumeric:function(){return!/[^0-9]/.test(this.s)},isUpper:function(){return this.isAlpha()&&this.s.toUpperCase()===this.s},left:function(N){if(N>=0){var s=this.s.substr(0,N);return new this.constructor(s)}else{return this.right(-N)}},lines:function(){return this.replaceAll("\r\n","\n").s.split("\n")},pad:function(len,ch){if(ch==null)ch=" ";if(this.s.length>=len)return new this.constructor(this.s);len=len-this.s.length;var left=Array(Math.ceil(len/2)+1).join(ch);var right=Array(Math.floor(len/2)+1).join(ch);return new this.constructor(left+this.s+right)},padLeft:function(len,ch){if(ch==null)ch=" ";if(this.s.length>=len)return new this.constructor(this.s);return new this.constructor(Array(len-this.s.length+1).join(ch)+this.s)},padRight:function(len,ch){if(ch==null)ch=" ";if(this.s.length>=len)return new this.constructor(this.s);return new this.constructor(this.s+Array(len-this.s.length+1).join(ch))},parseCSV:function(delimiter,qualifier,escape,lineDelimiter){delimiter=delimiter||",";escape=escape||"\\";if(typeof qualifier=="undefined")qualifier='"';var i=0,fieldBuffer=[],fields=[],len=this.s.length,inField=false,inUnqualifiedString=false,self=this;var ca=function(i){return self.s.charAt(i)};if(typeof lineDelimiter!=="undefined")var rows=[];if(!qualifier)inField=true;while(i<len){var current=ca(i);switch(current){case escape:if(inField&&(escape!==qualifier||ca(i+1)===qualifier)){i+=1;fieldBuffer.push(ca(i));break}if(escape!==qualifier)break;case qualifier:inField=!inField;break;case delimiter:if(inUnqualifiedString){inField=false;inUnqualifiedString=false}if(inField&&qualifier)fieldBuffer.push(current);else{fields.push(fieldBuffer.join(""));fieldBuffer.length=0}break;case lineDelimiter:if(inUnqualifiedString){inField=false;inUnqualifiedString=false;fields.push(fieldBuffer.join(""));rows.push(fields);fields=[];fieldBuffer.length=0}else if(inField){fieldBuffer.push(current)}else{if(rows){fields.push(fieldBuffer.join(""));rows.push(fields);fields=[];fieldBuffer.length=0}}break;case" ":if(inField)fieldBuffer.push(current);break;default:if(inField)fieldBuffer.push(current);else if(current!==qualifier){fieldBuffer.push(current);inField=true;inUnqualifiedString=true}break}i+=1}fields.push(fieldBuffer.join(""));if(rows){rows.push(fields);return rows}return fields},replaceAll:function(ss,r){var s=this.s.split(ss).join(r);return new this.constructor(s)},right:function(N){if(N>=0){var s=this.s.substr(this.s.length-N,N);return new this.constructor(s)}else{return this.left(-N)}},setValue:function(s){initialize(this,s);return this},slugify:function(){var sl=new S(new S(this.s).latinise().s.replace(/[^\w\s-]/g,"").toLowerCase()).dasherize().s;if(sl.charAt(0)==="-")sl=sl.substr(1);return new this.constructor(sl)},startsWith:function(prefix){return this.s.lastIndexOf(prefix,0)===0},stripPunctuation:function(){return new this.constructor(this.s.replace(/[^\w\s]|_/g,"").replace(/\s+/g," "))},stripTags:function(){var s=this.s,args=arguments.length>0?arguments:[""];multiArgs(args,function(tag){s=s.replace(RegExp("</?"+tag+"[^<>]*>","gi"),"")});return new this.constructor(s)},template:function(values,opening,closing){var s=this.s;var opening=opening||Export.TMPL_OPEN;var closing=closing||Export.TMPL_CLOSE;var open=opening.replace(/[-[\]()*\s]/g,"\\$&").replace(/\$/g,"\\$");var close=closing.replace(/[-[\]()*\s]/g,"\\$&").replace(/\$/g,"\\$");var r=new RegExp(open+"(.+?)"+close,"g");var matches=s.match(r)||[];matches.forEach(function(match){var key=match.substring(opening.length,match.length-closing.length);if(typeof values[key]!="undefined")s=s.replace(match,values[key])});return new this.constructor(s)},times:function(n){return new this.constructor(new Array(n+1).join(this.s))},toBoolean:function(){if(typeof this.orig==="string"){var s=this.s.toLowerCase();return s==="true"||s==="yes"||s==="on"||s==="1"}else return this.orig===true||this.orig===1},toFloat:function(precision){var num=parseFloat(this.s);if(precision)return parseFloat(num.toFixed(precision));else return num},toInt:function(){return/^\s*-?0x/i.test(this.s)?parseInt(this.s,16):parseInt(this.s,10)},trim:function(){var s;if(typeof __nsp.trim==="undefined")s=this.s.replace(/(^\s*|\s*$)/g,"");else s=this.s.trim();return new this.constructor(s)},trimLeft:function(){var s;if(__nsp.trimLeft)s=this.s.trimLeft();else s=this.s.replace(/(^\s*)/g,"");return new this.constructor(s)},trimRight:function(){var s;if(__nsp.trimRight)s=this.s.trimRight();else s=this.s.replace(/\s+$/,"");return new this.constructor(s)},truncate:function(length,pruneStr){var str=this.s;length=~~length;pruneStr=pruneStr||"...";if(str.length<=length)return new this.constructor(str);var tmpl=function(c){return c.toUpperCase()!==c.toLowerCase()?"A":" "},template=str.slice(0,length+1).replace(/.(?=\W*\w*$)/g,tmpl);if(template.slice(template.length-2).match(/\w\w/))template=template.replace(/\s*\S+$/,"");else template=new S(template.slice(0,template.length-1)).trimRight().s;return(template+pruneStr).length>str.length?new S(str):new S(str.slice(0,template.length)+pruneStr)},toCSV:function(){var delim=",",qualifier='"',escape="\\",encloseNumbers=true,keys=false;var dataArray=[];function hasVal(it){return it!==null&&it!==""}if(typeof arguments[0]==="object"){delim=arguments[0].delimiter||delim;delim=arguments[0].separator||delim;qualifier=arguments[0].qualifier||qualifier;encloseNumbers=!!arguments[0].encloseNumbers;escape=arguments[0].escape||escape;keys=!!arguments[0].keys}else if(typeof arguments[0]==="string"){delim=arguments[0]}if(typeof arguments[1]==="string")qualifier=arguments[1];if(arguments[1]===null)qualifier=null;if(this.orig instanceof Array)dataArray=this.orig;else{for(var key in this.orig)if(this.orig.hasOwnProperty(key))if(keys)dataArray.push(key);else dataArray.push(this.orig[key])}var rep=escape+qualifier;var buildString=[];for(var i=0;i<dataArray.length;++i){var shouldQualify=hasVal(qualifier);if(typeof dataArray[i]=="number")shouldQualify&=encloseNumbers;if(shouldQualify)buildString.push(qualifier);if(dataArray[i]!==null&&dataArray[i]!==undefined){var d=new S(dataArray[i]).replaceAll(qualifier,rep).s;buildString.push(d)}else buildString.push("");if(shouldQualify)buildString.push(qualifier);if(delim)buildString.push(delim)}buildString.length=buildString.length-1;return new this.constructor(buildString.join(""))},toString:function(){return this.s},underscore:function(){var s=this.trim().s.replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase();if(new S(this.s.charAt(0)).isUpper()){s="_"+s}return new this.constructor(s)},unescapeHTML:function(){return new this.constructor(this.s.replace(/\&([^;]+);/g,function(entity,entityCode){var match;if(entityCode in escapeChars){return escapeChars[entityCode]}else if(match=entityCode.match(/^#x([\da-fA-F]+)$/)){return String.fromCharCode(parseInt(match[1],16))}else if(match=entityCode.match(/^#(\d+)$/)){return String.fromCharCode(~~match[1])}else{return entity}}))},valueOf:function(){return this.s.valueOf()},wrapHTML:function(tagName,tagAttrs){var s=this.s,el=tagName==null?"span":tagName,elAttr="",wrapped="";if(typeof tagAttrs=="object")for(var prop in tagAttrs)elAttr+=" "+prop+'="'+new this.constructor(tagAttrs[prop]).escapeHTML()+'"';s=wrapped.concat("<",el,elAttr,">",this,"</",el,">");return new this.constructor(s)}};var methodsAdded=[];function extendPrototype(){for(var name in __sp){(function(name){var func=__sp[name];if(!__nsp.hasOwnProperty(name)){methodsAdded.push(name);__nsp[name]=function(){String.prototype.s=this;return func.apply(this,arguments)}}})(name)}}function restorePrototype(){for(var i=0;i<methodsAdded.length;++i)delete String.prototype[methodsAdded[i]];methodsAdded.length=0}var nativeProperties=getNativeStringProperties();for(var name in nativeProperties){(function(name){var stringProp=__nsp[name];if(typeof stringProp=="function"){if(!__sp[name]){if(nativeProperties[name]==="string"){__sp[name]=function(){return new this.constructor(stringProp.apply(this,arguments))}}else{__sp[name]=stringProp}}}})(name)}__sp.repeat=__sp.times;__sp.include=__sp.contains;__sp.toInteger=__sp.toInt;__sp.toBool=__sp.toBoolean;__sp.decodeHTMLEntities=__sp.decodeHtmlEntities;__sp.constructor=S;function getNativeStringProperties(){var names=getNativeStringPropertyNames();var retObj={};for(var i=0;i<names.length;++i){var name=names[i];var func=__nsp[name];try{var type=typeof func.apply("teststring",[]);retObj[name]=type}catch(e){}}return retObj}function getNativeStringPropertyNames(){var results=[];if(Object.getOwnPropertyNames){results=Object.getOwnPropertyNames(__nsp);results.splice(results.indexOf("valueOf"),1);results.splice(results.indexOf("toString"),1);return results}else{var stringNames={};var objectNames=[];for(var name in String.prototype)stringNames[name]=name;for(var name in Object.prototype)delete stringNames[name];for(var name in stringNames){results.push(name)}return results}}function Export(str){return new S(str)}Export.extendPrototype=extendPrototype;Export.restorePrototype=restorePrototype;Export.VERSION=VERSION;Export.TMPL_OPEN="{{";Export.TMPL_CLOSE="}}";Export.ENTITIES=ENTITIES;if(typeof module!=="undefined"&&typeof module.exports!=="undefined"){module.exports=Export}else{if(typeof define==="function"&&define.amd){define([],function(){return Export})}else{window.S=Export}}function multiArgs(args,fn){var result=[],i;for(i=0;i<args.length;i++){result.push(args[i]);if(fn)fn.call(args,args[i],i)}return result}var escapeChars={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"};var reversedEscapeChars={};for(var key in escapeChars){reversedEscapeChars[escapeChars[key]]=key}ENTITIES={amp:"&",gt:">",lt:"<",quot:'"',apos:"'",AElig:198,Aacute:193,Acirc:194,Agrave:192,Aring:197,Atilde:195,Auml:196,Ccedil:199,ETH:208,Eacute:201,Ecirc:202,Egrave:200,Euml:203,Iacute:205,Icirc:206,Igrave:204,Iuml:207,Ntilde:209,Oacute:211,Ocirc:212,Ograve:210,Oslash:216,Otilde:213,Ouml:214,THORN:222,Uacute:218,Ucirc:219,Ugrave:217,Uuml:220,Yacute:221,aacute:225,acirc:226,aelig:230,agrave:224,aring:229,atilde:227,auml:228,ccedil:231,eacute:233,ecirc:234,egrave:232,eth:240,euml:235,iacute:237,icirc:238,igrave:236,iuml:239,ntilde:241,oacute:243,ocirc:244,ograve:242,oslash:248,otilde:245,ouml:246,szlig:223,thorn:254,uacute:250,ucirc:251,ugrave:249,uuml:252,yacute:253,yuml:255,copy:169,reg:174,nbsp:160,iexcl:161,cent:162,pound:163,curren:164,yen:165,brvbar:166,sect:167,uml:168,ordf:170,laquo:171,not:172,shy:173,macr:175,deg:176,plusmn:177,sup1:185,sup2:178,sup3:179,acute:180,micro:181,para:182,middot:183,cedil:184,ordm:186,raquo:187,frac14:188,frac12:189,frac34:190,iquest:191,times:215,divide:247,"OElig;":338,"oelig;":339,"Scaron;":352,"scaron;":353,"Yuml;":376,"fnof;":402,"circ;":710,"tilde;":732,"Alpha;":913,"Beta;":914,"Gamma;":915,"Delta;":916,"Epsilon;":917,"Zeta;":918,"Eta;":919,"Theta;":920,"Iota;":921,"Kappa;":922,"Lambda;":923,"Mu;":924,"Nu;":925,"Xi;":926,"Omicron;":927,"Pi;":928,"Rho;":929,"Sigma;":931,"Tau;":932,"Upsilon;":933,"Phi;":934,"Chi;":935,"Psi;":936,"Omega;":937,"alpha;":945,"beta;":946,"gamma;":947,"delta;":948,"epsilon;":949,"zeta;":950,"eta;":951,"theta;":952,"iota;":953,"kappa;":954,"lambda;":955,"mu;":956,"nu;":957,"xi;":958,"omicron;":959,"pi;":960,"rho;":961,"sigmaf;":962,"sigma;":963,"tau;":964,"upsilon;":965,"phi;":966,"chi;":967,"psi;":968,"omega;":969,"thetasym;":977,"upsih;":978,"piv;":982,"ensp;":8194,"emsp;":8195,"thinsp;":8201,"zwnj;":8204,"zwj;":8205,"lrm;":8206,"rlm;":8207,"ndash;":8211,"mdash;":8212,"lsquo;":8216,"rsquo;":8217,"sbquo;":8218,"ldquo;":8220,"rdquo;":8221,"bdquo;":8222,"dagger;":8224,"Dagger;":8225,"bull;":8226,"hellip;":8230,"permil;":8240,"prime;":8242,"Prime;":8243,"lsaquo;":8249,"rsaquo;":8250,"oline;":8254,"frasl;":8260,"euro;":8364,"image;":8465,"weierp;":8472,"real;":8476,"trade;":8482,"alefsym;":8501,"larr;":8592,"uarr;":8593,"rarr;":8594,"darr;":8595,"harr;":8596,"crarr;":8629,"lArr;":8656,"uArr;":8657,"rArr;":8658,"dArr;":8659,"hArr;":8660,"forall;":8704,"part;":8706,"exist;":8707,"empty;":8709,"nabla;":8711,"isin;":8712,"notin;":8713,"ni;":8715,"prod;":8719,"sum;":8721,"minus;":8722,"lowast;":8727,"radic;":8730,"prop;":8733,"infin;":8734,"ang;":8736,"and;":8743,"or;":8744,"cap;":8745,"cup;":8746,"int;":8747,"there4;":8756,"sim;":8764,"cong;":8773,"asymp;":8776,"ne;":8800,"equiv;":8801,"le;":8804,"ge;":8805,"sub;":8834,"sup;":8835,"nsub;":8836,"sube;":8838,"supe;":8839,"oplus;":8853,"otimes;":8855,"perp;":8869,"sdot;":8901,"lceil;":8968,"rceil;":8969,"lfloor;":8970,"rfloor;":8971,"lang;":9001,"rang;":9002,"loz;":9674,"spades;":9824,"clubs;":9827,"hearts;":9829,"diams;":9830}}.call(this);
},{}],3:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresAnimationBlockCtrlModule', []).controller('ceresAnimationBlockCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],4:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresButtonOutlineCtrlModule', []).controller('ceresButtonOutlineCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],5:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresButtonSolidCtrlModule', []).controller('ceresButtonSolidCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],6:[function(require,module,exports){
'use strict';
var snazzy = require('./snazzy');
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");

// home module
angular.module('ceresGoogleMapCtrlModule', []).controller('ceresGoogleMapCtrl', [
    '$scope',
    '$window',
    '$element',
    '$log',
    function ($scope, $window, $element, $log) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        $scope.map = {
            center: {
                latitude: data.location_lat,
                longitude: data.location_long
            },
            zoom: data.map_zoom,
            draggable: data.draggable
        };

        var value =
            _.find(snazzy.styles, function (style) {
                return style.name == data.styling;
            });

        $scope.options = {};
        if (value) {
            $scope.options.styles = value.json
        }

        $scope.options.mapTypeId = $window.google.maps.MapTypeId[data.map_type];
        $scope.options.scrollwheel = !data.display_map_zoom_scroll;
        $scope.options.mapTypeControl = data.map_type_control;
        $scope.options.panControl = data.pan_control;

        $scope.options.streetViewControl = data.street_view_control;

        $scope.options.zoomControl = data.zoom_control;
        var zoomSize = data.zoom_control_size.toUpperCase();
        $scope.options.zoomControlOptions = {
            style: $window.google.maps.ZoomControlStyle[zoomSize]
        };

    }
]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./snazzy":7}],7:[function(require,module,exports){
module.exports = {
    styles: [
        {"name": "Default", "json": []},
        {"id": 15, "name": "Subtle Grayscale", "json": [
            {"featureType": "landscape", "stylers": [
                {"saturation": -100},
                {"lightness": 65},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "stylers": [
                {"saturation": -100},
                {"lightness": 51},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"saturation": -100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"saturation": -100},
                {"lightness": 30},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"saturation": -100},
                {"lightness": 40},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "stylers": [
                {"saturation": -100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "on"},
                {"lightness": -25},
                {"saturation": -100}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"hue": "#ffff00"},
                {"lightness": -25},
                {"saturation": -97}
            ]}
        ]},
        {"id": 1, "name": "Pale Dawn", "json": [
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#acbcc9"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#f2e5d4"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#c5c6c6"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#e4d7c6"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#fbfaf7"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"color": "#c5dac6"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "on"},
                {"lightness": 33}
            ]},
            {"featureType": "road"},
            {"featureType": "poi.park", "elementType": "labels", "stylers": [
                {"visibility": "on"},
                {"lightness": 20}
            ]},
            {},
            {"featureType": "road", "stylers": [
                {"lightness": 20}
            ]}
        ]},
        {"id": 25, "name": "Blue water", "json": [
            {"featureType": "water", "stylers": [
                {"color": "#46bcec"},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#f2f2f2"}
            ]},
            {"featureType": "road", "stylers": [
                {"saturation": -100},
                {"lightness": 45}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"color": "#444444"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 38, "name": "Shades of Grey", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 17}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 20}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"},
                {"lightness": 17}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000000"},
                {"lightness": 29},
                {"weight": 0.2}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 18}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 16}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 21}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "on"},
                {"color": "#000000"},
                {"lightness": 16}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"saturation": 36},
                {"color": "#000000"},
                {"lightness": 40}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#000000"},
                {"lightness": 19}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"},
                {"lightness": 20}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000000"},
                {"lightness": 17},
                {"weight": 1.2}
            ]}
        ]},
        {"id": 2, "name": "Midnight Commander", "json": [
            {"featureType": "water", "stylers": [
                {"color": "#021019"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#08304b"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#0c4152"},
                {"lightness": 5}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#0b434f"},
                {"lightness": 25}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"color": "#0b3d51"},
                {"lightness": 16}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#000000"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#000000"},
                {"lightness": 13}
            ]},
            {"featureType": "transit", "stylers": [
                {"color": "#146474"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"color": "#144b53"},
                {"lightness": 14},
                {"weight": 1.4}
            ]}
        ]},

        {"id": 18, "name": "Retro", "json": [
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#84afa3"},
                {"lightness": 52}
            ]},
            {"stylers": [
                {"saturation": -17},
                {"gamma": 0.36}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"color": "#3f518c"}
            ]}
        ]},
        {"id": 29, "name": "Light Monochrome", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#e9ebed"},
                {"saturation": -78},
                {"lightness": 67},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#bbc0c4"},
                {"saturation": -93},
                {"lightness": 31},
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"hue": "#e9ebed"},
                {"saturation": -90},
                {"lightness": -8},
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"hue": "#e9ebed"},
                {"saturation": 10},
                {"lightness": 69},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.locality", "elementType": "all", "stylers": [
                {"hue": "#2c2e33"},
                {"saturation": 7},
                {"lightness": 19},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"hue": "#bbc0c4"},
                {"saturation": -93},
                {"lightness": 31},
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels", "stylers": [
                {"hue": "#bbc0c4"},
                {"saturation": -93},
                {"lightness": -2},
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 39, "name": "Paper", "json": [
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#5f94ff"},
                {"lightness": 26},
                {"gamma": 5.86}
            ]},
            {},
            {"featureType": "road.highway", "stylers": [
                {"weight": 0.6},
                {"saturation": -85},
                {"lightness": 61}
            ]},
            {"featureType": "road"},
            {},
            {"featureType": "landscape", "stylers": [
                {"hue": "#0066ff"},
                {"saturation": 74},
                {"lightness": 100}
            ]}
        ]},
        {"id": 42, "name": "Apple Maps-esque", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#a2daf2"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry", "stylers": [
                {"color": "#f7f1df"}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry", "stylers": [
                {"color": "#d0e3b4"}
            ]},
            {"featureType": "landscape.natural.terrain", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"color": "#bde6ab"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.medical", "elementType": "geometry", "stylers": [
                {"color": "#fbd3da"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffe15f"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#efd151"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [
                {"color": "black"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [
                {"color": "#cfb2db"}
            ]}
        ]},
        {"id": 20, "name": "Gowalla", "json": [
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "simplified"},
                {"lightness": 20}
            ]},
            {"featureType": "administrative.land_parcel", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#a1cdfc"},
                {"saturation": 30},
                {"lightness": 49}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"hue": "#f49935"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"hue": "#fad959"}
            ]}
        ]},
        {"id": 5, "name": "Greyscale", "json": [
            {"featureType": "all", "stylers": [
                {"saturation": -100},
                {"gamma": 0.5}
            ]}
        ]},
        {"id": 19, "name": "Subtle", "json": [
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"stylers": [
                {"saturation": -70},
                {"lightness": 37},
                {"gamma": 1.15}
            ]},
            {"elementType": "labels", "stylers": [
                {"gamma": 0.26},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "stylers": [
                {"lightness": 0},
                {"saturation": 0},
                {"hue": "#ffffff"},
                {"gamma": 0}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"lightness": 20}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"lightness": 50},
                {"saturation": 0},
                {"hue": "#ffffff"}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"visibility": "on"},
                {"lightness": -50}
            ]},
            {"featureType": "administrative.province", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.province", "elementType": "labels.text", "stylers": [
                {"lightness": 20}
            ]}
        ]},
        {"id": 53, "name": "Flat Map", "json": [
            {"stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "on"},
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"visibility": "on"},
                {"color": "#fee379"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "on"},
                {"color": "#fee379"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "on"},
                {"color": "#f3f4f4"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#7fc8ed"}
            ]},
            {},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#83cead"}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry", "stylers": [
                {"weight": 0.9},
                {"visibility": "off"}
            ]}
        ]},
        {"id": 13, "name": "Neutral Blue", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#193341"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#2c5a71"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"color": "#29768a"},
                {"lightness": -37}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#406d80"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#406d80"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "on"},
                {"color": "#3e606f"},
                {"weight": 2},
                {"gamma": 0.84}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"weight": 0.6},
                {"color": "#1a3541"}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"color": "#2c5a71"}
            ]}
        ]},
        {"id": 27, "name": "Shift Worker", "json": [
            {"stylers": [
                {"saturation": -100},
                {"gamma": 1}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.business", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.business", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.place_of_worship", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.place_of_worship", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"saturation": 50},
                {"gamma": 0},
                {"hue": "#50a5d1"}
            ]},
            {"featureType": "administrative.neighborhood", "elementType": "labels.text.fill", "stylers": [
                {"color": "#333333"}
            ]},
            {"featureType": "road.local", "elementType": "labels.text", "stylers": [
                {"weight": 0.5},
                {"color": "#333333"}
            ]},
            {"featureType": "transit.station", "elementType": "labels.icon", "stylers": [
                {"gamma": 1},
                {"saturation": 50}
            ]}
        ]},
        {"id": 44, "name": "MapBox", "json": [
            {"featureType": "water", "stylers": [
                {"saturation": 43},
                {"lightness": -11},
                {"hue": "#0088ff"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"hue": "#ff0000"},
                {"saturation": -100},
                {"lightness": 99}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"color": "#808080"},
                {"lightness": 54}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [
                {"color": "#ece2d9"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry.fill", "stylers": [
                {"color": "#ccdca1"}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"color": "#767676"}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#b8cb93"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi.sports_complex", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi.medical", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 54, "name": "RouteXL", "json": [
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"visibility": "on"},
                {"saturation": -100},
                {"lightness": 20}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"visibility": "on"},
                {"saturation": -100},
                {"lightness": 40}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": [
                {"visibility": "on"},
                {"saturation": -10},
                {"lightness": 30}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"visibility": "simplified"},
                {"saturation": -60},
                {"lightness": 10}
            ]},
            {"featureType": "landscape.natural", "elementType": "all", "stylers": [
                {"visibility": "simplified"},
                {"saturation": -60},
                {"lightness": 60}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"visibility": "off"},
                {"saturation": -100},
                {"lightness": 60}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"visibility": "off"},
                {"saturation": -100},
                {"lightness": 60}
            ]}
        ]},
        {"id": 37, "name": "Lunar Landscape", "json": [
            {"stylers": [
                {"hue": "#ff1a00"},
                {"invert_lightness": true},
                {"saturation": -100},
                {"lightness": 33},
                {"gamma": 0.5}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#2D333C"}
            ]}
        ]},
        {"id": 35, "name": "Avocado World", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#aee2e0"}
            ]},
            {"featureType": "landscape", "elementType": "geometry.fill", "stylers": [
                {"color": "#abce83"}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"color": "#769E72"}
            ]},
            {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [
                {"color": "#7B8758"}
            ]},
            {"featureType": "poi", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#EBF4A4"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"},
                {"color": "#8dab68"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"color": "#5B5B3F"}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ABCE83"}
            ]},
            {"featureType": "road", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#A4C67D"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#9BBF72"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#EBF4A4"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "on"},
                {"color": "#87ae79"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"color": "#7f2200"},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "on"},
                {"weight": 4.1}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"color": "#495421"}
            ]},
            {"featureType": "administrative.neighborhood", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 17, "name": "Bright &amp; Bubbly", "json": [
            {"featureType": "water", "stylers": [
                {"color": "#19a0d8"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"},
                {"weight": 6}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"color": "#e85113"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#efe9e4"},
                {"lightness": -40}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"color": "#efe9e4"},
                {"lightness": -20}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"lightness": 100}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"lightness": -100}
            ]},
            {"featureType": "road.highway", "elementType": "labels.icon"},
            {"featureType": "landscape", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"lightness": 20},
                {"color": "#efe9e4"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "labels.text.stroke", "stylers": [
                {"lightness": 100}
            ]},
            {"featureType": "water", "elementType": "labels.text.fill", "stylers": [
                {"lightness": -100}
            ]},
            {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [
                {"hue": "#11ff00"}
            ]},
            {"featureType": "poi", "elementType": "labels.text.stroke", "stylers": [
                {"lightness": 100}
            ]},
            {"featureType": "poi", "elementType": "labels.icon", "stylers": [
                {"hue": "#4cff00"},
                {"saturation": 58}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#f0e4d3"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#efe9e4"},
                {"lightness": -25}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#efe9e4"},
                {"lightness": -10}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 80, "name": "Cool Grey", "json": [
            {"featureType": "landscape", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"stylers": [
                {"hue": "#00aaff"},
                {"saturation": -100},
                {"gamma": 2.15},
                {"lightness": 12}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"lightness": 24}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 57}
            ]}
        ]},
        {"id": 6, "name": "Countries", "json": [
            {"featureType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"lightness": -100}
            ]}
        ]},
        {"id": 43, "name": "Bentley", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#F1FF00"},
                {"saturation": -27.4},
                {"lightness": 9.4},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#0099FF"},
                {"saturation": -20},
                {"lightness": 36.4},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#00FF4F"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#FFB300"},
                {"saturation": -38},
                {"lightness": 11.2},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00B6FF"},
                {"saturation": 4.2},
                {"lightness": -63.4},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#9FFF00"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]}
        ]},
        {"id": 22, "name": "Old Timey", "json": [
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#84afa3"},
                {"lightness": 52}
            ]},
            {"stylers": [
                {"saturation": -77}
            ]},
            {"featureType": "road"}
        ]},
        {"id": 7, "name": "Icy Blue", "json": [
            {"stylers": [
                {"hue": "#2c3e50"},
                {"saturation": 250}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 50},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 74, "name": "becomeadinosaur", "json": [
            {"elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"color": "#f5f5f2"},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.attraction", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.medical", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.place_of_worship", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.school", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.sports_complex", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"visibility": "simplified"},
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.icon", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "poi.park", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#71c8d4"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#e5e8e7"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"color": "#8ba129"}
            ]},
            {"featureType": "road", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "poi.sports_complex", "elementType": "geometry", "stylers": [
                {"color": "#c7c7c7"},
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#a0d3d3"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"color": "#91b65d"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"gamma": 1.51}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi.government", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road"},
            {"featureType": "road"},
            {},
            {"featureType": "road.highway"}
        ]},
        {"id": 61, "name": "Blue Essence", "json": [
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#e0efef"}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"hue": "#1900ff"},
                {"color": "#c0e8e8"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill"},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#7dcdcd"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"lightness": 700}
            ]}
        ]},
        {"id": 12, "name": "Snazzy Maps", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#333739"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#2ecc71"}
            ]},
            {"featureType": "poi", "stylers": [
                {"color": "#2ecc71"},
                {"lightness": -7}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#2ecc71"},
                {"lightness": -28}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#2ecc71"},
                {"visibility": "on"},
                {"lightness": -15}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#2ecc71"},
                {"lightness": -18}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#2ecc71"},
                {"lightness": -34}
            ]},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#333739"},
                {"weight": 0.8}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"color": "#2ecc71"}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"color": "#333739"},
                {"weight": 0.3},
                {"lightness": 10}
            ]}
        ]},
        {"id": 60, "name": "Blue Gray", "json": [
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#b5cbe4"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#efefef"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#83a5b0"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#bdcdd3"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"color": "#e3eed3"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "on"},
                {"lightness": 33}
            ]},
            {"featureType": "road"},
            {"featureType": "poi.park", "elementType": "labels", "stylers": [
                {"visibility": "on"},
                {"lightness": 20}
            ]},
            {},
            {"featureType": "road", "stylers": [
                {"lightness": 20}
            ]}
        ]},
        {"id": 55, "name": "Subtle Greyscale Map", "json": [
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"hue": "#000000"},
                {"saturation": 0},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "elementType": "labels", "stylers": [
                {"hue": "#000000"},
                {"saturation": 0},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "elementType": "labels", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#bbbbbb"},
                {"saturation": -100},
                {"lightness": 26},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"hue": "#dddddd"},
                {"saturation": -100},
                {"lightness": -3},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 30, "name": "Cobalt", "json": [
            {"featureType": "all", "elementType": "all", "stylers": [
                {"invert_lightness": true},
                {"saturation": 10},
                {"lightness": 30},
                {"gamma": 0.5},
                {"hue": "#435158"}
            ]}
        ]},
        {"id": 79, "name": "Black and White", "json": [
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"color": "#000000"},
                {"weight": 1}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000000"},
                {"weight": 0.8}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels.text", "stylers": [
                {"visibility": "on"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#000000"}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "on"}
            ]}
        ]},
        {"id": 31, "name": "Red Hues", "json": [
            {"stylers": [
                {"hue": "#dd0d0d"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 100},
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 21, "name": "Hopper", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"hue": "#165c64"},
                {"saturation": 34},
                {"lightness": -69},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"hue": "#b7caaa"},
                {"saturation": -14},
                {"lightness": -18},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"hue": "#cbdac1"},
                {"saturation": -6},
                {"lightness": -9},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#8d9b83"},
                {"saturation": -89},
                {"lightness": -12},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"hue": "#d4dad0"},
                {"saturation": -88},
                {"lightness": 54},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"hue": "#bdc5b6"},
                {"saturation": -89},
                {"lightness": -3},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"hue": "#bdc5b6"},
                {"saturation": -89},
                {"lightness": -26},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"hue": "#c17118"},
                {"saturation": 61},
                {"lightness": -45},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.park", "elementType": "all", "stylers": [
                {"hue": "#8ba975"},
                {"saturation": -46},
                {"lightness": -28},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"hue": "#a43218"},
                {"saturation": 74},
                {"lightness": -51},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative.province", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative.neighborhood", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.land_parcel", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"hue": "#3a3935"},
                {"saturation": 5},
                {"lightness": -57},
                {"visibility": "off"}
            ]},
            {"featureType": "poi.medical", "elementType": "geometry", "stylers": [
                {"hue": "#cba923"},
                {"saturation": 50},
                {"lightness": -46},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 47, "name": "Nature", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#FFA800"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#53FF00"},
                {"saturation": -73},
                {"lightness": 40},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#FBFF00"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#00FFFD"},
                {"saturation": 0},
                {"lightness": 30},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00BFFF"},
                {"saturation": 6},
                {"lightness": 8},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#679714"},
                {"saturation": 33.4},
                {"lightness": -25.4},
                {"gamma": 1}
            ]}
        ]},
        {"id": 77, "name": "Clean Cut", "json": [
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#C6E2FF"}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"color": "#C5E3BF"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"color": "#D1D1B8"}
            ]}
        ]},
        {"id": 16, "name": "Unimposed Topography", "json": [
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#727D82"},
                {"lightness": -30},
                {"saturation": -80}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": [
                {"visibility": "simplified"},
                {"hue": "#F3F4F4"},
                {"lightness": 80},
                {"saturation": -80}
            ]}
        ]},
        {"id": 36, "name": "Flat green", "json": [
            {"stylers": [
                {"hue": "#bbff00"},
                {"weight": 0.5},
                {"gamma": 0.5}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"color": "#a4cc48"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "on"},
                {"weight": 1}
            ]},
            {"featureType": "administrative", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"visibility": "simplified"},
                {"gamma": 1.14},
                {"saturation": -18}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "labels", "stylers": [
                {"saturation": 30},
                {"gamma": 0.76}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "simplified"},
                {"weight": 0.4},
                {"lightness": -8}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#4aaecc"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"color": "#718e32"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"saturation": 68},
                {"lightness": -61}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels.text.stroke", "stylers": [
                {"weight": 2.7},
                {"color": "#f4f9e8"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [
                {"weight": 1.5},
                {"color": "#e53013"},
                {"saturation": -42},
                {"lightness": 28}
            ]}
        ]},
        {"id": 3, "name": "Red Alert", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#ffdfa6"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#b52127"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#c5531b"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#74001b"},
                {"lightness": -10}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#da3c3c"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#74001b"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"color": "#da3c3c"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [
                {"color": "#990c19"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#74001b"},
                {"lightness": -8}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#6a0d10"},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"color": "#ffdfa6"},
                {"weight": 0.4}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 8, "name": "Turquoise Water", "json": [
            {"stylers": [
                {"hue": "#16a085"},
                {"saturation": 0}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 14, "name": "Vintage", "json": [
            {"stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#2f343b"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "on"},
                {"color": "#703030"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "on"},
                {"color": "#2f343b"},
                {"weight": 1}
            ]}
        ]},
        {"id": 52, "name": "Souldisco", "json": [
            {"stylers": [
                {"saturation": -100},
                {"gamma": 0.8},
                {"lightness": 4},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"visibility": "on"},
                {"color": "#5dff00"},
                {"gamma": 4.97},
                {"lightness": -5},
                {"saturation": 100}
            ]}
        ]},
        {"id": 28, "name": "Bluish", "json": [
            {"stylers": [
                {"hue": "#007fff"},
                {"saturation": 89}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "administrative.country", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 83, "name": "Muted Blue", "json": [
            {"featureType": "all", "stylers": [
                {"saturation": 0},
                {"hue": "#e7ecf0"}
            ]},
            {"featureType": "road", "stylers": [
                {"saturation": -70}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"},
                {"saturation": -60}
            ]}
        ]},
        {"id": 58, "name": "Simple Labels", "json": [
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 46, "name": "Homage to Toner", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": []},
            {"featureType": "landscape.natural", "elementType": "all", "stylers": []},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#333333"},
                {"saturation": -100},
                {"lightness": -69},
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi.attraction", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "poi.government", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]}
        ]},
        {"id": 65, "name": "Just places", "json": [
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#fffffa"}
            ]},
            {"featureType": "water", "stylers": [
                {"lightness": 50}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"lightness": 40}
            ]}
        ]},
        {"id": 40, "name": "Vitamin C", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#004358"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#fd7400"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"},
                {"lightness": -20}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"},
                {"lightness": -17}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "on"},
                {"weight": 0.9}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#ffffff"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"},
                {"lightness": -10}
            ]},
            {},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"color": "#1f8a70"},
                {"weight": 0.7}
            ]}
        ]},
        {"id": 82, "name": "Grass is greener. Water is bluer.", "json": [
            {"stylers": [
                {"saturation": -100}
            ]},
            {"featureType": "water", "elementType": "geometry.fill", "stylers": [
                {"color": "#0099dd"}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry.fill", "stylers": [
                {"color": "#aadd55"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels.text", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "labels.text", "stylers": [
                {"visibility": "on"}
            ]},
            {}
        ]},
        {"id": 75, "name": "Shade of green", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#76aee3"},
                {"saturation": 38},
                {"lightness": -11},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "all", "stylers": [
                {"hue": "#8dc749"},
                {"saturation": -47},
                {"lightness": -17},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.park", "elementType": "all", "stylers": [
                {"hue": "#c6e3a4"},
                {"saturation": 17},
                {"lightness": -2},
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "elementType": "all", "stylers": [
                {"hue": "#cccccc"},
                {"saturation": -100},
                {"lightness": 13},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.land_parcel", "elementType": "all", "stylers": [
                {"hue": "#5f5855"},
                {"saturation": 6},
                {"lightness": -31},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": []}
        ]},
        {"id": 26, "name": "Vintage Blue", "json": [
            {"featureType": "road", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#004b76"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"visibility": "on"},
                {"color": "#fff6cb"}
            ]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "on"},
                {"color": "#7f7d7a"},
                {"lightness": 10},
                {"weight": 1}
            ]}
        ]},
        {"id": 68, "name": "Aqua", "json": [
            {"featureType": "landscape", "stylers": [
                {"color": "#6c8080"},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"color": "#d98080"},
                {"hue": "#eeff00"},
                {"lightness": 100},
                {"weight": 1.5}
            ]}
        ]},
        {"id": 84, "name": "Pastel Tones", "json": [
            {"featureType": "landscape", "stylers": [
                {"saturation": -100},
                {"lightness": 60}
            ]},
            {"featureType": "road.local", "stylers": [
                {"saturation": -100},
                {"lightness": 40},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "stylers": [
                {"saturation": -100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"lightness": 30}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#ef8c25"},
                {"lightness": 40}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry.fill", "stylers": [
                {"color": "#b6c54c"},
                {"lightness": 40},
                {"saturation": -40}
            ]},
            {}
        ]},
        {"id": 41, "name": "Hints of Gold", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#252525"},
                {"saturation": -100},
                {"lightness": -81},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#666666"},
                {"saturation": -100},
                {"lightness": -55},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"hue": "#555555"},
                {"saturation": -100},
                {"lightness": -57},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#777777"},
                {"saturation": -100},
                {"lightness": -6},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"hue": "#cc9900"},
                {"saturation": 100},
                {"lightness": -22},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"hue": "#444444"},
                {"saturation": 0},
                {"lightness": -64},
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"hue": "#555555"},
                {"saturation": -100},
                {"lightness": -57},
                {"visibility": "off"}
            ]}
        ]},
        {"id": 102, "name": "Clean Grey", "json": [
            {"featureType": "administrative", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#e3e3e3"}
            ]},
            {"featureType": "landscape.natural", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"color": "#cccccc"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.line", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#FFFFFF"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 9, "name": "Chilled", "json": [
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": 149},
                {"saturation": -78},
                {"lightness": 0}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": -31},
                {"saturation": -40},
                {"lightness": 2.8}
            ]},
            {"featureType": "poi", "elementType": "label", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"hue": 163},
                {"saturation": -26},
                {"lightness": -1.1}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": 3},
                {"saturation": -24.24},
                {"lightness": -38.57}
            ]}
        ]},
        {"id": 24, "name": "Hot Pink", "json": [
            {"stylers": [
                {"hue": "#ff61a6"},
                {"visibility": "on"},
                {"invert_lightness": true},
                {"saturation": 40},
                {"lightness": 10}
            ]}
        ]},
        {"id": 48, "name": "Hard edges", "json": [
            {"featureType": "landscape.natural", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "water", "stylers": [
                {"saturation": -100},
                {"lightness": -86}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"saturation": -100},
                {"lightness": -75}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 97}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"saturation": -100},
                {"lightness": -100}
            ]},
            {"featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"saturation": -100},
                {"lightness": -68}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [
                {"saturation": -100},
                {"lightness": -100}
            ]},
            {"featureType": "poi", "stylers": [
                {"saturation": -100},
                {"lightness": 91}
            ]},
            {"featureType": "poi", "elementType": "labels.text.fill", "stylers": [
                {"saturation": -100},
                {"lightness": -100}
            ]},
            {"featureType": "transit.station", "stylers": [
                {"saturation": -100},
                {"lightness": -22}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [
                {"hue": "#ff004c"},
                {"saturation": -100},
                {"lightness": 44}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"saturation": 1},
                {"lightness": -100}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]}
        ]},
        {"id": 4, "name": "Tripitty", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"color": "#193a70"},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"color": "#2c5ca5"}
            ]},
            {"featureType": "poi", "stylers": [
                {"color": "#2c5ca5"}
            ]},
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 50, "name": "The Endless Atlas", "json": [
            {"featureType": "all", "elementType": "labels.text.stroke", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "all", "elementType": "labels.icon", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"hue": "#D1D3D4"},
                {"saturation": -88},
                {"lightness": -7},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "labels", "stylers": [
                {"hue": "#939598"},
                {"saturation": -91},
                {"lightness": -34},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#414042"},
                {"saturation": -98},
                {"lightness": -60},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#E3EBE5"},
                {"saturation": -61},
                {"lightness": 57},
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry", "stylers": [
                {"hue": "#E3EBE5"},
                {"saturation": -100},
                {"lightness": 57},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.country", "elementType": "all", "stylers": [
                {"hue": "#E3EBE5"},
                {"saturation": -100},
                {"lightness": 81},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.province", "elementType": "all", "stylers": [
                {"hue": "#E3EBE5"},
                {"saturation": -100},
                {"lightness": 81},
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "geometry", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels", "stylers": [
                {"hue": "#939598"},
                {"saturation": 2},
                {"lightness": 59},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.neighborhood", "elementType": "labels", "stylers": [
                {"hue": "#939598"},
                {"saturation": -100},
                {"lightness": 16},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.neighborhood", "elementType": "all", "stylers": [
                {"hue": "#939598"},
                {"saturation": -100},
                {"lightness": 16},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.land_parcel", "elementType": "all", "stylers": [
                {"hue": "#939598"},
                {"saturation": -100},
                {"lightness": 16},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"hue": "#939598"},
                {"saturation": -98},
                {"lightness": -8},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"hue": "#6D6E71"},
                {"saturation": -98},
                {"lightness": -43},
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": -100},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "labels", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]}
        ]},
        {"id": 70, "name": "Unsaturated Browns", "json": [
            {"elementType": "geometry", "stylers": [
                {"hue": "#ff4400"},
                {"saturation": -68},
                {"lightness": -4},
                {"gamma": 0.72}
            ]},
            {"featureType": "road", "elementType": "labels.icon"},
            {"featureType": "landscape.man_made", "elementType": "geometry", "stylers": [
                {"hue": "#0077ff"},
                {"gamma": 3.1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00ccff"},
                {"gamma": 0.44},
                {"saturation": -33}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"hue": "#44ff00"},
                {"saturation": -23}
            ]},
            {"featureType": "water", "elementType": "labels.text.fill", "stylers": [
                {"hue": "#007fff"},
                {"gamma": 0.77},
                {"saturation": 65},
                {"lightness": 99}
            ]},
            {"featureType": "water", "elementType": "labels.text.stroke", "stylers": [
                {"gamma": 0.11},
                {"weight": 5.6},
                {"saturation": 99},
                {"hue": "#0091ff"},
                {"lightness": -86}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"lightness": -48},
                {"hue": "#ff5e00"},
                {"gamma": 1.2},
                {"saturation": -23}
            ]},
            {"featureType": "transit", "elementType": "labels.text.stroke", "stylers": [
                {"saturation": -64},
                {"hue": "#ff9100"},
                {"lightness": 16},
                {"gamma": 0.47},
                {"weight": 2.7}
            ]}
        ]},
        {"id": 91, "name": "Muted Monotone", "json": [
            {"stylers": [
                {"visibility": "on"},
                {"saturation": -100},
                {"gamma": 0.54}
            ]},
            {"featureType": "road", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#4d4946"}
            ]},
            {"featureType": "poi", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "labels.text", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.local", "elementType": "labels.text", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"gamma": 0.48}
            ]},
            {"featureType": "transit.station", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"gamma": 7.18}
            ]}
        ]},
        {"id": 34, "name": "Neon World", "json": [
            {"stylers": [
                {"saturation": 100},
                {"gamma": 0.6}
            ]}
        ]},
        {"id": 59, "name": "Light Green", "json": [
            {"stylers": [
                {"hue": "#baf4c4"},
                {"saturation": 10}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#effefd"}
            ]},
            {"featureType": "all", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "labels", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 11, "name": "Blue", "json": [
            {"featureType": "all", "stylers": [
                {"hue": "#0000b0"},
                {"invert_lightness": "true"},
                {"saturation": -30}
            ]}
        ]},
        {"id": 10, "name": "Mixed", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#00dd00"}
            ]},
            {"featureType": "road", "stylers": [
                {"hue": "#dd0000"}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#000040"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#ffff00"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 90, "name": "Light Blue Water", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#71d6ff"},
                {"saturation": 100},
                {"lightness": -5},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"hue": "#deecec"},
                {"saturation": -73},
                {"lightness": 72},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"hue": "#bababa"},
                {"saturation": -100},
                {"lightness": 25},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"hue": "#e3e3e3"},
                {"saturation": -100},
                {"lightness": 0},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative", "elementType": "labels", "stylers": [
                {"hue": "#59cfff"},
                {"saturation": 100},
                {"lightness": 34},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 73, "name": "A Dark World", "json": [
            {"stylers": [
                {"visibility": "simplified"}
            ]},
            {"stylers": [
                {"color": "#131314"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#131313"},
                {"lightness": 7}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"lightness": 25}
            ]}
        ]},
        {"id": 76, "name": "HashtagNineNineNine", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#bbbbbb"},
                {"saturation": -100},
                {"lightness": -4},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#999999"},
                {"saturation": -100},
                {"lightness": -33},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#999999"},
                {"saturation": -100},
                {"lightness": -6},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#aaaaaa"},
                {"saturation": -100},
                {"lightness": -15},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 45, "name": "Candy Colours ", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#FFE100"},
                {"saturation": 34.48275862068968},
                {"lightness": -1.490196078431353},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#FF009A"},
                {"saturation": -2.970297029703005},
                {"lightness": -17.815686274509815},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#FFE100"},
                {"saturation": 8.600000000000009},
                {"lightness": -4.400000000000006},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#00C3FF"},
                {"saturation": 29.31034482758622},
                {"lightness": -38.980392156862735},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#0078FF"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#00FF19"},
                {"saturation": -30.526315789473685},
                {"lightness": -22.509803921568633},
                {"gamma": 1}
            ]}
        ]},
        {"id": 23, "name": "Bates Green", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#1CB2BD"},
                {"saturation": 53},
                {"lightness": -44},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#1CB2BD"},
                {"saturation": 40}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#BBDC00"},
                {"saturation": 80},
                {"lightness": -20},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "all", "stylers": [
                {"visibility": "on"}
            ]}
        ]},
        {"id": 64, "name": "Old Dry Mud", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#FFAD00"},
                {"saturation": 50.2},
                {"lightness": -34.8},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#FFAD00"},
                {"saturation": -19.8},
                {"lightness": -1.8},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#FFAD00"},
                {"saturation": 72.4},
                {"lightness": -32.6},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#FFAD00"},
                {"saturation": 74.4},
                {"lightness": -18},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00FFA6"},
                {"saturation": -63.2},
                {"lightness": 38},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#FFC300"},
                {"saturation": 54.2},
                {"lightness": -14.4},
                {"gamma": 1}
            ]}
        ]},
        {"id": 51, "name": "Roadtrip At Night", "json": [
            {"stylers": [
                {"hue": "#ff1a00"},
                {"invert_lightness": true},
                {"saturation": -100},
                {"lightness": 33},
                {"gamma": 0.5}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#2D333C"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"color": "#eeeeee"},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"},
                {"weight": 3}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"color": "#2D333C"}
            ]}
        ]},
        {"id": 72, "name": "Transport for London", "json": [
            {"elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "geometry.fill", "stylers": [
                {"color": "#0099cc"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"color": "#00314e"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#f0f0f0"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"color": "#adbac9"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"color": "#adb866"}
            ]},
            {"featureType": "poi", "stylers": [
                {"color": "#f7c742"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"color": "#adb866"}
            ]},
            {"featureType": "transit.station", "elementType": "geometry.fill", "stylers": [
                {"color": "#ff8dd3"}
            ]},
            {"featureType": "transit.station", "stylers": [
                {"color": "#ff8dd3"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#808080"}
            ]},
            {}
        ]},
        {"id": 95, "name": "Roadie", "json": [
            {"elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#000000"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#ffffff"},
                {"visibility": "on"}
            ]},
            {}
        ]},
        {"id": 32, "name": "Deep Green", "json": [
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "simplified"},
                {"color": "#ffe24d"}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "simplified"},
                {"color": "#158c28"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"visibility": "simplified"},
                {"color": "#37b34a"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#ffe24d"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "simplified"},
                {"color": "#8bc53f"}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#808080"},
                {"gamma": 9.91},
                {"visibility": "off"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 49, "name": "Subtle Green", "json": [
            {"stylers": [
                {"visibility": "on"},
                {"saturation": -100}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"saturation": 100},
                {"hue": "#00ffe6"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"saturation": 100},
                {"hue": "#00ffcc"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"visibility": "on"}
            ]}
        ]},
        {"id": 56, "name": "Esperanto", "json": [
            {"elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#0000ff"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#ff0000"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000100"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffff00"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [
                {"color": "#ff0000"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffa91a"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"saturation": 36},
                {"gamma": 0.55}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000000"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [
                {"lightness": -100},
                {"weight": 2.1}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [
                {"invert_lightness": true},
                {"hue": "#ff0000"},
                {"gamma": 3.02},
                {"lightness": 20},
                {"saturation": 40}
            ]},
            {"featureType": "poi.attraction", "stylers": [
                {"saturation": 100},
                {"hue": "#ff00ee"},
                {"lightness": -13}
            ]},
            {"featureType": "poi.government", "stylers": [
                {"saturation": 100},
                {"hue": "#eeff00"},
                {"gamma": 0.67},
                {"lightness": -26}
            ]},
            {"featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [
                {"hue": "#ff0000"},
                {"saturation": 100},
                {"lightness": -37}
            ]},
            {"featureType": "poi.medical", "elementType": "labels.text.fill", "stylers": [
                {"color": "#ff0000"}
            ]},
            {"featureType": "poi.school", "stylers": [
                {"hue": "#ff7700"},
                {"saturation": 97},
                {"lightness": -41}
            ]},
            {"featureType": "poi.sports_complex", "stylers": [
                {"saturation": 100},
                {"hue": "#00ffb3"},
                {"lightness": -71}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"saturation": 84},
                {"lightness": -57},
                {"hue": "#a1ff00"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [
                {"gamma": 0.11}
            ]},
            {"featureType": "transit.station", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffc35e"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"lightness": -100}
            ]},
            {"featureType": "administrative", "stylers": [
                {"saturation": 100},
                {"gamma": 0.35},
                {"lightness": 20}
            ]},
            {"featureType": "poi.business", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"gamma": 0.35}
            ]},
            {"featureType": "poi.business", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#69ffff"}
            ]},
            {"featureType": "poi.place_of_worship", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#c3ffc3"}
            ]}
        ]},
        {"id": 99, "name": "Old Map", "json": [
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#abbaa4"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"color": "#3f518c"}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"color": "#ad9b8d"}
            ]}
        ]},
        {"id": 57, "name": "Military Flat", "json": [
            {"featureType": "landscape", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"hue": "#00ff88"},
                {"lightness": 14},
                {"color": "#667348"},
                {"saturation": 4},
                {"gamma": 1.14}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [
                {"color": "#313916"},
                {"weight": 0.8}
            ]},
            {"featureType": "road", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels.icon", "stylers": [
                {"visibility": "simplified"},
                {"color": "#334b1f"}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 69, "name": "Holiday", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#FFB000"},
                {"saturation": 71.66666666666669},
                {"lightness": -28.400000000000006},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#E8FF00"},
                {"saturation": -76.6},
                {"lightness": 113},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#FF8300"},
                {"saturation": -77},
                {"lightness": 27.400000000000006},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#FF8C00"},
                {"saturation": -66.6},
                {"lightness": 34.400000000000006},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00C4FF"},
                {"saturation": 22.799999999999997},
                {"lightness": -11.399999999999991},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#9FFF00"},
                {"saturation": 0},
                {"lightness": -23.200000000000003},
                {"gamma": 1}
            ]}
        ]},
        {"id": 33, "name": "Jane Iredale", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#87bcba"},
                {"saturation": -37},
                {"lightness": -17},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": []},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"hue": "#4f6b46"},
                {"saturation": -23},
                {"lightness": -61},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": -55},
                {"lightness": 13},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "all", "stylers": [
                {"hue": "#ffa200"},
                {"saturation": 100},
                {"lightness": -22},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": -55},
                {"lightness": -31},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"hue": "#f69d94"},
                {"saturation": 84},
                {"lightness": 9},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": 45},
                {"lightness": 36},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.country", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": 45},
                {"lightness": 36},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative.land_parcel", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": 45},
                {"lightness": 36},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.government", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": 35},
                {"lightness": -19},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.school", "elementType": "all", "stylers": [
                {"hue": "#d38bc8"},
                {"saturation": -6},
                {"lightness": -17},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.park", "elementType": "all", "stylers": [
                {"hue": "#b2ba70"},
                {"saturation": -19},
                {"lightness": -25},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 63, "name": "Caribbean Mountain", "json": [
            {"featureType": "poi.medical", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.place_of_worship", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#cec6b3"}
            ]},
            {"featureType": "road", "stylers": [
                {"color": "#f2eee8"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#01186a"}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"color": "#cec6b3"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.government", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 66, "name": "Blueprint (No Labels)", "json": [
            {"stylers": [
                {"visibility": "simplified"},
                {"saturation": -100}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 17}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#000045"},
                {"lightness": 17}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 25}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 25}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 21}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"saturation": 100},
                {"color": "#7b94be"},
                {"lightness": 50}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 19}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000045"},
                {"lightness": 17},
                {"weight": 1.2}
            ]}
        ]},
        {"id": 81, "name": "Ilustra&#231;&#227;o", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"hue": "#71ABC3"},
                {"saturation": -10},
                {"lightness": -21},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry", "stylers": [
                {"hue": "#7DC45C"},
                {"saturation": 37},
                {"lightness": -41},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry", "stylers": [
                {"hue": "#C3E0B0"},
                {"saturation": 23},
                {"lightness": -12},
                {"visibility": "simplified"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#A19FA0"},
                {"saturation": -98},
                {"lightness": -20},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"hue": "#FFFFFF"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]}
        ]},
        {"id": 62, "name": "Night vision", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#001204"},
                {"saturation": 100},
                {"lightness": -95},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"hue": "#007F1E"},
                {"saturation": 100},
                {"lightness": -72},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.natural", "elementType": "all", "stylers": [
                {"hue": "#00C72E"},
                {"saturation": 100},
                {"lightness": -59},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#002C0A"},
                {"saturation": 100},
                {"lightness": -87},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#00A927"},
                {"saturation": 100},
                {"lightness": -58},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 67, "name": "Blueprint", "json": [
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 17}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#000045"},
                {"lightness": 17}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 25}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 25}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 21}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"saturation": 0},
                {"color": "#4d88ea"},
                {"lightness": 0}
            ]},
            {"elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "geometry", "stylers": [
                {"color": "#000045"},
                {"lightness": 19}
            ]},
            {"featureType": "administrative", "elementType": "geometry.fill", "stylers": [
                {"color": "#000045"},
                {"lightness": 20}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"color": "#000045"},
                {"lightness": 17},
                {"weight": 1.2}
            ]}
        ]},
        {"id": 87, "name": "Red &amp; Green", "json": [
            {"featureType": "landscape", "stylers": [
                {"lightness": 16},
                {"hue": "#ff001a"},
                {"saturation": -61}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#ff0011"},
                {"lightness": 53}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"hue": "#00ff91"}
            ]},
            {"elementType": "labels", "stylers": [
                {"lightness": 63},
                {"hue": "#ff0000"}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#0055ff"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 107, "name": "Blue-ish", "json": [
            {"stylers": [
                {"saturation": -45},
                {"lightness": 13}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#8fa7b3"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#667780"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [
                {"color": "#333333"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#8fa7b3"},
                {"gamma": 2}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#a3becc"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"color": "#7a8f99"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [
                {"color": "#555555"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [
                {"color": "#a3becc"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"color": "#7a8f99"}
            ]},
            {"featureType": "road.local", "elementType": "labels.text.fill", "stylers": [
                {"color": "#555555"}
            ]},
            {"featureType": "water", "elementType": "geometry.fill", "stylers": [
                {"color": "#bbd9e9"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.fill", "stylers": [
                {"color": "#525f66"}
            ]},
            {"featureType": "transit", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#bbd9e9"},
                {"gamma": 2}
            ]},
            {"featureType": "transit.line", "elementType": "geometry.fill", "stylers": [
                {"color": "#a3aeb5"}
            ]}
        ]},
        {"id": 89, "name": "Green", "json": [
            {"featureType": "landscape", "elementType": "geometry.fill", "stylers": [
                {"color": "#bbd5c5"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"color": "#808080"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#fcf9a2"}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"color": "#bbd5c5"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#808080"}
            ]}
        ]},
        {"id": 93, "name": "Lost in the desert", "json": [
            {"elementType": "labels", "stylers": [
                {"visibility": "off"},
                {"color": "#f49f53"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#f9ddc5"},
                {"lightness": -7}
            ]},
            {"featureType": "road", "stylers": [
                {"color": "#813033"},
                {"lightness": 43}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"color": "#645c20"},
                {"lightness": 38}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#1994bf"},
                {"saturation": -69},
                {"gamma": 0.99},
                {"lightness": 43}
            ]},
            {"featureType": "road.local", "elementType": "geometry.fill", "stylers": [
                {"color": "#f19f53"},
                {"weight": 1.3},
                {"visibility": "on"},
                {"lightness": 16}
            ]},
            {"featureType": "poi.business"},
            {"featureType": "poi.park", "stylers": [
                {"color": "#645c20"},
                {"lightness": 39}
            ]},
            {"featureType": "poi.school", "stylers": [
                {"color": "#a95521"},
                {"lightness": 35}
            ]},
            {},
            {"featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [
                {"color": "#813033"},
                {"lightness": 38},
                {"visibility": "off"}
            ]},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {"elementType": "labels"},
            {"featureType": "poi.sports_complex", "stylers": [
                {"color": "#9e5916"},
                {"lightness": 32}
            ]},
            {},
            {"featureType": "poi.government", "stylers": [
                {"color": "#9e5916"},
                {"lightness": 46}
            ]},
            {"featureType": "transit.station", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"color": "#813033"},
                {"lightness": 22}
            ]},
            {"featureType": "transit", "stylers": [
                {"lightness": 38}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"color": "#f19f53"},
                {"lightness": -10}
            ]},
            {},
            {},
            {}
        ]},
        {"id": 100, "name": "Brownie", "json": [
            {"stylers": [
                {"hue": "#ff8800"},
                {"gamma": 0.4}
            ]}
        ]},
        {"id": 96, "name": "Bobby&#39;s World", "json": [
            {"featureType": "landscape.natural.landcover", "stylers": [
                {"gamma": 0.44},
                {"hue": "#2bff00"}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00a1ff"},
                {"saturation": 29},
                {"gamma": 0.74}
            ]},
            {"featureType": "landscape.natural.terrain", "stylers": [
                {"hue": "#00ff00"},
                {"saturation": 54},
                {"lightness": -51},
                {"gamma": 0.4}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"gamma": 0.27},
                {"hue": "#0077ff"},
                {"saturation": -91},
                {"lightness": 36}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"saturation": 10},
                {"lightness": -23},
                {"hue": "#0099ff"},
                {"gamma": 0.71}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"hue": "#0055ff"},
                {"saturation": 9},
                {"lightness": -46},
                {"gamma": 1.05}
            ]},
            {"featureType": "administrative.country", "stylers": [
                {"gamma": 0.99}
            ]},
            {"featureType": "administrative.province", "stylers": [
                {"lightness": 36},
                {"saturation": -54},
                {"gamma": 0.76}
            ]},
            {"featureType": "administrative.locality", "stylers": [
                {"lightness": 33},
                {"saturation": -61},
                {"gamma": 1.21}
            ]},
            {"featureType": "administrative.neighborhood", "stylers": [
                {"hue": "#ff0000"},
                {"gamma": 2.44}
            ]},
            {"featureType": "road.highway.controlled_access", "stylers": [
                {"hue": "#ff0000"},
                {"lightness": 67},
                {"saturation": -40}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#ff6600"},
                {"saturation": 52},
                {"gamma": 0.64}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#006eff"},
                {"gamma": 0.46},
                {"saturation": -3},
                {"lightness": -10}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"hue": "#0077ff"},
                {"saturation": -46},
                {"gamma": 0.58}
            ]},
            {"featureType": "transit.station", "stylers": [
                {"gamma": 0.8}
            ]},
            {"featureType": "transit.station.rail", "stylers": [
                {"hue": "#ff0000"},
                {"saturation": -45},
                {"gamma": 0.9}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"gamma": 0.58}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [
                {"gamma": 2.01},
                {"hue": "#00ffff"},
                {"lightness": 22}
            ]},
            {"featureType": "transit", "stylers": [
                {"saturation": -87},
                {"lightness": 44},
                {"gamma": 1.98},
                {"visibility": "off"}
            ]},
            {"featureType": "poi.business", "elementType": "labels.text", "stylers": [
                {"gamma": 0.06},
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"hue": "#00aaff"},
                {"lightness": -6},
                {"gamma": 2.21}
            ]},
            {"elementType": "labels.text.stroke", "stylers": [
                {"gamma": 3.84}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"gamma": 9.99}
            ]},
            {"featureType": "administrative", "stylers": [
                {"gamma": 0.01}
            ]}
        ]},
        {"id": 92, "name": "Blue Cyan", "json": [
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#333333"}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#666666"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "geometry", "stylers": [
                {"color": "#df2f23"},
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#cccccc"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.stroke", "stylers": [
                {"color": "#999999"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"color": "#aaaaaa"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.fill", "stylers": [
                {"color": "#808080"}
            ]},
            {"featureType": "administrative", "elementType": "geometry.stroke", "stylers": [
                {"color": "#aaaaaa"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text"},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"color": "#c6eeee"}
            ]},
            {}
        ]},
        {"id": 98, "name": "Purple Rain", "json": [
            {"featureType": "road", "stylers": [
                {"hue": "#5e00ff"},
                {"saturation": -79}
            ]},
            {"featureType": "poi", "stylers": [
                {"saturation": -78},
                {"hue": "#6600ff"},
                {"lightness": -47},
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "stylers": [
                {"lightness": 22}
            ]},
            {"featureType": "landscape", "stylers": [
                {"hue": "#6600ff"},
                {"saturation": -11}
            ]},
            {},
            {},
            {"featureType": "water", "stylers": [
                {"saturation": -65},
                {"hue": "#1900ff"},
                {"lightness": 8}
            ]},
            {"featureType": "road.local", "stylers": [
                {"weight": 1.3},
                {"lightness": 30}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "simplified"},
                {"hue": "#5e00ff"},
                {"saturation": -16}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"saturation": -72}
            ]},
            {}
        ]},
        {"id": 101, "name": "Bright Dessert", "json": [
            {"featureType": "landscape", "stylers": [
                {"saturation": -7},
                {"gamma": 1.02},
                {"hue": "#ffc300"},
                {"lightness": -10}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#ffaa00"},
                {"saturation": -45},
                {"gamma": 1},
                {"lightness": -4}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#ffaa00"},
                {"lightness": -10},
                {"saturation": 64},
                {"gamma": 0.9}
            ]},
            {"featureType": "road.local", "stylers": [
                {"lightness": -5},
                {"hue": "#00f6ff"},
                {"saturation": -40},
                {"gamma": 0.75}
            ]},
            {"featureType": "poi", "stylers": [
                {"saturation": -30},
                {"lightness": 11},
                {"gamma": 0.5},
                {"hue": "#ff8000"}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#0077ff"},
                {"gamma": 1.25},
                {"saturation": -22},
                {"lightness": -31}
            ]}
        ]},
        {"id": 78, "name": "Pink &amp; Blue", "json": [
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"},
                {"color": "#9debff"},
                {"weight": 0.1}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"},
                {"color": "#ebebeb"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#51dbff"}
            ]},
            {"featureType": "poi.park", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#51dbff"}
            ]},
            {"featureType": "poi"},
            {"featureType": "transit.line", "stylers": [
                {"color": "#ff4e80"},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "on"},
                {"weight": 1.5},
                {"color": "#51dbff"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"},
                {"color": "#51dbNaN"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"},
                {"color": "#51dbff"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"color": "#9debff"},
                {"visibility": "off"}
            ]},
            {},
            {"featureType": "poi.government", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.school", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "poi.medical", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.attraction", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#51dbff"}
            ]},
            {"featureType": "poi.place_of_worship", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.sports_complex", "stylers": [
                {"visibility": "off"}
            ]},
            {},
            {"featureType": "road.arterial", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#000000"},
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road"}
        ]},
        {"id": 94, "name": "San Andreas", "json": [
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"lightness": -100}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"lightness": -100},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"lightness": 100}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"saturation": 100},
                {"hue": "#006eff"},
                {"lightness": -19}
            ]},
            {"featureType": "landscape", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"lightness": -16}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"hue": "#2bff00"},
                {"lightness": -39},
                {"saturation": 8}
            ]},
            {"featureType": "poi.attraction", "elementType": "geometry.fill", "stylers": [
                {"lightness": 100},
                {"saturation": -100}
            ]},
            {"featureType": "poi.business", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "poi.government", "elementType": "geometry.fill", "stylers": [
                {"lightness": 100},
                {"saturation": -100}
            ]},
            {"featureType": "poi.medical", "elementType": "geometry.fill", "stylers": [
                {"lightness": 100},
                {"saturation": -100}
            ]},
            {"featureType": "poi.place_of_worship", "elementType": "geometry.fill", "stylers": [
                {"lightness": 100},
                {"saturation": -100}
            ]},
            {"featureType": "poi.school", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]},
            {"featureType": "poi.sports_complex", "elementType": "geometry.fill", "stylers": [
                {"saturation": -100},
                {"lightness": 100}
            ]}
        ]},
        {"id": 85, "name": "Totally Pink", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#F600FF"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#DE00FF"},
                {"saturation": -4.6000000000000085},
                {"lightness": -1.4210854715202004e-14},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#FF009A"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#FF0098"},
                {"saturation": 0},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#EC00FF"},
                {"saturation": 72.4},
                {"lightness": 0},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#7200FF"},
                {"saturation": 49},
                {"lightness": 0},
                {"gamma": 1}
            ]}
        ]},
        {"id": 111, "name": "The Propia Effect", "json": [
            {"featureType": "landscape", "stylers": [
                {"visibility": "simplified"},
                {"color": "#2b3f57"},
                {"weight": 0.1}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "on"},
                {"hue": "#ff0000"},
                {"weight": 0.4},
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text", "stylers": [
                {"weight": 1.3},
                {"color": "#FFFFFF"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#f55f77"},
                {"weight": 3}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"color": "#f55f77"},
                {"weight": 1.1}
            ]},
            {"featureType": "road.local", "elementType": "geometry", "stylers": [
                {"color": "#f55f77"},
                {"weight": 0.4}
            ]},
            {},
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"weight": 0.8},
                {"color": "#ffffff"},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels", "stylers": [
                {"color": "#ffffff"},
                {"weight": 0.7}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"color": "#6c5b7b"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#f3b191"}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"visibility": "on"}
            ]}
        ]},
        {"id": 88, "name": "Overseas", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#00559B"},
                {"saturation": 100},
                {"lightness": -60},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape.natural", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "poi.park", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#00559B"},
                {"saturation": 100},
                {"lightness": -53},
                {"visibility": "simplified"}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": []},
            {"featureType": "administrative.locality", "elementType": "geometry", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": 0},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "water", "elementType": "all", "stylers": []},
            {"featureType": "poi.school", "elementType": "labels", "stylers": [
                {"hue": "#999999"},
                {"saturation": -100},
                {"lightness": -28},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#999999"},
                {"saturation": -100},
                {"lightness": -23},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "all", "stylers": [
                {"hue": "#2C3E50"},
                {"saturation": 29},
                {"lightness": -52},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 97, "name": "manushka", "json": [
            {"featureType": "water", "stylers": [
                {"color": "#6ebeab"}
            ]},
            {"featureType": "road", "stylers": [
                {"color": "#b5a15b"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"color": "#f9f9f9"}
            ]},
            {"featureType": "landscape", "elementType": "labels.text.fill", "stylers": [
                {"color": "#808080"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [
                {"color": "#808080"}
            ]},
            {"featureType": "landscape.natural.terrain", "stylers": [
                {"color": "#d0d0d0"}
            ]},
            {}
        ]},
        {"id": 106, "name": "Dark Grey on Light Grey", "json": [
            {"featureType": "administrative", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [
                {"color": "#DCE7EB"}
            ]},
            {"featureType": "administrative.province", "elementType": "geometry.stroke", "stylers": [
                {"color": "#DCE7EB"}
            ]},
            {"featureType": "landscape", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.natural", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels.icon", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.line", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "geometry", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"color": "#83888B"}
            ]},
            {"featureType": "water", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]}
        ]},
        {"id": 113, "name": "Golden Crown", "json": [
            {"featureType": "landscape", "stylers": [
                {"visibility": "on"},
                {"color": "#e7cd79"},
                {"weight": 0.1}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "simplified"},
                {"color": "#282828"}
            ]},
            {"featureType": "landscape.natural.landcover", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#d6bc68"}
            ]},
            {"featureType": "administrative.locality", "elementType": "geometry", "stylers": [
                {"visibility": "off"},
                {"color": "#d6bc68"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"color": "#d6bc68"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"visibility": "on"},
                {"color": "#d6bc68"}
            ]},
            {"featureType": "transit.station.airport", "elementType": "geometry.fill", "stylers": [
                {"visibility": "off"},
                {"color": "#d6bc68"}
            ]},
            {"featureType": "poi"},
            {"featureType": "transit.line", "stylers": [
                {"color": "#d6bc68"},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"},
                {"weight": 1},
                {"color": "#e9d9a6"}
            ]},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"},
                {"color": "#e9d9a6"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"visibility": "simplified"},
                {"color": "#e9d9a6"}
            ]},
            {"featureType": "poi.business", "stylers": [
                {"color": "#e9d9a6"},
                {"visibility": "on"}
            ]},
            {},
            {"featureType": "poi.government", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.school", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.medical", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.attraction", "elementType": "geometry", "stylers": [
                {"visibility": "off"},
                {"color": "#cfb665"}
            ]},
            {"featureType": "poi.place_of_worship", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.sports_complex", "stylers": [
                {"visibility": "off"}
            ]},
            {},
            {"featureType": "road.arterial", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#cfb665"},
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road"}
        ]},
        {"id": 71, "name": "Jazzygreen", "json": [
            {"featureType": "landscape", "stylers": [
                {"hue": "#000000"},
                {"saturation": -100},
                {"lightness": 44},
                {"gamma": 1}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"hue": "#00F93f"},
                {"saturation": 100},
                {"lightness": -40.95294117647059},
                {"gamma": 1}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"hue": "#00F93f"},
                {"saturation": 100},
                {"lightness": -51.15294117647059},
                {"gamma": 1}
            ]},
            {"featureType": "road.local", "stylers": [
                {"hue": "#00F93f"},
                {"saturation": 100},
                {"lightness": -50.35294117647059},
                {"gamma": 1}
            ]},
            {"featureType": "water", "stylers": [
                {"hue": "#00F93f"},
                {"saturation": 100},
                {"lightness": -50.35294117647059},
                {"gamma": 1}
            ]},
            {"featureType": "poi", "stylers": [
                {"hue": "#00F93f"},
                {"saturation": 100},
                {"lightness": -50.35294117647059},
                {"gamma": 1}
            ]}
        ]},
        {"id": 105, "name": "Veins", "json": [
            {"stylers": [
                {"hue": "#B61530"},
                {"saturation": 60},
                {"lightness": -40}
            ]},
            {"elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#B61530"}
            ]},
            {"featureType": "road", "stylers": [
                {"color": "#B61530"},
                {}
            ]},
            {"featureType": "road.local", "stylers": [
                {"color": "#B61530"},
                {"lightness": 6}
            ]},
            {"featureType": "road.highway", "stylers": [
                {"color": "#B61530"},
                {"lightness": -25}
            ]},
            {"featureType": "road.arterial", "stylers": [
                {"color": "#B61530"},
                {"lightness": -10}
            ]},
            {"featureType": "transit", "stylers": [
                {"color": "#B61530"},
                {"lightness": 70}
            ]},
            {"featureType": "transit.line", "stylers": [
                {"color": "#B61530"},
                {"lightness": 90}
            ]},
            {"featureType": "administrative.country", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]}
        ]},
        {"id": 108, "name": "Lemon Tree", "json": [
            {"featureType": "road.highway", "elementType": "labels", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.natural", "elementType": "all", "stylers": [
                {"hue": "#ffffff"},
                {"saturation": -100},
                {"lightness": 100},
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "all", "stylers": [
                {"hue": "#ffe94f"},
                {"saturation": 100},
                {"lightness": 4},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"hue": "#ffe94f"},
                {"saturation": 100},
                {"lightness": 4},
                {"visibility": "on"}
            ]},
            {"featureType": "water", "elementType": "geometry", "stylers": [
                {"hue": "#333333"},
                {"saturation": -100},
                {"lightness": -74},
                {"visibility": "off"}
            ]}
        ]},
        {"id": 112, "name": "Swiss Cheese", "json": [
            {"stylers": [
                {"saturation": 100},
                {"hue": "#fff700"}
            ]},
            {"featureType": "landscape", "stylers": [
                {"color": "#ffdd00"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#718098"},
                {"saturation": -35},
                {"lightness": 20}
            ]},
            {"featureType": "poi", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "transit", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative", "elementType": "labels.text", "stylers": [
                {"color": "#ffdd00"},
                {"lightness": -38}
            ]},
            {"featureType": "administrative", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#ffdd00"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road", "stylers": [
                {"weight": 0.7}
            ]},
            {"featureType": "water", "elementType": "labels.text.fill", "stylers": [
                {"color": "#ffffff"}
            ]}
        ]},
        {"id": 109, "name": "Beige White and Blue", "json": [
            {"featureType": "landscape.natural", "stylers": [
                {"visibility": "on"},
                {"color": "#ecd5c3"}
            ]},
            {"featureType": "water", "stylers": [
                {"visibility": "on"},
                {"color": "#32c4fe"}
            ]},
            {"featureType": "landscape.natural", "stylers": [
                {"visibility": "simplified"}
            ]},
            {"featureType": "transit", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#ffffff"}
            ]},
            {"featureType": "road.arterial", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.local", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "geometry.fill", "stylers": [
                {"color": "#baaca2"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway.controlled_access", "elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#ffffff"}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"color": "#565757"},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "labels.text.stroke", "stylers": [
                {"color": "#808080"},
                {"visibility": "off"}
            ]},
            {"featureType": "road.arterial", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.neighborhood", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#535555"}
            ]},
            {"featureType": "road.highway", "elementType": "geometry", "stylers": [
                {"color": "#fffffe"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "road.highway", "elementType": "labels.icon", "stylers": [
                {"visibility": "on"}
            ]},
            {"featureType": "road", "elementType": "labels.icon", "stylers": [
                {"visibility": "on"},
                {"saturation": -100},
                {"lightness": 17}
            ]},
            {}
        ]},
        {"id": 110, "name": "mikiwat", "json": [
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "336d75"}
            ]},
            {"featureType": "poi", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"hue": "#1900ff"},
                {"color": "#d064a4"}
            ]},
            {"featureType": "landscape.man_made", "elementType": "geometry.fill"},
            {"featureType": "road", "elementType": "geometry", "stylers": [
                {"lightness": 100},
                {"visibility": "simplified"}
            ]},
            {"featureType": "road", "elementType": "labels", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#6bb1e1"}
            ]},
            {"featureType": "transit.line", "elementType": "geometry", "stylers": [
                {"visibility": "on"},
                {"lightness": 700}
            ]}
        ]},
        {"id": 86, "name": "Nature Highlight", "json": [
            {"featureType": "administrative", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "administrative.locality", "elementType": "labels", "stylers": [
                {"visibility": "simplified"},
                {"saturation": 100},
                {"color": "#ff4702"}
            ]},
            {"featureType": "road", "stylers": [
                {"saturation": -100},
                {"visibility": "simplified"},
                {"lightness": -25}
            ]},
            {"featureType": "water", "stylers": [
                {"color": "#5f1bff"},
                {"saturation": 100},
                {"visibility": "on"},
                {"lightness": -38}
            ]},
            {"featureType": "landscape.natural.terrain", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "poi.park", "stylers": [
                {"visibility": "simplified"},
                {"color": "#d3ff44"},
                {"lightness": -32},
                {"saturation": 30}
            ]},
            {"featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#797679"},
                {"gamma": 4.92},
                {"lightness": -47}
            ]},
            {}
        ]},
        {"id": 114, "name": "Colorblind-friendly", "json": [
            {"featureType": "water", "elementType": "all", "stylers": [
                {"hue": "#0072B2"},
                {"saturation": 100},
                {"lightness": -54},
                {"visibility": "on"}
            ]},
            {"featureType": "landscape", "elementType": "all", "stylers": [
                {"hue": "#E69F00"},
                {"saturation": 100},
                {"lightness": -49},
                {"visibility": "on"}
            ]},
            {"featureType": "poi", "elementType": "all", "stylers": [
                {"hue": "#D55E00"},
                {"saturation": 100},
                {"lightness": -46},
                {"visibility": "on"}
            ]},
            {"featureType": "road.local", "elementType": "all", "stylers": [
                {"hue": "#CC79A7"},
                {"saturation": -55},
                {"lightness": -36},
                {"visibility": "on"}
            ]},
            {"featureType": "road.arterial", "elementType": "all", "stylers": [
                {"hue": "#F0E442"},
                {"saturation": -15},
                {"lightness": -22},
                {"visibility": "on"}
            ]},
            {"featureType": "road.highway", "elementType": "all", "stylers": [
                {"hue": "#56B4E9"},
                {"saturation": -23},
                {"lightness": -2},
                {"visibility": "on"}
            ]},
            {"featureType": "administrative", "elementType": "geometry", "stylers": [
                {"hue": "#000000"},
                {"saturation": 0},
                {"lightness": -100},
                {"visibility": "on"}
            ]},
            {"featureType": "transit", "elementType": "all", "stylers": [
                {"hue": "#009E73"},
                {"saturation": 100},
                {"lightness": -59},
                {"visibility": "on"}
            ]}
        ]},
        {"id": 104, "name": "towalk", "json": [
            {"featureType": "poi", "stylers": [
                {"visibility": "off"}
            ]},
            {"featureType": "landscape.man_made", "stylers": [
                {"visibility": "off"},
                {"saturation": 100},
                {"lightness": -17},
                {"gamma": 1.18},
                {"color": "#da97ae"}
            ]},
            {"elementType": "geometry.fill", "stylers": [
                {"color": "#f07913"}
            ]},
            {"featureType": "road", "elementType": "geometry.fill", "stylers": [
                {"color": "#ffffff"},
                {"weight": 0.1}
            ]},
            {"featureType": "road", "elementType": "geometry.stroke", "stylers": [
                {"color": "#d0f380"}
            ]},
            {"stylers": [
                {"weight": 0.1}
            ]},
            {"featureType": "road", "elementType": "labels.text.fill", "stylers": [
                {"visibility": "on"},
                {"color": "#000000"}
            ]},
            {"featureType": "road", "elementType": "labels.text.stroke", "stylers": [
                {"weight": 1},
                {"color": "#83827f"},
                {"visibility": "off"}
            ]},
            {}
        ]}
    ]
};
},{}],8:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresGoogleMapMarkerCtrlModule', []).controller('ceresGoogleMapMarkerCtrl', [
    '$scope',
    '$window',
    '$log',
    '$element',
    function ($scope, $window, $log, $element) {
        $scope.showWindow = false;
        // HELPERS
        var ceres_uid = $element.attr("id");
        var getData = function () {

            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        $scope.marker = {
            id: ceres_uid,
            coords: {
                latitude: data.location_lat,
                longitude: data.location_long
            }
        };

        if(data.icon){
            $scope.marker.icon = data.icon;
        }

        $scope.clicked = function () {
            if (data.content) {
                $scope.showWindow = !$scope.showWindow();
            }
        };

    }
]);

},{}],9:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresIconBlockCtrlModule', []).controller('ceresIconBlockCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],10:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresIconBoxCtrlModule', []).controller('ceresIconBoxCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],11:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresIconLinkCtrlModule', []).controller('ceresIconLinkCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],12:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresIconListCtrlModule', []).controller('ceresIconListCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],13:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresIconListItemCtrlModule', []).controller('ceresIconListItemCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],14:[function(require,module,exports){
'use strict';

// home module
angular.module('ceresSeparatorStyledCtrlModule', []).controller('ceresSeparatorStyledCtrl', [
    '$scope',
    '$window',
    '$element',
    function ($scope, $window, $element) {

        // HELPERS
        var getData = function () {
            var ceres_uid = $element.attr("id");
            return $window.ceresData[ceres_uid];
        };
        var data = getData();

        // This routes to ng-style
        // $scope.myStyle = { ... }
    }
]);

},{}],15:[function(require,module,exports){
'use strict';
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp').directive('parallax', ['$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                parallaxRatio: '@',
                parallaxVerticalOffset: '@',
                parallaxHorizontalOffset: '@',
            },
            link: function ($scope, elem, $attrs) {
                var setPosition = function () {
                    // horizontal positioning
                    elem.css('left', $scope.parallaxHorizontalOffset + "px");

                    var calcValY = $window.pageYOffset * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                    if (calcValY <= $window.innerHeight) {
                        var topVal = (calcValY < $scope.parallaxVerticalOffset ? $scope.parallaxVerticalOffset : calcValY);
                        elem.css('top', topVal + "px");
                    }
                };

                setPosition();

                angular.element($window).bind("scroll", setPosition);
                angular.element($window).bind("touchmove", setPosition);
            }  // link function
        };
    }]).directive('parallaxBackground', ['$window', function ($window) {
        return {
            restrict: 'AC',
            transclude: true,
            template: '<div ng-transclude></div>',
            scope: {
                parallaxRatio: '@',
            },
            link: function ($scope, elem, attrs) {

                //if directive is declared via class,
                //evaluate the object provided by the declaration
                //and shove it into the attrs var so that it
                // behaves like the other two declaration types.
                if (_.isString(attrs.parallaxBackground)) {
                    var directiveAtts = $scope.$eval(attrs.parallaxBackground);
                    _.merge(attrs, directiveAtts);
                }

                var setPosition = function () {
                    var calcValY = (elem.prop('offsetTop') - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                    // horizontal positioning
                    elem.css('background-position', "50% " + calcValY + "px");
                };

                // set our initial position - fixes webkit background render bug
                angular.element($window).bind('load', function (e) {
                    setPosition();
                    $scope.$apply();
                });

                angular.element($window).bind("scroll", setPosition);
                angular.element($window).bind("touchmove", setPosition);
            }  // link function
        };
    }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],16:[function(require,module,exports){
'use strict';
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var $ = window.jQuery;

angular.module('webApp')
    .directive('bsCarousel', function () {
        return {
            template: '<div id="{{ elementId }}" class="carousel slide" data-ride="carousel" >' +
            '<ol class="carousel-indicators"><li ng-repeat="slides in $slides" data-target="#{{ elementId }}" data-slide-to="{{ $index }}" class="active"></li></ol>' +
            '<div ng-transclude class="carousel-inner" role="listbox"></div>' +
            '<a class="left carousel-control" data-target="#{{ elementId }}" role="button" data-slide="prev"> <i class="fa fa-chevron-left"></i><span class="sr-only">Previous</span></a>' +
            '<a class="right carousel-control" data-target="#{{ elementId }}" role="button" data-slide="next"><i class="fa fa-chevron-right"></i><span class="sr-only">Next</span></a>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {},
            link: function postLink(scope, element, attrs) {
                function guid() {
                    function _p8(s) {
                        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
                    }

                    return _p8() + _p8(true) + _p8(true) + _p8();
                }

                scope.elementId = guid();
                console.log("Element ID: " + scope.elementId);
                var $el = $(element);
                console.log($el);
                $el.css('background', 'black');

                scope.$slides = $el.find('.carousel-inner .item');

                if($('.active', scope.$slides).length == 0 && scope.$slides.length > 0) {
                    scope.$slides.first().addClass('active');
                }
            }
        };
    });

},{"./../../bower_components/lodash/dist/lodash.compat.js":1}],17:[function(require,module,exports){
'use strict';
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp')
    .directive('bsCarouselSlide', function () {
        return {
            template: '<div ng-transclude class="item"></div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            link: function postLink(scope, element, attrs) {
            }
        };
    });

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],18:[function(require,module,exports){
'use strict';
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp')
    .directive('ceresClickAnimation', ['$log', '$timeout', 'applyAnimation', function ($log, $timeout, applyAnimation) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var animation = attrs.ceresClickAnimation;
                var delay = attrs.ceresClickAnimationDelay;
                var duration = attrs.clickAnimationDuration;

                element.bind('click', function () {
                    var timeout = applyAnimation.doAnimation(element, animation,
                        delay, duration);

                    applyAnimation.clearAnimation(element, animation, timeout);

                });
            }
        };
    }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],19:[function(require,module,exports){
'use strict';
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");
var $ = window.jQuery;
var _animations = {};

angular.module('webApp')
    .directive('ceresEntranceAnimationType', ['$log', '$timeout', 'applyAnimation', function ($log, $timeout, applyAnimation) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                element.css('opacity', 0);

                //add a collection that tracks the attrs of
                //the different animated elements so they
                //are properly parmeterized on the triggerAnimation
                //actions.
                var unqid = _.uniqueId('animation-');
                element.attr('data-animation-id', unqid);
                attrs.hasAnimated = false;
                _animations[unqid] = attrs;

                scope.triggerInviewAnimation = function (inview, inviewpart, event) {
                    if (inview) {
                        var inviewElement = $(event.inViewTarget);
                        attrs = _animations[inviewElement.attr('data-animation-id')];
                        $log.log("Inview Animation");
                        if (!attrs.animatedIn) {
                            var animation = attrs.ceresEntranceAnimationType;
                            var delay = attrs.entranceAnimationDelay ? attrs.entranceAnimationDelay : 0;
                            var duration = attrs.entranceAnimationDuration ? attrs.entranceAnimationDuration : 0;

                            var timeout = applyAnimation.doAnimation(inviewElement, animation,
                                delay, duration);

                            applyAnimation.clearAnimation(inviewElement, animation, timeout, function () {
                                inviewElement.css('opacity', 1);
                            });
                            attrs.animatedIn = true;
                        }
                    }
                };
            }
        };
    }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],20:[function(require,module,exports){
'use strict';

angular.module('webApp')
    .directive('ceresFlipbook', function () {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var $ = jQuery;

                element.addClass('bb-custom-wrapper');
                var $el = $(element);


                var config = {
                        $bookBlock: $el.find('.bb-bookblock'),
                        $navNext: $el.find('.bb-nav-next'),
                        $navPrev: $el.find('.bb-nav-prev'),
                        $navFirst: $el.find('.bb-nav-first'),
                        $navLast: $el.find('.bb-nav-last')
                    },
                    init = function () {
                        config.$bookBlock.bookblock({
                            speed: 800,
                            shadowSides: 0.8,
                            shadowFlip: 0.7
                        });
                        initEvents();
                    },
                    initEvents = function () {

                        var $slides = config.$bookBlock.children();

                        // add navigation events
                        config.$navNext.on('click touchstart', function () {
                            config.$bookBlock.bookblock('next');
                            return false;
                        });

                        config.$navPrev.on('click touchstart', function () {
                            config.$bookBlock.bookblock('prev');
                            return false;
                        });

                        config.$navFirst.on('click touchstart', function () {
                            config.$bookBlock.bookblock('first');
                            return false;
                        });

                        config.$navLast.on('click touchstart', function () {
                            config.$bookBlock.bookblock('last');
                            return false;
                        });

                        // add swipe events
                        $slides.on({
                            'swipeleft': function (event) {
                                config.$bookBlock.bookblock('next');
                                return false;
                            },
                            'swiperight': function (event) {
                                config.$bookBlock.bookblock('prev');
                                return false;
                            }
                        });
                    };
                init();

            }
        };
    })
;

},{}],21:[function(require,module,exports){
'use strict';
var $ = window.jQuery;
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp').constant("ceresGradients",
    {
        gradients: [
            {
                "name":"Emerald Water",
                "color1":"#348F50",
                "color2":"#56B4D3"
            },
            {
                "name":"Lemon Twist",
                "color1":"#3CA55C",
                "color2":"#B5AC49"
            },
            {
                "name":"Horizon",
                "color1":"#003973",
                "color2":"#E5E5BE"
            },
            {
                "name":"Rose Water",
                "color1":"#E55D87",
                "color2":"#5FC3E4"
            },
            {
                "name":"Frozen",
                "color1":"#403B4A",
                "color2":"#E7E9BB"
            },
            {
                "name":"Mango Pulp",
                "color1":"#F09819",
                "color2":"#EDDE5D"
            },
            {
                "name":"Bloody Mary",
                "color1":"#FF512F",
                "color2":"#DD2476"
            },
            {
                "name":"Aubergine",
                "color1":"#AA076B",
                "color2":"#61045F"
            },
            {
                "name":"Aqua Marine",
                "color1":"#1A2980",
                "color2":"#26D0CE"
            },
            {
                "name":"Sunrise",
                "color1":"#FF512F",
                "color2":"#F09819"
            },
            {
                "name":"Purple Paradise",
                "color1":"#1D2B64",
                "color2":"#F8CDDA"
            },
            {
                "name":"Sea Weed",
                "color1":"#4CB8C4",
                "color2":"#3CD3AD"
            },
            {
                "name":"Pinky",
                "color1":"#DD5E89",
                "color2":"#F7BB97"
            },
            {
                "name":"Cherry",
                "color1":"#EB3349",
                "color2":"#F45C43"
            },
            {
                "name":"Mojito",
                "color1":"#1D976C",
                "color2":"#93F9B9"
            },
            {
                "name":"Juicy Orange",
                "color1":"#FF8008",
                "color2":"#FFC837"
            },
            {
                "name":"Mirage",
                "color1":"#16222A",
                "color2":"#3A6073"
            },
            {
                "name":"Steel Gray",
                "color1":"#1F1C2C",
                "color2":"#928DAB"
            },
            {
                "name":"Kashmir",
                "color1":"#614385",
                "color2":"#516395"
            },
            {
                "name":"Electric Violet",
                "color1":"#4776E6",
                "color2":"#8E54E9"
            },
            {
                "name":"Venice Blue",
                "color1":"#085078",
                "color2":"#85D8CE"
            },
            {
                "name":"Bora Bora",
                "color1":"#2BC0E4",
                "color2":"#EAECC6"
            },
            {
                "name":"Moss",
                "color1":"#134E5E",
                "color2":"#71B280"
            },
            {
                "name":"Shroom Haze",
                "color1":"#5C258D",
                "color2":"#4389A2"
            },
            {
                "name":"Mystic",
                "color1":"#757F9A",
                "color2":"#D7DDE8"
            },
            {
                "name":"Midnight City",
                "color1":"#232526",
                "color2":"#414345"
            },
            {
                "name":"Sea Blizz",
                "color1":"#1CD8D2",
                "color2":"#93EDC7"
            },
            {
                "name":"Opa",
                "color1":"#3D7EAA",
                "color2":"#FFE47A"
            },
            {
                "name":"Titanium",
                "color1":"#283048",
                "color2":"#859398"
            },
            {
                "name":"Mantle",
                "color1":"#24C6DC",
                "color2":"#514A9D"
            },
            {
                "name":"Dracula",
                "color1":"#DC2424",
                "color2":"#4A569D"
            },
            {
                "name":"Peach",
                "color1":"#ED4264",
                "color2":"#FFEDBC"
            },
            {
                "name":"Moonrise",
                "color1":"#DAE2F8",
                "color2":"#D6A4A4"
            },
            {
                "name":"Clouds",
                "color1":"#ECE9E6",
                "color2":"#FFFFFF"
            },
            {
                "name":"Stellar",
                "color1":"#7474BF",
                "color2":"#348AC7"
            },
            {
                "name":"Bourbon",
                "color1":"#EC6F66",
                "color2":"#F3A183"
            },
            {
                "name":"Calm Darya",
                "color1":"#5f2c82",
                "color2":"#49a09d"
            },
            {
                "name":"Influenza",
                "color1":"#C04848",
                "color2":"#480048"
            },
            {
                "name":"Shrimpy",
                "color1":"#e43a15",
                "color2":"#e65245"
            },
            {
                "name":"Army",
                "color1":"#414d0b",
                "color2":"#727a17"
            },
            {
                "name":"Miaka",
                "color1":"#FC354C",
                "color2":"#0ABFBC"
            },
            {
                "name":"Pinot Noir",
                "color1":"#4b6cb7",
                "color2":"#182848"
            },
            {
                "name":"Day Tripper",
                "color1":"#f857a6",
                "color2":"#ff5858"
            },
            {
                "name":"Namn",
                "color1":"#a73737",
                "color2":"#7a2828"
            },
            {
                "name":"Blurry Beach",
                "color1":"#d53369",
                "color2":"#cbad6d"
            },
            {
                "name":"Vasily",
                "color1":"#e9d362",
                "color2":"#333333"
            },
            {
                "name":"A Lost Memory",
                "color1":"#DE6262",
                "color2":"#FFB88C"
            },
            {
                "name":"Petrichor",
                "color1":"#666600",
                "color2":"#999966"
            },
            {
                "name":"Jonquil",
                "color1":"#FFEEEE",
                "color2":"#DDEFBB"
            },
            {
                "name":"Sirius Tamed",
                "color1":"#EFEFBB",
                "color2":"#D4D3DD"
            },
            {
                "name":"Kyoto",
                "color1":"#c21500",
                "color2":"#ffc500"
            },
            {
                "name":"Misty Meadow",
                "color1":"#215f00",
                "color2":"#e4e4d9"
            },
            {
                "name":"Aqualicious",
                "color1":"#50C9C3",
                "color2":"#96DEDA"
            },
            {
                "name":"Moor",
                "color1":"#616161",
                "color2":"#9bc5c3"
            },
            {
                "name":"Almost",
                "color1":"#ddd6f3",
                "color2":"#faaca8"
            },
            {
                "name":"Forever Lost",
                "color1":"#5D4157",
                "color2":"#A8CABA"
            },
            {
                "name":"Winter",
                "color1":"#E6DADA",
                "color2":"#274046"
            },
            {
                "name":"Autumn",
                "color1":"#DAD299",
                "color2":"#B0DAB9"
            },
            {
                "name":"Candy",
                "color1":"#D3959B",
                "color2":"#BFE6BA"
            },
            {
                "name":"Reef",
                "color1":"#00d2ff",
                "color2":"#3a7bd5"
            },
            {
                "name":"The Strain",
                "color1":"#870000",
                "color2":"#190A05"
            },
            {
                "name":"Dirty Fog",
                "color1":"#B993D6",
                "color2":"#8CA6DB"
            },
            {
                "name":"Earthly",
                "color1":"#649173",
                "color2":"#DBD5A4"
            },
            {
                "name":"Virgin",
                "color1":"#C9FFBF",
                "color2":"#FFAFBD"
            },
            {
                "name":"Ash",
                "color1":"#606c88",
                "color2":"#3f4c6b"
            },
            {
                "name":"Shadow Night",
                "color1":"#000000",
                "color2":"#53346D"
            },
            {
                "name":"Cherryblossoms",
                "color1":"#FBD3E9",
                "color2":"#BB377D"
            },
            {
                "name":"Parklife",
                "color1":"#ADD100",
                "color2":"#7B920A"
            },
            {
                "name":"Dance To Forget",
                "color1":"#FF4E50",
                "color2":"#F9D423"
            },
            {
                "name":"Starfall",
                "color1":"#F0C27B",
                "color2":"#4B1248"
            },
            {
                "name":"Red Mist",
                "color1":"#000000",
                "color2":"#e74c3c"
            },
            {
                "name":"Teal Love",
                "color1":"#AAFFA9",
                "color2":"#11FFBD"
            },
            {
                "name":"Neon Life",
                "color1":"#B3FFAB",
                "color2":"#12FFF7"
            },
            {
                "name":"Man of Steel",
                "color1":"#780206",
                "color2":"#061161"
            },
            {
                "name":"Amethyst",
                "color1":"#9D50BB",
                "color2":"#6E48AA"
            },
            {
                "name":"Cheer Up Emo Kid",
                "color1":"#556270",
                "color2":"#FF6B6B"
            },
            {
                "name":"Shore",
                "color1":"#70e1f5",
                "color2":"#ffd194"
            },
            {
                "name":"Facebook Messenger",
                "color1":"#00c6ff",
                "color2":"#0072ff"
            },
            {
                "name":"SoundCloud",
                "color1":"#fe8c00",
                "color2":"#f83600"
            },
            {
                "name":"Behongo",
                "color1":"#52c234",
                "color2":"#061700"
            },
            {
                "name":"ServQuick",
                "color1":"#485563",
                "color2":"#29323c"
            },
            {
                "name":"Friday",
                "color1":"#83a4d4",
                "color2":"#b6fbff"
            },
            {
                "name":"Martini",
                "color1":"#FDFC47",
                "color2":"#24FE41"
            },
            {
                "name":"Metallic Toad",
                "color1":"#abbaab",
                "color2":"#ffffff"
            },
            {
                "name":"Between The Clouds",
                "color1":"#73C8A9",
                "color2":"#373B44"
            },
            {
                "name":"Crazy Orange I",
                "color1":"#D38312",
                "color2":"#A83279"
            },
            {
                "name":"Hersheys",
                "color1":"#1e130c",
                "color2":"#9a8478"
            },
            {
                "name":"Talking To Mice Elf",
                "color1":"#948E99",
                "color2":"#2E1437"
            },
            {
                "name":"Purple Bliss",
                "color1":"#360033",
                "color2":"#0b8793"
            },
            {
                "name":"Predawn",
                "color1":"#FFA17F",
                "color2":"#00223E"
            },
            {
                "name":"Endless River",
                "color1":"#43cea2",
                "color2":"#185a9d"
            },
            {
                "name":"Pastel Orange at the Sun",
                "color1":"#ffb347",
                "color2":"#ffcc33"
            },
            {
                "name": "Twitch",
                "color1": "#6441A5",
                "color2": "#2a0845"
            },
            {
                "name": "Instagram",
                "color1": "#517fa4",
                "color2": "#243949"
            },
            {
                "name": "Flickr",
                "color1": "#ff0084",
                "color2": "#33001b"
            },
            {
                "name": "Vine",
                "color1": "#00bf8f",
                "color2": "#001510"
            }
        ]})
    .directive('ceresGradientBg', [
        '$log', '$interpolate', 'ceresGradients',
        function ($log, $interpolate, ceresGradients) {

            function link(scope, element, attrs) {

                //if directive is declared via class,
                //evaluate the object provided by the declaration
                //and shove it into the attrs var so that it
                // behaves like the other two declaration types.
                if (_.isString(attrs.ceresGradientBg)) {
                    var directiveAtts = scope.$eval(attrs.ceresGradientBg);
                    _.merge(attrs, directiveAtts);
                }

                var gradientsMap = _.indexBy(ceresGradients.gradients, function (grad) {
                    return S(grad.name).dasherize().chompLeft('-').s;
                });

                var selectedGradientStyle = attrs.gradientStyle ? attrs.gradientStyle : "emerald-water";
                var selectedGradient = gradientsMap[selectedGradientStyle];

                var $el = $(element);
                var vendors = ['webkit', 'moz', 'ms', 'o'];
                vendors = _.mapValues(vendors, function (v) {
                    return S(v).ensureLeft('-').ensureRight('-').s;
                });
                vendors = _.values(vendors);
                vendors.push('');

                var background = $interpolate("background: {{ vendor }}linear-gradient({{ degree }}deg, {{ color1 }} 10%, {{ color2 }} 90%);");
                var bkgdRules = _.mapValues(vendors, function (v) {
                    selectedGradient.vendor = v;
                    selectedGradient.degree = attrs.gradientDegree ? attrs.gradientDegree : 90;
                    return background(selectedGradient);
                });

                var bkgdString = _.reduce(bkgdRules, function (all, rule) {
                    return all + rule;
                });

                var elStyle = $el.attr("style") + bkgdString;

                $el.attr("style", elStyle);
            }

            return {
                restrict: 'AEC',
                link: link
            };
        }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],22:[function(require,module,exports){
'use strict';

var $ = window.jQuery;
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp')
    .directive('ceresHoverAnimation',  ['$log', '$timeout', 'applyAnimation', function ($log, $timeout, applyAnimation) {
        return {
            restrict: 'A',
            link: function postLink(scope, element, attrs) {
                var animation = attrs.ceresHoverAnimation;
                var delay = attrs.ceresHoverAnimationDelay;
                var duration = attrs.hoverAnimationDuration;

                element.bind('mouseenter', function () {
                    var timeout = applyAnimation.doAnimation(element, animation,
                        delay, duration);
                    applyAnimation.clearAnimation(element, animation, timeout);

                });

            }
        };
    }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],23:[function(require,module,exports){
'use strict';
var $ = window.jQuery;
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp')
    .directive('ceresVideoBg', [
        '$log', '$interpolate', '$window',
        function ($log, $interpolate, $window) {

            function link(scope, element, attrs) {

                //if directive is declared via class,
                //evaluate the object provided by the declaration
                //and shove it into the attrs var so that it
                // behaves like the other two declaration types.
                if (_.isString(attrs.ceresVideoBg)) {
                    var directiveAtts = scope.$eval(attrs.ceresVideoBg);
                    _.merge(attrs, directiveAtts);
                }

                var template =
                    '<div class="ceres-background-video">' +
                    '<video muted="muted" preload="auto" autoplay="autoplay" loop="loop" poster="{{ poster }}" class="video-js">' +
                    '<source src="{{ mp4Path }}" type="video/mp4" />' +
                    '<source src="{{ webmPath }}" type="video/webm" />' +
                    '</video>' +
                    '</div>';
                var compiledTemplate = $interpolate(template);
                var videoHtml = compiledTemplate(attrs);

                element.addClass('has-ceres-video-bg');
                element.prepend(videoHtml);

                var videoEl = element.find('.ceres-background-video > video');
                if (videoEl.count > 0) {
                    videoEl = videoEl[0];
                }
                var updateVideoSize = function () {
                    var elWidth = element.width();
                    var elHeight = element.height();

                    var vidWidth = videoEl.width();
                    var vidHeight = videoEl.height();
                    var vidAspectRatio = vidWidth / vidHeight;


                    $(videoEl).css('min-width', Math.round(Math.max(elWidth, elHeight * vidAspectRatio)));
                    $(videoEl).css('min-height', Math.round(Math.max(elHeight, elWidth / vidAspectRatio)));

                    //Grab it again because the width and height of the video have been updated
                    vidWidth = videoEl.width();
                    vidHeight = videoEl.height();
                    // Calculate the top and left offsets to center the video
                    var left = Math.round((vidWidth - elWidth) / 2) * -1;
                    var top = Math.round((vidHeight - elHeight) / 2) * -1;
                    $(videoEl).css('left', left + 'px');
                    $(videoEl).css('top', top + 'px');
                };

                $(window).load(function () {
                    _.defer(function () {
                        updateVideoSize();
                    });
                });

                $($window).on("debouncedresize", function (event) {
                    updateVideoSize();
                });
            }

            return {
                restrict: 'AEC',
                link: link
            };
        }]);

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],24:[function(require,module,exports){
'use strict';

angular.module('webApp')
    .directive('counter', ['$log', '$window', function ($log, $window) {
        return {
            template: '<div in-view="animate($inview)"></div>',
            restrict: 'E',
            controller: function ($scope) {

            },
            scope: {},
            link: function postLink(scope, element, attrs) {
                var _ = $window._;
                var numeral = $window.numeral;
                var TweenMax = $window.TweenMax;
                var Power2 = $window.Power2;

                //get the start & end values
                var currVal = attrs.startValue;
                var endVal = attrs.endValue;
                var prefix = attrs.prefix ? attrs.prefix : '';
                var postfix = attrs.postfix ? attrs.postfix : '';
                var format = attrs.numberFormat ? attrs.numberFormat : '0,0';

                //animation options
                var duration = attrs.animationDuration ? parseFloat(attrs.animationDuration) : 5;
                var animationDelay = attrs.animationDelay ? parseFloat(attrs.animationDelay) : 0;
                var easing = attrs.easing ? attrs.easing : 'Power2.easeInOut';
                var easingParts = easing.split('.');

                var easeObj = $window;
                _.forEach(easingParts, function (ease) {
                    easeObj = easeObj[ease];
                });
                easing = easeObj;

                //numeraljs configuration;
                var defaultLang = numeral.languageData('en');
                var oldLang = _.cloneDeep(defaultLang);


                //NOTE: We have to directly edit the DOM because the NG apply
                //isn't sufficient for animating steps.
                element.text(currVal);

                scope.getTextVal = function () {
                    return parseFloat(currVal);
                };
                scope.setTextVal = function (val) {
                    if (attrs.thousandsDelimiter) {
                        defaultLang.delimiters.thousands = attrs.thousandsDelimiter;
                    }
                    if (attrs.decimalDelimiter) {
                        defaultLang.delimiters.decimal = attrs.decimalDelimiter;
                    }

                    var currVal = parseFloat(val, 10);
                    var numStr = prefix + numeral(currVal).format(format) + postfix;
                    element.text(numStr);
                };

                var animated = false;
                scope.animate = function (inview) {
                    if (!animated && inview) {
                        TweenMax.to(scope, duration, { delay: animationDelay, setTextVal: endVal, ease: easing, onComplete: function () {
                            //reset the default numeral.
                            numeral.language('en', oldLang);
                        }});
                        animated = true;
                    }
                };
            }
        };
    }]);

},{}],25:[function(require,module,exports){
'use strict';

// load src modules
// ADD REQUIRE STATEMENTS FOR NEW SHORTCODES HERE

// WARNING: DO NOT DELETE THE LINE BELOW -- THE SHORTCODE GENERATOR DEPENDS ON IT
// [ShortcodeNgControllerRequireStatement]
require('./ceresSeparatorStyledCtrl/ceresSeparatorStyledCtrl');
require('./ceresIconListItemCtrl/ceresIconListItemCtrl');
require('./ceresIconListCtrl/ceresIconListCtrl');
require('./ceresIconBlockCtrl/ceresIconBlockCtrl');
require('./ceresIconLinkCtrl/ceresIconLinkCtrl');
require('./ceresIconBoxCtrl/ceresIconBoxCtrl');
require('./ceresButtonOutlineCtrl/ceresButtonOutlineCtrl');
require('./ceresButtonSolidCtrl/ceresButtonSolidCtrl');
require('./ceresAnimationBlockCtrl/ceresAnimationBlockCtrl');
require('./ceresIconListItemCtrl/ceresIconListItemCtrl');
require('./ceresGoogleMapMarkerCtrl/ceresGoogleMapMarkerCtrl');
require('./ceresGoogleMapCtrl/ceresGoogleMapCtrl');

angular.module('webApp', [
    // ADD MODULE NAMES FOR NEW SHORTCODES HERE
    'ngAnimate',
    'angular-inview',
    'timer',
    'google-maps',
    // WARNING: DO NOT DELETE THE LINE BELOW -- THE SHORTCODE GENERATOR DEPENDS ON IT
    // [ShortcodeNgModuleImport]
        'ceresSeparatorStyledCtrlModule',
        'ceresIconListItemCtrlModule',
        'ceresIconListCtrlModule',
        'ceresIconBlockCtrlModule',
        'ceresIconLinkCtrlModule',
        'ceresIconBoxCtrlModule',
        'ceresButtonOutlineCtrlModule',
        'ceresButtonSolidCtrlModule',
        'ceresAnimationBlockCtrlModule',
        'ceresIconListItemCtrlModule',
    'ceresGoogleMapMarkerCtrlModule',
    'ceresGoogleMapCtrlModule'
]);

require('./services/browservendorstrings');
require('./services/applyanimation');

require('./vendors/numeral');
require('./vendors/angular-parallax/scripts/angular-parallax.js');
require('./vendors/toucheffects');

require('./directives/angular-parallax');
require('./directives/ceresclickanimation');
require('./directives/ceresentranceanimationtype');
require('./directives/cereshoveranimation');
require('./directives/ceresgradientbg');
require('./directives/ceresvideobg');
require('./directives/ceresflipbook');
require('./directives/counter');
require('./directives/bscarousel.js');
require('./directives/bscarouselslide.js');



//angular configuration
angular.element(document).ready(function () {
    /*smart works go here*/
    var $html = angular.element('html');
    // bootstrap model
    angular.bootstrap($html, ['webApp']);
});

},{"./ceresAnimationBlockCtrl/ceresAnimationBlockCtrl":3,"./ceresButtonOutlineCtrl/ceresButtonOutlineCtrl":4,"./ceresButtonSolidCtrl/ceresButtonSolidCtrl":5,"./ceresGoogleMapCtrl/ceresGoogleMapCtrl":6,"./ceresGoogleMapMarkerCtrl/ceresGoogleMapMarkerCtrl":8,"./ceresIconBlockCtrl/ceresIconBlockCtrl":9,"./ceresIconBoxCtrl/ceresIconBoxCtrl":10,"./ceresIconLinkCtrl/ceresIconLinkCtrl":11,"./ceresIconListCtrl/ceresIconListCtrl":12,"./ceresIconListItemCtrl/ceresIconListItemCtrl":13,"./ceresSeparatorStyledCtrl/ceresSeparatorStyledCtrl":14,"./directives/angular-parallax":15,"./directives/bscarousel.js":16,"./directives/bscarouselslide.js":17,"./directives/ceresclickanimation":18,"./directives/ceresentranceanimationtype":19,"./directives/ceresflipbook":20,"./directives/ceresgradientbg":21,"./directives/cereshoveranimation":22,"./directives/ceresvideobg":23,"./directives/counter":24,"./services/applyanimation":26,"./services/browservendorstrings":27,"./vendors/angular-parallax/scripts/angular-parallax.js":28,"./vendors/numeral":29,"./vendors/toucheffects":30}],26:[function(require,module,exports){
'use strict';

var $ = window.jQuery
var _ = require("./../../bower_components/lodash/dist/lodash.compat.js");
var S = require("./../../bower_components/stringjs/lib/string.min.js");

angular.module('webApp')
    .factory('applyAnimation', function (browserVendorStrings, $log, $timeout) {

        var setAllVendorCSS = function (element, property, value) {
            _.forEach(browserVendorStrings, function (prefix) {
                var stylePrefix = S(prefix);
                if (prefix != '') {
                    stylePrefix.ensureLeft('-').ensureRight('-');
                }
                element.css(stylePrefix.ensureRight(property).s, value);
            });
        };

        // Public API here
        return {
            doAnimation: function (element, animation, delay, duration) {
                element = $(element);
                if (!element.hasClass('animated')) {
                    if (duration !== undefined) {
                        setAllVendorCSS(element, 'animation-duration', S(duration).ensureRight('s').s);
                    }
                    if (delay !== undefined) {
                        setAllVendorCSS(element, 'animation-delay', S(delay).ensureRight('s').s);
                    }

                    element.addClass("animated " + animation);
                    $log.log("Added Animated class");
                    delay = parseFloat(delay);
                    duration = parseFloat(duration);
                    delay = !isNaN(delay) ? delay : 0;
                    duration = !isNaN(duration) ? duration : 0;
                    return (delay + duration) * 1000;
                }
            },
            clearAnimation: function (element, animation, timeout, cb) {
                timeout = timeout > 0 ? timeout : 750;
                $timeout(function () {
                    element = $(element);
                    element.removeClass("animated");
                    element.removeClass(animation);
                    $log.log("Removed Animated class");

                }, timeout);
                if (cb) {
                    cb();
                }
            }
        };
    });

},{"./../../bower_components/lodash/dist/lodash.compat.js":1,"./../../bower_components/stringjs/lib/string.min.js":2}],27:[function(require,module,exports){
'use strict';

angular.module('webApp')
  .constant('browserVendorStrings', ['webkit', 'moz', 'o', 'ms', '']);

},{}],28:[function(require,module,exports){
'use strict';

angular.module('angular-parallax', [
    ]).directive('parallax', ['$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                parallaxRatio: '@',
                parallaxVerticalOffset: '@',
                parallaxHorizontalOffset: '@',
            },
            link: function ($scope, elem, $attrs) {
                var setPosition = function () {
                    // horizontal positioning
                    elem.css('left', $scope.parallaxHorizontalOffset + "px");

                    var calcValY = $window.pageYOffset * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                    if (calcValY <= $window.innerHeight) {
                        var topVal = (calcValY < $scope.parallaxVerticalOffset ? $scope.parallaxVerticalOffset : calcValY);
                        elem.css('top', topVal + "px");
                    }
                };

                setPosition();

                angular.element($window).bind("scroll", setPosition);
                angular.element($window).bind("touchmove", setPosition);
            }  // link function
        };
    }]).directive('parallaxBackground', ['$window', function ($window) {
        return {
            restrict: 'AC',
            transclude: true,
            template: '<div ng-transclude></div>',
            scope: {
                parallaxRatio: '@',
            },
            link: function ($scope, elem, attrs) {

                //if directive is declared via class,
                //evaluate the object provided by the declaration
                //and shove it into the attrs var so that it
                // behaves like the other two declaration types.
                if (_.isString(attrs.parallaxBackground)) {
                    var directiveAtts = $scope.$eval(attrs.parallaxBackground);
                    _.merge(attrs, directiveAtts);
                }

                var setPosition = function () {
                    var calcValY = (elem.prop('offsetTop') - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                    // horizontal positioning
                    elem.css('background-position', "50% " + calcValY + "px");
                };

                // set our initial position - fixes webkit background render bug
                angular.element($window).bind('load', function (e) {
                    setPosition();
                    $scope.$apply();
                });

                angular.element($window).bind("scroll", setPosition);
                angular.element($window).bind("touchmove", setPosition);
            }  // link function
        };
    }]);

},{}],29:[function(require,module,exports){
/*!
 * numeral.js
 * version : 1.5.3
 * author : Adam Draper
 * license : MIT
 * http://adamwdraper.github.com/Numeral-js/
 */

(function () {

    /************************************
     Constants
     ************************************/

    var numeral,
        VERSION = '1.5.3',
    // internal storage for language config files
        languages = {},
        currentLanguage = 'en',
        zeroFormat = null,
        defaultFormat = '0,0',
    // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports);


    /************************************
     Constructors
     ************************************/


        // Numeral prototype object
    function Numeral (number) {
        this._value = number;
    }

    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === '0.61') that present
     * problems for accounting- and finance-related software.
     */
    function toFixed (value, precision, roundingFunction, optionals) {
        var power = Math.pow(10, precision),
            optionalsRegExp,
            output;

        //roundingFunction = (roundingFunction !== undefined ? roundingFunction : Math.round);
        // Multiply up by precision, round accurately, then divide and use native toFixed():
        output = (roundingFunction(value * power) / power).toFixed(precision);

        if (optionals) {
            optionalsRegExp = new RegExp('0{1,' + optionals + '}$');
            output = output.replace(optionalsRegExp, '');
        }

        return output;
    }

    /************************************
     Formatting
     ************************************/

        // determine what type of formatting we need to do
    function formatNumeral (n, format, roundingFunction) {
        var output;

        // figure out what kind of format we are dealing with
        if (format.indexOf('$') > -1) { // currency!!!!!
            output = formatCurrency(n, format, roundingFunction);
        } else if (format.indexOf('%') > -1) { // percentage
            output = formatPercentage(n, format, roundingFunction);
        } else if (format.indexOf(':') > -1) { // time
            output = formatTime(n, format);
        } else { // plain ol' numbers or bytes
            output = formatNumber(n._value, format, roundingFunction);
        }

        // return string
        return output;
    }

    // revert to number
    function unformatNumeral (n, string) {
        var stringOriginal = string,
            thousandRegExp,
            millionRegExp,
            billionRegExp,
            trillionRegExp,
            suffixes = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            bytesMultiplier = false,
            power;

        if (string.indexOf(':') > -1) {
            n._value = unformatTime(string);
        } else {
            if (string === zeroFormat) {
                n._value = 0;
            } else {
                if (languages[currentLanguage].delimiters.decimal !== '.') {
                    string = string.replace(/\./g,'').replace(languages[currentLanguage].delimiters.decimal, '.');
                }

                // see if abbreviations are there so that we can multiply to the correct number
                thousandRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.thousand + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                millionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.million + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                billionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.billion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');
                trillionRegExp = new RegExp('[^a-zA-Z]' + languages[currentLanguage].abbreviations.trillion + '(?:\\)|(\\' + languages[currentLanguage].currency.symbol + ')?(?:\\))?)?$');

                // see if bytes are there so that we can multiply to the correct number
                for (power = 0; power <= suffixes.length; power++) {
                    bytesMultiplier = (string.indexOf(suffixes[power]) > -1) ? Math.pow(1024, power + 1) : false;

                    if (bytesMultiplier) {
                        break;
                    }
                }

                // do some math to create our number
                n._value = ((bytesMultiplier) ? bytesMultiplier : 1) * ((stringOriginal.match(thousandRegExp)) ? Math.pow(10, 3) : 1) * ((stringOriginal.match(millionRegExp)) ? Math.pow(10, 6) : 1) * ((stringOriginal.match(billionRegExp)) ? Math.pow(10, 9) : 1) * ((stringOriginal.match(trillionRegExp)) ? Math.pow(10, 12) : 1) * ((string.indexOf('%') > -1) ? 0.01 : 1) * (((string.split('-').length + Math.min(string.split('(').length-1, string.split(')').length-1)) % 2)? 1: -1) * Number(string.replace(/[^0-9\.]+/g, ''));

                // round if we are talking about bytes
                n._value = (bytesMultiplier) ? Math.ceil(n._value) : n._value;
            }
        }
        return n._value;
    }

    function formatCurrency (n, format, roundingFunction) {
        var symbolIndex = format.indexOf('$'),
            openParenIndex = format.indexOf('('),
            minusSignIndex = format.indexOf('-'),
            space = '',
            spliceIndex,
            output;

        // check for space before or after currency
        if (format.indexOf(' $') > -1) {
            space = ' ';
            format = format.replace(' $', '');
        } else if (format.indexOf('$ ') > -1) {
            space = ' ';
            format = format.replace('$ ', '');
        } else {
            format = format.replace('$', '');
        }

        // format the number
        output = formatNumber(n._value, format, roundingFunction);

        // position the symbol
        if (symbolIndex <= 1) {
            if (output.indexOf('(') > -1 || output.indexOf('-') > -1) {
                output = output.split('');
                spliceIndex = 1;
                if (symbolIndex < openParenIndex || symbolIndex < minusSignIndex){
                    // the symbol appears before the "(" or "-"
                    spliceIndex = 0;
                }
                output.splice(spliceIndex, 0, languages[currentLanguage].currency.symbol + space);
                output = output.join('');
            } else {
                output = languages[currentLanguage].currency.symbol + space + output;
            }
        } else {
            if (output.indexOf(')') > -1) {
                output = output.split('');
                output.splice(-1, 0, space + languages[currentLanguage].currency.symbol);
                output = output.join('');
            } else {
                output = output + space + languages[currentLanguage].currency.symbol;
            }
        }

        return output;
    }

    function formatPercentage (n, format, roundingFunction) {
        var space = '',
            output,
            value = n._value * 100;

        // check for space before %
        if (format.indexOf(' %') > -1) {
            space = ' ';
            format = format.replace(' %', '');
        } else {
            format = format.replace('%', '');
        }

        output = formatNumber(value, format, roundingFunction);

        if (output.indexOf(')') > -1 ) {
            output = output.split('');
            output.splice(-1, 0, space + '%');
            output = output.join('');
        } else {
            output = output + space + '%';
        }

        return output;
    }

    function formatTime (n) {
        var hours = Math.floor(n._value/60/60),
            minutes = Math.floor((n._value - (hours * 60 * 60))/60),
            seconds = Math.round(n._value - (hours * 60 * 60) - (minutes * 60));
        return hours + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' + ((seconds < 10) ? '0' + seconds : seconds);
    }

    function unformatTime (string) {
        var timeArray = string.split(':'),
            seconds = 0;
        // turn hours and minutes into seconds and add them all up
        if (timeArray.length === 3) {
            // hours
            seconds = seconds + (Number(timeArray[0]) * 60 * 60);
            // minutes
            seconds = seconds + (Number(timeArray[1]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[2]);
        } else if (timeArray.length === 2) {
            // minutes
            seconds = seconds + (Number(timeArray[0]) * 60);
            // seconds
            seconds = seconds + Number(timeArray[1]);
        }
        return Number(seconds);
    }

    function formatNumber (value, format, roundingFunction) {
        var negP = false,
            signed = false,
            optDec = false,
            abbr = '',
            abbrK = false, // force abbreviation to thousands
            abbrM = false, // force abbreviation to millions
            abbrB = false, // force abbreviation to billions
            abbrT = false, // force abbreviation to trillions
            abbrForce = false, // force abbreviation
            bytes = '',
            ord = '',
            abs = Math.abs(value),
            suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            min,
            max,
            power,
            w,
            precision,
            thousands,
            d = '',
            neg = false;

        // check if number is zero and a custom zero format has been set
        if (value === 0 && zeroFormat !== null) {
            return zeroFormat;
        } else {
            // see if we should use parentheses for negative number or if we should prefix with a sign
            // if both are present we default to parentheses
            if (format.indexOf('(') > -1) {
                negP = true;
                format = format.slice(1, -1);
            } else if (format.indexOf('+') > -1) {
                signed = true;
                format = format.replace(/\+/g, '');
            }

            // see if abbreviation is wanted
            if (format.indexOf('a') > -1) {
                // check if abbreviation is specified
                abbrK = format.indexOf('aK') >= 0;
                abbrM = format.indexOf('aM') >= 0;
                abbrB = format.indexOf('aB') >= 0;
                abbrT = format.indexOf('aT') >= 0;
                abbrForce = abbrK || abbrM || abbrB || abbrT;

                // check for space before abbreviation
                if (format.indexOf(' a') > -1) {
                    abbr = ' ';
                    format = format.replace(' a', '');
                } else {
                    format = format.replace('a', '');
                }

                if (abs >= Math.pow(10, 12) && !abbrForce || abbrT) {
                    // trillion
                    abbr = abbr + languages[currentLanguage].abbreviations.trillion;
                    value = value / Math.pow(10, 12);
                } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !abbrForce || abbrB) {
                    // billion
                    abbr = abbr + languages[currentLanguage].abbreviations.billion;
                    value = value / Math.pow(10, 9);
                } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !abbrForce || abbrM) {
                    // million
                    abbr = abbr + languages[currentLanguage].abbreviations.million;
                    value = value / Math.pow(10, 6);
                } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !abbrForce || abbrK) {
                    // thousand
                    abbr = abbr + languages[currentLanguage].abbreviations.thousand;
                    value = value / Math.pow(10, 3);
                }
            }

            // see if we are formatting bytes
            if (format.indexOf('b') > -1) {
                // check for space before
                if (format.indexOf(' b') > -1) {
                    bytes = ' ';
                    format = format.replace(' b', '');
                } else {
                    format = format.replace('b', '');
                }

                for (power = 0; power <= suffixes.length; power++) {
                    min = Math.pow(1024, power);
                    max = Math.pow(1024, power+1);

                    if (value >= min && value < max) {
                        bytes = bytes + suffixes[power];
                        if (min > 0) {
                            value = value / min;
                        }
                        break;
                    }
                }
            }

            // see if ordinal is wanted
            if (format.indexOf('o') > -1) {
                // check for space before
                if (format.indexOf(' o') > -1) {
                    ord = ' ';
                    format = format.replace(' o', '');
                } else {
                    format = format.replace('o', '');
                }

                ord = ord + languages[currentLanguage].ordinal(value);
            }

            if (format.indexOf('[.]') > -1) {
                optDec = true;
                format = format.replace('[.]', '.');
            }

            w = value.toString().split('.')[0];
            precision = format.split('.')[1];
            thousands = format.indexOf(',');

            if (precision) {
                if (precision.indexOf('[') > -1) {
                    precision = precision.replace(']', '');
                    precision = precision.split('[');
                    d = toFixed(value, (precision[0].length + precision[1].length), roundingFunction, precision[1].length);
                } else {
                    d = toFixed(value, precision.length, roundingFunction);
                }

                w = d.split('.')[0];

                if (d.split('.')[1].length) {
                    d = languages[currentLanguage].delimiters.decimal + d.split('.')[1];
                } else {
                    d = '';
                }

                if (optDec && Number(d.slice(1)) === 0) {
                    d = '';
                }
            } else {
                w = toFixed(value, null, roundingFunction);
            }

            // format number
            if (w.indexOf('-') > -1) {
                w = w.slice(1);
                neg = true;
            }

            if (thousands > -1) {
                w = w.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + languages[currentLanguage].delimiters.thousands);
            }

            if (format.indexOf('.') === 0) {
                w = '';
            }

            return ((negP && neg) ? '(' : '') + ((!negP && neg) ? '-' : '') + ((!neg && signed) ? '+' : '') + w + d + ((ord) ? ord : '') + ((abbr) ? abbr : '') + ((bytes) ? bytes : '') + ((negP && neg) ? ')' : '');
        }
    }

    /************************************
     Top Level Functions
     ************************************/

    numeral = function (input) {
        if (numeral.isNumeral(input)) {
            input = input.value();
        } else if (input === 0 || typeof input === 'undefined') {
            input = 0;
        } else if (!Number(input)) {
            input = numeral.fn.unformat(input);
        }

        return new Numeral(Number(input));
    };

    // version number
    numeral.version = VERSION;

    // compare numeral object
    numeral.isNumeral = function (obj) {
        return obj instanceof Numeral;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    numeral.language = function (key, values) {
        if (!key) {
            return currentLanguage;
        }

        if (key && !values) {
            if(!languages[key]) {
                throw new Error('Unknown language : ' + key);
            }
            currentLanguage = key;
        }

        if (values || !languages[key]) {
            loadLanguage(key, values);
        }

        return numeral;
    };

    // This function provides access to the loaded language data.  If
    // no arguments are passed in, it will simply return the current
    // global language object.
    numeral.languageData = function (key) {
        if (!key) {
            return languages[currentLanguage];
        }

        if (!languages[key]) {
            throw new Error('Unknown language : ' + key);
        }

        return languages[key];
    };

    numeral.language('en', {
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                        (b === 3) ? 'rd' : 'th';
        },
        currency: {
            symbol: '$'
        }
    });

    numeral.zeroFormat = function (format) {
        zeroFormat = typeof(format) === 'string' ? format : null;
    };

    numeral.defaultFormat = function (format) {
        defaultFormat = typeof(format) === 'string' ? format : '0.0';
    };

    /************************************
     Helpers
     ************************************/

    function loadLanguage(key, values) {
        languages[key] = values;
    }

    /************************************
     Floating-point helpers
     ************************************/

    // The floating-point helper functions and implementation
    // borrows heavily from sinful.js: http://guipn.github.io/sinful.js/

    /**
     * Array.prototype.reduce for browsers that don't support it
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Compatibility
     */
    if ('function' !== typeof Array.prototype.reduce) {
        Array.prototype.reduce = function (callback, opt_initialValue) {
            'use strict';

            if (null === this || 'undefined' === typeof this) {
                // At the moment all modern browsers, that support strict mode, have
                // native implementation of Array.prototype.reduce. For instance, IE8
                // does not support strict mode, so this check is actually useless.
                throw new TypeError('Array.prototype.reduce called on null or undefined');
            }

            if ('function' !== typeof callback) {
                throw new TypeError(callback + ' is not a function');
            }

            var index,
                value,
                length = this.length >>> 0,
                isValueSet = false;

            if (1 < arguments.length) {
                value = opt_initialValue;
                isValueSet = true;
            }

            for (index = 0; length > index; ++index) {
                if (this.hasOwnProperty(index)) {
                    if (isValueSet) {
                        value = callback(value, this[index], index, this);
                    } else {
                        value = this[index];
                        isValueSet = true;
                    }
                }
            }

            if (!isValueSet) {
                throw new TypeError('Reduce of empty array with no initial value');
            }

            return value;
        };
    }


    /**
     * Computes the multiplier necessary to make x >= 1,
     * effectively eliminating miscalculations caused by
     * finite precision.
     */
    function multiplier(x) {
        var parts = x.toString().split('.');
        if (parts.length < 2) {
            return 1;
        }
        return Math.pow(10, parts[1].length);
    }

    /**
     * Given a variable number of arguments, returns the maximum
     * multiplier that must be used to normalize an operation involving
     * all of them.
     */
    function correctionFactor() {
        var args = Array.prototype.slice.call(arguments);
        return args.reduce(function (prev, next) {
            var mp = multiplier(prev),
                mn = multiplier(next);
            return mp > mn ? mp : mn;
        }, -Infinity);
    }


    /************************************
     Numeral Prototype
     ************************************/


    numeral.fn = Numeral.prototype = {

        clone : function () {
            return numeral(this);
        },

        format : function (inputString, roundingFunction) {
            return formatNumeral(this,
                inputString ? inputString : defaultFormat,
                (roundingFunction !== undefined) ? roundingFunction : Math.round
            );
        },

        unformat : function (inputString) {
            if (Object.prototype.toString.call(inputString) === '[object Number]') {
                return inputString;
            }
            return unformatNumeral(this, inputString ? inputString : defaultFormat);
        },

        value : function () {
            return this._value;
        },

        valueOf : function () {
            return this._value;
        },

        set : function (value) {
            this._value = Number(value);
            return this;
        },

        add : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum + corrFactor * curr;
            }
            this._value = [this._value, value].reduce(cback, 0) / corrFactor;
            return this;
        },

        subtract : function (value) {
            var corrFactor = correctionFactor.call(null, this._value, value);
            function cback(accum, curr, currI, O) {
                return accum - corrFactor * curr;
            }
            this._value = [value].reduce(cback, this._value * corrFactor) / corrFactor;
            return this;
        },

        multiply : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) * (curr * corrFactor) /
                (corrFactor * corrFactor);
            }
            this._value = [this._value, value].reduce(cback, 1);
            return this;
        },

        divide : function (value) {
            function cback(accum, curr, currI, O) {
                var corrFactor = correctionFactor(accum, curr);
                return (accum * corrFactor) / (curr * corrFactor);
            }
            this._value = [this._value, value].reduce(cback);
            return this;
        },

        difference : function (value) {
            return Math.abs(numeral(this._value).subtract(value).value());
        }

    };

    /************************************
     Exposing Numeral
     ************************************/

    // CommonJS module is defined
    if (hasModule) {
        module.exports = numeral;
    }

    /*global ender:false */
    if (typeof ender === 'undefined') {
        // here, `this` means `window` in the browser, or `global` on the server
        // add `numeral` as a global object via a string identifier,
        // for Closure Compiler 'advanced' mode
        this['numeral'] = numeral;
    }

    /*global define:false */
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return numeral;
        });
    }
})(); // KR -- Had to change this line from the following:
// }).call(this);
// Otherwise the function wasn't being run
// TODO: Figure out why

},{}],30:[function(require,module,exports){
/** Used Only For Touch Devices **/
( function( window ) {
	
	// for touch devices: add class cs-hover to the figures when touching the items
	if( Modernizr.touch ) {

		// classie.js https://github.com/desandro/classie/blob/master/classie.js
		// class helper functions from bonzo https://github.com/ded/bonzo

		function classReg( className ) {
			return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
		}

		// classList support for class management
		// altho to be fair, the api sucks because it won't accept multiple classes at once
		var hasClass, addClass, removeClass;

		if ( 'classList' in document.documentElement ) {
			hasClass = function( elem, c ) {
				return elem.classList.contains( c );
			};
			addClass = function( elem, c ) {
				elem.classList.add( c );
			};
			removeClass = function( elem, c ) {
				elem.classList.remove( c );
			};
		}
		else {
			hasClass = function( elem, c ) {
				return classReg( c ).test( elem.className );
			};
			addClass = function( elem, c ) {
				if ( !hasClass( elem, c ) ) {
						elem.className = elem.className + ' ' + c;
				}
			};
			removeClass = function( elem, c ) {
				elem.className = elem.className.replace( classReg( c ), ' ' );
			};
		}

		function toggleClass( elem, c ) {
			var fn = hasClass( elem, c ) ? removeClass : addClass;
			fn( elem, c );
		}

		var classie = {
			// full names
			hasClass: hasClass,
			addClass: addClass,
			removeClass: removeClass,
			toggleClass: toggleClass,
			// short names
			has: hasClass,
			add: addClass,
			remove: removeClass,
			toggle: toggleClass
		};

		// transport
		if ( typeof define === 'function' && define.amd ) {
			// AMD
			define( classie );
		} else {
			// browser global
			window.classie = classie;
		}

		[].slice.call( document.querySelectorAll( 'ul.grid > li > figure' ) ).forEach( function( el, i ) {
			el.querySelector( 'figcaption > a' ).addEventListener( 'touchstart', function(e) {
				e.stopPropagation();
			}, false );
			el.addEventListener( 'touchstart', function(e) {
				classie.toggle( this, 'cs-hover' );
			}, false );
		} );

	}

})( window );
},{}]},{},[25])