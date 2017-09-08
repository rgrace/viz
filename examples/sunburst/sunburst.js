looker.plugins.visualizations.add({
  id: "sunburst",
  label: "Sunburst",
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
    var radius = (Math.min(width, height) / 2) - 8;

    var dimension = queryResponse.fields.dimensions[0].name;
    var measure = queryResponse.fields.measures[0].name;

    var format = d3.format(",");

    var x = d3.scaleLinear()
          .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
          .range([0, radius]);

    var color = d3.scaleOrdinal()
      .range(["#4aac8d", "#9061c9", "#64ac48", "#c75d9c", "#9a963f", "#6c8acd", "#c97f3e", "#cb5352"]);

    data.forEach(function(row) {
      row.taxonomy = row[dimension].value.split("-");
    });

    var partition = d3.partition()
      .size([2 * Math.PI, radius * radius]);

    var arc = d3.arc()
      .startAngle(function(d) { return d.x0; })
      .endAngle(function(d) { return d.x1; })
      .innerRadius(function(d) { return Math.sqrt(d.y0); })
      .outerRadius(function(d) { return Math.sqrt(d.y1); });

    var svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    var label = svg.append("text")
      .attr("y", -height/2 + 20)
      .attr("x", -width/2 + 20);

    var root = d3.hierarchy(burrow(data))
      .sum(function(d) { return ("data" in d) ? d.data[measure].value : 0; });

    partition(root);

    svg.selectAll("path")
        .data(root.descendants())
      .enter().append("path")
        .attr("d", arc)
        .style("fill", function(d) {
          if (d.depth == 0) return "none";
          return color(d.ancestors().map(function(p) { return p.data.name }).slice(-2,-1));
        })
        .style("fill-opacity", function(d) {
          return 1 - d.depth*0.15;
        })
        .style("transition", function(d) {
          return "fill-opacity 0.5s";
        })
        .style("stroke", function(d) { return "#fff"; })
        .style("stroke-width", function(d) { return "0.5px"; })
        .on("click", function(d) { console.log(d);})
        .on("mouseenter", function(d) {
          label.text(d.ancestors().map(function(p) { return p.data.name }).slice(0,-1).reverse().join("-") + ": " + format(d.value));

          var ancestors = d.ancestors();
          svg.selectAll("path")
            .style("fill-opacity", function(p) {
              return ancestors.indexOf(p) > -1 ? 1 : 0.15;
            });
        })
        .on("mouseleave", function(d) {
          label.text("");
          svg.selectAll("path")
            .style("fill-opacity", function(d) {
              return 1 - d.depth*0.15;
            })
        });

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

      // use descend to create nested children arrays
      return {
        name: "root",
        children: descend(obj, 1),
        depth: 0
      }
    };

  }
});
