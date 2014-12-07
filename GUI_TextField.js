var GUI_TextField = function (callback) {
    "use strict";
    this.initElement();
    var thisTextField = this;
    this.textColor = "black";
    this.font = "Courier New";
    this.fontSize = "11px";
    this.fontWeight = "normal";
    this.textAlign = "left";
    this.width = "100%";
    this.enabled = true;
    this.tabComplete;
    this.multiLine = false;
    this.placeholder = ""
    
    this.tabCompleteErrorColor = "red";
    this.tabCompleteErrorDelay = "200";
    this.tabCompleteCaseSensitive = false;
    
    var textArea = document.createElement("TEXTAREA");
    textArea.style.display = "block";
    textArea.style.width = "100%";
    textArea.style.height = "100%";
    textArea.style.padding = "0px";
    textArea.style.margin = "0px";
    textArea.style.border = "0px";
    textArea.style.outline = "0";
    textArea.style.background = "transparent";
    var textField = document.createElement("INPUT");
    textField.type = "text";
    textField.style.display = "block";
    textField.style.width = "100%";
    textField.style.height = "100%";
    textField.style.padding = "0px";
    textField.style.margin = "0px";
    textField.style.border = "0px";
    textField.style.outline = "0";
    textField.style.background = "transparent";
    this.node.appendChild(textField);
    this.createDOMEventRelay("onkeydown", "keydown", {}, textField);
    this.createDOMEventRelay("onkeydown", "keydown", {}, textArea);
    this.getValue = function() {
        if (this.multiLine) {
            return textArea.value;
        } else {
            return textField.value;
        }
    };
    
    //TabCompleter
    var suggestions;
    var suggestionNumber;
    var suggest = function(suggestion) {
        if (suggestions.length === 0) {
            textField.style.color = thisTextField.tabCompleteErrorColor;
            textField.style.transition = "all " + thisTextField.tabCompleteErrorDelay +
                "ms ease 0ms"
            setTimeout(function() {
                textField.style.color = thisTextField.textColor;
            }, thisTextField.tabCompleteErrorDelay);
        } else {
            if (suggestionNumber === suggestions.length) {
                suggestionNumber = 0;
            }
            var breakPoint = textField.value.lastIndexOf(" ");
            var text = textField.value.substr(0, breakPoint + 1);
            text += suggestion;
            textField.value = text;
        }
    };
    this.addListener("keydown", function (event) {
        if (thisTextField.tabComplete) {
            var DOMEvent = event.data.DOMEvent;
            //keyCode 9 is tab
            if (DOMEvent.keyCode === 9 && !DOMEvent.shiftKey && !DOMEvent.ctrlKey) {
                event.data.DOMEvent.preventDefault();
                if (suggestions) {
                    suggest(suggestions[suggestionNumber++]);
                } else {
                    //Find the last word (=sub-string after last white space)
                    var uncompleted = textField.value.split(" ").pop();
                    if (!thisTextField.tabCompleteCaseSensitive) {
                        uncompleted = uncompleted.toLowerCase();
                    }
                    suggestionNumber = 0;
                    suggestions = [];
                    var wordIterator = new Iterator(thisTextField.tabComplete);
                    wordIterator.iterate(function (word) {
                        var suggestionTest = word.substr(0, uncompleted.length);
                        if (!thisTextField.tabCompleteCaseSensitive) {
                            suggestionTest = suggestionTest.toLowerCase();
                        }
                        if (uncompleted === suggestionTest) {
                            suggestions.push(word);
                        }
                    });
                    suggest(suggestions[suggestionNumber++]);
                }
            } else {
                suggestions = undefined;
            }
        }
    });
    
    
    this.setValue = function(newValue) {
        var input = this.multiLine ? textArea : textField;
        if (newValue !== undefined) {
            input.value = newValue;
        } else {
            input.value = "";
        }
    };
    this.focus = function() {
        var input = this.multiLine ? textArea : textField;
        input.focus();
    }
    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        elementPaint.call(this, newProperties, transition);
        if (!transition) {
            transition = 0;
        }
        textField.style.transition = "all " + transition + "ms ease 0ms"
        textField.style.color = this.textColor;
        textField.style.fontFamily = this.font;
        textField.style.fontSize = this.fontSize;
        textField.style.fontWeight = this.fontWeight;
        textField.style.textAlign = this.textAlign;
        textField.placeholder = this.placeholder;
        textField.disabled = this.enabled ? "" : "TRUE";
        
        textArea.style.transition = "all " + transition + "ms ease 0ms"
        textArea.style.color = this.textColor;
        textArea.style.fontFamily = this.font;
        textArea.style.fontSize = this.fontSize;
        textArea.style.textAlign = this.textAlign;
        textArea.placeholder = this.placeholder;
        textArea.disabled = this.enabled ? "" : "TRUE";
        
        if (this.multiLine) {
            if (textArea.parentNode !== this.node) {
                this.node.removeChild(textField);
                this.node.appendChild(textArea);
            }
        } else {
            if (textField.parentNode !== this.node) {
                this.node.removeChild(textArea);
                this.node.appendChild(textField);
            }
        }
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);