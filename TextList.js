JuiS.TextList = function () {
    "use strict";
    this.initContainer("DIV");
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
    
    var elementClick = function (element) {
        if (thatTextList.selection !== "none") {
            if (selection.indexOf(element) === -1) {
                select(element);
            } else {
                unselect(element);
            }
        }
    };
    
    this.getValue = function () {
        var keyList = [];
        selection.forEach(function (element) {
            keyList.push(element.key);
        });
        return keyList;
    };
    
    var createSelectionChangedEvent = function () {

        thatTextList.trigger("change", thatTextList.getValue());
    };
    
    var select = function(elements) {
        if (thatTextList.selection === "one") {
            thatTextList.clearSelection();
        }
        elements = JuiS.arrayWrap(elements);
        elements.forEach(function (element) {
            element.item.selectedState.activate();
            selection.push(element);
        });
        createSelectionChangedEvent();
    };
    
    var unselect = function(element) {
        if (!thatTextList.required || selection.length !== 1) {
            element.item.selectedState.deactivate();
            selection.remove(element);
        }
        createSelectionChangedEvent();
    };
    
    this.select = function(keys) {
        keys = JuiS.arrayWrap(keys);
        var elementsToSelect = [];
        elements.forEach(function (element) {
            if (keys.indexOf(element.key) !== -1) {
                elementsToSelect.push(element);
            }
        });
        select(elementsToSelect);
    };
    
    this.clearSelection = function () {
        selection.forEach(function (element) {
            element.item.selectedState.deactivate();
        });
        selection = [];
    };
    
    var clearData = function () {
        selection = [];
        elements.forEach(function (element) {
            thatTextList.removeChild(element.item);
        });
        elements = [];
    };
    
    this.removeElement = function (key) {
        elements.forEach(function (element) {
            if (element.key === key) {
                //todo
            }
        });
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
            elementClick(element);
        });
        this.addChild(item);
        elements.push(element);
        
        if (this.required && selection.length === 0) {
            select(element);
        }
    };
    
    this.addProperty("selection", function selectionSetter(value) {
        this.clearSelection();
        if (value !== "none" && value !== "one" && value !== "many") {
            throw new Error("selection property must be either 'none', 'one' or 'many'");
        }
    }, "one");
    
    this.addProperty("data", function dataSetter(data) {
        clearData();
        data = JuiS.arrayWrap(data)
        data.forEach(function (item) {
            this.addElement(item.key, item.value);
        }, this);
    });
    
    //Initial values
    this.backgroundColor = "white";
    this.borderWidth = "1px";
    this.borderStyle = "inset";
    this.items.borderWidth = "1px";
    this.items.padding = "5px";
    this.items.margin = "1px";
    this.items.selected.backgroundColor = "#CCCCCC";
    
    this.callback(arguments);
    
}.addMixin(JuiS.ContainerMixin).addMixin(JuiS.FormFieldMixin).addMixin(function StaticTextList() {
    
    //Add properties

    this.addProperty("required", function requiredSetter(value) {}, true);

    this.setValue = function (values) {
        this.clearSelection();
        this.select(values);
    };    
});