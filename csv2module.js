var fs = require('fs');

var inputFile = process.argv[2];
var outputFile = process.argv[3];
var moduleName = process.argv[4];
var separator = (process.argv[5] || ";");

if (!inputFile || !outputFile || !moduleName) {
	console.error("It seems there is something wrong with the given parameters.");
	console.error("Schema: node csv2module <INPUT_FILE> <OUTPUT_FILE> <MODULE_NAME> [<SEPARATOR>]");
	console.error("Paths are seen as relative from current directory.");
	process.exit(1);
}

var csv = fs.readFileSync(inputFile, {encoding: "utf8"});

var lines = splitLines(csv);

if (lines.length > 1) {
	var o = {};

	var langs = splitValues(lines[0]);
	for (var i = 1; i < langs.length; i++) {
		o[langs[i]] = {};
	}

	for (var i = 1; i < lines.length; i++) {
		var vals = splitValues(lines[i]);
		for (var j = 1; j < vals.length; j++) {
			o[langs[j]][vals[0]] = vals[j];
		}
	}

	var json = JSON.stringify(o);

	var module = "angular.module('" + moduleName + "', ['ng-t']).config(['$tProvider', function($tProvider) {"
	module += "var map = JSON.parse('" + json + "');";
	module += "$tProvider.addPhraseMap(map);";
	module += "}]);";

	fs.writeFileSync(outputFile, module);

	console.log("The module has been written to your file system.");
	console.log("You can now use the module by loading it into your application (via 'script' tag) and setting a dependency for it in one of your existing modules.");
	console.log("Registering of phrases will be done automatically.");
	process.exit(0);
}
else {
	console.error("Your csv seems to contains just one line - this is not enough. There needs to be one headline and at least one content-row.");
	process.exit(1);
}

function splitLines(csv) {
	csv = csv.replace(/\r\n/g, "\n");
	return csv.split("\n");
}

function splitValues(line) {
	var vals = [];
	var val = "";

	for (var i = 0; i <= line.length; i++) {
		if ((line.charAt(i) != separator) && (i != line.length)) {
			val += line.charAt(i);
		}
		else {
			vals.push(val);
			val = "";
		}
	}

	return vals;
}