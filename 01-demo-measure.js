(function () {

var viz = {
	id: '01-demo-measure'
	, label: 'Demo Measure'
	, type: 'single-value'
	, options: {
		fontColor: {
			type: 'string'
			, label: 'Font Color'
			, section: 'Style'
			, default: "#fff"
			, placeholder: '#fff'
		},
		backColor: {
			type: 'string'
			, label: 'Background Color'
			, section: 'Style'
			, default: "#000"
			, placeholder: '#fff'
		},
		mytitle: {
			type: 'string'
			, label: 'Title'
			, section: 'Style'
			, default: "Title"
			, placeholder: 'My Title'
		}
	, hideHeader: true
	, contextTitleHtml: ""
	, lookerInternal: {
		primary: true
      	
	}
      	
	}


	, handleErrors: function (data, resp) {
		if (!resp || !resp.fields) {
			return;
		}
		if (resp.fields.measures.length !== 1) {
			this.addError({
				group: 'measure-req'
				, title: 'Incompatible Data'
				, message: 'Exactly one measure is required'
			});
			return false;
		} else {
			this.clearErrors('measure-req');
		}
		if (resp.fields.dimensions.length > 0) {
			this.addError({
				group: 'measure-req'
				, title: 'Incompatible Data'
				, message: 'Exactly zero dimensions are required'
			});
			return false;
		} else {
			this.clearErrors('dimension-req');
		}
		return true;
	}

	, create: function (el, settings) {
		console.log(el);
		el.title="";
		$(".vis-header").empty();
	}

	, update: function (data, el, settings, resp) {
		if (!this.handleErrors(data, resp)) {
			return;
		}

		var $el = $(el)
		, extracter = mkExtracter(data)
		, measure_1_meta = resp.fields.measures[0]
		, measure = extracter(measure_1_meta.name)
		;
		
		// $el.empty().append('<div class="vis-single-value-wrapper" ng-init="hideHeader=true" style="text-align: center;"><b>' + measure[0].toString() + '</b>');
		// $el.append('<p style="text-align: center;">' +settings['mytitle']+ '</p></div>');
		
		$el.empty().append('<div class="" style=" width=100%; height=100%; background-color:' + settings['backColor']+ '; color:' + settings['fontColor']+ '; text-align: center; vertical-align: middle"><br><b>' + measure[0].toString() + '</b><p style="text-align: center;">' + settings['mytitle']+ '</p></div>');
	


		console.log(data);
	}

};

/*----------------------------------------------------------------------------*/
	
function mkExtracter(data) {
	return function (name) {
		return data.map(function (x) {
			return x[name].rendered ||x[name].linked_value || x[name].value;
		});
	};
};

viz.contextTitleHtml = "";
/*----------------------------------------------------------------------------*/

looker.plugins.visualizations.add(viz);

}());
