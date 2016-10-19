(function () {

var viz = {
	id: '04-demo-table-calculation'
	, label: 'Demo Table Calculation'
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
		if (resp.fields.measures.length !== 2) {
			this.addError({
				group: 'measure-req'
				, title: 'Incompatible Data'
				, message: 'Exactly two measures are required'
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
		if (resp.fields.table_calculations.length !== 1) {
			this.addError({
				group: 'table-calc-req'
				, title: 'Incompatible Data'
				, message: 'Exactly one table calculation is '
						+ 'required'
			});
			return false;
		} else {
			this.clearErrors('table-calc-req');
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
		, calc_1_meta = resp.fields.table_calculations[0]
		, mname = measure_1_meta.name
		, dname = dimension_1_meta.name
		, cname = calc_1_meta.name
		;
		
		var tbl = $el.empty().append('<table></table>');
		tbl.append('<tr><th>' + dname + '</th>'
				+ '<th>' + mname + '</th>'
				+ '<th>' + cname + '</th></tr>');
		data.forEach(function (x) {
			var dval = x[dname].rendered
			, mval = x[mname].rendered
			, cval = x[cname].rendered
			;
			tbl.append('<tr><td>' + dval + '</td>'
				+ '<td>' + mval + '</td>'
				+ '<td>' + cval + '</td></tr>');
		});
	}

};

/*----------------------------------------------------------------------------*/

looker.plugins.visualizations.add(viz);

}());
