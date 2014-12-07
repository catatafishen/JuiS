"use strict";
var ListenableMixin = function (nextListenable) {
    var Listener = function (listensTo, handler, thisListenable) {
        this.listensTo = listensTo;  //Change so this can be an array
        this.active = true;
        var timesHandled = 0;
        this.handle = function (event) {
            if (this.active && event.type === this.listensTo) {
                handler.call(thisListenable, event);
                timesHandled += 1;
            }
        };
    };
    var Event = this.Event = function (eventType, origin, data) {
        this.type = eventType;
        this.origin = origin;
        this.propagating = true;
        this.propagationPath = [origin];
        this.data = data;
        var next;
        this.setNext = function (listenable) {
            next = listenable;
        };
        this.getNext = function () {
            return next;
        };
        this.propagate = function () {
            if (this.propagating) {
                var next = this.getNext();
                if (next && next.fire) {
                    this.propagationPath.unshift(next);
                    this.setNext(next.nextListenable);
                    next.fire(this);
                }
            }
        };
    };
    this.nextListenable = nextListenable;
    this.fire = function (event) {
        if (this.listenerIterator) {
            this.listenerIterator.iterate(function (listener) {
                listener.handle(event);
            });
        }
        event.propagate();
    };
    this.addListener = this.on = function (listensTo, handler) {
        if (this.listeners === undefined) {
            this.listeners = [];
            this.listenerIterator = new Iterator(this.listeners);
        }
        var listener = new Listener(listensTo, handler, this);
        this.listeners.push(listener);
        this.createEvent("listenerAdded", {"listener": listener});
        return listener;
    };
    this.removeListener = function (listener) {
        this.listenerIterator.iterate(function (listener) {
            //delete listener; //should remove element from array
                             //Change: add such array-function
        });
    };
    this.createEvent = function (arg0, arg1) {
        var type;
        var data = {};
        var nextListenable = this.nextListenable;
        var propagate = true;
        if (typeof arg0 === "string") {
            type = arg0;
            data = arg1 || data;
        } else {
            var argObj = arg0;
            type = argObj.type;
            if (argObj.data !== undefined) {
                data = argObj.data;
            }
            if (argObj.nextListenable !== undefined) {
                nextListenable = arg0.nextListenable;
            }
            if (argObj.propagate !== undefined) {
                propagate = argObj.propagate;
            }
        }
        var event = new Event(type, this, data);
        event.setNext(nextListenable);
        event.propagating = propagate;
        this.fire(event);
    };
};