var GUI_DualView = function (callback) {
    "use strict";
    this.initElement();
    var thisDualView = this;
    
    this.left = new GUI_Container();
    this.right = new GUI_Container();
    
    this.leftWidth = "50%";
    this.rightWidth = "50%";
    
    
    
    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        elementPaint.call(this, newProperties, transition);
        
        this.left.float = "left";
        this.left.width = this.leftWidth;
        this.left.display = "block";
        this.left.backgroundColor = "green";
        this.left.paint();
        this.node.appendChild(this.left.node);
        
        this.right.float = "right";
        this.right.width = this.rightWidth;
        this.right.display = "block";
        this.right.backgroundColor = "red";
        this.right.paint();
        this.node.appendChild(this.right.node);
    };
    if (callback && callback.call) {
        callback.call(this);
    }
    this.paint();
}.addMixin(GUI_ElementMixin);