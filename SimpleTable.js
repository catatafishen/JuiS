JuiS.SimpleTable = function (callback) {
    "use strict";
    this.initElement();
    var thisSimpleTable = this;
    var nodeStyle = this.node.style;
    
    var columns = [];
    var table = document.createElement("TABLE");
    table.style.width = "100%";
    table.style.height = "100%";
    var header = table.createTHead();
    var headerRow = header.insertRow(-1);
    this.node.appendChild(table);
    
    this.addColumn = function (name, text, width, align) {
        columns.push({"name": name, "text": text, "width": width, "align": align});
        var cell = headerRow.insertCell(-1);
        cell.appendChild(new JuiS.Label(function () {
            this.text = text;
        }).node);
    };
    
    this.addProperty("textColor", function(value) {nodeStyle.color = value;}, "#000000");
    this.addProperty("font", function(value) {nodeStyle.fontFamily = value;}, "Courier New");
    this.addProperty("fontSize", nodeStyle, "1em");
    this.addProperty("textAlign", nodeStyle, "left");
    this.addProperty("textRotation", nodeStyle, "0");
    this.addProperty("lineHeight", nodeStyle, "1em");
    
    if (typeof callback === "function") {
        callback.call(this);
    }
}.addMixin(GUI_ElementMixin);