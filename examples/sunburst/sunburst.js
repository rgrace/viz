looker.plugins.visualizations.add({
  id: "sunburst",
  label: "Sunburst",
  options: {
    color_range: {
      type: "array",
      label: "Color Range",
      display: "colors",
      default: ["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"],
    },
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    this._svg = d3v4.select(element).append("svg");
  },
  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    if (!handleErrors(this, data, queryResponse, {
      min_pivots: 0, max_pivots: 0,
      min_dimensions: 1, max_dimensions: undefined,
      min_measures: 1, max_measures: 1,
    })) return;
    let d3 = d3v4;

    let width = element.clientWidth;
    let height = element.clientHeight;
    let radius = (Math.min(width, height) / 2) - 8;

    let dimensions = queryResponse.fields.dimension_like;
    let measure = queryResponse.fields.measure_like[0];

    let format = formatType(measure.value_format);

    let x = d3.scaleLinear()
          .range([0, 2 * Math.PI]);

    let y = d3.scaleSqrt()
          .range([0, radius]);

    let color = d3.scaleOrdinal()
      .range(config.color_range);

    data.forEach(function(row) {
      row.taxonomy = dimensions.map(function(dimension) {return row[dimension.name].value}) // row[dimension].value.split("-");
    });

    let partition = d3.partition()
      .size([2 * Math.PI, radius * radius]);

    let arc = d3.arc()
      .startAngle(function(d) { return d.x0; })
      .endAngle(function(d) { return d.x1; })
      .innerRadius(function(d) { return Math.sqrt(d.y0); })
      .outerRadius(function(d) { return Math.sqrt(d.y1); });

    let svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

    let label = svg.append("text")
      .attr("y", -height/2 + 20)
      .attr("x", -width/2 + 20);

    let root = d3.hierarchy(burrow(data))
          .sum(function(d) { return ("data" in d) ? d.data[measure.name].value : 0; });
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

          let ancestors = d.ancestors();
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
      let obj = {};
      table.forEach(function(row) {
        // start at root
        let layer = obj;

        // create children as nested objects
        row.taxonomy.forEach(function(key) {
          layer[key] = key in layer ? layer[key] : {};
          layer = layer[key];
        });
        layer.__data = row;
      });

      // recursively create children array
      let descend = function(obj, depth) {
        let arr = [];
        depth = depth || 0;
        for (let k in obj) {
          if (k == "__data") { continue; }
          let child = {
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

