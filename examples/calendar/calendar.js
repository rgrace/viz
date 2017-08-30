/*!
 * An implementation of Mike Bostock's Calendar View within the Looker custom visualization API
 *
 * https://bl.ocks.org/mbostock/4063318
 */

(function() {
  var d3 = d3v4;
  var viz = {
    id: "calendar",
    label: "Calendar",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 1
      max_mes = 1
      min_dim = 1
      max_dim = 1
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

      if (resp.fields.dimensions.length > max_dim) {
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
          message: "You need " + min_dim +" to "+ max_dim +" dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
      }

      if (!resp.fields.dimensions[0].is_timeframe) {
        this.addError({
            group: "dim-date",
            title: "Incompatible Data",
            message: "You need a date dimension"
          });
        return false;
        if(resp.fields.dimensions[0].field_group_variant != "Date") {
          this.addError({
            group: "dim-date",
            title: "Incompatible Data",
            message: "You need a date dimension"
          });
          return false;
        } else {
          this.clearErrors("dim-date");
        }
      } else {
        this.clearErrors("dim-date");
      }

      if (resp.fields.measure_like.length > max_mes) {
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
          message: "You need " + min_mes +" to "+ max_mes +" measures"
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
      d3.select(element).empty();
    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;

      let x = queryResponse.fields.dimensions[0]
      let y = queryResponse.fields.measures[0]

      let series = []
      data.forEach(function(datum) {
        let point = {}
        point[x.name] = datum[x.name]["value"]
        point[y.name] = datum[y.name]["value"]
        series.push(point)
      })

      // {date: value}
      var formattedData = d3.nest()
          .key(function(d) { return d[x.name]; })
          .rollup(function(d) { return d[0][y.name]; })
          .map(series);
      function calendarView(series, element, dateKey, valueKey) {
        function monthPath(t0) {
          var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
              d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0)
              d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
          return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
              + "H" + w0 * cellSize + "V" + 7 * cellSize
              + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
              + "H" + (w1 + 1) * cellSize + "V" + 0
              + "H" + (w0 + 1) * cellSize + "Z";
        }

        var format = d3.timeFormat("%Y-%m-%d");
        var parseDate = d3.timeParse("%Y-%m-%d");

        let minYear = d3.min(series, function(d) { return parseDate(d[dateKey]).getFullYear(); })
        let maxYear = d3.max(series, function(d) { return parseDate(d[dateKey]).getFullYear(); })

        let yearLength = maxYear - minYear + 1

        let minY = d3.min(series, function(d) { return d[valueKey]; })
        let maxY = d3.max(series, function(d) { return d[valueKey]; })

        // element.offsetHeight / (maxYear + 1 - minYear)

        // var width = 960 // element.offsetWidth
        //     yearHeight = 136 // element.offsetHeight
        //     cellSize = 17; // cell size

        var heightCellRatio = 9
            widthCellRatio = 55;

        var cellSize = d3.min([(element.offsetWidth - 20) / widthCellRatio, element.offsetHeight / yearLength / heightCellRatio])
            width = cellSize * widthCellRatio
            yearHeight = cellSize * heightCellRatio
            height = yearHeight * yearLength;

        console.log(width, height, yearHeight, cellSize)

        var color = d3.scaleQuantize()
            .domain([minY, maxY])
            .range(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]);

        var svg = d3.select(element)
          .selectAll("svg")
            .data(d3.range(minYear, maxYear + 1))
          .enter().append("svg")
            .style("display", "block")
            .style("margin", "0 auto")
            .attr("width", width)
            .attr("height", yearHeight)
            .attr("year", function(d) { return d; })
          .append("g")
            // .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (yearHeight - cellSize * 7 - 1) + ")");
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + ",0)");

        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("font-family", "sans-serif")
            .style("font-size", 10)
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        var rect = svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#ccc")
          .selectAll("rect")
          .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
            .attr("y", function(d) { return d.getDay() * cellSize; })
            .datum(format);

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
          .selectAll("path")
          .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
          .enter().append("path")
            .attr("d", monthPath);

        var tooltip = d3.select(element)
          .append("div").attr("id", "tooltip")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")

        rect.filter(function(d) { return formattedData.has(d); })
            .attr("fill", function(d) { return color(formattedData.get(d)); })
          .append("title")
            .text(function(d) { return d + ": " + formattedData.get(d); });
          .on("click", function(d) { console.log(d);})
          .on("mouseenter", function(d) {
            tooltip.style("visibility", "visible");
            d.style("fill-opacity", .15);
            tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
            tooltip.text(function(d) { return d + ": " + formattedData.get(d); })
              .style("left",  (d3.event.pageX)+30 + "px")
              .style("top", (d3.event.pageY) + "px");
          })
          .on("mouseleave", function(d) {
            tooltip.text("")
              .style("visibility", "hidden");
            d.style("fill-opacity", 1);
          });
      }
      calendarView(series, element, x.name, y.name)
    }
  }
  looker.plugins.visualizations.add(viz);
}())
