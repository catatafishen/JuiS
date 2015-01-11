JuiS.SimpleTable = function (callback) {
    "use strict";
    this.initElement();
    var thisSimpleTable = this;
    var nodeStyle = this.node.style;
    var initialAdd = true;
    var columns = [];
    var fieldFactories = [];
    
    var rows = [];
    this.rows = new JuiS.ElementArray();
    this.rows.relayProperty("background");
    this.rows.relayProperty("height");
    this.rows.relayState("hover");
    
    var headers = {};
    var table = document.createElement("TABLE");
    var visibleRows = 0;
    table.style.width = "100%";
    table.style.height = "100%";
    table.style.tableLayout = "fixed";
    table.style.borderCollapse = "collapse";
    var header = table.createTHead();
    var headerRow = header.insertRow(-1);
    var tableBody = table.createTBody();
    var tableFoot = table.createTFoot();
    this.node.appendChild(table);

    var showingFootLoader = false;
    this.showFootLoader = function () {
        if (!showingFootLoader) {
            var footRow = tableFoot.insertRow(-1);
            var footCell = footRow.insertCell(-1);
            footCell.colSpan = columns.length;
            footCell.innerHTML = "...";
            footCell.style.textAlign = "center";
            footCell.style.userSelect = "none";
            footCell.style.MozUserSelect = "none";
            footCell.style.cursor = "pointer";
            footCell.onclick = function () {
                thisSimpleTable.showRows();
            }
            showingFootLoader = true;
        }
    };
    
    this.hideFootLoader = function () {
        if (showingFootLoader) {
            tableFoot.deleteRow(-1);
            showingFootLoader = false
        }
    };
    
    this.orderBy = function (columnName) {
        this.truncate();
        rows = rows.sort(function(a, b){
            if(a.getRowData(columnName)+"" < b.getRowData(columnName)+"") return -1;
            if(a.getRowData(columnName)+"" > b.getRowData(columnName)+"") return 1;
            return 0;
        });
        this.showRows(this.maxInitialRows);
    };
    
    this.truncate = function () {
        visibleRows = 0;
        this.rows.truncate();
        this.hideFootLoader();
        var newtableBody = document.createElement("tbody");
        tableBody.parentNode.removeChild(tableBody);
        tableBody = table.createTBody();
    };
    
    this.empty = function () {
        initialAdd = true;
        rows = [];
        this.truncate();
    };
    
    this.addColumn = function (name, header, fieldFactory) {
        columns.push(name);
        fieldFactories.push(fieldFactory || null);
        var cell = headerRow.insertCell(-1);
        cell.style.padding = "0px";
        var label = new JuiS.Label(function () {
            this.enablePaintEvents = true;
            this.on("paint", function (event) {
                if (event.data.property === "width"
                    || event.data.property === "borderLeftWidth"
                    || event.data.property === "borderRightWidth"
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
        if (initialAdd) {
            this.showRows(this.maxInitialRows);
        }
        initialAdd = false;
    };
    
    this.addRow = function(rowData) {
        var row = new RowElement(rowData);
        rows.push(row);
    };
    
    this.showRows = function (qty) {
        var qty = qty || this.maxInitialRows;
        var rowIndex;
        var showingAll = false;
        for (rowIndex = visibleRows; rowIndex < visibleRows + qty; rowIndex += 1) {
            if (rows[rowIndex] === undefined) {
                showingAll = true;
                this.hideFootLoader();
                break;
            }
            rows[rowIndex].addToTable();
        }
        visibleRows = rowIndex;
        if (!showingAll) {
            this.showFootLoader();
        }
    };
    
    var RowElement = function (rowData) {
        var tableRow,
            thisRow = this,
            inited = false;
        
        this.getRowData = function (column) {
            if (column) {
                return rowData[column];
            }
            return rowData;
        }
        
        this.addToTable = function () {
            if (!inited) {
                this.createElement();
                this.createColumns();
                inited = true;
            } else {
                tableBody.appendChild(this.node);
            }
            thisSimpleTable.rows.addElement(this);
        };
        
        this.createColumns = function () {
            columns.forEach(function (column, index) {
                var fieldFactory = fieldFactories[index] || labelFieldFactory;
                thisRow.createColumn(column, fieldFactory);
            });
        };
        
        this.createColumn = function(column, fieldFactory) {
            var field = fieldFactory(column, rowData);
            var cell = tableRow.insertCell(-1);
            cell.appendChild(field.node || field);
        };
        
        this.createElement = function () {
            tableRow = tableBody.insertRow(-1);
            this.initElement(tableRow);
            var hoverState = this.createState("hover");
            this.on("mouseEnter", function () {
                hoverState.activate();
            });
            this.on("mouseLeave", function () {
                hoverState.deactivate();
            });
        };
    }.addMixin(JuiS.ElementMixin);
    
    var labelFieldFactory = function (key, rowData) {
        return new JuiS.Label(function () {
            this.text = rowData[key];
            this.height = "100%";
            this.font = "arial";
            this.fontSize = "1em";
            this.overflow = "hidden";
            this.title = rowData[key];
            this.paddingLeft = "3px";
        });
    };
    
    if (typeof callback === "function") {
        callback.call(this);
    }
}.addMixin(JuiS.ElementMixin).addMixin(function staticSimpleTable() {
    this.maxInitialRows = 500;
});