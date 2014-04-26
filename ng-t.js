angular.module("ng-t", []).directive("t", ["$t", "$rootScope", function ($t, $rootScope) {
    var compileFn = function (elem) {
        var identifier = elem.text();
        var overrideLang = elem.attr("lang") || elem.attr("l");

        if ($t.isTestableMode()) {
            elem.text($t.get(identifier, overrideLang)); //This way manipulates the original element which can be retrieved with $compile().
                                           //This is important for testing, but not so great for productive use because the <t></t> will stay in
                                           //the html dom
        }
        else {
            if ($t.isBindMode()) {
                if (!("t" in $rootScope)) {
                    $rootScope.t = $t.get; //Make $t available on $rootScope so interpolate-service can resolve t() on every scope (because they are all children of $rootScope)
                }

                if (!overrideLang) elem.text("{{t('" + identifier + "')}}");
                else elem.text("{{t('" + identifier + "', '" + overrideLang + "')}}");
            }
            else {
                var newElem = $t.get(identifier, overrideLang);     //This way the <t></t> are removed completely, but this happens by not manipulating the original dom element.
                $rootScope.__lastReplacedTElement = newElem;            //The new one cannot be accessed in tests
                elem.replaceWith(newElem);          //Because of this a switch has been implemented. Calling $t.activeTestableMode() sets directive in test-friendly mode
            }                                                   
        }                                               
    };

    return {
        restrict: "E",
        replace: true,
        compile: compileFn
    };
}]);

angular.module("ng-t").provider("$t", ["$injector", function ($injector) {
    var self = this;
    window.t = self;
    var currLang = "en-en";
    var defLang = "en-en";
    var testableMode = false;
    var bindMode = false;

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

    this.addPhraseMap = function (phrases_o) {
        if (typeof phrases_o !== "object") return false;

        for (var lang in phrases_o) {
            if (!(map.hasOwnProperty(lang))) {
                map[lang] = {};
            }
            for (var id in phrases_o[lang]) {
                map[lang][id] = phrases_o[lang][id];
            }
        }

        return true;
    };

    this.getPhraseMap = function () {
        return angular.copy(map);
    }

    this.get = function (identifier, lang_override) {
        var lang = currLang;
        if (lang_override && map.hasOwnProperty(lang_override)) {
            lang = lang_override;
        }

        var ret;

        if (map.hasOwnProperty(lang)) {
            if (map[lang].hasOwnProperty(identifier)) {
                ret = map[lang][identifier];
            } 
            else if (map.hasOwnProperty(defLang) && map[defLang].hasOwnProperty(identifier)) {
                ret = map[defLang][identifier];
            }
            else {
                ret = identifier;
            }
        }
        else if (map.hasOwnProperty(defLang)) {
            if (map[defLang].hasOwnProperty(identifier)) {
                ret = map[defLang][identifier];
            }
            else {
                ret = identifier;
            }
        }
        else {
            ret = identifier;
        }

        if (typeof ret == "function") {
            return $injector.invoke(ret);
        }
        if (angular.isArray(ret)) {
            return $injector.invoke(ret);
        }
        return ret;
    };

    this.isTestableMode = function () {
        return testableMode;
    };

    this.activeTestableMode = function () {
        testableMode = true;
    };

    this.deactivateTestableMode = function () {
        testableMode = false;
    };

    this.isBindMode = function () {
        return bindMode;
    };

    this.activateBindMode = function () {
        bindMode = true;
    };

    this.$get = function () {
        return self;
    };
}]);

angular.module("ng-t").config(["$tProvider", function ($tProvider) {
    //$tProvider.activeTestableMode();
}]);