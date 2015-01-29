JuiS.Form = function (callback) {
    "use strict";
    this.initContainer();
    
    this.TextFields = new JuiS.ElementArray(JuiS.TextField);
    this.TextFields.init();
    
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
    this.content = this.addChild(new JuiS.Container());
    this.content.overflowY = "auto";
    
    this.fields = {};
    this.useColumns = false;
    this.initialValues = {};
        
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
        this.content.addChild(column);
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
        Object.keys(this.initialValues).forEach(function (key) {
            if (value[key] === undefined) {
                value[key] = this.initialValues[key];
            }
        },this);
        return value;
    };
    
    this.reset = function () {
        Object.keys(this.fields).forEach(function (key) {
            this.fields[key].value = this.initialValues[key];
        }, this);
    };
    
    this.empty = function () {
        this.initialValues = {};
        Object.keys(this.fields).forEach(function (key) {
            this.fields[key].value = "";
        }, this);
    };
    
    this.populate = function (data) {
        this.initialValues = data;
        this.reset();
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
            this.initialValues[formElementDescription.name] = formElementDescription.value;
            
            var fieldContainer = this.createFieldContainer(label, field, formElementDescription.labelPosition);
            
            column.addChild(fieldContainer);
        }, this);
    };
});