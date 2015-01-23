﻿JuiS.SimpleTable = function (callback) {
    "use strict";
    this.initElement();
    var thisSimpleTable = this;
    var nodeStyle = this.node.style;
    var initialAdd = true;
    var columns = [];
    var orderedByColumn;
    
    var rows = [];
    this.rows = new JuiS.ElementArray();
    this.rows.relayProperty("background");
    this.rows.relayProperty("height");
    this.rows.relayState("hover");
    this.rows.relayState("selected");
    
    var selectedRows = [];
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

    var triggerSelectionChange = function () {
        thisSimpleTable.trigger("selectionChange", selectedRows.map(function (row) {
            return row.getRowData();
        }));
    }
    
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
    
    var stringSort = function (a, b) {
        if(a + "" < b + "") return -1;
        if(a + "" > b + "") return 1;
        return 0;
    }
    
    this.orderBy = function (column, reverse) {
        if (typeof column === "string") {
            columns.some(function (searchColumn) {
                if (searchColumn.name = column) {
                    column = searchColumn;
                    return true;
                }
            });
        }
        this.truncate();
        column.sort();
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
    
    this.addColumn = function (column, styler) {
        columns.push(column);
        column.fieldFactory = column.fieldFactory || labelFieldFactory;
        column.sort = column.sort || stringSort;
        var cell = headerRow.insertCell(-1);
        cell.style.padding = "0px";
        var label = new JuiS.Label(function () {
            this.enablePaintEvents = true;
            this.on("click", function () {
                thisSimpleTable.orderBy(column);
            });
            var ascState = this.createState("asc");
            var descState = this.createState("desc");
            this.cursor = "pointer";
            this.width = "auto";
            this.on("paint", function (event) {
                if (event.data.property === "width"
                    || event.data.property === "marginLeft"
                    || event.data.property === "marginRight") {
                    cell.style.width = this.countHorisontalDisplacement();
                }
            });
            if (typeof styler === "function") {
                styler.call(this);
            }
            this.text = column.text;
            this.showOrderIndicator = function (order) {
                if (order === "asc") {
                    ascState.activate();
                    descState.deactivate();
                } else {
                    ascState.deactivate();
                    descState.activate();
                }
            };
            
            this.hideOrderIndicator = function () {
                ascState.deactivate();
                descState.deactivate();
            };
        });
        
        headers[name] = label;
        cell.appendChild(label.node);
        label.nextListenable = this;
        
        
        column.noSort = function () {
            label.hideOrderIndicator();
            column.order = undefined;
        }
        
        column.sort = function (reverse) {
            if (orderedByColumn && orderedByColumn !== this) {
                orderedByColumn.noSort();
            }
            orderedByColumn = this;
            if (column.order === "desc" || (column.order === undefined && reverse === true)) {
                column.order = "asc";
            } else {
                column.order = "desc";
            }
            rows.sort(function(a, b){
                return stringSort(a.getRowData(column.key), b.getRowData(column.key));
            });
            if (column.order === "asc") {
                rows.reverse();
            }
            label.showOrderIndicator(column.order);
        }
        
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
    
    this.clearSelection = function () {
        selectedRows.forEach(function (row) {
            row.unselect();
        });
    };
    
    var RowElement = function (rowData) {
        var tableRow, selectedState,
            selected = false,
            thisRow = this,
            inited = false;
        
        this.getRowData = function (key) {
            if (key) {
                return rowData[key];
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
                thisRow.createColumn(column.key, column.fieldFactory);
            });
        };
        
        this.createColumn = function(key, fieldFactory) {
            var field = fieldFactory(key, rowData);
            field.nextListenable = this;
            var cell = tableRow.insertCell(-1);
            cell.appendChild(field.node || field);
        };
        
        this.select = function () {
            if (thisSimpleTable.selection !== "none") {
                if (thisSimpleTable.selection === "one") {
                    thisSimpleTable.clearSelection();
                }
                selectedRows.push(this);
                triggerSelectionChange();
                selected = true;
                selectedState.activate();
            }
        };
        
        this.unselect = function () {
            selectedRows.remove(this);
            triggerSelectionChange();
            selected = false;
            selectedState.deactivate();
        };
        
        this.createElement = function () {
            tableRow = tableBody.insertRow(-1);
            this.initElement(tableRow);
            var hoverState = this.createState("hover");
            selectedState = this.createState("selected");
            this.on("mouseEnter", function () {
                hoverState.activate();
            });
            this.on("mouseLeave", function () {
                hoverState.deactivate();
            });
            this.on("click", function () {
                if (!selected) {
                    this.select();
                } else {
                    this.unselect();
                }
            });
        };
    }.addMixin(JuiS.ElementMixin);
    
    var labelFieldFactory = function (key, rowData) {
        return new JuiS.Label(function () {
            this.text = rowData[key];
            this.font = "arial";
            this.fontSize = "1em";
            this.overflow = "hidden";
            this.title = rowData[key];
            this.paddingLeft = "3px";
        });
    };
    
    this.addProperty("selection", function(value) {
        this.clearSelection();
        if (value !== "none" && value !== "one" && value !== "many") {
            throw new Error("selection property must be either 'none', 'one' or 'many'");
        }
    }, "none");
    
    this.callback(arguments);
}.addMixin(JuiS.ElementMixin).addMixin(function staticSimpleTable() {
    this.maxInitialRows = 30;
});