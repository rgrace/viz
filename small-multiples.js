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
		.append('svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.classed('small-multiples-chart', true);
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

	var $el = $(element)
	, margins = 1
	, padding = 60
	, pivots = resp.pivots.map(prop('key'))
	, num_charts = pivots.length
	, w = Math.floor($el.width()/2 - margins*3)
	, h = Math.floor(2*$el.height()/num_charts -
			margins*(Math.ceil(num_charts/2) - 1))
	, fmt = d3.time.format('%Y-%M')
	, x_scale = d3.time.scale().range([0, w])
	, y_scale = d3.scale.linear().range([h, 0])
	, x_key = resp.fields.dimensions[0].name
	, y_key = resp.fields.measures[0].name
	, x_trans = compose(x_scale, x_val)
	, sel = d3.select(element)
		.select('.small-multiples-chart')
	, y_vals = {}
	, y_scales = {}
	, areas = {}
	, y_axes
	, y_transformers
	, lines
	;

	if (!h || h <= 0) {
		return;
	}

	/**
	 * ``y_vals'' will be a hash of accessor functions. The keys will be the
	 * names of the pivoted dimension and the values will be functions that
	 * know how to get the y-value for the key from a hash in the ``data''
	 * hash passed as a formal parameter to ``update''.
	 */
	setup_y_vals(pivots);

	/**
	 * We want ``y_scales'' to be a hash of D3 scales. Each key is the name
	 * of the pivoted dimension and each scale knows how to compute the
	 * physical point (in pixels) in the Cartesian y dimension of the chart
	 * for the value passed to the scale. This is because each category in
	 * the pivoted dimension will have a different range of values for its
	 * Cartesian y dimension and we want all the small multiples to take up
	 * the same physical space (in pixels) in our chart.
	 */
	setup_y_scales(data, pivots);

	/**
	 * Set up the x-scale so it has correct minimum and maximum values.
	 */
	x_scale.domain(d3.extent(data, x_val));

	setup_areas(data, pivots);

	chart(sel);

	function setup_areas(xs, pivots) {
		pivots.forEach(function (pivot) {
			areas[pivot] = d3.svg.area()
				.x(x_trans)
				.y0(h)
				.y1(compose(y_scales[pivot], y_vals[pivot]));
		});
	}

	function setup_y_vals(pivots) {
		pivots.forEach(function (pivot) {
			y_vals[pivot] = y_val(pivot);
		});
	}

	function setup_y_scales(xs, pivots) {
		pivots.forEach(function (pivot) {
			var max_y = xs.reduce(function (x, x_hash) {
				return Math.max(x, y_vals[pivot](x_hash));
			}, 0)*1.25
			;
			y_scales[pivot] = y_scale.copy().domain([0, max_y]);
		});
	}

	function x_val(d) {
		return d[x_key].value;
	}

	function y_val(pivot) {
		return function (d) {
			return d[y_key][pivot].value;
		};
	}

	function prop(k) {
		return function (x) {
			return x[k];
		};
	}

	function chart(sel) {
		var g, lines, gs, lines;

		pivots.forEach(function (pivot) {
			g = sel.append('g')
				.classed('small-multiple-panels', true)
				.attr('width', w + margins*2)
				.attr('height', h + margins*2);
			g.append('rect')
				.classed('panel-bg', true)
				.style('pointer-events', 'all')
				.attr('width', w + margins)
				.attr('height', h)
				.on('mouseover', mouseover)
				.on('mouseout', mouseout);
			lines = g.append('g');
		});

		sel.data(data).enter();
		gs = sel.select('rect.panel-bg');
		lines = gs.append('g');
		lines.append('path')
			.classed('area', true)
			.style('pointer-events', 'none')
			.attr('d', function (c) {
				return areas[pivot](c);
			});
	}

	function identity(x) {
		return x;
	}

	var mouseover = identity;
	var mouseout = identity;

};

VisualizationManager.register(viz);

function compose(f, g) {
	return function (x) {
		return f(g(x));
	}
}

});

}());
