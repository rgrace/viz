looker.plugins.visualizations.add({
  id: "sankey",
  label: "Sankey",
  options: {
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    var d3 = d3v4;

    var css = element.innerHTML = `
      <style>
      .node,
      .link {
        transition: 0.5s opacity;
      }
      </style>
    `;

    this._svg = d3.select(element).append("svg");

  },
  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    var d3 = d3v4;

    // Clear any errors from previous updates
    this.clearErrors();

    var width = element.clientWidth;
    var height = element.clientHeight;

    var svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g");

    var dimension1 = queryResponse.fields.dimensions[0].name;
    var dimension2 = queryResponse.fields.dimensions[1].name;
    var measure = queryResponse.fields.measures[0].name;

    var format = d3.format(",");

    var color = d3.scaleOrdinal()
      .range(["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"]);

		var defs = svg.append('defs');

		var sankey = d3.sankey()
				.nodeWidth(10)
				.nodePadding(12)
				.extent([[1, 1], [width - 1, height - 6]]);

		var link = svg.append("g")
				.attr("class", "links")
				.attr("fill", "none")
				.attr("stroke", "#fff")
			.selectAll("path");

		var node = svg.append("g")
				.attr("class", "nodes")
				.attr("font-family", "sans-serif")
				.attr("font-size", 10)
			.selectAll("g");

		var graph = {
			nodes: [],
			links: []
		};

		var nodes = d3.set();

		data.forEach(function(d) {
			nodes.add(d[dimension1].value + "1");
			nodes.add(d[dimension2].value + "2");
			graph.links.push({ "source": d[dimension1].value + "1",
												 "target": d[dimension2].value + "2",
												 "value": +d[measure].value});
		});

		var nodesArray = nodes.values();

		graph.links.forEach(function (d, i) {
			d.source = nodesArray.indexOf(d.source);
			d.target = nodesArray.indexOf(d.target);
		});

		graph.nodes = nodes.values().map(function(d) {
			return {
				name: d.slice(0,-1)
			};
		});

		sankey(graph);

		link = link
			.data(graph.links)
			.enter().append("path")
        .attr("class", "link")
				.attr("d", function(d) { return "M" + -10 + "," + -10 + d3.sankeyLinkHorizontal()(d); })
				.style("opacity", 0.4)
				.attr("stroke-width", function(d) { return Math.max(1, d.width); })
        .on("mouseenter", function(d) {
          svg.selectAll(".link")
            .style("opacity", 0.1)
          d3.select(this)
            .style("opacity", 0.7)
          svg.selectAll(".node")
            .style("opacity", function(p) {
              if (p == d.source) return 1;
              if (p == d.target) return 1;
              return 0.5;
            });
        })
        .on("mouseleave", function(d) {
          d3.selectAll(".node").style("opacity", 1);
          d3.selectAll(".link").style("opacity", 0.4);
        });

		// gradients https://bl.ocks.org/micahstubbs/bf90fda6717e243832edad6ed9f82814
		link.style('stroke', function(d,i) {

			// make unique gradient ids
			var gradientID = "gradient" + i;

			var startColor = color(d.source.name.replace(/ .*/, ""));
			var stopColor = color(d.target.name.replace(/ .*/, ""));

			var linearGradient = defs.append('linearGradient')
					.attr('id', gradientID);

			linearGradient.selectAll('stop')
				.data([
						{offset: '10%', color: startColor },
						{offset: '90%', color: stopColor }
					])
				.enter().append('stop')
				.attr('offset', function(d) {
					return d.offset;
				})
				.attr('stop-color', function(d) {
					return d.color;
				});

			return "url(#" + gradientID + ")";
		})

		node = node
			.data(graph.nodes)
			.enter().append("g")
      .attr("class", "node")
      .on("mouseenter", function(d) {
        svg.selectAll(".link")
          .style("opacity", function(p) {
            if (p.source == d) return 0.7;
            if (p.target  == d) return 0.7;
            return 0.1;
          });
      })
      .on("mouseleave", function(d) {
        d3.selectAll(".link").style("opacity", 0.4);
      });

		node.append("rect")
				.attr("x", function(d) { return d.x0; })
				.attr("y", function(d) { return d.y0; })
				.attr("height", function(d) { return d.y1 - d.y0; })
				.attr("width", function(d) { return d.x1 - d.x0; })
				.attr("fill", function(d) { return color(d.name.replace(/ .*/, "")); })
				.attr("stroke", "#555");

		node.append("text")
				.attr("x", function(d) { return d.x0 - 6; })
				.attr("y", function(d) { return (d.y1 + d.y0) / 2; })
				.attr("dy", "0.35em")
				.style("font-weight", "bold")
				.attr("text-anchor", "end")
				.style("fill", "#222")
				.text(function(d) { return d.name; })
			.filter(function(d) { return d.x0 < width / 2; })
				.attr("x", function(d) { return d.x1 + 6; })
				.attr("text-anchor", "start");

		node.append("title")
				.text(function(d) { return d.name + "\n" + d.value; });
  }
});

