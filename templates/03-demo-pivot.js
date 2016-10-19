(function () {

var viz = {
	id: '03-demo-pivot'
	, label: 'Demo Pivot'
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
		if (resp.fields.pivots.length !== 1) {
			this.addError({
				group: 'pivot-req'
				, title: 'Incompatible Data'
				, message: 'Exactly one pivot is required'
			});
			return false;
		} else {
			this.clearErrors('pivot-req');
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
		, pivot_1_meta = resp.fields.pivots[0]
		, mname = measure_1_meta.name
		, dname = dimension_1_meta.name
		, pname = pivot_1_meta.name
		, pivots = resp.pivots.map(function (x) {
			return x.data[pname];
		})
		;
		
		var tbl = $el.empty().append('<table></table>')
		, content = pivots.reduce(function (acc, x) {
			return acc + '<th>' + x + '</th>';
		}, '<tr><th>' + pname + '</th>') + '</tr>'
			+ '<tr><td>' + dname + '</td>'
			+ Array(pivots.length)
				.fill(mname)
				.reduce(function (acc, x) {
					return acc + '<td>' + x + '</td>';
				}, '')
			+ '</tr>'
		;

		tbl.append(content);
		data.forEach(function (x) {
			var dval = x[dname].rendered
			, ks = Object.keys(x[mname]).sort(compareKeys)
			, ms = ks.map(function (k) {
				return x[mname][k].rendered;
			})
			, content
			;
			content = '<tr>'
				+ '<td>'
				+ dval
				+ '</td>'
				+ ms.reduce(function (acc, m) {
					return acc + '<td>' + m + '</td>';
				}, '')
				+ '</tr>'
			;
			tbl.append(content);
		});
	}
};

/*----------------------------------------------------------------------------*/

function compareKeys(x, y) {
	var xarr_ = x.split("|")
	, yarr_ = y.split("|")
	, x_ = parseInt(xarr_[xarr_.length], 10)
	, y_ = parseInt(yarr_[yarr_.length], 10)
	;
	if (x_ < y_) {
		return -1;
	}
	if (x_ > y_) {
		return 1;
	}
	return 0;
}


/*----------------------------------------------------------------------------*/

looker.plugins.visualizations.add(viz);

}());
