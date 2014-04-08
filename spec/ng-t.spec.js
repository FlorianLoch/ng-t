angular.module("dict", ["ng-t"]).config(["$tProvider", function ($tProvider) {
	var map = {
		"de-de": {
			"os": "Betriebssystem"
		},
		"en-en": {
			"os": "operating system"
		}
	};

	$tProvider.addPhraseMap(map);
}]);

describe("This suite tests whether ng-t works or not", function () {
	var element, scope, $tProvider, $compile, $interpolate;

	beforeEach(function () {
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
});