looker.plugins.visualizations.add({
  id: "matrix",
  label: "Matrix",
  options: {
    color_range: {
      type: "array",
      label: "Color Range",
      display: "colors",
      default: ["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"],
    },
  },
  // require proper data input
  handleErrors: function(data, resp) {
    var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
    min_mes = 1
    max_mes = 1
    min_dim = 2
    max_dim = 2
    min_piv = 0
    max_piv = 0

    if (resp.fields.pivots.length > max_piv) {
      this.addError({
        group: "pivot-req",
        title: "Incompatible Data",
        message: "No pivot is allowed"
      });
      return false;
    } else {
      this.clearErrors("pivot-req");
    }

    if (resp.fields.pivots.length < min_piv) {
      this.addError({
        group: "pivot-req",
        title: "Incompatible Data",
        message: "Add a Pivot"
      });
      return false;
    } else {
      this.clearErrors("pivot-req");
    }

    if (max_dim && resp.fields.dimensions.length > max_dim) {
      this.addError({
        group: "dim-req",
        title: "Incompatible Data",
        message: "You need " + min_dim +" to "+ max_dim +" dimensions"
      });
      return false;
    } else {
      this.clearErrors("dim-req");
    }

    if (resp.fields.dimensions.length < min_dim) {
      this.addError({
        group: "dim-req",
        title: "Incompatible Data",
        message: "You need " + min_dim + max_dim ? " to "+ max_dim : "" +" dimensions"
      });
      return false;
    } else {
      this.clearErrors("dim-req");
    }

    if (max_mes && resp.fields.measure_like.length > max_mes) {
      this.addError({
        group: "mes-req",
        title: "Incompatible Data",
        message: "You need " + min_mes +" to "+ max_mes +" measures"
      });
      return false;
    } else {
      this.clearErrors("mes-req");
    }

    if (resp.fields.measure_like.length < min_mes) {
      this.addError({
        group: "mes-req",
        title: "Incompatible Data",
        message: "You need " + min_mes + max_mes ? " to "+ max_mes : "" +" measures"
      });
      return false;
    } else {
      this.clearErrors("mes-req");
    }

    // If no errors found, then return true
    return true;
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    var d3 = d3v4;

    var css = element.innerHTML = `
      <style>
      .axis path {
        display: none;
      }
      rect {
        opacity: 0.9;
      }
      .x.axis text {
        cursor: ns-resize;
      }
      .y.axis text {
        cursor: ew-resize;
      }
      </style>
    `;

    this._svg = d3.select(element).append("svg");

  },
  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    if (!this.handleErrors(data, queryResponse)) return;
    var d3 = d3v4;

    var margin = {top: 50, right: 30, bottom: 10, left: 150};
    var width = element.clientWidth - margin.left - margin.right;
    var height = element.clientHeight - margin.top - margin.bottom;

    // needs to be more dynamic
    var color = d3.scaleThreshold()
      .domain([0, 50, 1000, 5000, 50000, 100000, 200000])
      .range(config.color_range);

    var size = Math.min(width,height);

    var svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

    var dimension1 = queryResponse.fields.dimension_like[0].name;
    var dimension2 = queryResponse.fields.dimension_like[1].name;
    var measure = queryResponse.fields.measure_like[0];

    var format = formatType(measure.value_format);

    var dimset1 = d3.set();
    var dimset2 = d3.set();

    data.forEach(function(d) {
      dimset1.add(d[dimension1].value);
      dimset2.add(d[dimension2].value);
    });

    var yscale = d3.scaleBand()
      .range([0, size])
      .paddingOuter(0.1)
      .paddingInner(0.1)
      .domain(dimset1.values());

    var xscale = d3.scaleBand()
      .range([0, size])
      .paddingOuter(0.1)
      .paddingInner(0.1)
      .domain(dimset2.values());

    var yaxis = d3.axisLeft()
      .scale(yscale);

    var xaxis = d3.axisTop()
      .scale(xscale)

    svg.append("g")
      .attr("class", "y axis")
      .call(yaxis);

    svg.select(".y.axis")
      .selectAll("text")
      .style("font-size", "15px");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (0) + ")")
      .call(xaxis);

    svg.select(".x.axis")
      .selectAll("text")
      .attr("text-anchor", "start")
      .style("font-size", "15px")
      .attr("transform", "translate(0,0) rotate(-30)");

    svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr('y', function(d) {
        return yscale(d[dimension1].value);
      })
      .attr('x', function(d) {
        return xscale(d[dimension2].value);
      })
      .attr('height', yscale.bandwidth())
      .attr('width', xscale.bandwidth())
      .style("fill", function(d) {
        return color(d[measure.name].value);
      })
      .append("title")
      .text(function(d) { return format(d[measure.name].value); });

    svg.selectAll(".x.axis text")
      .on("click", function(d) {
        var lookup = {};

        var filtered = data.filter(function(p) {
          return p[dimension2].value == d;
        })

        filtered.forEach(function(p) {
          lookup[p[dimension1].value] = p[measure.name].value;
        });

        var sorted = dimset1.values()
        sorted.sort(function(a,b) {
            var one = a in lookup ? lookup[a] : 0;
            var two = b in lookup ? lookup[b] : 0;
            return two - one;
          });

        yscale.domain(sorted);

        svg.selectAll("rect")
          .transition()
          .duration(800)
          .attr('y', function(d) {
            return yscale(d[dimension1].value);
          })

        svg.select(".y.axis")
          .transition()
          .duration(800)
          .call(yaxis);
      });

    svg.selectAll(".y.axis text")
      .on("click", function(d) {
        var lookup = {};

        var filtered = data.filter(function(p) {
          return p[dimension1].value == d;
        })

        filtered.forEach(function(p) {
          lookup[p[dimension2].value] = p[measure.name].value;
        });

        var sorted = dimset2.values()
        sorted.sort(function(a,b) {
            var one = a in lookup ? lookup[a] : 0;
            var two = b in lookup ? lookup[b] : 0;
            return two - one;
          });

        xscale.domain(sorted);

        svg.selectAll("rect")
          .transition()
          .duration(800)
          .attr('x', function(d) {
            return xscale(d[dimension2].value);
          })

        svg.select(".x.axis")
          .transition()
          .duration(800)
          .call(xaxis);
      });

  }
});

