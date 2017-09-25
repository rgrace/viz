looker.plugins.visualizations.add({
  id: "treemap-2",
  label: "Treemap 2",
  options: {
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    var d3 = d3v4;

    this._svg = d3.select(element).append("svg");

  },
  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    var d3 = d3v4;

    // Clear any errors from previous updates
    this.clearErrors();

    var width = element.clientWidth;
    var height = element.clientHeight;

    var dimension = queryResponse.fields.dimensions[0].name;
    var measure = queryResponse.fields.measures[0].name;

    var format = d3.format(",");

    var color = d3.scaleSequential(d3.interpolateViridis)
      .domain([50, 0]);

    data.forEach(function(row) {
      row.taxonomy = row[dimension].value.split("-");  
    });

    var treemap = d3.treemap()
        .size([width, height-16])
        .tile(d3.treemapSquarify.ratio(1))
        .paddingOuter(2)
				.paddingTop(function(d) {
          return d.depth == 1 ? 16 : 2;
        })
        .paddingInner(2)
        .round(true);

    var svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", "translate(0,16)");

    var breadcrumb = svg.append("text")
      .attr("y", -5)  
      .attr("x", 4);

    var root = d3.hierarchy(burrow(data))
//        .sum(function(d) { return ("data" in d) ? d.data[measure].value : 0; });
      .sum(function(d) { return d.children.length > 0 ? 0 : 1; });
    treemap(root);

    var cell = svg.selectAll(".node")
        .data(root.descendants())
      .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
        .attr("class", function(d,i) { return "node depth-" + d.depth; })
        .style("cursor", "pointer")
        .on("click", function(d) { console.log(d);})
        .on("mouseenter", function(d) {
          var ancestors = d.ancestors();
          breadcrumb.text(ancestors.map(function(p) { return p.data.name }).slice(0,-1).reverse().join("-") + ": " + format(d.value));
        })
        .on("mouseleave", function(d) {
          breadcrumb.text("");
        });
    
    cell.append("rect")
      .attr("id", function(d,i) { return "rect-" + i; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .style("stroke", "#000")
      .style("fill", function(d) {
        return "data" in d.data ? color(d.data.data[measure].value) : color(0);
      });

		cell.append("clipPath")
				.attr("id", function(d,i) { return "clip-" + i; })
			.append("use")
				.attr("xlink:href", function(d,i) { return "#rect-" + i; });

		var label = cell
        .append("text")
        .style("opacity", function(d) {
          if (d.depth == 1) return 1;
          return 0;
        })
				.attr("clip-path", function(d,i) { return "url(#clip-" + i + ")"; })
				.attr("y", function(d) {
          return d.depth == 1 ? "13" : "10";
        })
				.attr("x", 2)
				.style("font-family", "Helvetica, Arial, sans-serif")
        .style("fill", "white")
				.style("font-size", function(d) {
          return d.depth == 1 ? "14px" : "10px";
        })
				.text(function(d) { return d.data.name == "root" ? "" : d.data.name; });

    /*
    console.log("burrowed", burrow(data));
    console.log("root", root);
    console.log("config", config);
    console.log("data", data);
    console.log("queryResponse", queryResponse);
    */

    function burrow(table) {
      // create nested object
      var obj = {};
      table.forEach(function(row) {
        // start at root
        var layer = obj;

        // create children as nested objects
        row.taxonomy.forEach(function(key) {
          layer[key] = key in layer ? layer[key] : {};
          layer = layer[key];
        });
        layer.__data = row;
      });

      // recursively create children array
      var descend = function(obj, depth) {
        var arr = [];
        var depth = depth || 0;
        for (var k in obj) {
          if (k == "__data") { continue; }
          var child = {
            name: k,
            depth: depth,
            children: descend(obj[k], depth+1)
          };
          if ("__data" in obj[k]) {
            child.data = obj[k].__data;
          }
          arr.push(child);
        }
        return arr;
      };

      // use descend to create nested children arrys
      return {
        name: "root",
        children: descend(obj, 1),
        depth: 0
      }
    };

  }
});

