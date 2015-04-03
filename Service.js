(function (JuiS) {
    "use strict";
    JuiS.Service = function () {
        
        this.addMethod = function (url, methodName, parameters) {
            this[methodName] = function () {
                var output = {};
                var args = arguments;
                parameters.forEach(function(parameter, index) {
                    output[parameter] = args[index];
                });
                return new this.Request(url, output);
            };
        };
        
        this.Request = function (url, output) {
            function onResponse(data) {
                that.createEvent("done", data);
                if (data.response) {
                    that.createEvent("response", data.response);
                }
                if (data.errors) {
                    data.errors.forEach(function (error) {
                        that.createEvent("error", error);
                    });
                }
            }
            var that = this;
            JuiS.AJAX(url, onResponse, output);
        };
        this.Request.addMixin(JuiS.ListenableMixin);
    };
}(JuiS || (window.JuiS = {})));