looker.plugins.visualizations.add({
  id: "matrix",
  label: "Matrix",
  options: {
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
    var d3 = d3v4;

    // Clear any errors from previous updates
    this.clearErrors();

    var margin = {top: 50, right: 30, bottom: 10, left: 150};
    var width = element.clientWidth - margin.left - margin.right;
    var height = element.clientHeight - margin.top - margin.bottom;

    var color = d3.scaleThreshold()
      .domain([0, 50, 1000, 5000, 50000, 100000, 200000])
      .range(["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#4a1486"]);

    var size = Math.min(width,height);

    var svg = this._svg
      .html("")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr('transform', 'translate(' + [margin.left, margin.top] + ')');

    var dimension1 = queryResponse.fields.dimensions[0].name;
    var dimension2 = queryResponse.fields.dimensions[1].name;
    var measure = queryResponse.fields.measures[0].name;

    var format = d3.format(",");

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
        return color(d[measure].value);
      })
      .append("title")
      .text(function(d) { return format(d[measure].value); });

    svg.selectAll(".x.axis text")
      .on("click", function(d) {
        var lookup = {};

        var filtered = data.filter(function(p) {
          return p[dimension2].value == d;
        })

        filtered.forEach(function(p) {
          lookup[p[dimension1].value] = p[measure].value;
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
          lookup[p[dimension2].value] = p[measure].value;
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

