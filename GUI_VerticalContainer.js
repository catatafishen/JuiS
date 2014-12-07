var GUI_VerticalContainer = function (callback) {
    "use strict";
    this.spacing = "2px";
    this.verticalAlign = "middle";
    this.initContainer();
    var layoutTable = document.createElement("TABLE");
    layoutTable.style.width = "100%";
    layoutTable.style.height = "100%";
    this.node.appendChild(layoutTable);
        
    this.nodeAddChild = function (child, index) {
        var cell = layoutTable.insertRow(index).insertCell(0);
        cell.style.padding = "0px";
        cell.style.verticalAlign = this.verticalAlign;
		cell.appendChild(child.node);
	};
	this.nodeRemoveChild = function (child) {
        if (typeof child === "number") {
            layoutTable.deleteRow(child);
        } else {
            throw new Error("not implemented");
        }
	};
    
    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        layoutTable.style.borderSpacing = this.spacing;
        elementPaint.call(this, newProperties, transition);
    };
    
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ContainerMixin);


