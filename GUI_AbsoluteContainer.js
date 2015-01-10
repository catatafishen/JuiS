var GUI_Container = JuiS.Container = function (callback) {
    this.initContainer();
    if (callback && callback.call) {
        callback.call(this);
    }
}.addMixin(GUI_ContainerMixin);