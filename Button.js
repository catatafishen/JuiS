JuiS.Button = function (callback) {
    "use strict";
    this.initElement("BUTTON");
    
    //Default values
    this.overflow = "visible";
    this.cursor = "pointer";
    this.userSelect = "none";
    this.display = "block";
    
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
        hoverState.deactivate();
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
    
    this.callback(arguments);
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
        this.node.innerHTML = "";
        this.node.appendChild(document.createTextNode(this.text.replace(/ /g, "\u00a0")));
    }, "Button");
});