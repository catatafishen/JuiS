JuiS.Label = function (callback) {
    "use strict";
    this.initElement();
    var thisLabel = this;
    var nodeStyle = this.node.style;
    var textContainer = document.createElement("SPAN");
    this.node.appendChild(textContainer);
    
    //Add properties
    this.addProperty("textColor", function(value) {nodeStyle.color = value;}, "#000000");
    this.addProperty("font", function(value) {nodeStyle.fontFamily = value;}, "Courier New");
    this.addProperty("fontSize", nodeStyle, "1em");
    this.addProperty("textAlign", nodeStyle, "left");
    this.addProperty("textRotation", nodeStyle, "0");
    this.addProperty("lineHeight", nodeStyle, "1em");
    this.addProperty("textShadow", nodeStyle, "none");
    this.addProperty("text", function(value) {
        textContainer.innerHTML = "";
        textContainer.appendChild(document.createTextNode(thisLabel.text.replace(/ /g, "\u00a0")));
    }, "Button");
    
    if (callback.call) {
        callback.call(this);
    }
}.addMixin(GUI_ElementMixin);