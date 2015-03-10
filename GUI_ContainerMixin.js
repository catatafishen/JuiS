"use strict";
var GUI_ContainerMixin = JuiS.ContainerMixin = function () {
    
    this.initContainer = function () {
		this.initElement("DIV");
        this.views = {};
        this.createView("default");
        this.showView("default");
        this.createDOMEventRelay("scroll");
    };
    
    this.addProperty("align", function(value) {
        this.node.style.textAlign = value;
    });
    
    this.createView = function (name) {
        var view = {}
        view.children = [];
        this.views[name] = view;
        return view;
    };
    
    this.getChildren = function (viewName) {
        if (typeof viewName === "string") {
            return this.views[viewName];
        }
        return this.views;
    };
    
    this.showView = function (name) {
        if (!this.views[name]) {
            this.createView(name);
        }
        if (this.activeView) {
            this.hideView(this.activeView);
        }
        this.activeView = this.views[name];
        this.activeView.children.forEach(function (child) {
            this.node.appendChild(child.node);
        }, this);
    };
    
    this.hideView = function (view) {
        view.children.forEach(function (child) {
            this.node.removeChild(child.node);
        }, this);
    };
    
	this.addChild = function (child, viewName, index) {
        var view = viewName ? this.views[viewName] : this.activeView;
        if (!view) {
            view = this.createView(viewName);
        }
        if (index === undefined) {
            index = view.children.length;
        }
        if (view === this.activeView) {
            this.attachNode(child, view, index);
        }
        view.children.splice(index, 0, child);
        child.nextListenable = this;
        return child;
	};
    
    this.attachNode = function (child, view, index) {
        var nextChild = view.children[index + 1];
        if (nextChild) {
            this.node.insertBefore(child.node, nextChild);
        } else {
            this.node.appendChild(child.node);
        }
    };
    
    //Todo: Replace and remove does not check if child is in current view!
    
	this.replaceChild = function (newChild, oldChild) {
        var childIndex;
        var view = view ? this.views[view] : this.activeView;
        if (typeof oldChild === "number") {
            childIndex = oldChild;
            throw new Error("Not implemented");
        } else {
            view.children.forEach(function(child, loopIndex) {
                if (child === oldChild) {
                    childIndex = loopIndex;
                }
            });
        }
        view.children[childIndex] = newChild;
		this.node.replaceChild(newChild.node, oldChild.node);
        newChild.nextListenable = this;
        return newChild;
	};

	this.removeChild = function (child, view) {
        var view = view ? this.views[view] : this.activeView;
        if (typeof child === "number") {
            view.children.splice(child, 1);
        } else {
            view.children.remove(child);
        }
        this.node.removeChild(child.node);
	};
};
GUI_ContainerMixin.addMixin(JuiS.ElementMixin);