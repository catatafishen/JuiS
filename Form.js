JuiS.Form = function (callback) {
    "use strict";
    this.initContainer();
    
    this.TextFields = new JuiS.ElementArray();
    this.TextFields.relayProperty("backgroundColor");
    this.TextFields.relayProperty("width");
    this.TextFields.relayProperty("height");
    this.TextFields.relayProperty("margin");
    this.TextFields.relayProperty("fontSize");
    this.TextFields.relayProperty("font");
    
    
    var top = this.addChild(new JuiS.Container());
    this.header = top.addChild(new JuiS.Label());
    this.header.width = "50%";
    this.header.font = "arial";
    this.header.fontSize = "1.5em";
    this.header.display = "inline-block";
    this.toolbar = top.addChild(new JuiS.Container());
    this.toolbar.width = "50%";
    this.toolbar.display = "inline-block";
    this.toolbar.node.style.textAlign = "right";
    
    this.fields = {};
    this.useColumns = false;
        
    this.callback(arguments);
}.addMixin(GUI_ContainerMixin).addMixin(function StaticForm() {


    this.createFieldContainer = function(label, field, labelPosition) {
        var fieldContainer = new JuiS.Container();
        if (!this.useColumns) {
            fieldContainer.display = "inline-block";
        }
        label.for = field;
        fieldContainer.align = "left";
        fieldContainer.addChild(label);
        fieldContainer.addChild(field);
        return fieldContainer;
    };
    
    this.addColumn = function() {
        var column = new JuiS.Container();
        if (this.useColumns) {
            column.display = "inline-block";
        }
        column.node.style.verticalAlign = "top";
        this.addChild(column);
        return column;
    };
    
    this.addFieldReference = function (name, field) {
        if (this.fields[name] !== undefined) {
            throw new Error("Cannot have multiple fields with same name")
        }
        this.fields[name] = field;
    };
    
    this.getElementArray = function (type) {
        return this[type + "s"];
    };
    
    this.getValue = function () {
        var value = {};
        Object.keys(this.fields).forEach(function (key) {
            value[key] = this.fields[key].getValue();
        },this);
        return value;
    };
    
    this.build = function (structure) {
        var column = this.addColumn();
        structure.forEach(function(formElementDescription) {
            if (formElementDescription.type === "break") {
                column = this.addColumn();
                return;
            }
            var label = new JuiS.Label();
            label.text = formElementDescription.label;
            
            var field = new JuiS[formElementDescription.type];
            this.addFieldReference(formElementDescription.name, field);
            this.getElementArray(formElementDescription.type).addElement(field);
            Object.assign(field, formElementDescription);
            
            
            var fieldContainer = this.createFieldContainer(label, field, formElementDescription.labelPosition);
            
            column.addChild(fieldContainer);
        }, this);
    };
});