var debug = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.operation == "COUNT") {
		if (debug) console.log("contentscript.js/chrome.runtime.onMessage COUNT? " + (request["COUNT"] != undefined) + " - id: " + request["id"]);
		var result = inspectTab();
		sendResponse({"count": result.duplicates, "map": result.map, "date": ""+new Date().getTime()});
	}
});

function inspectTab(map) {
	try {
		var allIdMap = {}; // Map<String, DOMElement[]> - all DOM elements with an ID attribute
		var duplicates = 0;
		var map = {}; // Map<String, DOMElement[]>
		var foundDOMElements = toArray(document.querySelectorAll("[id]"));

		// Keep references to elements with an ID
		var theLength = foundDOMElements.length;
		if (debug) console.debug("There are " + theLength + " elements with an id attribute in page");
		for (var i = 0; i < theLength; i++) {
			var domElement = foundDOMElements[i];
			if (allIdMap[domElement.id] == undefined) {
				allIdMap[domElement.id] = [];
			}
			allIdMap[domElement.id].push({"tag": domElement.tagName, "xpath": getElementTreeXPath(domElement)});
		}

		// Iterate over all recorded ID values, and count those with 2+ usages
		for (var idValue in allIdMap) {
			if (allIdMap.hasOwnProperty(idValue)) {
				var array = allIdMap[idValue];
				if (array.length >= 2) {
					duplicates++;
					map[idValue] = array;
					if (debug) console.debug("id [" + idValue + "] is used " + array.length + " times :-/");
				}
			}
		}

		if (duplicates == 0 && debug) {
			console.debug("w00t, no duplicates!");
		}
		return {"duplicates": duplicates, "map": map};
	} catch (error) {
		if (debug) console.error("contentscript.js: " + error);
		return null;
	}
}

// turns nodelist into an array to enable forEach
// http://stackoverflow.com/a/5501800/967410
function toArray(list) {
  var i, array = [];
  for  (i=0; i<list.length;i++) {array[i] = list[i];}
  return array;
}

// http://stackoverflow.com/a/11133649/967410
var getElementTreeXPath = function(element) {
      var paths = [];

      // Use nodeName (instead of localName) so namespace prefix is included (if any).
      for (; element && element.nodeType == 1; element = element.parentNode)  {
          var index = 0;

          for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
              // Ignore document type declaration.
              if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;

              if (sibling.nodeName == element.nodeName)
                  ++index;
          }

          var tagName = element.nodeName.toLowerCase();
          var pathIndex = "[" + (index+1) + "]";
          paths.splice(0, 0, tagName + pathIndex);
      }

      return paths.length ? "/" + paths.join("/") : null;
  };

// Listen for the content script to send a message to the background page.
chrome.extension.onMessage.addListener(function(param){
	if (debug) {
		console.log("contentscript.js/chrome.extension.onMessage COUNT? " + (param["COUNT"] != undefined) + " - id: " + param["id"]);
		console.log("chrome.extension.onMessage event triggered");
	}
});
