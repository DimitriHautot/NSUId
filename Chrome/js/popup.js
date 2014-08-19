var debug = false;

function requestMap() {
	if (debug) console.debug("About to async call a function background page...");
	if (chrome.extension.getBackgroundPage()) {
		chrome.extension.getBackgroundPage().queryPageDuplicates(onResponseMap);
	}
	if (debug) console.debug("... done");
}

function onResponseMap(response) {
	if (debug) console.debug("Received answer from background page");

	var map = response["map"];
	var duplicates = response["count"];

	var table = document.getElementById("theTable");
	document.getElementById("theDate").innerHTML = new Date(parseFloat(response["date"])).toLocaleTimeString();
	if (duplicates == 0) {
		document.getElementById("lblNoDuplicates").className = "shown";
		document.getElementById("lblSomeDuplicates").className = "hidden";
		document.getElementById("lblOneDuplicate").className = "hidden";
		table.className = "hidden";
		return;
	}

	document.getElementById("lblNoDuplicates").className = "hidden";
	table.className = "shown";
	if (duplicates == 1) {
		document.getElementById("lblOneDuplicate").className = "shown";
		document.getElementById("lblSomeDuplicates").className = "hidden";
	} else {
		document.getElementById("count").innerHTML = duplicates;
		document.getElementById("lblOneDuplicate").className = "hidden";
		document.getElementById("lblSomeDuplicates").className = "shown";
	}

	var tbody = table.getElementsByTagName("tbody")[0];
	table.removeChild(tbody);
	tbody = table.appendChild(document.createElement("tbody"));
	
	var array;
	var arrayLength = 0;
	for (var idValue in map) {
		if (debug) console.debug("idValue: " +idValue);
		if (map.hasOwnProperty(idValue)) {
			array = map[idValue];
			arrayLength = array.length;
			for (var index = 0; index < arrayLength; index++) {
				var row = tbody.insertRow(tbody.rows ? tbody.rows.length : 0);
				var nextCellIndex = 0;
				if (index == 0) {
					var cellId = row.insertCell(0);
					cellId.setAttribute("rowspan", arrayLength);
					cellId.innerHTML = idValue;
					var cellCount = row.insertCell(1);
					cellCount.setAttribute("rowspan", arrayLength);
					cellCount.innerHTML = arrayLength;
					nextCellIndex = 2;
				} else {
				}
				var cellTagName = row.insertCell(nextCellIndex++);
				cellTagName.innerHTML = array[index]["tag"];
				var cellXPath = row.insertCell(nextCellIndex);
				cellXPath.className = "xpath";
				cellXPath.innerHTML = array[index]["xpath"];
			}
		}
	}
	if (debug) console.debug("end loop");
}

document.addEventListener('DOMContentLoaded', requestMap);
