var GUI_Container = function (callback) {
    this.initContainer();
    if (callback && callback.call) {
        callback.call(this);
    }
    this.paint();
}.addMixin(GUI_ContainerMixin);