document.addEventListener("DOMContentLoaded", function () {
    console.log(JuiS);
    var oldJuiS = JuiS;
    JuiS = new (function () {
        Object.keys(oldJuiS).forEach(function (key) {
            this[key] = oldJuiS[key];
        }, this);
        this.initElement(document.body);
        this.window = window;
        this.createDOMEventRelay("onscroll", "scroll");
    }.addMixin(oldJuiS.ElementMixin))();
    
    JuiS.document = new (function () {
        this.initElement(document.documentElement);
        this.nextListenable = JuiS;
    }.addMixin(oldJuiS.ElementMixin))();
});