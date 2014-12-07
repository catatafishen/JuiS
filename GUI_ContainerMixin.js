"use strict";
var GUI_ContainerMixin = function () {
    this.initContainer = function () {
		this.initElement();
        this.children = [];
    };
	this.addChild = function (child, index) {
        if (index === undefined) {
            index = this.children.length;
        }
        this.children.splice(index, 0, child);
		this.nodeAddChild(child, index);
        child.nextListenable = this;
        return child;
	};
	this.replaceChild = function (newChild, oldChild) {
        var childIndex;
        if (typeof oldChild === "number") {
            childIndex = oldChild;
            throw new Error("Not implemented");
        } else {
            this.children.forEach(function(child, loopIndex) {
                if (child === oldChild) {
                    childIndex = loopIndex;
                }
            });
        }
        this.children[childIndex] = newChild;
		this.nodeReplaceChild(newChild, oldChild);
        newChild.nextListenable = this;
        return newChild;
	};
	this.nodeAddChild = function (child) {
        child.node.style.display = "block";
		this.node.appendChild(child.node);
	};
	this.nodeReplaceChild = function (newChild, oldChild) {
        child.node.style.display = "block";
		this.node.replaceChild(newChild.node, oldChild.node);
	};
	this.removeChild = function (child) {
        if (typeof child === "number") {
            this.children.splice(child, 1);
        } else {
            this.children.remove(child);
        }
        this.nodeRemoveChild(child);
	};
	this.nodeRemoveChild = function (child) {
        this.node.removeChild(child.node);
	};
	this.attachChild = function (child) {
        //Todo Check that child is in children
		this.node.appendChild(child.node);
	};
	this.detachChild = function (child) {
        //Todo Check that child is in children
		this.node.removeChild(child.node);
	};
};
GUI_ContainerMixin.addMixin(GUI_ElementMixin);