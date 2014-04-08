angular.module("ng-t", []).directive("t", ["$t", function ($t) {
	var compileFn = function (elem) {
		var identifier = elem.text();
		if ($t.isTestableMode()) {
			elem.text($t.get(identifier)); //This way manipulates the original element which can be retrieved with $compile().
										   //This is important for testing, but not so great for productive use because the <t></t> will stay in
										   //the html dom
		}
		else {
			elem.replaceWith($t.get(identifier)); //This way the <t></t> are removed completely, but this happens by not manipulating the original dom element.
												  //The new one cannot be accessed in tests
												  //Because of this a switch has been implemented. Calling $t.activeTestableMode() sets directive in test-friendly mode
		}
	}

	return {
		restrict: "E",
		replace: true,
		compile: compileFn
	};
}]);

angular.module("ng-t").provider("$t", function () {
	var self = this;
	window.t = self;
	var currLang = "en-en";
	var defLang = "en-en";
	var testableMode = false;

	var map = {};

	this.setCurrentLanguage = function (currLang_s) {
		currLang = currLang_s;
	};

	this.setDefaultLanguage = function (defLang_s) {
		defLang = defLang_s;
	};

	this.getCurrentLanguage = function () {
		return currLang;
	};

	this.getDefaultLanguage = function () {
		return defLang;
	};

	this.setPhraseMap = function (phrases_o) {
		map = phrases_o;
	};

	this.get = function (identifier, lang_override) {
		var lang = (lang_override || currLang);

		if (map.hasOwnProperty(lang)) {
			if (map[lang].hasOwnProperty(identifier)) {
				return map[lang][identifier];
			} 
			else if (map[defLang].hasOwnProperty(identifier)) {
				return map[defLang][identifier];
			}
			else {
				return identifier;
			}
		}
		else if (map.hasOwnProperty(defLang)) {
			if (map[defLang].hasOwnProperty(identifier)) {
				return map[defLang][identifier];
			}
			else {
				return identifier;
			}
		}
		else {
			return identifier;
		}
	};

	this.isTestableMode = function () {
		return testableMode;
	};

	this.activeTestableMode = function () {
		testableMode = true;
	};

	this.$get = function () {
		return self;
	};
});

angular.module("ng-t").config(["$tProvider", function ($tProvider) {
	//$tProvider.activeTestableMode();
}]);