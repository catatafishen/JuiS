var GUI_Container = JuiS.Container = function () {
    this.initContainer();
    this.callback(arguments);
}.addMixin(GUI_ContainerMixin);