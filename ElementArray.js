JuiS.ElementArray = function (componentContructor) {
    "use strict";
    var elements = [];
    var properties = [];
    var states = ["default"];
    var thatElementArray = this;
    var setProperties = {};
    this.default = this;
    
    this.forEach = elements.forEach;
    
    this.truncate = function () {
        elements = [];
    };
    
    var inited = false;
    
    this.init = function (element) {
        if (!inited) {
            element.getProperties().forEach(function (property) {
                relayProperty(property, element[property]);
            }, this);
            element.getStates().forEach(function (state) {
                relayState(state);
            }, this);
            inited = true;
        }
    };
    
    this.debugProperties = function() {
        console.log(setProperties);
    };
    
    this.addElement = function (element, autoRelay) {
        if (!inited) {
            this.init(element);
        }
        var index = elements.push(element) - 1;
        Object.keys(setProperties).forEach(function (state) {
            Object.keys(setProperties[state]).forEach(function (property) {
                // var value = thatElementArray[state][property];
                var value = setProperties[state][property];
                if (JuiS.isArray(value)) {
                    element[state][property] = value[index % value.length];
                } else {
                    element[state][property] = value;
                }
            });
        });
        
        if (autoRelay) {
            // Todo loop through the element's properties and states and relay everything
        }
    };
    
    this.addState = function (stateName) {
        this.relayState(stateName);
        return elements.map(function (element) {
            return element.addState(stateName, properties, priority);
        });
    };
    
    this.changePaintFunction = function (name, paint, defaultValue) {
        return elements.map(function (element) {
            return element.changePaintFunction(name, paint, defaultValue);
        });
    };
    
    this.addProperty = function (propertyName, paint, defaultValue, allStates) {
        this.releyProperty(propertyName, defaultValue);
        return elements.map(function (element) {
            return element.addProperty(name, paint, defaultValue, allStates);
        });
    };
    
    var relayProperty = function (propertyName, defaultValue) {
        properties.push(propertyName);
        states.forEach(function (state) {
            createAccessor(state, propertyName);
        });
    };
    
    var relayState = function (stateName) {
        states.push(stateName);
        thatElementArray[stateName] = {};
        properties.forEach(function (property) {
            createAccessor(stateName, property);
        });
    };
    
    function createAccessor(stateName, propertyName) {
        var value;
        Object.defineProperty(thatElementArray[stateName], propertyName, {
            get: function () {
                //If we have no value use whatever is currently set on the first element
                if (value === undefined && elements[0] !== undefined) {
                    value = elements[0][stateName][propertyName];
                }
                return value;
            },
            set: function (newValue) {
                if (!setProperties[stateName]) {
                    setProperties[stateName] = {};
                }
                value = newValue;
                setProperties[stateName][propertyName] = value;
                if (JuiS.isArray(newValue)) {
                    elements.forEach(function(element, index) {
                        element[stateName][propertyName] = value[index % value.length];
                    });
                } else {
                    elements.forEach(function(element) {
                        element[stateName][propertyName] = value;
                    });
                }
            },
            enumerable: true
        });
    }

    this.createDOMEventRelay = function (DOMName, name) {
        return elements.map(function (element) {
            return element.createDOMEventRelay(DOMName, name);
        });
    };
    if (typeof componentContructor === "function") {
        this.init(new componentContructor());
    }
};