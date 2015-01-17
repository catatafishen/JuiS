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
    
    this.initElement = function (tagName) {
        var thisElement = this;
        this.node = createNode(tagName);
        this.paintFunctions = {};
        staticState.setElement(this);
        this.states = [staticState];
        var defaultState = this.createState("default");
        staticState.activate();
        defaultState.activate();
        
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
    };
    
    var State = function (stateName, thisElement, defaultValues) {
        var name = stateName;
        var thisState = this;
        var properties = {};
        var active = false;
        
        if (Object.observe) {
            Object.observe(properties, function(changes) {
                changes.forEach(function (change) {
                    thisElement.refreshProperty(change.name);
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
                properties[property] === value;
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
        if (this.paintFunctions) {
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
                    this.states[this.states.length - 2].setProperty(propertyName, newValue);
                }
            },
            enumerable: true
        });
        staticState.addProperty(propertyName, defaultValue);
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
            parseInt(this.paddingLeft || 0) + 
            parseInt(this.paddingRight || 0) + 
            parseInt(this.borderLeftWidth || 0) + 
            parseInt(this.borderRightWidth || 0) + 
            parseInt(this.marginLeft || 0) + 
            parseInt(this.marginRight || 0) + "px";
        }
    };

    this.createDOMEventRelay = function (DOMName, name) {
        var obj = {};
        obj.element = this;
        obj.data = {};
        obj.node = this.node;
        obj.preventDefault = false;
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

    //Transforms
    this.addProperty("rotation", "nodeStyle");
    
}.addMixin(ListenableMixin);;