/* Wrap everything in an immediately-invoked function expression. */
(function () {

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
	if (!data || !resp) {
		return null;
	}

	if (resp.fields.dimensions.length !== 1) {
		this.addError({
			group: 'dimension-req'
			, title: 'Incompatible Data'
			, message: 'One dimension is required'
		});
		return false;
	}

	if (resp.fields.measures.length !== 1) {
		this.addError({
			group: 'measure-req'
			, title: 'Incompatible Data'
			, message: 'One measure is required'
		});
		return false;
	}

	if (resp.fields.pivots.length !== 1) {
		this.addError({
			group: 'pivot-req'
			, title: 'Incompatible Data'
			, message: 'One pivot is required'
		});
		return false;
	}


	[
		'dimension-req'
		, 'measure-req'
		, 'pivot-req'
	].forEach(this.clearErrors);
	
	return true;

	function no_bar(x) {
		return x.key.indexOf('|') === -1;
	}
};

/**
 * The creation method should set up the state of the DOM. In this case, we'll
 * make an element to hold the chart and set the height and width.
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
	/* TODO: This layout is painfully naive... */
	, margin = { top: 15, right: 10, bottom: 40, left: 65 }
	, w = Math.floor($el.width()/cols - (margin.right + margin.left)*cols)
	, h = Math.floor($el.height()/rows - (margin.top + margin.bottom)*(rows - 1))
	, plot
	;

	if (!h || h <= 0 || !w || w <= 0) {
		return;
	}

	$el.find('div').empty();
	
	plot = SmallMultiples(w, h, settings, resp);
	plotData('#small-multiples-chart-box', d, plot);

	function SmallMultiples(w, h, settings, resp) {
		var cur_x, caption, circle, data, x_scale, y_scale, x_val,
			y_val, pivot_vals, x_trans, y_trans, y_axis, area,
			line, bisect;

		data = [];
		
		x_scale = d3.time.scale().range([0, w]);
		y_scale = d3.scale.linear().range([h, 0]);

		x_val = prop('dim');
		y_val = prop('meas');
		pivot_vals = prop('v');
		pivot_key = prop('k');
		
		bisect = d3.bisector(x_val).left;

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
			var data, div, min_x;
			data = xs;
			setup_scales(data);
			div = d3.select(this).selectAll('.chart').data(data)
			div.enter().append('div')
				.attr('class', 'chart')
				.style('float', 'left')
				.append('svg')
				.append('g');

			div.exit().remove();

			var svg = div.select('svg')
				.attr('width', w + margin.left + margin.right)
				.attr('height', h + margin.top + margin.bottom);

		      	var g = svg.select('g')
				.attr('transform', 'translate(' + margin.left +
						',' + margin.top + ')');
		     
		      	g.append('rect')
				.attr('class', 'background')
				.style('pointer-events', 'all')
				.style('fill', 'none')
				.attr('width', w + margin.right )
				.attr('height', h)
				.on('mouseover', show_circle)
				.on('mousemove', show_x_pos)
				.on('mouseout', hide_circle);

			var lines = g.append('g');

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

			lines.append('text')
				.attr('class', 'pivot-name')
				.attr('text-anchor', 'middle')
				.attr('y', h)
				.attr('dy', margin.bottom/2 + 5)
				.attr('x', w/2)
				.text(pivot_key);
			
			/**
			 * TODO: These static labels will be wrong if the data
			 * are sorted descending.
			 */
			lines.append('text')
				.attr('class', 'static-xlabel')
				.attr('text-anchor', 'start')
				.style('pointer-events', 'none')
				.attr('dy', 13)
				.attr('y', h)
				.attr('x', 0)
				.text(reduce_x(d3.min));

			lines.append("text")
				.attr("class", "static-xlabel")
				.attr("text-anchor", "end")
				.style("pointer-events", "none")
				.attr("dy", 13)
				.attr("y", h)
				.attr("x", w)
				.text(reduce_x(d3.max));

			circle = lines.append('circle')
				.attr('r', 2.2)
				.attr('opacity', 0)
				.style('pointer-events', 'none')

			caption = lines.append('text')
				.attr('class', 'caption')
				.attr('text-anchor', 'middle')
				.style('pointer-events', 'none')
				.attr('dy', -8)

			cur_x = lines.append('text')
				.attr('class', 'year')
				.attr('text-anchor', 'middle')
				.style('pointer-events', 'none')
				.attr('dy', 13)
				.attr('y', h)

			return g.append('g')
				.attr('class', 'y-axis')
				.call(y_axis);
		
			/* TODO: Need to deal with non-date x values. */	
			function reduce_x(f) {
				return function (x) {
					return f(pivot_vals(x).map(x_val))
						.getFullYear();
				};
			}
		}

		function chart(sel) {
			sel.each(doit);
		}

		function show_circle() {
			circle.attr('opacity', 1.0);
			d3.selectAll('.static-xlabel').classed('hidden', true);
			return show_x_pos.call(this);
		}

		function show_x_pos() {
			var x = x_scale.invert(d3.mouse(this)[0]);
			var str = x.getFullYear().toString() +
				'-' +
				(d3.format('02d')(x.getMonth() + 1)).toString();
			var date = fmt.parse(str);

			var index = 0;
			circle.attr("cx", x_scale(date))
				.attr("cy", function (c) {
					var xs = pivot_vals(c);
					index = bisect(xs, date, 0, xs.length - 1);
					return y_scale(y_val(xs[index]));
				});

			caption.attr("x", x_scale(date))
				.attr("y", function (c) {
					var xs = pivot_vals(c);
					return y_scale(y_val(xs[index]));
				})
				.text(function (c) {
					var xs = pivot_vals(c)
					, f = d3.format(',.0f')
					;
					return f(y_val(xs[index]));
				});

			return cur_x.attr("x", x_scale(date))
				.text(str);
		}
		
		function hide_circle() {
			d3.selectAll('.static-xlabel')
				.classed('hidden', false);
			circle.attr('opacity', 0);
			caption.text('');
			return cur_x.text('');
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

looker.plugins.visualizations.add(viz);

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

function identity(x) {
	return x;
}

}());
