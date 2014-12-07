"use strict";
var Iterator = function (iterable) {
	function isArray(something) {
		return (Object.prototype.toString.call(something) === '[object Array]');
	}
	var key;
	this.type = typeof iterable;
	this.iterate = function (callback) {
		callback(iterable);
	};
	this.getCurrentKey = function () {
		return key;
	};
	if (isArray(iterable)) {
		this.type = "Array";
		this.iterate = function (callback) {
			for (key = 0; key < iterable.length; key += 1) {
				if (callback(iterable[key], key) === false) {
					return false;
				}
			}
			return true;
		};
	} else if (iterable !== null && typeof iterable === "object") {
		this.type = "Object";
		this.iterate = function (callback) {
			for (key in iterable) {
				if (iterable.hasOwnProperty(key)) {
					if (callback(iterable[key], key) === false) {
						return false;
					}
				}
			}
			return true;
		};
	}
};

Array.prototype.remove = function () {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

if (!Object.keys) {
    Object.prototype.keys = function () {
        var keys = [];
        var k;
        for (k in this) {
            if (this.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };
}

if (typeof Object.prototype.addMixin !== "function") {
    Object.defineProperty(Object.prototype, "addMixin", {
        "value": function addMixin(mixin) {
            var args = [].slice.call(arguments, 1); //Any arguments (other than mixin) are
                                                    //converted to an array
            var mixed = this;
            function recursivelyMixin(mixins) {
                var mixinIterator = new Iterator(mixins);
                mixinIterator.iterate(function (mixin) {
                    if (mixin.mixins !== undefined) {
                        recursivelyMixin(mixin.mixins);
                    }
                    if (mixed.prototype) {
                        mixin.apply(mixed.prototype, args);
                    } else {
                        mixin.apply(mixed, args);
                    }
                });
            }
            recursivelyMixin([mixin]);
            if (this.mixins === undefined) {
                this.mixins = [];
            }
            this.mixins.push(mixin);
            return this;
        },
        "configurable": true,
        "writable": true
    });
}

var miniStyleClasses = {};
var miniStyleClassesCounter = 0;
this.createMiniStyleClass = function (element, pseudoClass) {
    var styleElement;
    var miniStyleClassName = element.className || "miniStyleClass" + miniStyleClassesCounter++;
    var pseudoClassText;
    pseudoClass = pseudoClass || "default";
    if (pseudoClass === "default") {
        pseudoClassText = "";
    } else {
        pseudoClassText = ":" + pseudoClass;
    }
    var cssText = "." + miniStyleClassName + pseudoClassText + "{" + element.style.cssText + "}";
    if (!miniStyleClasses[miniStyleClassName]) {
        miniStyleClasses[miniStyleClassName] = {};
    }
    if (!miniStyleClasses[miniStyleClassName][pseudoClass]) {
        styleElement = document.createElement("style");
        miniStyleClasses[miniStyleClassName][pseudoClass] = styleElement;
        document.getElementsByTagName("head")[0].appendChild(styleElement);
    } else {
        styleElement = miniStyleClasses[miniStyleClassName][pseudoClass];
    }
    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = cssText;
    } else {
        styleElement.appendChild(document.createTextNode(cssText));
    }
    element.className = miniStyleClassName;
    return miniStyleClassName;
};


