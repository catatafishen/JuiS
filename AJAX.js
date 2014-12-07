"use strict";
function AJAX() {
	//Gets data from url, onRespone is a callback
	this.request = function (url, onResponse, parameters) {
		onResponse = onResponse || function () {return true; };
		var timeout = 10000; //Number of ms until script aborts
		var uri = url.indexOf(document.domain);
		var re = /^(\s*)http/;
		var aborted = false;
		if (uri > 8 || (uri === -1 && re.test(uri))) {
            throw new Error("AJAX: bad URL");
        }
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		var timer = setTimeout(function () {
			aborted = true;
			xhr.abort();
			throw new Error("AJAX: No response from server");
		}, timeout);
		xhr.open("post", url, true);
		xhr.setRequestHeader("Content-Type", "text/json");
		xhr.onreadystatechange = function () {
			var response;
			if (xhr.readyState === 4) {
				if (!aborted) {
					clearTimeout(timer);
					if (xhr.status === 200) {
						try {
							response = JSON.parse(xhr.responseText);
						} catch (e) {
							throw new Error("AJAX: could not parse response from server");
						}
						onResponse(response);
					} else {
						throw new Error("AJAX: bad response from server");
					}
				}
			}
		};
		xhr.send(JSON.stringify(parameters));
	};
}