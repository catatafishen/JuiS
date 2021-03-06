﻿(function (JuiS) {
    "use strict";
    JuiS.ElementMixin = function () {
        function createNode(tagName) {
            if (!(tagName instanceof Node)) {
                return document.createElement(tagName || "DIV");
            } else {
                return tagName;
            }
        }
        
        var staticPaintFunctions = {};
        
        this.getDefaultState = function () {
            return this.states[this.states.length -2];
        };
        
        this.getProperties = function () {
            return Object.keys(staticPaintFunctions).concat(Object.keys(this.paintFunctions));
        };
        
        this.getStates = function () {
            return this.states.map(function (state) {
                return state.getName();
            });
        };
        
        this.changeNodeElement = function (tagName) {
            var oldNode = this.node;
            this.node = createNode(tagName);
            
            var i;
            for (i = 0; i < oldNode.attributes.length; i++){
                console.log(oldNode.attributes[i].nodeName);
                this.node[oldNode.attributes[i].nodeName] = oldNode.attributes[i].nodeValue;
            }
            
            // this.states.forEach(function (state) {
                // state.deactivate();
            // });
            // staticState.activate();
            this.getDefaultState().activate();
        };

        this.createResponsiveState = function (name, minWidth, maxWidth) {
            if (window.matchMedia) {
                var state = this.createState(name);
                var query = window.matchMedia(
                    "(min-width: " + minWidth + "px) and (max-width: " + maxWidth + "px)");
                var handler = function() {
                    if (query.matches) {
                        state.activate();
                    } else {
                        state.deactivate();
                    }
                }
                query.addListener(handler);
                handler();
            } else {
                throw new Error("Could not create responsive states as matchMedia is not defined");
            }
        }
        
        
        this.initElement = function (tagName) {

            var thisElement = this;
            this.node = createNode(tagName);
            this.paintFunctions = {};
            this.states = [];
            staticState.setElement(this);
            this.states.push(staticState);
            var defaultState = this.createState("default");
            staticState.activate();
            defaultState.activate();
            this.createResponsiveState("xs", 0, 767);
            this.createResponsiveState("sm", 768, 991);
            this.createResponsiveState("md", 992, 1199);
            this.createResponsiveState("lg", 1200, 9999);
            
            //Events
            this.createDOMEventRelay("click");
            this.createDOMEventRelay("mousedown");
            this.createDOMEventRelay("mouseup");
            addMouseEnterEventListener(this.node, function() {
                thisElement.createEvent({"type": "mouseEnter"});
            });
            addMouseLeaveEventListener(this.node, function() {
                thisElement.createEvent({"type": "mouseLeave"});
            });
        };
        
        var State = function (stateName, thisElement, defaultValues) {
            var name = stateName;
            var thisState = this;
            var properties = {};
            var active = false;
            var staticAddList = [];
            var alreadyRefreshed = [];
            
            if (Object.observe) {
                Object.observe(properties, function(changes) {
                    //There is a problem where some values get an add-event and then an update event directly afterwards. The 
                    //update event will say that the old value was undefined even if the add event had already set a value.
                    //This might be a bug in the observer and causes some setters to be called twice (which should not make a difference)
                    changes.forEach(function (change) {
                        if (change.type === "update" || change.type === "delete") {
                            thisElement.refreshProperty(change.name);
                        }
                        else if (thisElement === undefined) {
                            //If element is not inited new properties are queued and refreshed later in the setElement-method
                            staticAddList.push(change.name);
                        } else {
                            if (properties[change.name] !== undefined && alreadyRefreshed.indexOf(change.name) === -1) {
                                thisElement.refreshProperty(change.name);
                            }
                        }
                    });
                });
            }
            
            this.setElement = function (element) {
                thisElement = element;
                if (thisElement[stateName] === undefined) {
                    thisElement[stateName] = properties;
                }
                
                if (!Object.observe) {
                    Object.keys(staticPaintFunctions).forEach(function(key) {
                        if (!thisState.hasProperty(key))
                            thisState.addProperty(key);
                    });
                    Object.keys(thisElement.paintFunctions).forEach(function(key) {
                        if (!thisState.hasProperty(key))
                            thisState.addProperty(key);
                    });
                } else {
                    var property;
                    while (property = staticAddList.pop()) {
                        thisElement.refreshProperty(property);
                    }
                }
            };
            
            this.addProperty = function (property, value) {
                if (!Object.observe) {
                    Object.defineProperty(properties, property, {
                        get: function () {
                            return value;
                        },
                        set: function (newValue) {
                            value = newValue;
                            if (thisState.isActive()) {
                                thisElement.refreshProperty(property);
                            }
                        },
                        enumerable: true
                    });
                    if (value !== undefined && thisElement !== undefined && thisState.isActive()) {
                        thisElement.refreshProperty(property);
                    }
                } else {
                    properties[property] = value;
                    if (thisElement && value) {
                        alreadyRefreshed.push(property);
                        thisElement.refreshProperty(property);
                    }
                }
            };
            
            this.setProperty = function (property, value) {
                if (!this.hasProperty(property) && !Object.observe) {
                    this.addProperty(property, value);
                }
                properties[property] = value;
            };
            
            this.getProperty = function (property) {
                return properties[property];
            };
            
            this.hasProperty = function (property) {
                return properties.hasOwnProperty(property);
            };
            
            this.hasValue = function (property) {
                return (this.hasProperty(property) && properties[property] !== undefined);
            }
            
            this.isActive = function () {
                return active;
            };
            
            this.activate = function () {
                active = true;
                Object.keys(properties).forEach(function (property) {
                    if (properties[property] !== undefined) {
                        thisElement.refreshProperty(property);
                    }
                });
            };
            
            this.deactivate = function () {
                active = false;
                Object.keys(properties).forEach(function (property) {
                    if (properties[property] !== undefined) {
                        thisElement.refreshProperty(property);
                    }
                });
            };
            
            this.getName = function () {
                return name;
            };
            
            if (thisElement) {
                this.setElement(thisElement);
            }
        };
        
        this.createState = function (stateName, defaultValues) {
            var state = new State(stateName, this, defaultValues);
            this.states.unshift(state);
            return state;
        };
        
        this.addProperty = function (propertyName, paintFunction, defaultValue) {
            var isStatic = true;
            if (this.paintFunctions) {
                isStatic = false;
                this.paintFunctions[propertyName] = paintFunction;
            } else {
                staticPaintFunctions[propertyName] = paintFunction;
            }
            Object.defineProperty(this, propertyName, {
                get: function () {
                    var stateValue;
                    this.states.some(function (state) {
                        var valueIsSet = false;
                        if (state.isActive() && state.hasValue(propertyName)) {
                            stateValue = state.getProperty(propertyName);
                            valueIsSet = true;
                        }
                        return valueIsSet;
                    });
                    return stateValue;
                },
                set: function (newValue) {
                    if (!this.states.some(function (state) {
                        var valueIsSet = false;
                        if (state.isActive() &&
                            state.hasValue(propertyName) &&
                            state.getName() !== "static"
                        ) {
                            state.setProperty(propertyName, newValue);
                            valueIsSet = true;
                        }
                        return valueIsSet;
                    })) {
                        this.getDefaultState().setProperty(propertyName, newValue);
                    }
                },
                enumerable: true
            });
            if (isStatic) {
                staticState.addProperty(propertyName, defaultValue);
            } else {
                this.getDefaultState().addProperty(propertyName, defaultValue);
            }
        };
        
        this.refreshProperty = function (property) {
            var thisElement = this;
            var value;
            var painted = false;
            this.states.every(function (state) {
                if (state.isActive() &&
                    ((Object.obesrver && state.hasProperty(property))
                    || state.hasValue(property))) {  
                    value = thisElement.paint(property, state.getProperty(property));
                    painted = true;
                    return false;
                }
                return true;
            });
            
            if (!Object.obesrver && !painted && this.states.length > 0) {
                value = thisElement.paint(property, staticState.getProperty(property));
            }
            
            if (this.enablePaintEvents) {
                this.createEvent("paint", {"property": property, "value": value});
            }
            return value;
        };
        
        this.paint = function (property, newValue) {
            var value;
            var paint = this.paintFunctions[property] || staticPaintFunctions[property];
            if (typeof paint === "function") {
                value = paint.call(this, newValue);
            } else if (paint === "nodeStyle") {
                this.node.style[property] = newValue !== undefined ? newValue : null;
                value = this.node.style[property];
            } else {
                paint[property] = newValue;
                value = paint[property];
            }
            return value;
        };
        
        this.changePaintFunction = function (name, paint) {
            var paintFunctions = this.paintFunctions || staticPaintFunctions;
            paintFunctions[name] = paint;
        };
        
        //Debug function
        this.getValueForEachState = function (property) {
            var values = {};
            this.states.forEach(function (state) {
                values[state.getName()] = state.getProperty(property);
            });
            return values;
        };
        
        this.callback = function(args) {
            var callback = args[0];
            var args = [].slice.call(args, 1);
            if (typeof callback === "function") {
                callback.apply(this, args);
            }
        };
        
        this.countHorisontalDisplacement = function() {
            if (this.width === undefined || this.width === "auto" || this.width.slice(-1) === "%") {
                return this.width;
            } else {
            return parseInt(this.width) +
                parseInt(this.marginLeft || 0) + 
                parseInt(this.marginRight || 0) + "px";
            }
        };

        this.createDOMEventRelay = function (DOMName, name) {
            var obj = {};
            var name = name || DOMName;
            obj.element = this;
            obj.data = {};
            obj.node = this.node;
            obj.preventDefault = false;
            obj.stopPropagation = true;
            obj.node.addEventListener(DOMName, function (event) {
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
            });
            return obj;
        };
        
        var staticState = new State("static");
        
        //Background
        this.addProperty("background", "nodeStyle");
        this.addProperty("backgroundColor", "nodeStyle");
        this.addProperty("backgroundImage", "nodeStyle");
        this.addProperty("backgroundPositionX", "nodeStyle");
        this.addProperty("backgroundPositionY", "nodeStyle");
        this.addProperty("backgroundRepeat", "nodeStyle");
        
        //Borders
        this.addProperty("borderLeftWidth", "nodeStyle");
        this.addProperty("borderTopWidth", "nodeStyle");
        this.addProperty("borderRightWidth", "nodeStyle");
        this.addProperty("borderBottomWidth", "nodeStyle");
        this.addProperty("borderWidth", function(value) {
            this.borderLeftWidth = value;
            this.borderTopWidth = value;
            this.borderRightWidth = value;
            this.borderBottomWidth = value;
        });
        
        this.addProperty("borderLeftStyle", "nodeStyle");
        this.addProperty("borderTopStyle", "nodeStyle");
        this.addProperty("borderRightStyle", "nodeStyle");
        this.addProperty("borderBottomStyle", "nodeStyle");
        this.addProperty("borderStyle", function(value) {
            this.borderLeftStyle = value;
            this.borderTopStyle = value;
            this.borderRightStyle = value;
            this.borderBottomStyle = value;
        });
        
        this.addProperty("borderLeftColor", "nodeStyle");
        this.addProperty("borderTopColor", "nodeStyle");
        this.addProperty("borderRightColor", "nodeStyle");
        this.addProperty("borderBottomColor", "nodeStyle");
        this.addProperty("borderColor", function(value) {
            this.borderLeftColor = value;
            this.borderTopColor = value;
            this.borderRightColor = value;
            this.borderBottomColor = value;
        });
        
        this.addProperty("borderTopLeftRadius", "nodeStyle");
        this.addProperty("borderTopRightRadius", "nodeStyle");
        this.addProperty("borderBottomLeftRadius", "nodeStyle");
        this.addProperty("borderBottomRightRadius", "nodeStyle");
        this.addProperty("borderRadius", function(value) {
            this.borderTopLeftRadius = value;
            this.borderTopRightRadius = value;
            this.borderBottomLeftRadius = value;
            this.borderBottomRightRadius = value;
        });

        //Margins
        this.addProperty("marginLeft", "nodeStyle");
        this.addProperty("marginTop", "nodeStyle");
        this.addProperty("marginRight", "nodeStyle");
        this.addProperty("marginBottom", "nodeStyle");
        this.addProperty("margin", function(value) {
            this.marginLeft = value;
            this.marginTop = value;
            this.marginRight = value;
            this.marginBottom = value;
        });
        
        //Other
        this.addProperty("opacity", "nodeStyle");
        this.addProperty("boxShadow", "nodeStyle");
        this.addProperty("overflowX", "nodeStyle");
        this.addProperty("overflowY", "nodeStyle");
        this.addProperty("overflow", function(value) {
            this.overflowX = value;
            this.overflowY = value;
        });
        this.addProperty("visibility", "nodeStyle");
        this.addProperty("display", "nodeStyle");
        this.addProperty("title", function (value) {
            this.node.title = value;
        });
        this.addProperty("zIndex", "nodeStyle");
        this.addProperty("cursor", "nodeStyle");
        this.addProperty("boxSizing", "nodeStyle", "border-box");
        this.addProperty("userSelect", function(value) {
            var nodeStyle = this.node.style;
            nodeStyle.WebkitUserSelect = value;
            nodeStyle.KhtmlUserSelect = value;
            nodeStyle.MozUserSelect = value;
            nodeStyle.MsUserSelect = value;
            nodeStyle.userSelect = value;
        });
                
        //Padding
        this.addProperty("paddingLeft", "nodeStyle");
        this.addProperty("paddingTop", "nodeStyle");
        this.addProperty("paddingRight", "nodeStyle");
        this.addProperty("paddingBottom", "nodeStyle");
        this.addProperty("padding", function(value) {
            this.paddingLeft = value;
            this.paddingTop = value;
            this.paddingRight = value;
            this.paddingBottom = value;
        });

        //Position
        this.addProperty("position", "nodeStyle");
        this.addProperty("left", "nodeStyle");
        this.addProperty("right", "nodeStyle");
        this.addProperty("top", "nodeStyle");
        this.addProperty("bottom", "nodeStyle");
        this.addProperty("float", function(value) {
            this.node.style.cssFloat = value;
        });

        //Size
        this.addProperty("height", "nodeStyle");
        this.addProperty("width", "nodeStyle");
        this.addProperty("minHeight", "nodeStyle");
        this.addProperty("minWidth", "nodeStyle");
        this.addProperty("maxHeight", "nodeStyle");
        this.addProperty("maxWidth", "nodeStyle");

        //Transforms
        this.addProperty("rotation", "nodeStyle");
        
    }.addMixin(ListenableMixin);
}(JuiS || (window.JuiS = {})));