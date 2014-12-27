JuiS.Button = function (callback) {
    "use strict";
    
    this.initElement("a");
    
    var thisButton =  this;
    var nodeStyle = this.node.style;
    nodeStyle.textDecoration = "none"
    nodeStyle.outline = "none";
    nodeStyle.WebkitTouchCallout = "none";
    nodeStyle.WebkitUserSelect = "none";
    nodeStyle.KhtmlUserSelect = "none";
    nodeStyle.MozUserSelect = "none";
    nodeStyle.MsUserSelect = "none";
    nodeStyle.userSelect = "none";
    
    this.node.href = "#";
    this.node.ondragstart = function() { return false; };
    // this.node.onclick = function() { return false; };
    var textContainer = document.createElement("SPAN");
    this.node.appendChild(textContainer);

    //Add properties
    this.addProperty("textColor", function(value) {nodeStyle.color = value;}, "#000000");
    this.addProperty("font", function(value) {nodeStyle.fontFamily = value;}, "Courier New");
    this.addProperty("fontSize", nodeStyle, "1em");
    this.addProperty("textAlign", nodeStyle, "center");
    this.addProperty("textRotation", nodeStyle, "0");
    this.changePaintFunction("height", function(value) {
        nodeStyle.height = value;
        nodeStyle.lineHeight = value;
    }, "Button");
    this.addProperty("text", function(value) {
        textContainer.innerHTML = "";
        textContainer.appendChild(document.createTextNode(thisButton.text.replace(/ /g, "\u00a0")));
    }, "Button");
    
    //Default values
    this.overflow = "visible";
    
    //Add states
    var focusState = this.addState("focus");
    var hoverState = this.addState("hover");
    var pressedState = this.addState("pressed");

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
    
    if (typeof callback.call === "function") {
        callback.call(this);
    }
}.addMixin(GUI_ElementMixin);