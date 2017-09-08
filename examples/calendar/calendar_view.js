var d3 = d3v4;
function calendarView(element, formattedData) {

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

  let minYear = d3.min(formattedData.keys(), function(d) { return parseDate(d).getFullYear(); })
  let maxYear = d3.max(formattedData.keys(), function(d) { return parseDate(d).getFullYear(); })

  let yearLength = maxYear - minYear + 1

  let minY = d3.min(formattedData.values(), function(d) { return d; })
  let maxY = d3.max(formattedData.values(), function(d) { return d; })

  var heightCellRatio = 9
      widthCellRatio = 55;

  var cellSize = d3.min([(element.offsetWidth - 20) / widthCellRatio, element.offsetHeight / yearLength / heightCellRatio])
      width = cellSize * widthCellRatio
      yearHeight = cellSize * heightCellRatio
      height = yearHeight * yearLength;

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
      .text(function(d) { return d + ": " + formattedData.get(d); })
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
