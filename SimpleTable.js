JuiS.SimpleTable = function (callback) {
    "use strict";
    this.initElement();
    var thisSimpleTable = this;
    var nodeStyle = this.node.style;
    var initialAdd = true;
    var columns = [];
    var orderedByColumn;
    
    var filteredRows;
    var rows = [];

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
    var filterRow = header.insertRow(-1);
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
    
    this.getColumnByKey = function (key) {
        var column;
        columns.some(function (searchColumn) {
            if (searchColumn.key === key) {
                column = searchColumn;
                return true;
            }
        });
        return column;
    };
    
    this.orderBy = function (column, reverse) {
        if (typeof column === "string") {
            column = this.getColumnByKey(column);
        }
        this.truncate();
        column.sort();
        this.showRows(this.maxInitialRows);
    };
    
    var filters = {};
    this.filter = function (key, filter) {
        var filterFunction = function (value, filter) {
            var value = "" + value; //Ensure value is a string
            if (typeof filter !== "string" || filter === "") {
                return true;
            }
            value = value.toLowerCase();
            filter = filter.toLowerCase();
            return (value.indexOf(filter) >= 0);
        }
        filters[key] = filter;
        this.truncate();
        filteredRows = [];
        rows.forEach(function (row, index, filterArray) {
            var rowData = row.getRowData();
            var goingToAdd = true;
            Object.keys(filters).forEach(function (key) {
                if (goingToAdd === false) {
                    return;
                }
                var value = rowData[key];
                var column = thisSimpleTable.getColumnByKey(key);
                if (typeof column.getValue === "function") {
                    value = column.getValue(key, rowData);
                }
                if (!filterFunction(value, filters[key])) {
                    goingToAdd = false;
                }                
            });
            if (goingToAdd) {
                filteredRows.push(row);
            }
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
        filteredRows;
        rows = [];
        this.truncate();
        this.filters.value = "";
    };
    
    this.addColumn = function (column) {
        columns.push(column);
        column.fieldFactory = column.fieldFactory || labelFieldFactory;
        var cell = headerRow.insertCell(-1);
        cell.style.padding = "0px";
        cell.style.width = column.width;
        var label = new JuiS.Label(function () {
            this.enablePaintEvents = true;
            this.on("click", function () {
                thisSimpleTable.orderBy(column);
            });
            var ascState = this.createState("asc");
            var descState = this.createState("desc");
            this.cursor = "pointer";
            this.width = "auto";
            if (typeof column.headerStyler === "function") {
                column.headerStyler.call(this);
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
        
        var filterCell = filterRow.insertCell(-1);
        filterCell.style.padding = "0px";
        if (column.filter) {
            var filterComponent = new JuiS.TextField(function () {
                this.on("input", function() {
                    thisSimpleTable.filter(column.key, this.getValue());
                });
            });
            this.filters.addElement(filterComponent);
            filterCell.appendChild(filterComponent.node);
        }
        
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
            
            var sortFunction = function(a, b) {
                var aValue = (typeof column.getValue === "function") ?
                    column.getValue(column.key, a.getRowData()) :
                    a.getRowData(column.key);
                var bValue = (typeof column.getValue === "function") ?
                    column.getValue(column.key, b.getRowData()) :
                    b.getRowData(column.key);
                return stringSort(aValue, bValue);
            };
            rows.sort(sortFunction);
            if (column.order === "asc") {
                rows.reverse();
            }
            if (filteredRows) {
                filteredRows.sort(sortFunction);
                if (column.order === "asc") {
                    filteredRows.reverse();
                }
            }
            label.showOrderIndicator(column.order);
        };
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
        var rowsShowing = filteredRows || rows;
        var showingAll = false;
        for (rowIndex = visibleRows; rowIndex < visibleRows + qty; rowIndex += 1) {
            if (rowsShowing[rowIndex] === undefined) {
                showingAll = true;
                this.hideFootLoader();
                break;
            }
            rowsShowing[rowIndex].addToTable();
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
            var column = thisSimpleTable.getColumnByKey(key);
            if (typeof column.getValue === "function") {
                this.text = column.getValue(key, rowData);
            } else {
                this.text = rowData[key];
            }
            this.font = "arial";
            this.fontSize = "1em";
            this.overflow = "hidden";
            this.title = this.text;
            this.paddingLeft = "3px";
        });
    };
    
    this.addProperty("selection", function (value) {
        this.clearSelection();
        if (value !== "none" && value !== "one" && value !== "many") {
            throw new Error("selection property must be either 'none', 'one' or 'many'");
        }
    }, "none");
    
    this.addProperty("showFilters", function (value) {
        if (value === true) {
            filterRow.style.display = "table-row";
        } else {
            filterRow.style.display = "none";
        }
    });
    
    this.rows = new JuiS.ElementArray();
    var dummyRow = new RowElement();
    dummyRow.createElement();
    this.rows.init(dummyRow);
    this.filters = new JuiS.ElementArray(JuiS.TextField);
    
    this.callback(arguments);
}.addMixin(JuiS.ElementMixin).addMixin(function staticSimpleTable() {
    this.maxInitialRows = 30;
});