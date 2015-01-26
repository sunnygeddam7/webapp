'use strict';

/* Directives */
angular.module('cttvDirectives', [])
    .directive('cttvTargetAssociations', function () {
	var bView = bubblesView();

	return {
	    restrict: 'EA',
	    scope: {

	    },
	    link: function (scope, elem, attrs) {
		var api = cttvApi();
		var url = api.url.filterby({
		    gene:attrs.target,
		    datastructure:"simple",
		    size:1000
		});
		api.call(url, function (status, resp) {
		    var bView = bubblesView();
		    scope.$parent.took = resp.took;
		    scope.$parent.nresults = resp.size;
		    scope.$parent.$apply();
		    bView
			.data(resp.data)
			.height(attrs.height)
			.width(attrs.width)
			.onclick (function (d) {
			    window.location.href="/app/#/gene-disease?t=" + attrs.target + "&d=" + d.name;
			});
		    bView(elem[0]);
		});		
	    }
	}
    })
    .directive('ebiExpressionAtlasBaselineSummary', function () {
	return {
	    restrict: 'EA',
	    templateUrl: "partials/expressionAtlas.html",
	    link: function (scope, elem, attrs) {
		var instance = new Biojs.ExpressionAtlasBaselineSummary ({
		    geneQuery : attrs.target,
		    proxyUrl : "",
		    rootContext : "http://www.ebi.ac.uk/gxa",
		    geneSetMatch : false,
		    target : "expressionAtlas"
		})
	    },
	}
    });


/*
angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
  */
