(function (JuiS) {
    JuiS.translator = new (function () {
        var language = {};
        var bindings = [];
        function getLanguagePart() {
            var args = [].slice.call(arguments, 0);
            var lang = language;
            args.forEach(function(argument) {
                if (lang[argument] === undefined) {
                    lang[argument] = {};
                }
                lang = lang[argument];
            });
            return lang;
        }
        
        function updateBindings() {
            function bind(lang, view) {
                Object.keys(lang).forEach(function (key) {
                    if (typeof lang[key] === "object" && typeof view[key] === "object") {
                        bind(lang[key], view[key]);
                        return;
                    }
                    view[key] = lang[key];
                });
            }
            bindings.forEach(function(binding) {
                bind(binding.lang, binding.view);
            });
        }
        
        function bind(view, lang) {
            var lang = lang || language;
            bindings.push({"lang": lang, "view": view});
        }
        
        function translate(lang, args) {
            var args = [].slice.call(arguments, 1);
            args.every(function (key, depth) {
                lang = lang[key];
                if (typeof lang === "object") {
                    return true;
                } else {
                    if (depth < args.length - 1) {
                        lang = args.join(".");
                    }
                }
            });
            return lang;
        }
        
        function deepExtend(destination, source) {
            for (var property in source) {
                if (source[property] && source[property].constructor &&
                source[property].constructor === Object) {
                    destination[property] = destination[property] || {};
                    arguments.callee(destination[property], source[property]);
                } else {
                    destination[property] = source[property];
                }
            }
            return destination;
        };
        
        function curry() {
            var args = [].slice.call(arguments, 0);
            var lang = getLanguagePart.apply(this, arguments);
            return {
                bind: function (view) {
                    return bind.call(this, view, lang);
                },
                translate: function () {
                    translate.call(this, lang, [].slice.call(arguments, 0));
                },
                curry: function () {
                    return curry.call(this, args.concat([].slice.call(arguments, 0)));
                }
            }
        };
        
        this.curry = function () {
            return curry.apply(this, arguments);
        }
        
        this.bind = function (view) {
            return bind(view);
        };
        
        this.translate = function () {
            return translate.apply(this, [language].concat(arguments));
        };
        
        this.loadTranslation = function(translationData, args) {
            var argsArray = [].slice.call(arguments, 1); // All except first
            var lang = getLanguagePart.apply(this, argsArray);
            deepExtend(lang, translationData);
            updateBindings();
            this.trigger("translationAvailable");
        };
        
        
    }.addMixin(JuiS.ListenableMixin))();
}(JuiS || (window.JuiS = {})));