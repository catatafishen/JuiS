JuiS.Label = function (callback) {
    "use strict";
    this.textContainer = document.createElement("SPAN");
    this.initElement();
    this.node.appendChild(this.textContainer);
    
    // this.textOverflow = "ellipsis";
    
    if (typeof callback === "function") {
        callback.call(this);
    }
    
}.addMixin(JuiS.ElementMixin).addMixin(function StaticLabel() {
    
    //Add properties
    this.addProperty("textColor", function(value) {this.node.style.color = value;});
    this.addProperty("font", function(value) {this.node.style.fontFamily = value;});
    this.addProperty("fontSize", "nodeStyle");
    this.addProperty("fontWeight", "nodeStyle");
    this.addProperty("textAlign", "nodeStyle");
    this.addProperty("textRotation", "nodeStyle");
    this.addProperty("lineHeight", "nodeStyle");
    this.addProperty("textShadow", "nodeStyle");
    this.addProperty("textOverflow", "nodeStyle", "ellipsis");
    this.addProperty("text", function(value) {
        this.textContainer.innerHTML = "";
        var text;
        if (value === null) {
            text = "null";
        } else if (value === undefined) {
            text = "";
        } else {
            text = value.toString();
        }
        this.textContainer.appendChild(document.createTextNode(text.replace(/ /g, "\u00a0")));
    }, "Label");
});