var GUI_Label = function (callback) {
    "use strict";
    this.initElement();
    var thisLabel = this;
    this.textColor = "black";
    this.font = "Courier New";
    this.fontSize = "11px";
    this.fontWeight = "normal";
    this.text = "Label";
    this.textAlign = "left";
    this.lineHeight = "";
    
    var textNode = document.createTextNode("");
    
    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        elementPaint.call(this, newProperties, transition);
        this.node.style.color = this.textColor;
        this.node.style.fontFamily = this.font;
        this.node.style.fontSize = this.fontSize;
        this.node.style.fontWeight = this.fontWeight;
        this.node.style.lineHeight = this.lineHeight;
        this.node.style.textAlign = this.textAlign;
        textNode.nodeValue = this.text;
        this.node.appendChild(textNode);
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);