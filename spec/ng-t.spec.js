describe("This suite tests whether ng-t works or not", function () {
	var element, scope, $tProvider, $compile;
 
	beforeEach(function () {
		module('ng-t')
	});
 
	beforeEach(inject(function($rootScope, _$compile_, _$t_) {
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

		$tProvider.activeTestableMode();
		$tProvider.setPhraseMap(map);
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
});