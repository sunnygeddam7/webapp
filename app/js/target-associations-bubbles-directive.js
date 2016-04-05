
/* Directives */
angular.module('cttvDirectives')

    .directive('cttvTargetAssociationsBubbles', ['$log', 'cttvAPIservice', 'cttvUtils', "cttvConsts", function ($log, cttvAPIservice, cttvUtils, cttvConsts) {
        'use strict';
	return {
	    restrict: 'E',

        require: '?^resize',

	    scope: {
			// "onFocus": '&onFocus',
			loadprogress : '=',
            facets : '='
        },

        template: '<cttv-matrix-legend colors="legendData"></cttv-matrix-legend>'
        +'<cttv-matrix-legend legend-text="legendText" colors="colors" layout="h"></cttv-matrix-legend>',


	    link: function (scope, elem, attrs, resizeCtrl) {
            var bubblesContainer = elem.children().eq(0).children().eq(0)[0];

		// event receiver on focus
		addEventListener('bubblesViewFocus', function (e) {
		    // TODO: This is effectively clicking in the nav bar
		    // This prevents delivering the directive as stand-alone
		    $("#cttv_targetAssociations_navBar_" + attrs.focus).click();
		}, true);

		var ga;
		var nav;

		var datatypesChangesCounter = 0;


        // scope.$watch('score', function(old, current){
        //     $log.log("score changed ");
        //     $log.log(current);
        // });



		// Data types changes
        /*
		scope.$watch(function () { return attrs.datatypes; }, function (dts) {

            dts = JSON.parse(attrs.datatypes);
            var opts = {
                target: attrs.target,
                datastructure: "tree",
            };
            if (!_.isEmpty (dts)) {
                opts.filterbydatatype = _.keys(dts);
            }

            if (datatypesChangesCounter>0) {
                if (ga) {
                    cttvAPIservice.getAssociations (opts)
                        .then (function (resp) {
                            scope.$parent.updateFacets(resp.body.facets);
                            var data = resp.body.data;
                            if (_.isEmpty(data)) {
                                data.association_score = 0.01;
                            }
                            ga.datatypes(dts);
                            updateView(data);
                            ga.update(data);
                        },
                        cttvAPIservice.defaultErrorHandler
                    );
                } else {
                    setView();
                }
            }
            datatypesChangesCounter++;
		});
        */



        // try only watching for facet changes
        scope.$watch('facets', function (fct) {

            var opts = {
                target: attrs.target,
                outputstructure: "tree",
                direct: true,
                facets: true,
                size: 1000
            };
            opts = cttvAPIservice.addFacetsOptions(fct, opts);


            if (datatypesChangesCounter>0) {
                if (ga) {
                    cttvAPIservice.getAssociations (opts)
                        .then (function (resp) {
                            // scope.$parent.updateFacets(resp.body.facets);
                            // var data = resp.body.data;
                            var data = cttvAPIservice.flat2tree(resp.body);
                            if (_.isEmpty(data)) {
                                data.association_score = 0.01;
                            }
                            //ga.datatypes(fct.datatypes);
                            //ga.datatypes( JSON.parse(attrs.datatypes) );
                            ga.filters (scope.facets);

                            updateView(data);
                            ga.update(data);
                        },
                        cttvAPIservice.defaultErrorHandler
                    );
                } else {
                    setView();
                }
            }
            datatypesChangesCounter++;
        });



		// Highlight changes
		scope.$watch(function () { return attrs.diseaseIsSelected; }, function () {

		    if (ga && attrs.highlight) {
                var efo = JSON.parse(attrs.highlight);

    			// Also put a flower in the nav bar -- TODO: Again, this is interacting with the navigation, which
    			// makes it more difficult to reuse!
    			var datatypes = {};
                for (var j=0; j<cttvConsts.datatypesOrder.length; j++) {
                    var dkey = cttvConsts.datatypesOrder[j];
                    datatypes[dkey] = _.result(_.find(efo.datatypes, function (d) {
                        return d.datatype === cttvConsts.datatypes[dkey];
                    }), "association_score")||0;
                }
    			// datatypes.GENETIC_ASSOCIATION = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "genetic_association"; }), "association_score")||0;
    			// datatypes.SOMATIC_MUTATION = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "somatic_mutation"; }), "association_score")||0;
    			// datatypes.KNOWN_DRUG = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "known_drug"; }), "association_score")||0;
    			// datatypes.RNA_EXPRESSION = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "rna_expression"; }), "association_score")||0;
    			// datatypes.AFFECTED_PATHWAY = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "affected_pathway"; }), "association_score")||0;
    			// datatypes.ANIMAL_MODEL = _.result(_.find(efo.datatypes, function (d) { return d.datatype === "animal_model"; }), "association_score")||0;
                // datatypes.LITERATURE = _.result(_.find(efo.datatypes, function (d) { return d.literature === "literature"; }), "association_score")||0;
                // var hasActiveDatatype = function (checkDatatype) {
                //     var datatypes = JSON.parse(attrs.datatypes);
                //     for (var datatype in datatypes) {
                //         if (datatype === checkDatatype) {
                //             return true;
                //         }
                //     }
                //     return false;
                // };

                var flowerData = [];
                for (var i=0; i<cttvConsts.datatypesOrder.length; i++) {
                    var key = cttvConsts.datatypesOrder[i];
                    flowerData.push({
                        "value": datatypes[key],
                        "label": cttvConsts.datatypesLabels[key],
                        "active": true, //hasActiveDatatype(cttvConsts.datatypes[key])
                    });
                }
    			// var flowerData = [
    			//     {"value":datatypes.genetic_association, "label": "Genetics", "active": hasActiveDatatype("genetic_association")},
    			//     {"value":datatypes.somatic_mutation,  "label":"Somatic", "active": hasActiveDatatype("somatic_mutation")},
    			//     {"value":datatypes.known_drug,  "label":"Drugs", "active": hasActiveDatatype("known_drug")},
    			//     {"value":datatypes.rna_expression,  "label":"RNA", "active": hasActiveDatatype("rna_expression")},
    			//     {"value":datatypes.affected_pathway,  "label":"Pathways", "active": hasActiveDatatype("affected_pathway")},
    			//     {"value":datatypes.animal_model,  "label":"Models", "active": hasActiveDatatype("animal_model")},
                //     {"value":datatypes.literature, "label":"Literature", "active": hasActiveDatatype("literature")}
    			// ];
                $log.log("FLOWER DATA:");
                $log.log(flowerData);
    			var navFlower = flowerView()
    			    .fontsize(9)
    			    .diagonal(130)
    			    .values(flowerData);

    			// The parent_efo is needed to dis-ambiguate between same EFOs in different therapeuticAreas
    			navFlower(document.getElementById("cttv_targetAssociations_flower_" + efo.efo + "_" + efo.parent_efo));

    			// This is the link to the evidence page from the flower
                // var link = "/evidence/" + attrs.target + "/" + efo.efo + '?score_str=' + scope.facets.score_str[0];
    			// scope.$parent.targetDiseaseLink = link;

    		}
		});

		// Focus changes
		scope.$watch(function () { return attrs.focus; }, function (val) {
            if (val === "None") {
                return;
            }

            if (ga) {
                ga.selectTherapeuticArea(val);
            }
		});

        // Dim changes
        scope.$watch(function () {if (resizeCtrl) { return resizeCtrl.dims();}}, function (val) {
            if (ga) {
                ga.diameter(val.height - 310);
            }
        }, true);

        function updateView (data) {
            // TODO: This may prevent from delivering directives as products!
            if (data) {
                ga.update(data);
                // scope.$parent.setTherapeuticAreas(ga.data().children || []);
            } else {
                // scope.$parent.setTherapeuticAreas([]);
            }
        }

		function setView () {
		    ////// Bubbles View
		    // viewport Size

		    var viewportW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		    var viewportH = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		    // Element Coord
		    var elemOffsetTop = elem[0].parentNode.offsetTop;

		    // BottomMargin
		    var bottomMargin = 310;

		    var diameter = viewportH - elemOffsetTop - bottomMargin;

            var colorScale = cttvUtils.colorScales.BLUE_0_1; //blue orig

		    //var dts = JSON.parse(attrs.datatypes);
		    /*var opts = {
                target: attrs.target,
                datastructure: "tree",
		    };
		    if (!_.isEmpty(dts)) {
                opts.filterbydatatype = _.keys(dts);
		    }
            */
            console.log("TARGET IS " + attrs.target);
            // var opts = {
            //     target: attrs.target,
            //     outputstructure: "flat",
            //     direct: true,
            //     facets: false,
            //     size: 1000
            // };
            // opts = cttvAPIservice.addFacetsOptions(scope.facets, opts);

		    // cttvAPIservice.getAssociations (opts)
		    // api.call (url)
		    	// .then (function (resp) {

                    // $log.log(" -- set view stuff --");
                    // $log.warn ("RESP FOR BUBBLES");
                    // $log.warn(resp);

                    // var data = cttvAPIservice.flat2tree(resp.body);
                    // console.log(" --------------------------- TREE: ");
                    // console.log(data);

                    // var data = resp.body.data;
                    // scope.$parent.updateFacets(resp.body.facets);
                    // if (_.isEmpty(data)) {
                    //     updateView ();
                    //     return;
                    // }

    			    // Bubbles View
                    // var bView = bubblesView()
                    //     .useFullPath(cttvUtils.browser.name !== "IE");
                        // .maxVal(1);
                        // .colorPalette(colorScale)
                        // .breadcrumsClick(function (d) {
                        //     var focusEvent = new CustomEvent("bubblesViewFocus", {
                        //         "detail" : d
                        //     });
                        //     this.dispatchEvent(focusEvent);
                        // });

                    var fView = flowerView()
                        .fontsize (10)
                        .diagonal (180);

                    // setup view
                    // ga = geneAssociations()
                    //     .target (attrs.target)
                    //     .diameter (diameter)
                    //     //.datatypes(dts)
                    //     .filters(scope.facets)
                    //     .names(cttvConsts);
                    ga = targetAssociations()
                        .target(attrs.target)
                        .diameter(diameter)
                        .filters(scope.facets);

                    var opts = {
                        target: attrs.target,
                        outputstructure: "flat",
                        size: 1000,
                        direct: true,
                        facets: false
                    };
                    opts = cttvAPIservice.addFacetsOptions(attrs.facet, opts);
                    ga.data(cttvAPIservice.getAssociations(opts));

                    // updateView (data);

                    //scope.$parent.$apply();
                    // ga(bView, fView, bubblesContainer);
                    ga(bubblesContainer);

                    // Setting up legend
                    scope.legendText = "Score";
                    scope.colors = [];
                    for(var i=0; i<=100; i+=25){
                        var j=i/100;
                        //scope.labs.push(j);
                        scope.colors.push({color:colorScale(j), label:j});
                    }
                    scope.legendData = [
                        //{label:"Therapeutic Area", class:"no-data"}
                    ];

                // },
                // cttvAPIservice.defaultErrorHandler
            // );

		}

		scope.$watch("target", function (val) {
		    setView();
		});
	    }
	};
    }]);
