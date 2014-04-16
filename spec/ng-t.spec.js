angular.module("dict", ["ng-t"]).config(["$tProvider", function ($tProvider) {
	var map = {
		"de-de": {
			"os": "Betriebssystem"
		},
		"en-en": {
			"os": "operating system"
		},
		"it-it": {
			"os": "sistema operativo"
		}
	};

	$tProvider.addPhraseMap(map);
}]);

describe("This suite tests whether ng-t works or not", function () {
	var element, scope, $tProvider, $compile, $interpolate;

	beforeEach(function () {
		module("ng");
		module('ng-t');
		module("dict");
	});
 
	beforeEach(inject(function($rootScope, _$compile_, _$t_, _$interpolate_) {
		var map = {
			"en-en": {
				"app": "application"
			},
			"de-de": {
				"app": "Anwendung"
			}
		};

		scope = $rootScope;
		$compile = _$compile_;
		$tProvider = _$t_;
		$interpolate = _$interpolate_;

		$tProvider.activeTestableMode();
		$tProvider.addPhraseMap(map);
	}));

	it("should lookup identifier and and fetch English phrase (set default)", function () {
		element = angular.element('<t>app</t>');

		$compile(element)(scope);

		expect(element.html()).toEqual("application");
	});

	it("should lookup identifier and and fetch German phrase", function () {
		element = angular.element('<t>app</t>');

		$tProvider.setCurrentLanguage("de-de");

		$compile(element)(scope);

		expect(element.html()).toEqual("Anwendung");
	});

	it("should lookup identifier and fallback to English phrase", function () {
		element = angular.element('<t>app</t>');

		var map = {
			"en-en": {
				"app": "application"
			},
			"de-de": {
				"foo": "bar"
			}
		};

		$tProvider.setPhraseMap(map);
		$tProvider.setCurrentLanguage("de-de");

		$compile(element)(scope);

		expect(element.html()).toEqual("application");
		expect($tProvider.get("foo")).toEqual("bar");
	});		

	it("should lookup identifier and return identifier because there is no translation", function () {
		element = angular.element('<t>foobar</t>');

		$compile(element)(scope);

		expect(element.html()).toEqual("foobar");
	});

	it("should lookup identifier and return fallback-phrase due to a non existing currentLang", function () {
		element = angular.element('<t>app</t>');
		
		$tProvider.setCurrentLanguage("de-ch");

		$compile(element)(scope);

		expect(element.html()).toEqual("application");
	});	

	it("should lookup identifier taking in case a set override-language", function () {
		element = angular.element('<t l="de-de">app</t>');
		var element2 = angular.element('<t lang="de-de">app</t>');

		$tProvider.setCurrentLanguage("en-en"); //explicitly set English as current language; also it is et by default

		$compile(element)(scope);
		$compile(element2)(scope);

		expect(element.html()).toEqual("Anwendung");
		expect(element2.html()).toEqual("Anwendung");
	});	

	it("should lookup identifier using current language because override language doesn't exist", function () {
		element = angular.element('<t lang="de-ch">app</t>');

		$tProvider.setCurrentLanguage("de-de");

		$compile(element)(scope);

		expect(element.html()).toEqual("Anwendung");		
	});

	it("should lookup return an resolved interpolate-expression when set to bindingMode", function () {
		element = angular.element('<t>app</t>');

		$tProvider.activateBindMode();

		$compile(element)(scope);

		expect(element.text()).toEqual("application");
	});		

	it("should lookup an identifier in an interpolate-expression using the currently set language", function () {
		scope.t = $tProvider.get;

		var exp = $interpolate('{{t("app")}}'); //

		expect(exp(scope)).toEqual("application");
	});			

	it("should lookup an identifier in an interpolate-expression using the given, override, language", function () {
		scope.t = $tProvider.get;

		var exp = $interpolate('{{t("app", "de-de")}}'); //

		expect(exp(scope)).toEqual("Anwendung");
	});		

	it("should load another module and resolve to one of the phrases contained only in this module", function () {
		scope.t = $tProvider.get;

		var exp = $interpolate('{{t("os", "de-de")}}'); //

		expect(exp(scope)).toEqual("Betriebssystem");
	});			

	it("should load another module and resolve to one of the phrases contained only in this module. The phrase is content of an 'new' language", function () {
		scope.t = $tProvider.get;

		$tProvider.setCurrentLanguage("it-it");

		var exp = $interpolate('{{t("os")}}'); //

		expect(exp(scope)).toEqual("sistema operativo");
	});			

	//TESTS OF UNCRITICAL PARTS OF APPLICATION

	it("should return an equal phrase map", function () {
		var testMap = {
			"de-de": {
				"os": "Betriebssystem",
				"app": "Anwendung"
			},
			"en-en": {
				"os": "operating system",
				"app": "application"
			},
			"it-it": {
				"os": "sistema operativo"
			}
		};

		var actualMap = $tProvider.getPhraseMap();

		expect(angular.equals(testMap, actualMap)).toBe(true);
	});

	it("should return set default language", function () {
		$tProvider.setDefaultLanguage("foo-bar");

		expect($tProvider.getDefaultLanguage()).toEqual("foo-bar");
	});

	it("should return set current language", function () {
		$tProvider.setCurrentLanguage("foo-bar");

		expect($tProvider.getCurrentLanguage()).toEqual("foo-bar");
	});

	it("should return false when trying to add something different to an object to the phrase map", function () {
		expect($tProvider.addPhraseMap("foobar")).toEqual(false);
	});	

	it("bind-mode should be deactivated by default", function () {
		expect($tProvider.isBindMode()).toBe(false);
	});

	it("should return identifier when requesting a word which doesn't exist in currentLanguage and not in default language AND current Language does not exist", function () {
		$tProvider.setCurrentLanguage("foo");

		expect($tProvider.get("foo-bar")).toEqual("foo-bar");
	});

	it("should return identifier when requesting a word AND current AND default language do not exist", function () {
		$tProvider.setCurrentLanguage("foo");
		$tProvider.setDefaultLanguage("bar");

		expect($tProvider.get("foo-bar")).toEqual("foo-bar");
	});	

	it("should return an interpolate-expression for the given identifier when not in testingMode (with and without override lang)", function () {
		$tProvider.deactivateTestableMode();
		$tProvider.activateBindMode();

		element = angular.element('<t>app</t>');
		element2 = angular.element('<t lang="de-de">app</t>');

		$compile(element);
		$compile(element2);

		expect(element.html()).toEqual("{{t('app')}}");
		expect(element2.html()).toEqual("{{t('app', 'de-de')}}");
	});

	it("should replace element (not only its content) when not in testing mode and not in binding mode", function () {
		$tProvider.deactivateTestableMode();

		element = angular.element('<t lang="de-de">app</t>');

		$compile(element);

		expect(scope.__lastReplacedTElement).toEqual("Anwendung");
	});

	it("should be possible to add a function as a value for an identifier and get the returning value when resolving this identifier", function () {
		var map = {
			"de-de": {
				"sinn": ["$tProvider", function ($rootScope) {
					$rootScope.sinn = "1337";
					return (21 * 2).toString();
				}]
			}
		};

		$tProvider.setCurrentLanguage("de-de");
		$tProvider.setPhraseMap(map);

		expect($tProvider.get("sinn")).toEqual("42");
		expect($tProvider.sinn).toEqual("1337");
	});

});