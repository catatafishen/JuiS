JuiS.SimpleTable = function (callback) {
    "use strict";
    this.initElement();
    var thisSimpleTable = this;
    var nodeStyle = this.node.style;
    
    var columns = [];
    var fieldFactories = [];
    var tableRows = [];
    var headers = {};
    var table = document.createElement("TABLE");
    table.style.width = "100%";
    table.style.height = "100%";
    table.style.tableLayout = "fixed";
    table.style.borderCollapse = "collapse";
    var header = table.createTHead();
    var headerRow = header.insertRow(-1);
    var tableBody = table.createTBody();
    this.node.appendChild(table);
    
    this.addColumn = function (name, header, fieldFactory) {
        columns.push(name);
        fieldFactories.push(fieldFactory || null);
        var cell = headerRow.insertCell(-1);
        cell.style.padding = "0px";
        var label = new JuiS.Label(function () {
            this.enablePaintEvents = true;
            this.on("paint", function (event) {
                if (event.data.property === "width"
                    || event.data.property === "marginLeft"
                    || event.data.property === "marginRight"
                    || event.data.property === "paddingLeft"
                    || event.data.property === "paddingRight") {
                    cell.style.width = this.countHorisontalDisplacement();
                }
            });
            this.text = header;
        });
        label.nextListenable = this;
        headers[name] = label;
        cell.appendChild(label.node);
        return label;
    };
    
    this.addRows = function (rows) {
        rows.forEach(function (row) {thisSimpleTable.addRow(row);});
    };
    
    this.addRow = function(rowData, position) {
        var position = (position === undefined) ? -1 : position;
        var tableRow = tableBody.insertRow(position);
        
        var rowElement = new RowElement(tableRow);
        this.rows.addElement(rowElement);
        tableRows.push(tableRow);
        
        columns.forEach(function (column, index) {
            var fieldFactory = fieldFactories[index] || labelFieldFactory;
            var field = fieldFactory(column, rowData);
            var cell = tableRow.insertCell(-1);
            thisSimpleTable.on("paint", function (event) {
                if (event.data.property === "font"
                    || event.data.property === "borderLeftWidth"
                    || event.data.property === "borderRightWidth"
                    || event.data.property === "marginLeft"
                    || event.data.property === "marginRight"
                    || event.data.property === "paddingLeft"
                    || event.data.property === "paddingRight") {
                    cell.style.width = this.countHorisontalDisplacement();
                }
            });
            cell.appendChild(field.node || field);
        });
    };
    
    var RowElement = function (node) {
        this.initElement(node);
        var hoverState = this.createState("hover");
        this.on("mouseEnter", function () {
            hoverState.activate();
        });
        this.on("mouseLeave", function () {
            hoverState.deactivate();
        });
    }.addMixin(JuiS.ElementMixin);
    
    var labelFieldFactory = function (key, rowData) {
        return new JuiS.Label(function () {
            this.text = rowData[key];
            this.height = "100%";
            this.paddingLeft = "3px";
        });
    };
    var labelFieldFactory_ = function (key, rowData) {
        return document.createTextNode(rowData[key]);
    };
    
    var getRowAttribute = function (value, index) {
        var rowValue;
        if (typeof value === "string") {
            rowValue = value;
        } else {
            rowValue = value[index % value.length];
        }
        return rowValue;
    };
    
    this.rows = new JuiS.ElementArray();
    this.rows.relayProperty("background");
    this.rows.relayProperty("height");
    // this.rows.relayProperty("boxShadow");
    this.rows.relayState("hover");
    
    // this.addProperty("textColor", function(value) {nodeStyle.color = value;}, "#000000");
    // this.addProperty("font", function(value) {nodeStyle.fontFamily = value;}, "Courier New");
    // this.addProperty("fontSize", nodeStyle, "1em");
    // this.addProperty("textAlign", nodeStyle, "left");
    // this.addProperty("textRotation", nodeStyle, "0");
    // this.addProperty("lineHeight", nodeStyle, "1em");
    
    if (typeof callback === "function") {
        callback.call(this);
    }
}.addMixin(JuiS.ElementMixin);