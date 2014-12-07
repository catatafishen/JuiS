var WebsocketViewAdapterContainer = function (address) {
    "use strict";
    var thisWebsocketViewAdapterContainer = this;
    var log = function (text) {
        console.log("WebsocketViewAdapterContainer :: " +
            Array.prototype.slice.call(arguments).join(" :: "));
    };
    var requestCallbacks = {};
    var callbackMethods = {};
    var callbackMethodCounter = 0;
    var nextRequestId = 1;
    var adapters = {};
    this.getAdapter = function (adapter) {
        return adapters[adapter];
    };
    this.forEachAdapter = function (callback) {
        var key;
        for (key in adapters) {
            if (adapters.hasOwnProperty(key)) {
                callback(adapters[key], key);
            }
        }
    };
    var websocket;
    var send = function (data) {
        log("raw output", JSON.stringify(data));
        websocket.send(JSON.stringify(data));
    };
    
    this.sendObject = function(data) {
        send(data);
    };
    
    var request = function (adapter, method, parameters, callback) {
        var data = {};
        data.requestId = nextRequestId;
        requestCallbacks[nextRequestId] = callback;
        nextRequestId += 1;
        data.adapter = adapter;
        data.method = method;
        data.parameters = parameters;
        send(data);
    };
    var initAdapters = function (adapterNames) {
        var adapterName;
        var adapterNameIterator = new Iterator(adapterNames);
        adapterNameIterator.iterate(function (properties, adapterName) {
            var adapter = {};
            adapter.addMixin(ListenableMixin);
            adapter.nextListenable = thisWebsocketViewAdapterContainer;
            var propertyIterator = new Iterator(properties);
            propertyIterator.iterate(function (propertyValue, propertyName) {
                if (propertyValue === "method") {
                    adapter[propertyName] = function () {
                        var callback;
                        var parameters = Array.prototype.slice.call(arguments);
                        // if (typeof parameters[parameters.length -1] === "function") {
                            // callback = parameters.pop();
                        // }
                        parameters.forEach(function (parameter, index) {
                            if (typeof parameter === "function") {
                                var methodName = "method" + ++callbackMethodCounter;
                                callbackMethods[methodName] = function (argumentsArray) {
                                    parameter.apply(adapter, Array.prototype.slice.call(argumentsArray));
                                    callbackMethods[methodName] = undefined; //Free memory
                                };
                                parameters[index] = {
                                    "type": "clientSideMethod",
                                    "clientSideIdentifier": methodName
                                };
                            }
                        });
                        request(adapterName, propertyName, parameters, function (error, response) {
                            if (error) {
                                adapter.createEvent("error",
                                    {"method": propertyName, "error": error});
                            } else {
                                if (callback) {
                                    callback.apply(adapter, response);
                                }
                            }
                        });
                    };
                } else {
                    adapter[propertyName] = propertyValue;
                }
            });
            adapters[adapterName] = adapter;
        });
        thisWebsocketViewAdapterContainer.createEvent("ready");
        var adapter;
        for (adapter in adapters) {
            if (adapters.hasOwnProperty(adapter)) {
                thisWebsocketViewAdapterContainer.createEvent("adapterAvailable", {"adapter": adapter});
            }
        }
    };
    function createNewConnection () {
        websocket = new WebSocket(address);
        websocket.onmessage = function (event) {
            log("raw input", event.data);
            var dataObj = {};
            try { dataObj = JSON.parse(event.data); } catch (e) {}

            var callback;
            if (callback = requestCallbacks[dataObj.requestId]) {
            //Run the callback for a request
                callback(dataObj.error, dataObj.response);
            } else if (dataObj.event && adapters[dataObj.adapter]) {
            //Fire an event in the right adapter
                adapters[dataObj.adapter].createEvent({"type": dataObj.event, "data": dataObj.data});
            } else if (dataObj.init) {
            //Run the initAdapters function
                initAdapters(dataObj.adapters);
            } else if (dataObj.method) {
            //The server has called a function that was given as a parameter by the client to a method in an adapter.
                callbackMethods[dataObj.method](dataObj.arguments);
            } else {
            //Or fire an unhandled event.
                thisWebsocketViewAdapterContainer.createEvent({"type": "unhandled", "data": {
                    "inputText": event.data,
                    "inputData": dataObj,
                    "DOMEvent": event
                }});
            }
        };
        websocket.onclose = function (event) {
            thisWebsocketViewAdapterContainer.createEvent({"type": "connection closed", "data": {"DOMEvent": event}});
            log("Connection closed");
        };
        websocket.onerror = function (event) {
            websocket.close();
            createNewConnection();
            alert(event);
        };
    }
    createNewConnection();
}.addMixin(ListenableMixin);