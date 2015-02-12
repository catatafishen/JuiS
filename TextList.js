JuiS.TextList = function () {
    "use strict";
    this.initElement("DIV");
    var elements = [];
    var selection = [];
    var thatTextList = this;
    
    var ListItem = function () {
        var label = new JuiS.Label();
        label.userSelect = "none";
        label.hoverState = label.createState("hover");
        label.selectedState = label.createState("selected");
        return label;
    };
    
    this.items = new JuiS.ElementArray(ListItem);
    
    var selectElement = function (element) {
        if (thatTextList.selection !== "none") {
            if (selection.indexOf(element) === -1) {
                select(element);
            } else {
                unselect(element);
            }
            var keyList = [];
            selection.forEach(function (element) {
                keyList.push(element.key);
            });
            thatTextList.trigger("change", keyList);
        }
    };
    
    var select = function(element) {
        if (thatTextList.selection === "one") {
            thatTextList.clearSelection();
        }
        element.item.selectedState.activate();
        selection.push(element);
    };
    
    var unselect = function(element) {
        if (!thatTextList.required || selection.length !== 1) {
            element.item.selectedState.deactivate();
            selection.remove(element);
        }
    };
    
    this.clearSelection = function () {
        selection.forEach(function (element) {
            element.item.selectedState.deactivate();
        });
        selection = [];
    };
    
    this.addElement = function(key, value) {
        var item = new ListItem();
        var element = {
            "key": key,
            "value": value,
            "item": item
        };
        item.text = value;
        this.items.addElement(item);
        item.on("click", function () {
            selectElement(element);
        });
        this.node.appendChild(item.node);
        elements.push(element);
        
        if (this.required && selection.length === 0) {
            selectElement(element);
        }
    };
    
    this.addProperty("selection", function (value) {
        this.clearSelection();
        if (value !== "none" && value !== "one" && value !== "many") {
            throw new Error("selection property must be either 'none', 'one' or 'many'");
        }
    }, "one");
    
    
    this.callback(arguments);
    
}.addMixin(JuiS.ElementMixin).addMixin(function StaticLabel() {
    
    //Add properties

    this.addProperty("align", function(value) {
        this.node.style.textAlign = value;
    });
    
    this.addProperty("required", function (value) {}, true);
});