if (!JuiS) {
    var JuiS = {};
}
var ListenableMixin = JuiS.ListenableMixin = function (nextListenable) {
    "use strict";
    var Listener = function (listensTo, handler, thisListenable) {
        this.listensTo = listensTo;
        this.active = true;

        this.hears = function (event) {
            if (typeof this.listensTo === "string") {
                return (event.type === this.listensTo);
            } else if (Array.isArray(this.listensTo)) {
                return (this.listensTo.indexOf(event.type) !== -1);
            }
        };

        this.handle = function (event) {
            if (this.active && this.hears(event)) {
                handler.call(thisListenable, event);
            }
        };
    };

    var Event = function (eventType, origin, data) {
        var next;
        this.type = eventType;
        this.origin = origin;
        this.propagating = true;
        this.propagationPath = [origin];
        this.data = data;

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

    this.fire = function (event) {
        if (Array.isArray(this.listeners)) {
            this.listeners.forEach(function (listener) {
                listener.handle(event);
            });
        }
        event.propagate();
    };

    this.addListener = this.on = function (listensTo, handler) {
        var listener = new Listener(listensTo, handler, this);
        if (!Array.isArray(this.listeners)) {
            this.listeners = [];
        }
        this.listeners.push(listener);
        this.createEvent("listenerAdded", {"listener": listener});
        return listener;
    };

    this.removeListener = function (listener) {
        this.listeners.remove(listener);
    };

    this.createEvent = this.trigger = function (arg0, arg1) {
        var type, event, data, argObj,
            nextListenable = this.nextListenable,
            propagate = true;

        if (typeof arg0 === "string") {
            type = arg0;
            data = arg1 || {};
        } else {
            argObj = arg0;
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

        event = new Event(type, this, data);
        event.setNext(nextListenable);
        event.propagating = propagate;
        this.fire(event);
    };
};