(function (JuiS) {
    "use strict";
    var Module = function () {
            
        function viewController(controllerBody, viewName) {
            if (viewControllers[viewName] === undefined) {
                viewControllers[viewName] = controllerBody;
            } else {
                throw new Error("A view can only have one controller"); // If needed we could
                //store the controllers in an array for every view instead.
            }
            runViewController(viewName);
        }
        
        function runViewController(viewName) {
            var children = {};
            if (viewControllers[viewName] !== undefined
                && views[viewName] !== undefined
                && viewChildNames[viewName].every(function (childName) {
                    return children[childName] = views[childName];
                })
            ) {
                viewControllers[viewName].call(thisModule, views[viewName], children);
                delete viewControllers[viewName];
            }
        }
        
        function isControllerAndViewsAvailable(viewName) {
                if (viewControllers[viewName] !== undefined &&
                    Object.keys(children).each(function (childName) {
                        return children[childName] !== undefined;
                    })
                ) {
                    viewControllers[viewName].call(this, rootComponent, children);
                }
        }
        
        var Hook = function () {
            var waitingAttachments = [];
            var attachmentFunction;
            this.nextListenable = thisModule;
            this.module = thisModule;
            this.attach = function () {
                var args = [].slice.call(arguments);
                if (attachmentFunction !== undefined) {
                    attachmentFunction.apply(this, args);
                } else {
                    waitingAttachments.push(args);
                }
            };
            this.setAttachmentFunction = function (newAttachmentFunction) {
                if (attachmentFunction) {
                    throw new Error("Attachment method for hook already set");
                }
                attachmentFunction = newAttachmentFunction;
                var attachment;
                while (waitingAttachments.length > 0) {
                    attachmentFunction.apply(this, waitingAttachments.shift());
                }
            };
        }.addMixin(JuiS.ListenableMixin);
        
        var thisModule = this,
            initialized = true,
            controllers = [],
            hooks = {},
            services = {},
            stylers = {},
            viewControllers = {},
            views = {},
            viewParentNames = [],
            viewChildNames = [];
        
        this.controller = function(controllerBody, viewName) {
            if (viewName !== undefined) {
                viewController(controllerBody, viewName);
            } else {
                controllerBody.apply(this);
            }
        };
        
        this.view = function(viewName, rootComponent, childNames) {
            var childNames = childNames || [];
            if (views[viewName] === undefined) {
                views[viewName] = rootComponent;
                viewChildNames[viewName] = childNames;
                childNames.forEach(function (childName) {
                    viewParentNames[childName] = viewParentNames[childName] || [];
                    viewParentNames[childName].push(viewName);
                });
                viewParentNames[viewName] = viewParentNames[viewName] || [];
                viewParentNames[viewName].forEach(function (parentName) {
                    runViewController(parentName);
                });
                runViewController(viewName);
            } else {
                throw new Error("View " + viewName + " is already defined");
            }
        };
        
        this.service = function (serviceName) {
            // console.log(serviceName);
            if (services[serviceName] === undefined) {
                services[serviceName] = new JuiS.Service();
            }
            return services[serviceName];
        };
        
        this.hook = function (hookName, attachmentFunction) {
            
            if (hooks[hookName] === undefined) {
                hooks[hookName] = new Hook();
            }
            if (attachmentFunction !== undefined) {
                hooks[hookName].setAttachmentFunction(attachmentFunction);
            }
            return hooks[hookName];
        };
        
        this.styler = function (stylerName, stylerFunction) {
            if (stylers[stylerName] === undefined) {
                if (stylerFunction !== undefined) {
                    stylers[stylerName] = stylerFunction;
                } else {
                    throw new Error("Styler " + stylerName + " is not defined");
                }
            } else {
                if (stylerFunction !== undefined) {
                    throw new Error("Styler " + stylerName + " is already defined");
                }
            }
            return stylers[stylerName];
        };
        
        // this.initialize = function () {
            // if (initialized) {
                // return;
            // }
            // var controller;
            // initialized = true;
            // while (controllers.length > 0) {
                // controller = controllers.shift();
                // this.controller(controller.body, controller.view);
            // }
        // };
    }.addMixin(JuiS.ListenableMixin);
    
    var modules = {};

    JuiS.module = function (moduleName, controllerBody) {
        if (modules[moduleName] === undefined) {
            modules[moduleName] = new Module();
        }
        if (controllerBody !== undefined) {
            modules[moduleName].controller(controllerBody);
            // modules[moduleName].initialize();
        }
        return modules[moduleName];
    };
}(JuiS || (window.JuiS = {})));