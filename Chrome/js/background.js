var debug = false;
var lastTabId = -1;
var selectedId = -1;
var requestId = 1;
var cache = {};

function queryPageDuplicates(sendResponseMap) {
	if (debug) console.debug("Is there a response callback provided? " + (sendResponseMap != undefined));
    chrome.tabs.query( {active: true, currentWindow: true},
    	function(tabs) {
	    	lastTabId = tabs[0].id;
			var queryCache = (sendResponseMap == undefined) && (cache[lastTabId] !== undefined);
	    	if (debug) console.log("background.js/queryPageDuplicates(" + (sendResponseMap != undefined) + "), cache(" + lastTabId + "): " + (cache[lastTabId] !== undefined));
	    	if (queryCache) {
		    	if (debug) console.log("background.js/queryPageDuplicates cache HIT");
	    		var response = cache[lastTabId];
	    		chrome.browserAction.setBadgeText({text: ""+response.count, tabId: lastTabId});
	    		return;
	    	}
	    	if (debug) console.log("background.js/queryPageDuplicates cache MISS");

	    	chrome.browserAction.setBadgeText({text: "", tabId: lastTabId});
	    	if (debug) console.log("background.js/queryPageDuplicates(" + (sendResponseMap != undefined) + "), COUNT id: " + requestId);
		    chrome.tabs.sendMessage(lastTabId, {operation: "COUNT", id: requestId++},
    			function(response) {
    				if (debug) console.log("response: " + (response != undefined));
    				cache[lastTabId] = response;
    				if (debug) console.log("store in cache for tabId: " + lastTabId);
	    			if (response) {
	    				chrome.browserAction.setBadgeText({text: ""+response.count, tabId: lastTabId});
	    				if (debug) console.log("sendResponseMap: " + (sendResponseMap != undefined));
	    				if (sendResponseMap) {
	    					sendResponseMap(response);
			    		}
    				}
		    	}
		    );
		}
	); // chrome.tabs.query
}

// When a tab is deleted
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	if (cache[tabId] !== undefined) {
		delete cache[tabId];
		if (debug) console.log("-- deleted cached entry for removed tab " + tabId);
	}
});

// When a tab is reloaded
chrome.tabs.onUpdated.addListener(function(tabId, props) {
console.log("background.js/chrome.tabs.onUpdated - status: " + props.status + " - tabId: " +tabId);
  if (props.status == "complete" && tabId == selectedId) {
	if (debug) console.log("background.onUpdated()");
	queryPageDuplicates();
  }
});

// When another tab is selected
chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
	if (debug) console.log("background.onSelectionChanged() - tabId: " + tabId);
	selectedId = tabId;
	queryPageDuplicates();
});
