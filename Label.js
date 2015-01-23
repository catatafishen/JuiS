JuiS.Label = function () {
    "use strict";

    this.initElement("LABEL");
    this.display = "block";
    this.callback(arguments);
    
}.addMixin(JuiS.ElementMixin).addMixin(function StaticLabel() {
    
    //Add properties
    this.addProperty("textColor", function(value) {this.node.style.color = value;});
    this.addProperty("font", function(value) {this.node.style.fontFamily = value;});
    this.addProperty("fontSize", "nodeStyle");
    this.addProperty("fontWeight", "nodeStyle");
    this.addProperty("textAlign", "nodeStyle");
    this.addProperty("textRotation", "nodeStyle");
    this.addProperty("lineHeight", "nodeStyle");
    this.addProperty("textShadow", "nodeStyle");
    this.addProperty("textOverflow", "nodeStyle", "ellipsis");
    this.addProperty("text", function(value) {
        this.node.innerHTML = "";
        var text;
        if (value === null) {
            text = "null";
        } else if (value === undefined) {
            text = "";
        } else {
            text = value.toString();
        }
        this.node.appendChild(document.createTextNode(text.replace(/ /g, "\u00a0")));
    }, "Label");
    this.addProperty("for", function(node) {
        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            return text;
        }
        if (!(node instanceof Node)) {
            node = node.node;
        }
        node.id = makeid();
        this.node.htmlFor = node.id;
    });
});