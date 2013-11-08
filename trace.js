/**
 *  traceJS
 *  @deps       []
 *  @author     BennyZhao
 *  @email      bennyzhaorice@gmail.com
 */
;(function(definition) {
    if (typeof define == "function") {
        define(definition)
    } else if (typeof YUI == "function") {
        YUI.add("es5", definition)
    } else {
        definition(Function('return this')())
    }
})(function(context) {

    /**
     *  Array.prototype:  forEach | slice(shim) |
     *  Object:           keys
     */
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEach(callback, thisArg) {
            'use strict';
            var T, k;
            if (this == null) {
                throw new TypeError("this is null or not defined");
            }
            var kValue,
            O = Object(this),
            len = O.length >>> 0; // Hack to convert O.length to a UInt32
            if ({}.toString.call(callback) !== "[object Function]") {
                throw new TypeError(callback + " is not a function");
            }
            if (arguments.length >= 2) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                if (k in O) {
                    kValue = O[k];
                    callback.call(T, kValue, k, O);
                }
                k++;
            }
        };
    }
    (function() {
        'use strict';
        var _slice = Array.prototype.slice;
        try {
            _slice.call(document.documentElement);
        } catch(e) { // Fails in IE < 9
            Array.prototype.slice = function(begin, end) {
                var i, arrl = this.length,
                a = [];
                if (this.charAt) { 
                    for (i = 0; i < arrl; i++) { a.push(this.charAt(i)); }
                } else { 
                    for (i = 0; i < this.length; i++) { a.push(this[i]); }
                }
                return _slice.call(a, begin, end || a.length); 
            };
        }
    } ());

    /*
     *  some underscore utils and fix
     *  http://github.com/documentcloud/underscore/
     */
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        b = {};

    b.slice = function(context){
        var args = slice.call(arguments,1);
        return slice.apply(context,args);
    }
    // obj是否本身拥有key属性（不追溯原型）
    b.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    // obj是否是Window对象
    b.isWindow = function(obj) {
        return obj != null && obj === obj.window;
    };
    // obj是否是dom元素
    b.isElement = b.isEle = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };
    // obj是否是一个Object
    b.isObject = function(obj) {
        return obj === Object(obj);
    };
    // obj是否是{key:value}形式的Object
    b.isPlainObject = function(obj) {
        if (!b.isObject(obj) || b.isElement(obj) || b.isWindow(obj))  return false;
        try {
            if (obj.constructor && !has(obj, "constructor") && !has(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }
        return true;
    };
    // obj是否是 参数 数组 函数 字符串 数字 日期 正则
    ['Arguments', 'Array', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
        b['is' + name] = function(obj) {
            return {}.toString.call(obj) == '[object ' + name + ']';
        };
    });
    // obj是否是null
    b.isNull = function(obj) {
        return obj === null;
    };
    // obj是否是undefined
    b.isUndefined = function(obj) {
        return obj === void 0;
    };

    var has           = b.has,
        isWindow      = b.isWindow,
        isElement     = b.isElement,
        isObject      = b.isObject,
        isPlainObject = b.isPlainObject,
        isArray       = b.isArray,
        isFunction    = b.isFunction,
        isString      = b.isString,
        isNumber      = b.isNumber,
        isNull        = b.isNull,
        isUndefined   = b.isUndefined;


    /**
     *  打印对象详细内容
     *  @param temp
     *  @returns {string}
     */
    b.printObj = function(temp) {
        var start = '',
            end = '';
        // object
        if (isArray(temp)) {
            start = 'Array:[';
            end = ']';
        } else if (isFunction(temp)) {
            start = 'Function :';
        } else if (isElement(temp)) {
            start = 'HTML'+temp.nodeName+'Element :';
            if(temp.outerHTML['replace']){
                temp = temp.outerHTML.replace(temp.innerHTML,'...')
            }
            
        } else if (isString(temp)) {
            start = 'String :"';
            end = '"';
        } else if (isPlainObject(temp)) {
            /* 打印obj对象具体属性 */
            start = 'Object:{';
            end = '}';
            var out = [];
            for (var p in temp) {
                if (temp['hasOwnProperty']) {
                    if (temp.hasOwnProperty(p)) {
                        out.push(p + ':' + temp[p]);
                    }
                } else {
                    out.push(p + ':' + temp[p]);
                }
            }
            temp = out.join(',');
        } else if (isNull(temp)) {
            temp = 'null';
        } else if (isUndefined(temp)) {
            temp = 'undefined';
        }
        return start + temp + end;
    }

    // console.log() fix
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
    
    // trace
    var trace = function trace( /*,args*/ ) {
        if (typeof console == "undefined") return;
        var arg = Array.prototype.splice.call(arguments, 0, arguments.length);
        // IE fix
        if (!console.log['apply']) {
            var params = [];
            for (var x = 0; x < arg.length; x++) {
                var temp = arg[x];
                params.push(b.printObj(temp));
            }
            params = params.length > 0 ? " " + params.join("，") + " " : "";
            console.log(params)
        // 其他浏览器
        } else {
            //arg.unshift('trace: ');
            var params = [];
            for (var x = 0; x < arg.length; x++) {
                var temp = arg[x];
                params.push(b.printObj(temp));
            }
            params = params.length > 0 ? " " + params.join("，") + " " : "";
            //console.log(params)
            console.log.apply(console, [params]);
        }
    };
    if(!context['trace']) window.trace = trace;
    context.b=b;
    return b;
});