include("util.js");
include("tinyxmldom.js");

var karotz_ip="localhost";
//var karotz_ip="192.168.1.4"

var line = params[instanceName].line;
var stopId = params[instanceName].stopId;
//var line = '43';
//var stopId = 14099;

var url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=" + line + "&stopId=" + stopId;

var xml = http.get(url);
var objDom = new XMLDoc(xml);
var domTree = objDom.docNode;

// Extract useful data
var predictionsNode = domTree.getElements("predictions")[0];
var route = predictionsNode.getAttribute("routeTitle");
var stop = predictionsNode.getAttribute("stopTitle");

var directionNode = predictionsNode.getElements("direction")[0];
var direction = directionNode.getAttribute("title");

var buses = directionNode.getElements("prediction");

var message = route + ", " + direction + ", in ";

// Get first three times
var c = 0;
for (i in buses.slice(0,3)) {
    m = buses[i].getAttribute("minutes");
    message += m;
    if (c == 0)
	message += ", ";
    else if (c == 1)
	message += " and ";
    c++;
}

message += " minutes";

// Clean up abbreviations
message = message.replace(/St\.?/g, 'Street');
message = message.replace(/Ave\.?/g, 'Avenue');
message = message.replace(/Blvd\.?/g, 'Boulevard');
message = message.replace(/Dr\.?/g, 'Drive');

var exitFunction = function(event) {
    if((event == "CANCELLED") || (event == "TERMINATED")) {
        exit();
    }
    return true;
}

var onKarotzConnect = function(data) {
    karotz.tts.start(message, "en", exitFunction);
}

karotz.connectAndStart(karotz_ip, 9123, onKarotzConnect, {});
