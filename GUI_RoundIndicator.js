var GUI_RoundIndicator = function (callback) {
    "use strict";
    var thisIndicator = this;
	this.position = "inline";
	this.left = "0px";
	this.top = "0px";
	this.bottom = "auto";
	this.right = "auto";
    
    this.textColor = "black";
    this.font = "Segoe UI";
    this.fontWeight = "normal";
    this.text = " ";
    this.backgroundColor = "#FFFFFF";
    this.hoverText = "";
    this.size = 20; //px
    this.verticalAlign = "top";
    this.node = document.createElement("DIV");
    this.node.style.display = "inline-block";
    this.paint = function (newProperties, transition) {
		this.node.style.position = this.position;
		this.node.style.left = this.left;
		this.node.style.top = this.top;
		this.node.style.bottom = this.bottom;
		this.node.style.right = this.right;
        this.node.style.backgroundColor = this.backgroundColor;
        this.node.style.borderRadius = (this.size / 2) + "px";
        this.node.style.color = this.textColor;
        this.node.style.fontFamily = this.font;
        this.node.style.fontSize = (this.size / 1.4) + "px";
        this.node.style.fontWeight = this.fontWeight;
        this.node.style.width = this.size + "px";
        this.node.style.height = this.size + "px";
        this.node.title = this.hoverText;
        this.node.style.textAlign = "center";
        this.node.style.verticalAlign = this.verticalAlign;
        this.node.style.lineHeight = this.size + "px";
        this.node.innerHTML = "";
        this.node.appendChild(document.createTextNode(this.text));
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
};