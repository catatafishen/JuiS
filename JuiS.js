(function (JuiS) {
    var JuiS = window.JuiS = new (function () {
        Object.keys(JuiS).forEach(function (key) {
            this[key] = JuiS[key];
        }, this);
    }.addMixin(JuiS.ElementMixin))();
    
    document.addEventListener("DOMContentLoaded", function () {
        JuiS.initElement(document.body);
        JuiS.window = window;
        window.addEventListener("scroll", function (event) {
            if (event.target === document) {
                JuiS.trigger("scroll");
            }
        });
        
        JuiS.document = new (function () {
            this.initElement(document.documentElement);
            this.nextListenable = JuiS;
        }.addMixin(JuiS.ElementMixin))();
        JuiS.inited = true;
        JuiS.trigger("init");
    });
    
    JuiS.component = function (componentName, constructor) {
        var args = [].slice.call(arguments, 1);
        function Component() {
            return JuiS[componentName].apply(this, args);
        }
        Component.prototype = JuiS[componentName].prototype;
        return new Component();
    };
    
}(JuiS || (window.JuiS = {})));