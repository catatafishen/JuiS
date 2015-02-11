JuiS.TextField = function (callback) {
    "use strict";
    
    this.initElement("input");
    this.node.type = "text";
    
    this.createDOMEventRelay("focus");
    this.createDOMEventRelay("blur");
    this.createDOMEventRelay("change");
    this.createDOMEventRelay("input");
    this.createDOMEventRelay("search");
    
    this.callback(arguments);
    
}.addMixin(JuiS.ElementMixin).addMixin(function StaticLabel() {
    
    //Add properties
    this.addProperty("textColor", function(value) {this.node.style.color = value;});
    this.addProperty("font", function(value) {this.node.style.fontFamily = value;});
    this.addProperty("fontSize", "nodeStyle");
    this.addProperty("fontWeight", "nodeStyle");
    this.addProperty("textAlign", "nodeStyle");
    this.addProperty("lineHeight", "nodeStyle");
    this.addProperty("textShadow", "nodeStyle");
    this.addProperty("textOverflow", "nodeStyle", "ellipsis");
    this.addProperty("inputType", function(value) {
        this.node.type = value;
    }, "text");
    
    this.addProperty("value", function(value) {
        this.node.value = value;
    }, "");
    
    this.addProperty("placeholder", function(value) {
        this.node.placeholder = value;
    }, "");
    
    //Common methods
    this.getValue = function () {
        return this.node.value;
    };
});