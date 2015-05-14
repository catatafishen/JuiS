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
        
        function resolveAttachements() {
            attachementRules.forEach(function (rule, index) {
                if (views[rule.childName] !== undefined) {
                    if (rule.parent === "root") {
                        thisModule.rootView = views[rule.childName];
                        thisModule.trigger("rootViewAttached", {rootView: thisModule.rootView});
                        attachementRules.splice(index, 1);
                    } else {
                        if (typeof rule.parent === "string") {
                            if (views[rule.parent] !== undefined) {
                                if (typeof views[rule.parent].attachView === "function") {
                                    views[rule.parent].attachView(views[rule.childName]);
                                    attachementRules.splice(index, 1);
                                } else {
                                    throw new Error("attachView must be defined on parent")
                                }
                            }
                        } else {
                            rule.parent.addChild(views[rule.childName], rule.name);
                            attachementRules.splice(index, 1);
                        }
                    }
                }
            });
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
            viewChildNames = [],
            attachementRules = [];
        
        this.controller = function(controllerBody, viewName) {
            if (JuiS.inited) {
                if (viewName !== undefined) {
                    viewController(controllerBody, viewName);
                } else {
                    controllerBody.apply(this);
                }
            } else {
                controllers.push({"controllerBody": controllerBody, "viewName": viewName});
            }
        };
        
        JuiS.on("init", function () {
            controllers.forEach(function (controller) {
                thisModule.controller(controller.controllerBody, controller.viewName);
            });
        });
        
        this.view = function(viewName, rootComponent, childNames) {
            var childNames = childNames || [];
            if (views[viewName] === undefined) {
                views[viewName] = rootComponent;
                resolveAttachements();
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
        
        this.attachView = function(parent, childName, viewName) {
            if (childName === undefined) {
                childName = parent;
                parent = "root";
            }
            attachementRules.push({childName: childName, parent: parent, name: viewName});
            resolveAttachements();
        };
    }.addMixin(JuiS.ListenableMixin);
    
    var modules = {};

    JuiS.module = function (moduleName, controllerBody) {
        if (JuiS !== window.JuiS) {
            JuiS = window.JuiS;
        }
        if (modules[moduleName] === undefined) {
            modules[moduleName] = new Module();
        }
        if (controllerBody !== undefined) {
            modules[moduleName].controller(controllerBody);
        }
        return modules[moduleName];
    };
}(JuiS || (window.JuiS = {})));