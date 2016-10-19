(function () {

var viz = {
	id: '02-demo-measure-dimension'
	, label: 'Demo Measure Dimension'
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
		if (resp.fields.dimensions.length !== 1) {
			this.addError({
				group: 'dimension-req'
				, title: 'Incompatible Data'
				, message: 'Exactly one dimension is required'
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
		, measure_1_meta = resp.fields.measures[0]
		, dimension_1_meta = resp.fields.dimensions[0]
		, mname = measure_1_meta.name
		, dname = dimension_1_meta.name
		;
		
		var tbl = $el.empty().append('<table></table>');
		tbl.append('<tr><th>' + dname + '</th>'
				+ '<th>' + mname + '</th></tr>');
		data.forEach(function (x) {
			var dval = x[dname].rendered
			, mval = x[mname].rendered
			;
			tbl.append('<tr><td>' + dval + '</td>'
				+ '<td>' + mval + '</td></tr>');
		});
	}

};

/*----------------------------------------------------------------------------*/

looker.plugins.visualizations.add(viz);

}());
