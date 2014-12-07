var elementCounter = 0;
var GUI_ElementMixin = function () {
    "use strict";
    this.addState = function (stateName, properties, priority) {
        var thisElement = this;
        if (this.states === undefined) thisElement.states = [];
        if (this.paintFunctions === undefined) this.paintFunctions = {};
        var state = new function () {
            var name = stateName;
            var thisState = this;
            var properties = properties || {};
            if (thisElement[stateName] === undefined) {
                thisElement[stateName] = properties;
            }
            var active = false;
            this.hasProperty = function (property) {
                return (properties[property] !== undefined);
            };
            this.addProperty = function (property, value) {
                Object.defineProperty(properties, property, {
                    get: function () {
                        return value;
                    },
                    set: function (newValue) {
                        value = newValue;
                        thisState.refresh(property);
                    },
                    enumerable: true
                });
                this.refresh(property);
            };
            this.setProperty = function (property, value) {
                if (this.hasProperty(property)) {
                    properties[property] = value;
                }
            };
            this.getProperty = function (property) {
                return properties[property];
            };
            this.isActive = function () {
                return active;
            };
                        
            this.refresh = function (property) {
                var value;
                thisElement.states.every(function (state) {
                    if (state.isActive() && state.hasProperty(property)) {
                        var paint = thisElement.paintFunctions[property];
                        if (typeof paint === "function") {
                            value = paint.call(this, state.getProperty(property));
                        } else {
                            paint[property] = state.getProperty(property);
                            value = paint[property];
                        }
                        return false;
                    }
                    return true;
                });
                return value;
            };
            
            this.activate = function () {
                active = true;
                Object.keys(properties).forEach(function (property) {
                    thisState.refresh(property);
                });
            };
            this.deactivate = function () {
                active = false;
                Object.keys(properties).forEach(function (property) {
                    thisState.refresh(property);
                });
            };
            this.getName = function () {
                return name;
            };
        }();
        if (priority) {
            thisElement.states.splice(priority - 1, 0, state);
        } else {
            thisElement.states.unshift(state);
        }
        
        return state;
    };
    
    this.setProperty = function (property, value, stateName) {
        var thisElement = this;
        stateName = stateName || "default";
        thisElement.states.forEach(function (state) {
            if (state.getName() === stateName) {
                if (state.hasProperty(property)) {
                    state.setProperty(property, value);
                } else {
                    state.addProperty(property, value);
                }
            }
        });
    };
    this.addProperty = function (name, paint, defaultValue, allStates) {
        var thisElement = this;
        this.paintFunctions[name] = paint;
        Object.defineProperty(this, name, {
            get: function () {
                var stateValue;
                thisElement.states.some(function (state) {
                    var valueIsSet = false;
                    if (state.isActive() && state.hasProperty(name)) {
                        stateValue = state.getProperty(name);
                        valueIsSet = true;
                    }
                    return valueIsSet;
                });
                return stateValue;
            },
            set: function (newValue) {
                thisElement.states.some(function (state) {
                    var valueIsSet = false;
                    if (state.isActive()) {
                        if (state.getProperty(name) !== undefined) {
                            state.setProperty(name, newValue)
                            valueIsSet = true;
                        }
                    }
                    return valueIsSet;
                });
            },
            enumerable: true
        });
        if (allStates) {
            thisElement.states.forEach(function (state) {
                thisElement.setProperty(name, defaultValue, state.getName());
            });
        } else {
            this.setProperty(name, defaultValue, "default");
        }
    };
    this.getActiveStateNames = function () {
        var activeStateNames = [];
        this.states.forEach(function (state) {
            if (state.isActive()) {
                activeStateNames.push(state.getName());
            }
        });
        return activeStateNames;
    }
    
    
    //Position
	this.position = "static";
	this.left = "0px";
	this.top = "0px";
	this.bottom = "auto";
	this.right = "auto";
    this["float"] = "none";

	//Size
	this.height = "auto";
	this.width = "auto";

	//Borders
	this.borderLeftWidth = "0px";
	this.borderTopWidth = "0px";
	this.borderRightWidth = "0px";
	this.borderBottomWidth = "0px";
	this.borderLeftStyle = "solid";
	this.borderTopStyle = "solid";
	this.borderRightStyle = "solid";
	this.borderBottomStyle = "solid";
	this.borderLeftColor = "black";
	this.borderTopColor = "black";
	this.borderRightColor = "black";
	this.borderBottomColor = "black";
	this.borderTopLeftRadius = "0px";
	this.borderTopRightRadius = "0px";
	this.borderBottomLeftRadius = "0px";
	this.borderBottomRightRadius = "0px";

	//Padding
	this.paddingLeft = "0px";
	this.paddingTop = "0px";
	this.paddingRight = "0px";
	this.paddingBottom = "0px";

	//Margins
	this.marginLeft = "0px";
	this.marginTop = "0px";
	this.marginRight = "0px";
	this.marginBottom = "0px";

	//Background
	// this.background = "";
	// this.backgroundImage = "";
	// this.backgroundPositionX = "center";
	// this.backgroundPositionY = "center";
	// this.backgroundRepeat = "no-repeat";
	// this.backgroundColor = "transparent";


    //Transforms
    this.rotation = 0;
    
	//Other
	this.opacity = "1.0";
	this.overflowX = "auto";
	this.overflowY = "auto";
	this.visibility = "visible";
	this.display = "block";
	this.userSelect = "text";
	this.title = "";
	this.zIndex = "0";
	this.cursor = "default";

	this.getBorderController = function () {
        var thisElement = this;
        return {
            "setWidth": function (width) {
                thisElement.borderLeftWidth = width;
                thisElement.borderTopWidth = width;
                thisElement.borderRightWidth = width;
                thisElement.borderBottomWidth = width;
            },
            "setStyle": function (style) {
                thisElement.borderLeftStyle = style;
                thisElement.borderTopStyle = style;
                thisElement.borderLightStyle = style;
                thisElement.borderBottomStyle = style;
            },
            "setColor": function (color) {
                thisElement.borderLeftColor = color;
                thisElement.borderTopColor = color;
                thisElement.borderRightColor = color;
                thisElement.borderBottomColor = color;
            },
            "setCornerRadius": function (radius) {
                thisElement.borderTopLeftRadius = radius;
                thisElement.borderTopRightRadius = radius;
                thisElement.borderBottomLeftRadius = radius;
                thisElement.borderBottomRightRadius = radius;
            },
            "getString": function (side) {
                switch (side) {
                case "left":
                    return thisElement.borderLeftWidth + " " +
                        thisElement.borderLeftStyle + " " +
                        thisElement.borderLeftColor;
                case "top":
                    return thisElement.borderTopWidth + " " +
                        thisElement.borderTopStyle + " " +
                        thisElement.borderTopColor;
                case "right":
                    return thisElement.borderRightWidth + " " +
                        thisElement.borderRightStyle + " " +
                        thisElement.borderRightColor;
                case "bottom":
                    return thisElement.borderBottomWidth + " " +
                        thisElement.borderBottomStyle + " " +
                        thisElement.borderBottomColor;
                default:
                    throw new Error("Unknown side: " + side + ".");
                }
            }
        };
	};

    // var cssClasses = {};
    // var styledElements = {};
    // this.addStyledElement = function(element, elementCssClassName) {
        // if (!elementCssClassName) {
            // elementCounter += 1;
            // var elementCssClassName = "element" + elementCounter;
        // }
        // var styleElement = document.createElement("style");
        // var cssText = "";
        // var cssTextHover = "";
        // document.getElementsByTagName("head")[0].appendChild(styleElement);
        // element.className = elementCssClassName;
        // cssClasses[elementCssClassName] = styleElement;
        // styledElements[elementCssClassName] = element;
        // return elementCssClassName;
    // };
 
    this.createDOMEventRelay = function (DOMName, name, data, node) {
        var thisContainer = this;
        node = node || this.node;
        data = data || {};
        node[DOMName] = function (event) {
            //Only fire once per event. => ignore propagating events that have already fired
            if (event.Henkka_inited === undefined) { //Not a good solution. Change this!
                data.DOMEvent = event;
                thisContainer.createEvent({"type": name, "data": data});
                event.Henkka_inited = true;
            }
        };
    };
    var resizeSensor;
    var senseResize;
    
    this.initElement = function (tagName) {
        tagName = tagName || "DIV";
        var thisElement = this;
        this.node = document.createElement(tagName);
        
        var nodeStyle = thisElement.node.style;
        var defaultState = this.addState("default");
        defaultState.activate();
        this.addProperty("backgroundColor", nodeStyle, "transparent");
        this.addProperty("backgroundImage", nodeStyle, "");
        this.addProperty("backgroundPositionX", nodeStyle, "center");
        this.addProperty("backgroundPositionY", nodeStyle, "center");
        this.addProperty("backgroundRepeat", nodeStyle, "no-repeat");
        this.addProperty("background", function (value) {
            if (value !== "") {
                nodeStyle.background = value;
            }
        }, "");
        
        // this.addStyledElement(this.node);
        this.createDOMEventRelay("onclick", "click");
        this.createDOMEventRelay("onmousedown", "mouseDown");
        this.createDOMEventRelay("onmouseup", "mouseUp");
        addMouseEnterEventListener(thisElement.node, function() {
            thisElement.createEvent({"type": "mouseEnter"});
        });
        addMouseLeaveEventListener(thisElement.node, function() {
            thisElement.createEvent({"type": "mouseLeave"});
        });
        
        
        this.addListener("listenerAdded", function (event) {
            //If this has listeners for resize then create resize sensor and emitter
            // if (event.data.listener) {
                // alert(event.data.listener.listensTo);
            // }
            if (event.data.listener && event.data.listener.listensTo === "resize") {
                //IE has native onresize. Other browsers use fallback
                if ("onresize" in this.node) {
                    this.node.onresize = function () {
                        thisElement.createEvent(
                            "resize", {
                                "width": thisElement.node.offsetWidth,
                                "height": thisElement.node.offsetHeight
                            }
                        );
                    };
                } else {
                //Fallback: Create wrapping divs and check if their overflow-properties change
                    resizeSensor = document.createElement('div');
                    resizeSensor.style.position = "relative";
                    resizeSensor.style.left = "0px";
                    resizeSensor.style.top = "0px";
                    resizeSensor.style.right = "0px";
                    resizeSensor.style.bottom = "0px";
                    resizeSensor.style.overflow = "hidden";
                    resizeSensor.style.zIndex = "-1";
                    var resizeSensorOverflow = document.createElement('div');
                    resizeSensorOverflow.style.position = "absolute";
                    resizeSensorOverflow.style.left = "0px";
                    resizeSensorOverflow.style.top = "0px";
                    resizeSensorOverflow.style.right = "0px";
                    resizeSensorOverflow.style.bottom = "0px";
                    resizeSensorOverflow.style.overflow = "hidden";
                    resizeSensorOverflow.style.zIndex = "-1";
                    resizeSensorOverflow.appendChild(document.createElement("DIV"));
                    resizeSensor.appendChild(resizeSensorOverflow);
                    var resizeSensorUnderFlow = document.createElement('div');
                    resizeSensorUnderFlow.style.position = "absolute";
                    resizeSensorUnderFlow.style.left = "0px";
                    resizeSensorUnderFlow.style.top = "0px";
                    resizeSensorUnderFlow.style.right = "0px";
                    resizeSensorUnderFlow.style.bottom = "0px";
                    resizeSensorUnderFlow.style.overflow = "hidden";
                    // resizeSensorUnderFlow.style.backgroundColor = "red";
                    resizeSensorUnderFlow.style.zIndex = "-1";
                    resizeSensorUnderFlow.appendChild(document.createElement("DIV"));
                    resizeSensor.appendChild(resizeSensorUnderFlow);
                    
                    var oldWidth = -1;
                    var oldHeight = -1;
                    senseResize = function() {
                        var change = false;
                        var width = resizeSensor.offsetWidth;
                        var height = resizeSensor.offsetHeight;

                        if (oldWidth != width) {
                            resizeSensorOverflow.firstChild.style.width =
                                (width ? (width - 1) : 1) + "px";
                            resizeSensorUnderFlow.firstChild.style.width =
                                (width ? (width + 1) : 1) + "px";
                            change = true;
                            oldWidth = width;
                        }
                        if (oldHeight != height) {
                            //there is still some problem where height is 0
                            if (height == 0) {
                                height = 10;
                            }
                            resizeSensorOverflow.firstChild.style.height = height  + "px";
                            resizeSensorUnderFlow.firstChild.style.height = height + "px";
                            change = true;
                            oldHeight = height;
                        }
                        if (change) {
                            thisElement.createEvent("resize",
                                {"width": oldWidth, "height": oldHeight});
                        }
                    };
                    senseResize();
                    this.node.appendChild(resizeSensor);
                    
                    var addResizeListener = function (element, callback) {
                        if (window.OverflowEvent) {
                            //webkit
                            element.addEventListener('overflowchanged', function(e) {
                                callback.call(this, e);
                            });
                        } else {
                            element.addEventListener('overflow', function(e) {
                                callback.call(this, e);
                            });
                            element.addEventListener('underflow', function(e) {
                                callback.call(this, e);
                            });
                        }
                    };
                    addResizeListener(resizeSensor, senseResize);
                    addResizeListener(resizeSensorOverflow, senseResize);
                    addResizeListener(resizeSensorUnderFlow, senseResize);
                }
            }
        });
        
        
        
    };

	this.paint = function (newProperties, transition) {
        var node = this.node;
		if (newProperties) {
			var i;
			for (i in newProperties) {
				if (newProperties.hasOwnProperty(i)) {
					if (this[i] !== "undefined" && (typeof this[i] === typeof newProperties[i])) {
						this[i] = newProperties[i];
					}
				}
			}
		}

    //Transition on
        if (!transition) {
            transition = 0;
        }
        node.style.transition = "all " + transition + "ms ease 0ms"
        
   //Position
		node.style.position = this.position;
        if (resizeSensor) {
            resizeSensor.style.position = this.position === "absolute" ? "absolute" : "relative";
        }
        if (senseResize) {
            senseResize();
        }
		node.style.left = this.left;
		node.style.top = this.top;
		node.style.bottom = this.bottom;
		node.style.right = this.right;
        node.style.cssFloat = this["float"];

	//Size
		node.style.height = this.height;
		node.style.width = this.width;

	//Borders
        var borderController = this.getBorderController();
		node.style.borderLeft = borderController.getString("left");
		node.style.borderTop = borderController.getString("top");
		node.style.borderRight = borderController.getString("right");
		node.style.borderBottom = borderController.getString("bottom");
		node.style.borderTopLeftRadius = this.borderTopLeftRadius;
		node.style.borderTopRightRadius = this.borderTopRightRadius;
		node.style.borderBottomLeftRadius = this.borderBottomLeftRadius;
		node.style.borderBottomRightRadius = this.borderBottomRightRadius;

	//Padding
		node.style.paddingLeft = this.paddingLeft;
		node.style.paddingTop = this.paddingTop;
		node.style.paddingRight = this.paddingRight;
		node.style.paddingBottom = this.paddingBottom;

	//Margins
		node.style.marginLeft = this.marginLeft;
		node.style.marginTop = this.marginTop;
		node.style.marginRight = this.marginRight;

	//Background
		// node.style.backgroundImage = this.backgroundImage;
		// node.style.backgroundPositionX = this.backgroundPositionX;
		// node.style.backgroundPositionY = this.backgroundPositionY;
		// node.style.backgroundRepeat = this.backgroundRepeat;
		// // node.style.backgroundColor = this.backgroundColor;
        // if (this.background) {
            // node.style.background = this.background;
        // }

   //Transforms
        // node.style.transform = "rotate(" + this.rotation + "deg)";
        node.style.transform = this.rotation ? "rotate(" + this.rotation + "deg)" : "";
        node.style.MsTransform = this.rotation ? "rotate(" + this.rotation + "deg)" : "";
        node.style.WebkitTransform = this.rotation ? "rotate(" + this.rotation + "deg)" : "";
        
	//Other
		node.style.opacity = this.opacity;
		node.style.overflowX = this.overflowX;
		node.style.overflowY = this.overflowY;
		node.style.visibility = this.visibility;
		node.style.display = this.display;
		node.style.userSelect = this.userSelect;
		node.title = this.title;
		node.style.zIndex = this.zIndex;
		node.style.cursor = this.cursor;
        
    //Transition off
        setTimeout(function (){
            node.style.transition = "all 0ms ease 0ms"
        }, transition);
        
        // var styledElementsIterator = new Iterator(styledElements);
        // styledElementsIterator.iterate(function (element, cssClassName) {
            // var styleElement = cssClasses[cssClassName];
            // var cssText = node.style.cssText;
            // var css = "." + cssClassName + "{" + cssText + "}";
            // if (styleElement.styleSheet) {
                // styleElement.styleSheet.cssText = css;
            // }
            // else {
                // styleElement.appendChild(document.createTextNode(css));
            // }
            // element.style.cssText = "";
        // });
        //Change the css-class associated with this element
        // if (hover) {
            // cssTextHover = this.node.style.cssText;
        // } else {
            // cssText = this.node.style.cssText;
        // }
        // var css = "." + nodeCssClassName + ":hover{" + cssTextHover + "}\n" + 
            // "." + nodeCssClassName + "{" + cssText + "}";
        // if (styleElement.styleSheet) {
            // styleElement.styleSheet.cssText = css;
        // }
        // else {
            // styleElement.appendChild(document.createTextNode(css));
        // }
        // this.node.style.cssText = "";
        
	};
};
GUI_ElementMixin.addMixin(ListenableMixin);