JuiS.Button = function (callback) {
    "use strict";
    this.textContainer = document.createElement("SPAN");
    
    this.initElement("DIV");
    
    var thisButton =  this;
    var nodeStyle = this.node.style;
    nodeStyle.textDecoration = "none"
    nodeStyle.outline = "none";
    
    this.node.href = "#";
    this.node.ondragstart = function() { return false; };
    this.node.appendChild(this.textContainer);

    
    //Default values
    this.overflow = "visible";
    this.cursor = "pointer";
    
    //Add states
    var focusState = this.createState("focus");
    var hoverState = this.createState("hover");
    var pressedState = this.createState("pressed");

    //Handle states
    this.addListener("mouseEnter", function () {
        hoverState.activate();
    });
    
    this.addListener("mouseLeave", function () {
        hoverState.deactivate();
    });
    
    this.addListener("focus", function () {
        focusState.activate();
    });
    
    this.addListener("blur", function () {
        focusState.deactivate();
    });
    
    this.addListener("mouseDown", function () {
        pressedState.activate();
        var mouseUpListener = this.addListener("mouseUp", function () {
            pressedState.deactivate();
            mouseUpListener.active = false;
            mouseEnterListener.active = false;
            mouseLeaveListener.active = false;
        });
        var mouseLeaveListener = this.addListener("mouseLeave", function () {
            pressedState.deactivate();
        });
        var mouseEnterListener = this.addListener("mouseEnter", function () {
            pressedState.activate();
        });
    });

    //Add events
    this.createDOMEventRelay("onblur", "blur");
    this.createDOMEventRelay("onfocus", "focus");
    var clickRelay = this.createDOMEventRelay("onclick", "click");
    clickRelay.preventDefault = true;
    
    if (typeof callback.call === "function") {
        callback.call(this);
    }
}.addMixin(JuiS.ElementMixin).addMixin(function StaticButton() {
    this.addProperty("textColor", function(value) {this.node.style.color = value;});
    this.addProperty("font", function(value) {this.node.style.fontFamily = value;});
    this.addProperty("fontSize", "nodeStyle");
    this.addProperty("textAlign", "nodeStyle");
    this.addProperty("textRotation", "nodeStyle");
    this.changePaintFunction("height", function(value) {
        this.node.style.height = value;
        this.node.style.lineHeight = value;
    });
    this.addProperty("text", function(value) {
        this.textContainer.innerHTML = "";
        this.textContainer.appendChild(document.createTextNode(this.text.replace(/ /g, "\u00a0")));
    }, "Button");
});