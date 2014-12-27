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
    
    this.changePaintFunction = function (name, paint, defaultValue) {
        this.paintFunctions[name] = paint;
        this.setProperty(name, defaultValue, "default");
    }
    
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
    };
    
    this.getValueForEachState = function (property) {
        var values = {};
        this.states.forEach(function (state) {
            values[state.getName()] = state.getProperty(property);
        });
        return values;
    };

    this.createDOMEventRelay = function (DOMName, name) {
        var obj = {};
        obj.element = this;
        obj.data = {};
        obj.node = this.node;
        obj.preventDefault = true;
        obj.stopPropagation = true;
        obj.node[DOMName] = function (event) {
            //Only fire once per event. => ignore propagating events that have already fired
            if (event.Henkka_inited === undefined) { //Not a good solution. Change this!
                obj.data.DOMEvent = event;
                obj.element.createEvent({"type": name, "data": obj.data});
                event.Henkka_inited = true;
                if (obj.stopPropagation) {
                    event.stopPropagation();
                }
                if (obj.preventDefault !== false) {
                    event.preventDefault();
                    return false;
                }
            }
        };
        return obj;
    };
    
    var resizeSensor;
    var senseResize;
    this.initElement = function (tagName) {
        tagName = tagName || "DIV";
        var thisElement = this;
        this.node = document.createElement(tagName);
        var nodeStyle = this.node.style;
        
        var defaultState = this.addState("default");
        defaultState.activate();
        
        //Background
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
        
        //Borders
        this.addProperty("borderLeftWidth", nodeStyle, "0px");
        this.addProperty("borderTopWidth", nodeStyle, "0px");
        this.addProperty("borderRightWidth", nodeStyle, "0px");
        this.addProperty("borderBottomWidth", nodeStyle, "0px");
        this.addProperty("borderWidth", function(value) {
            thisElement.borderLeftWidth = value;
            thisElement.borderTopWidth = value;
            thisElement.borderRightWidth = value;
            thisElement.borderBottomWidth = value;
        }, "0px");
        
        this.addProperty("borderLeftStyle", nodeStyle, "solid");
        this.addProperty("borderTopStyle", nodeStyle, "solid");
        this.addProperty("borderRightStyle", nodeStyle, "solid");
        this.addProperty("borderBottomStyle", nodeStyle, "solid");
        this.addProperty("borderStyle", function(value) {
            thisElement.borderLeftStyle = value;
            thisElement.borderTopStyle = value;
            thisElement.borderRightStyle = value;
            thisElement.borderBottomStyle = value;
        }, "solid");
        
        this.addProperty("borderLeftColor", nodeStyle, "black");
        this.addProperty("borderTopColor", nodeStyle, "black");
        this.addProperty("borderRightColor", nodeStyle, "black");
        this.addProperty("borderBottomColor", nodeStyle, "black");
        this.addProperty("borderColor", function(value) {
            thisElement.borderLeftColor = value;
            thisElement.borderTopColor = value;
            thisElement.borderRightColor = value;
            thisElement.borderBottomColor = value;
        }, "black");
        
        this.addProperty("borderTopLeftRadius", nodeStyle, "0px");
        this.addProperty("borderTopRightRadius", nodeStyle, "0px");
        this.addProperty("borderBottomLeftRadius", nodeStyle, "0px");
        this.addProperty("borderBottomRightRadius", nodeStyle, "0px");
        this.addProperty("borderRadius", function(value) {
            thisElement.borderTopLeftRadius = value;
            thisElement.borderTopRightRadius = value;
            thisElement.borderBottomLeftRadius = value;
            thisElement.borderBottomRightRadius = value;
        }, "0px");

        //Margins
        this.addProperty("marginLeft", nodeStyle, "0px");
        this.addProperty("marginTop", nodeStyle, "0px");
        this.addProperty("marginRight", nodeStyle, "0px");
        this.addProperty("marginBottom", nodeStyle, "0px");
        this.addProperty("margin", function(value) {
            thisElement.marginLeft = value;
            thisElement.marginTop = value;
            thisElement.marginRight = value;
            thisElement.marginBottom = value;
        }, "0px");
        
        //Other
        this.addProperty("opacity", nodeStyle, "1.0");
        this.addProperty("boxShadow", nodeStyle, "none");
        this.addProperty("overflowX", nodeStyle, "auto");
        this.addProperty("overflowY", nodeStyle, "auto");
        this.addProperty("overflow", function(value) {
            thisElement.overflowX = value;
            thisElement.overflowY = value;
        }, "auto");
        this.addProperty("visibility", nodeStyle, "visible");
        this.addProperty("display", nodeStyle, "block");
        this.addProperty("userSelect", nodeStyle, "text");
        this.addProperty("title", nodeStyle, "");
        this.addProperty("zIndex", nodeStyle, "0");
        this.addProperty("cursor", nodeStyle, "default");
                
        //Padding
        this.addProperty("paddingLeft", nodeStyle, "0px");
        this.addProperty("paddingTop", nodeStyle, "0px");
        this.addProperty("paddingRight", nodeStyle, "0px");
        this.addProperty("paddingBottom", nodeStyle, "0px");
        this.addProperty("padding", function(value) {
            thisElement.paddingLeft = value;
            thisElement.paddingTop = value;
            thisElement.paddingRight = value;
            thisElement.paddingBottom = value;
        }, "0px");
    
        //Position
        this.addProperty("position", nodeStyle, "static");
        this.addProperty("left", nodeStyle, "auto");
        this.addProperty("right", nodeStyle, "auto");
        this.addProperty("top", nodeStyle, "auto");
        this.addProperty("bottom", nodeStyle, "auto");
        this.addProperty("float", nodeStyle, "none");

        //Size
        this.addProperty("height", nodeStyle, "auto");
        this.addProperty("width", nodeStyle, "auto");

        //Transforms
        this.addProperty("rotation", nodeStyle, "0");
        
        //Events
        this.createDOMEventRelay("onclick", "click");
        this.createDOMEventRelay("onmousedown", "mouseDown");
        this.createDOMEventRelay("onmouseup", "mouseUp");
        addMouseEnterEventListener(this.node, function() {
            thisElement.createEvent({"type": "mouseEnter"});
        });
        addMouseLeaveEventListener(this.node, function() {
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
 
	};
}.addMixin(ListenableMixin);