document.addEventListener("DOMContentLoaded", function () {
    console.log(JuiS);
    var oldJuiS = JuiS;
    JuiS = new (function () {
        var thisJuiS = this;
        Object.keys(oldJuiS).forEach(function (key) {
            this[key] = oldJuiS[key];
        }, this);
        this.initElement(document.body);
        this.window = window;
        window.addEventListener("scroll", function (event) {
            if (event.target === document) {
                thisJuiS.trigger("scroll");
            }
        });
    }.addMixin(oldJuiS.ElementMixin))();
    
    JuiS.document = new (function () {
        this.initElement(document.documentElement);
        this.nextListenable = JuiS;
    }.addMixin(oldJuiS.ElementMixin))();
});