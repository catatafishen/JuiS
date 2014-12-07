var GUI_ControlBar = function (callback) {
    "use strict";
    this.initElement();
    this.itemTextColor = "black";
    this.selectedItemTextColor = "grey";
    this.selectedItemBackgroundColor = "lightGrey";
    this.font = "Lucida Console, Courier New";
    this.itemMargin = "2px";
    this.fontSize = "11px";
    var items = {};
    
    this.addItem = function (item) {
        name = name || itemText;
        if (items[name]) {
            throw new Error("Item is already in list");
        }
        var item = document.createElement("DIV");
        item.style.fontFamily = this.font;
        item.style.fontSize = this.fontSize;
        item.style.color = this.itemTextColor;
        item.style.margin = this.itemMargin;
        item.appendChild(document.createTextNode(itemText));
        this.node.appendChild(item);
        items[name] = item;
    };
    this.removeItem = function (name) {
        var item = items[name];
        this.node.removeChild(item);
        items[name] = undefined;
    }

    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);