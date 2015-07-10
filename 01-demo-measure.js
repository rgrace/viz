(function () {

var viz = {
	id: '01-demo-measure'
	, label: 'Demo Measure'
	, options: {
		colorRange: {
			type: 'array'
			, label: 'Color Ranges'
			, section: 'Style'
			, placeholder: '#fff'
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
		
		$el.empty().append('<p>' + measure[0].toString() + '</p>');
	}

};

/*----------------------------------------------------------------------------*/
	
function mkExtracter(data) {
	return function (name) {
		return data.map(function (x) {
			return x[name].value;
		});
	};
};

/*----------------------------------------------------------------------------*/

looker.plugins.visualizations.add(viz);

}());
