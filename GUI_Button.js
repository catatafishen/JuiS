var GUI_Button = function (callback) {
    "use strict";
    this.initElement("a");
    var thisButton = this;
    // this.textColor = "black";
    this.font = "Courier New";
    this.fontWeight = "normal";
    this.fontSize = "16px";
    this.cursor = "default";
    this.width = "150px";
    this.height = "20px";
    this.text = "Button";
    this.textAlign = "center";
    this.overflowX = "show";
    this.overflowY = "show";
    this.backgroundColor = "#FFFFFF";
    this.hoverTransition = "0";
    this.textColorHover = "blue";
    this.backgroundColorHover = "#EEEEFF";
    this.backgroundImageHover = "";
    this.backgroundHover = "";
    this.textRotationHover = "0deg";
    // this.textColorActive = "blue";
    // this.backgroundColorActive = "#EEEEFF";
    // this.backgroundImageActive = "";
    this.backgroundActive = "";
    // this.textRotationActive = "0deg";
    this.hoverEffectsEnabled = true;
    this.textRotation = 0;

    var borderControlls = this.getBorderController();
    borderControlls.setWidth("0px");
    borderControlls.setColor("gray");
    borderControlls.setStyle("outset");
    borderControlls.setCornerRadius("8px");

    var nodeStyle = this.node.style;
    
    var focusState = this.addState("focus");
    focusState.addProperty("backgroundColor", "#FAFAFA");
    focusState.addProperty("backgroundImage", "");
    focusState.addProperty("backgroundPositionX", "center");
    focusState.addProperty("backgroundPositionY", "center");
    focusState.addProperty("backgroundRepeat", "no-repeat");
    focusState.addProperty("background", "");
    
    var hoverState = this.addState("hover");
    hoverState.addProperty("backgroundColor", "#FAFAFA");
    hoverState.addProperty("backgroundImage", "");
    hoverState.addProperty("backgroundPositionX", "center");
    hoverState.addProperty("backgroundPositionY", "center");
    hoverState.addProperty("backgroundRepeat", "no-repeat");
    hoverState.addProperty("background", "");
    
    var pressedState = this.addState("pressed");
    pressedState.addProperty("backgroundColor", "blue");
    pressedState.addProperty("backgroundImage", "");
    pressedState.addProperty("backgroundPositionX", "center");
    pressedState.addProperty("backgroundPositionY", "center");
    pressedState.addProperty("backgroundRepeat", "no-repeat");
    pressedState.addProperty("background", "");


    this.addProperty("textColor", function(value) {nodeStyle.color = value;}, "#000000", true);
    

    this.addListener("mouseEnter", function () {
        hoverState.activate();
        console.log(this.getActiveStateNames());
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

    this.node.href = "#";
    this.node.ondragstart = function() { return false; };
    this.node.style.textDecoration = "none"
    
    this.createDOMEventRelay("onblur", "blur");
    this.createDOMEventRelay("onfocus", "focus");
    
    var textContainer = document.createElement("SPAN");
    this.node.appendChild(textContainer);
    var indicatorContainer = document.createElement("DIV");
    indicatorContainer.style.display = "inline";
    indicatorContainer.style.position = "relative";
    indicatorContainer.style.top = "-2px";
    indicatorContainer.style.left = "5px";
    this.node.appendChild(indicatorContainer);
    var indicator;
    this.setIndicator = function (indicator_) {
        indicator = indicator_;
        // this.node.innerHTML = "";
        // this.node.appendChild(document.createTextNode(this.text + " "));
        indicatorContainer.appendChild(indicator.node);
    };
    this.removeIndicator = function () {
        if (indicator) {
            indicatorContainer.removeChild(indicator.node);
            indicator = undefined;
        }
    };
    //Disable text selection on button
    this.node.style.WebkitTouchCallout = "none";
    this.node.style.WebkitUserSelect = "none";
    this.node.style.KhtmlUserSelect = "none";
    this.node.style.MozUserSelect = "none";
    this.node.style.MsUserSelect = "none";
    this.node.style.userSelect = "none";
    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        this.node.style.outline = "none";
        // this.node.style.color = "";
        // this.node.style.setProperty("color", this.textColorHover, "important");
        // this.node.style.setProperty("backgroundColor", this.backgroundColorHover, "important");
        // this.node.style.setProperty("backgroundImage", this.backgroundImageHover, "important");
        // if (this.backgroundHover) {
            // this.node.style.setProperty("background", this.backgroundHover, "important");
        // }
        // createMiniStyleClass(this.node, "focus");
        // this.node.style.setProperty("background", this.backgroundActive, "important");
        // createMiniStyleClass(this.node, "active");
        elementPaint.call(this, newProperties, transition);
        // this.node.style.color = this.textColor;
        this.node.style.fontFamily = this.font;
        this.node.style.fontSize = this.fontSize;
        this.node.style.fontWeight = this.fontWeight;
        this.node.style.cursor = this.cursor;
        this.node.style.textAlign = this.textAlign;
        this.node.style.lineHeight = this.height;
        // if (isHovering && this.hoverEffectsEnabled) {
            // this.node.style.color = thisButton.textColorHover;
            // this.node.style.backgroundColor = thisButton.backgroundColorHover;
        // }
        textContainer.innerHTML = "";
        textContainer.appendChild(document.createTextNode(this.text));
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);