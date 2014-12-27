var GUI_HorizontalContainer = function (callback) {
    "use strict";
    this.spacing = "0px";
    this.verticalAlign = "middle";
    this.initContainer();
    var layoutTable = document.createElement("TABLE");
    layoutTable.style.width = "100%";
    layoutTable.style.height = "100%";
    this.node.appendChild(layoutTable);
    var row = layoutTable.insertRow(-1);
        
    this.nodeAddChild = function (child, index) {
        var cell = row.insertCell(-1);
        cell.style.padding = "0px";
        cell.style.verticalAlign = this.verticalAlign;
        cell.style.width = child.width;
		cell.appendChild(child.node);
	};
	this.nodeReplaceChild = function (newChild, oldChild) {
        var i;
        for (i = 0; i < row.children.length; i += 1) {
            console.log(oldChild.node);
            if (row.children[i].firstChild === oldChild.node) {
                row.children[i].replaceChild(newChild.node, oldChild.node);
                break;
            }
        }
	};
	this.removeChild = function (child) {
        if (typeof child === "number") {
            this.children.remove(child);
            row.deleteCell(child);
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