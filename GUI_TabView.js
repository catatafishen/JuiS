var GUI_TabView = function (callback) {
    "use strict";
    this.initContainer();
    var tabs = [];
    var currentTab;
    var thisTabView = this;
    this.tabHeight = "25px";
    this.tabbarHeight = "27px";
    this.tabColor = "#EEEEEE";
    this.tabColorHover = "#EEEEFF";
    this.tabColorSelected = "#EEEEFF";
    this.tabBackground = "";
    this.tabBackgroundHover = "";
    this.tabBackgroundSelected = "";
    this.tabHoverColorFromContent = true;
    this.tabTextColor = "black";
    this.tabTextColorHover = "blue";
    this.tabTextColorSelected = "black";
    this.tabSpacing = "2px";
    this.font = "Courier New";
    this.fontWeight = "normal";
    this.fontSize = "16px";
    
    this.position = "absolute";
    
    //Add the tabbar normally before nodeAddChild is overloaded
    this.tabbar = this.addChild(new GUI_HorizontalContainer(function () {
        this.spacing = "0px";
        this.verticalAlign = "bottom";
        this.paddingLeft = "2px";
        this.paddingRight = "2px";
    }));
        
    //Overload the nodeAddChild method so that children are not automatically added to the DOM-tree.
    //New children are tabs which are only attached to the DOM-tree when the tab is selected. They 
    //are however considered as children even when not attached and events will propagate normally.
    this.nodeAddChild = function (child) {
        child.node.style.display = "block";
	};
    
	this.addTab = function (name, content, select) {
        var oldTab = getTab(name);
        if (oldTab) {
            this.removeTab(name);
        }
        var tab = {"name": name, "content": content};
        content.nextListenable = this;
        content.setIndicator = this.setIndicator;
        content.removeIndicator = function () {thisTabView.removeIndicator(name)};
        var position = tabs.push(tab) - 1;
        tab.button = thisTabView.tabbar.addChild(new GUI_Button(function () {
            this.text = name;
            this.width = "auto";
            this.height = thisTabView.tabHeight;
            this.backgroundColor = thisTabView.tabColor;
            if (thisTabView.tabHoverColorFromContent) {
                this.backgroundColorHover = content.backgroundColor;
            } else {
                this.backgroundColorHover = this.tabColorHover;
            }
            this.textColor = thisTabView.tabTextColor;
            this.textColorHover = thisTabView.tabTextColorHover;
            this.background = thisTabView.tabBackground;
            this.backgroundHover = thisTabView.tabBackgroundHover;//sdfgdfgdfgfd
            this.font = thisTabView.font;
            this.fontSize = thisTabView.fontSize;
            this.fontWeight = thisTabView.fontWeight;
            this.borderBottomLeftRadius = "0px";
            this.borderBottomRightRadius = "0px";
            this.marginLeft = thisTabView.tabSpacing;
            this.marginRight = thisTabView.tabSpacing;
            this.addListener("click", function (event) {
                thisTabView.selectTab(position);
            });
        }));
        if (select) {
            thisTabView.selectTab(position);
        }
        return content;
	};
    var getTab = function(tabId) {
        var tab;
        if (typeof tabId === "number") {
            tab = tabs[tabId];
        } else if (typeof tabId === "string") {
            tab = thisTabView.getTabByName(tabId);
        }
        return tab;
    };
    
    this.setIndicator = function(tab, indicator) {
        return getTab(tab).button.setIndicator(indicator);
    };
    this.removeIndicator = function(tab) {
        return getTab(tab).button.removeIndicator();
    };
    this.removeTab = function (tab) {
        var removedTab = getTab(tab);
        this.removeChild(removedTab.content);
        this.tabbar.removeChild(removedTab.button);
        if (currentTab === removedTab) {
            currentTab = undefined;
        }
    };
    this.getTabByName = function (name) {
        var foundTab;
        var tabIterator = new Iterator(tabs);
        tabIterator.iterate(function (tab) {
            if (tab.name === name) {
                foundTab = tab;
                return false;
            }
        });
        return foundTab;
    };
    
    this.selectTab = function (tab) {
        var newSelectedTab = getTab(tab);
        if (newSelectedTab !== currentTab) {
            if (currentTab) {
                currentTab.content.createEvent("focusLost", {});
                thisTabView.detachChild(currentTab.content);
                currentTab.button.textColor = thisTabView.tabTextColor;
                currentTab.button.backgroundColor = thisTabView.tabColor;
                currentTab.button.background = thisTabView.tabBackground;
                currentTab.button.hoverEffectsEnabled = true;
                currentTab.button.paint();
            }
            currentTab = newSelectedTab;
            var content = currentTab.content;
            content.position = "absolute";
            content.width = "auto";
            content.height = "auto";
            content.left = "0px";
            content.top = thisTabView.tabbarHeight;
            content.right = "0px";
            content.bottom = "0px";
            content.paint();
            this.attachChild(content);
            var button = currentTab.button;
            button.textColor = thisTabView.tabTextColorSelected;
            button.backgroundColor = thisTabView.tabColorSelected;
            button.background = thisTabView.tabBackgroundSelected;
            button.hoverEffectsEnabled = false;
            button.paint();
            content.createEvent("focus", {});
        }
    };

    var elementPaint = this.paint;
    this.paint = function (newProperties, transition) {
        elementPaint.call(this, newProperties, transition);
        thisTabView.tabbar.height = this.tabbarHeight;
        thisTabView.tabbar.paint();
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
};
GUI_TabView.addMixin(GUI_ContainerMixin);