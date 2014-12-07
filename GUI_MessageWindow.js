"use strict";
var GUI_MessageWindow = function (callback) {
    this.initElement();
    var thisMessageWindow = this;
    this.timeColor = "black";
    this.messageColor = "black";
    this.ownMessageColor = "#505050";
    this.highlightColor = "red";
    this.highlightBackgroundColor = "lightGrey";
    this.urlColor = "black";
    this.urlVisitedColor = "black";
    this.urlActiveColor = "black";
    this.urlHoverColor = "#505050";
    this.notificationColor = "grey";
    this.senderColor = "black";
    this.font = "Lucida Console, Courier New";
    this.fontSize = "11px";
    this.width = "100%";
    this.overflowX = "hidden";
    this.overflowY = "hidden";
    this.timeWidth = "60px";
    this.nickWidth = "100px";
    this.timeFormat = "HH:mm:ss";
    this.ownNick;// = attributes.ownNick;
    this.highlightWords = [];// = [this.ownNick];
    this.clickableLinks = true;
    
    var scrollbarWidth = getScrollbarWidth();
    var alertSound = new Audio("sounds/MSN_alert.ogg");
    var messageScrollbarHider = document.createElement("DIV");
    messageScrollbarHider.style.position = "absolute";
    messageScrollbarHider.style.top = "0px";
    messageScrollbarHider.style.left = "0px";
    messageScrollbarHider.style.width = "auto";
    messageScrollbarHider.style.height = "auto";
    messageScrollbarHider.style.right = "-" + scrollbarWidth + "px";
    messageScrollbarHider.style.bottom = "-" + scrollbarWidth + "px";
    messageScrollbarHider.style.overflowX = "scroll";
    messageScrollbarHider.style.overflowY = "scroll";
    
    var messageTable = document.createElement("TABLE");
    messageTable.style.width = "100%";
    messageTable.style.borderSpacing = "0px 1px";
    var loadIndicatorRow = messageTable.insertRow(0);
    var loadIndicator = loadIndicatorRow.insertCell(-1);
    loadIndicator.colSpan = 3;
    
    messageScrollbarHider.appendChild(messageTable);
    this.node.appendChild(messageScrollbarHider);
    
    var linkStyler = document.createElement("a");
    
    var scrolledToTop = false;
    messageScrollbarHider.onscroll = function (event) {
        if (!scrolledToTop && this.scrollTop < this.offsetHeight) {
            scrolledToTop = true;
            thisMessageWindow.createEvent("scrolledToTop");
        } else  if (scrolledToTop && this.scrollTop >= this.offsetHeight) {
            scrolledToTop = false;
        }
    };
    
    this.scrollToBottom = function() {
        loadIndicator.style.height = this.node.offsetHeight + "px";
        messageScrollbarHider.scrollTop = messageScrollbarHider.scrollHeight;
    };
    
    function urlify(text) {
        return text.replace(
            /(https?:\/\/[^\s]+)/g,
            "<a href=\"$1\" target=\"_blank\" class = \"" + linkStyler.className + "\">$1</a>"
        );
    }    
    this.addMessages = function (messageList) {
        var scrollHeight1 = messageScrollbarHider.scrollHeight;
        var messageIterator = new Iterator(messageList);
        messageIterator.iterate(function (message) {
            thisMessageWindow.addMessage(message, true);
        });
        var scrollHeight2 = messageScrollbarHider.scrollHeight;
        //To keep the same messages visible in the window, scroll down the height of the data added.
        messageScrollbarHider.scrollTop += (scrollHeight2 - scrollHeight1);
    };
    this.addMessage = function (messageData, history) {
        var row;
        if (history) {
            row = messageTable.insertRow(1);
        } else {
            row = messageTable.insertRow(-1);
        }
        var timeCell = row.insertCell(-1);
        timeCell.style.verticalAlign = "top";
        timeCell.style.color = this.timeColor;
        timeCell.style.fontFamily = this.font;
        timeCell.style.fontSize = this.fontSize;
        timeCell.style.width = this.timeWidth;
        var timeStringShort = moment(messageData.time).format(this.timeFormat);
        var timeStringLong = moment(messageData.time).format("dddd, MMMM Do YYYY, H:mm:ss");
        //Create a DIV inside the cell to prevent the cell from resizing
        var timeDiv = document.createElement("DIV");
        timeDiv.appendChild(document.createTextNode(timeStringShort));
        timeDiv.style.width = this.timeWidth;
        timeCell.appendChild(timeDiv);
        timeCell.title = timeStringLong;

        var senderCell = row.insertCell(-1);
        senderCell.style.verticalAlign = "top";
        if (!messageData.sender && messageData.own) {
            messageData.sender = this.ownNick
        }
        senderCell.style.color = this.senderColor;
        senderCell.style.fontFamily = this.font;
        senderCell.style.fontSize = this.fontSize;
        senderCell.style.width = this.nickWidth;
        //Create a DIV inside the cell to prevent the cell from resizing
        var senderDiv = document.createElement("DIV");
        senderDiv.style.width = this.nickWidth;
        if (messageData.sender !== null && messageData.sender !== undefined) {
            senderDiv.appendChild(document.createTextNode(messageData.sender));
        }
        senderCell.appendChild(senderDiv);
        
        var messageCell = row.insertCell(-1);
        messageCell.style.verticalAlign = "top";
        messageCell.style.color = this.messageColor;
        messageCell.style.fontFamily = this.font;
        messageCell.style.fontSize = this.fontSize;
        if (messageData.informationText) {
            messageCell.title = messageData.informationText;
        }
        if (messageData.direction === "out") {
            messageCell.style.color = thisMessageWindow.ownMessageColor;
        } else if (messageData.type === "information") {
            messageCell.style.color = thisMessageWindow.notificationColor;
        } else {
            var highlightWordIterator = new Iterator(this.highlightWords);
            highlightWordIterator.iterate(function (word) {
                if (messageData.message.indexOf(word) > -1) {
                    if (!history) {
                        alertSound.play();
                        thisMessageWindow.createEvent("highlight");
                    }
                    messageCell.style.color = thisMessageWindow.highlightColor;
                    row.style.backgroundColor = thisMessageWindow.highlightBackgroundColor;
                    return false;
                }
            });
        }
        var messageDiv = document.createElement("DIV");
        messageDiv.style.wordBreak = "break-all";
        messageDiv.appendChild(document.createTextNode(messageData.message));
        if (this.clickableLinks) {
            messageDiv.innerHTML = urlify(messageDiv.innerHTML);
        }
        messageCell.appendChild(messageDiv);
        if (!history) {
            //When adding messages in a loop it is not necessary to scroll for each message
            this.scrollToBottom();
        }
    };
    var elementPaint = this.paint;
    this.paint = function (newProperties) {
        linkStyler.style.color = this.urlColor;
        linkStyler.style.textDecoration = "none";
        createMiniStyleClass(linkStyler, "default");
        linkStyler.style.color = this.urlVisitedColor;
        createMiniStyleClass(linkStyler, "visited");
        linkStyler.style.color = this.urlActiveColor;
        createMiniStyleClass(linkStyler, "active");
        linkStyler.style.color = this.urlHoverColor;
        createMiniStyleClass(linkStyler, "hover");
        elementPaint.call(this, newProperties);
    };
    if (callback.call) {
        callback.call(this);
    }
    this.paint(callback);
}.addMixin(GUI_ElementMixin);