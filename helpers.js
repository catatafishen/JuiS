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
                mixins.forEach(function (mixin) {
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

if (!Object.assign) {
  Object.defineProperty(Object, "assign", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      "use strict";
      if (target === undefined || target === null)
        throw new TypeError("Cannot convert first argument to object");
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
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

if (!JuiS) {
    var JuiS = {};
}
JuiS.linearGradient = function() {
    var args = Array.prototype.join.call(arguments, ",");
    return "linear-gradient("+args+")";
}
JuiS.shadow = function(hShadow, vShadow, blur, spread, color, inset) {
    if (color  === undefined) {
        color = "";
    }
    if (inset === undefined) {
        inset = "";
    }
    return hShadow + " " +  vShadow + " " + blur + " " + spread + " " + color + " " + inset;
};
JuiS.rgba = function(red, green, blue, opacity) {
    return "rgba(" +  red + ", " + green + ", " + blue + ", " + opacity + ")";
};
JuiS.isArray = function(someVar) {
    return (Object.prototype.toString.call(someVar) === "[object Array]")
}