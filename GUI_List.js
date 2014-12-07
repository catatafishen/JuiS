var GUI_List = function (callback) {
    "use strict";
    this.initElement();
    this.itemTextColor = "black";
    this.selectedItemTextColor = "grey";
    this.selectedItemBackgroundColor = "lightGrey";
    this.font = "Lucida Console, Courier New";
    this.itemMargin = "2px";
    this.fontSize = "11px";
    var items = {};
    var thisList = this;
    
    this.addItem = function (itemText, name, overwrite) {
        name = name || itemText;
        if (items[name]) {
            if (overwrite) {
                this.changeItemText(name, itemText);
            } else {
                throw new Error("Item is already in list");
            }
        } else {
            var item = document.createElement("DIV");
            item.style.fontFamily = this.font;
            item.style.fontSize = this.fontSize;
            item.style.color = this.itemTextColor;
            item.style.margin = this.itemMargin;
            item.appendChild(document.createTextNode(itemText));
            this.node.appendChild(item);
            items[name] = item;
        }
    };
    this.removeItem = function (name) {
        var item = items[name];
        if (item) {
            this.node.removeChild(item);
            items[name] = undefined;
        }
    };
    this.empty = function() {
        var itemIterator = new Iterator(items);
        itemIterator.iterate(function (item, name) {
            thisList.node.removeChild(item);
        });
        items = {};
    };
    this.changeItemText = function (name, itemText) {
        var item = items[name];
        item.innerHTML = "";
        item.appendChild(document.createTextNode(itemText));
    };

    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);