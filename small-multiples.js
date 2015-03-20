/* Wrap everything in an immediately-invoked function expression. */
(function () {

/* Wrap the chart code in Looker's visualization framework.  */
angular.module('Visualizations').run(function (VisualizationManager) {

/* Make a hash to pass to the visualization framework. */
var viz = {
	/* Must be a unique identifier. */
	id: 'small-multiples'
	/* This name will show up in the visualization picker. */
	, label: 'Small Multiples Example'
	, options: {
		colorRange: {
			type: 'array'
			, label: 'Color Ranges'
			, section: 'Style'
			, placeholder: '#fff'
		}
	}
};

/**
 * The error handler should return ``false'' if there is an error, ``true'' if
 * there is not an error, and ``null'' if there is no way to tell. The last one
 * generally happens when the chart update method is called before there is
 * data.
 */
viz.handleErrors = function (data, resp) {
	/* Make sure we can figure out whether there is an error condition. */
	if (!data || !resp || !resp.fields) {
		return null;
	}
	return true;
};

/**
 * The creation method should set up the state of the DOM. In this case, we'll
 * make an SVG element to hold the chart and set the height and width.
 */
viz.create = function (element, settings) {
	d3.select(element)
		.append('div')
		.attr('id', 'small-multiples-chart-box')
		.style({
			'height': '100%'
			, 'width': '100%'
		});
};

/**
 * The update method can be called lots of times, so we need to bail out if
 * there isn't any data. That's why we checked for missing stuff in the
 * ``handleErrors'' method. ``update'' doesn't return any value; it's just used
 * for its side-effect of drawing the chart.
 */
viz.update = function (data, element, settings, resp) {
	/**
	 * Handle error conditions; these include missing and incompatible data.
	 */
	if (!this.handleErrors(data, resp)) {
		return;
	}

	var x_key = resp.fields.dimensions[0].name
	, y_key = resp.fields.measures[0].name
	, pivots = resp.pivots.map(prop('key'))
	, num_charts = pivots.length
	, cols = Math.ceil(num_charts/2)
	, rows = Math.ceil(num_charts/cols)
	, fmt = d3.time.format('%Y-%m')
	, d = transformData(data, pivots, x_key, y_key, fmt)
	, $el = $(element)
	, w = Math.floor($el.width()/cols)/(0.9*cols)
	, h = Math.floor($el.height()/rows)/(0.7*rows)
	, plot
	;

	if (!h || h <= 0 || !w || w <= 0) {
		return;
	}
	
	plot = SmallMultiples(w, h, settings, resp);
	plotData('#small-multiples-chart-box', d, plot);

	function SmallMultiples(w, h, settings, resp) {
		var margin, data, x_scale, y_scale, x_val, y_val, pivot_vals,
			x_trans, y_trans, y_axis, area, line;

		margin = { top: 15, right: 10, bottom: 40, left: 35 }
		data = [];
		
		x_scale = d3.time.scale().range([0, w]);
		y_scale = d3.scale.linear().range([h, 0]);

		x_val = prop('dim');
		y_val = prop('meas');
		pivot_vals = prop('v');

		x_trans = compose(x_scale, x_val);
		y_trans = compose(y_scale, y_val);

		y_axis = d3.svg.axis()
			.scale(y_scale)
			.orient("left").ticks(4)
			.outerTickSize(0)
			.tickSubdivide(1);

		area = d3.svg.area().x(x_trans).y0(h).y1(y_trans);
		line = d3.svg.line().x(x_trans).y(y_trans);

		function setup_scales(xs) {
			max_y = d3.max(xs, function (x) {
				return d3.max(pivot_vals(x), y_val);
			})*1.2;
			y_scale.domain([0, max_y]);

			extent_x = d3.extent(xs[0].v, x_val);
			x_scale.domain(extent_x);
		}

		function doit(xs) {
			var data, div;
			data = xs;
			setup_scales(data);
			div = d3.select(this).selectAll('.chart').data(data)
			div.enter().append('div')
				.attr('class', 'chart')
				.style('float', 'left')
				.append('svg')
				.append('g');

			var svg = div.select('svg')
				.attr('width', w + margin.left + margin.right)
				.attr('height', h + margin.top + margin.bottom);

		      	var g = svg.select('g')
				.attr('transform', 'translate(' + margin.left +
						',' + margin.top + ')');
		     
		      	g.append('rect')
				.attr('class', 'background')
				.style('pointer-events', 'all')
				.style('fill', '#dddddd')
				.attr('width', w + margin.right )
				.attr('height', h);

			var lines = g.append('g')

			lines.append('path')
				.attr('class', 'area')
				.style('pointer-events', 'none')
				.style('fill', '#eeeeee')
				.attr('d', compose(area, pivot_vals));

			lines.append('path')
				.attr('class', 'line')
				.style('pointer-events', 'none')
				.style('fill', 'none')
				.style('stroke', '#333333')
				.style('stroke-width', '1px')
				.attr('d', compose(line, pivot_vals));

		}

		function chart(sel) {
			sel.each(doit);
		}

		chart.x = function (f) {
			if (f == null) return x_val;
			x_val = f;
			return chart;
		}

		chart.y = function (f) {
			if (f == null) return y_val;
			y_val = f;
			return chart;
		}

		return chart;
	}

	function transformData(data, pivots, x_key, y_key, fmt) {
		var d = [];
		pivots.forEach(function (pivot) {
			d.push({
				k: pivot
				, v: []
			});

		});
		data.forEach(function (x) {
			d.forEach(function (y) {
				var pivot = y.k;
				y.v.push({
					dim: fmt.parse(x[x_key].value)
					, meas: x[y_key][pivot].value
				});
			});
		});
		return d;
	}

	function plotData(selector, data, plot) {
		d3.select(selector).datum(data).call(plot);
	}

};

VisualizationManager.register(viz);

function compose(f, g) {
	return function (x) {
		return f(g(x));
	}
}

function prop(k) {
	return function (x) {
		return x[k];
	};
}

});

}());
