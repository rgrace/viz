function calendarView(element, formattedData, colorRange) {
  let data = formattedData.data

  function monthPath(t0) {
    let t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
        d0 = t0.getDay(), w0 = d3v4.timeWeek.count(d3v4.timeYear(t0), t0)
        d1 = t1.getDay(), w1 = d3v4.timeWeek.count(d3v4.timeYear(t1), t1)
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
        + "H" + w0 * cellSize + "V" + 7 * cellSize
        + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
        + "H" + (w1 + 1) * cellSize + "V" + 0
        + "H" + (w0 + 1) * cellSize + "Z"
  }

  let format = d3v4.timeFormat("%Y-%m-%d")
  let parseDate = d3v4.timeParse("%Y-%m-%d")

  let minYear = d3v4.min(data.keys(), function(d) { return parseDate(d).getFullYear() })
  let maxYear = d3v4.max(data.keys(), function(d) { return parseDate(d).getFullYear() })

  let yearLength = maxYear - minYear + 1

  let minY = d3v4.min(data.values(), function(d) { return d })
  let maxY = d3v4.max(data.values(), function(d) { return d })

  let heightCellRatio = 9
      widthCellRatio = 55

  let cellSize = d3v4.max([d3v4.min([(element.offsetWidth - 20) / widthCellRatio, element.offsetHeight / yearLength / heightCellRatio]), 1])
      width = cellSize * widthCellRatio
      yearHeight = cellSize * heightCellRatio
      height = yearHeight * yearLength

  let color = d3v4.scaleQuantize()
      .domain([minY, maxY])
      .range(colorRange)

  let svg = d3v4.select(element)
    .selectAll("svg")
      .data(d3v4.range(minYear, maxYear + 1))
    .enter().append("svg")
      .style("display", "block")
      .style("margin", "0 auto")
      .attr("width", width)
      .attr("height", yearHeight)
      .attr("year", function(d) { return d })
    .append("g")
      .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + ",0)")

  svg.append("text")
      .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
      .style("font-family", "sans-serif")
      .style("font-size", 10)
      .style("text-anchor", "middle")
      .text(function(d) { return d })

  let rect = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
    .selectAll("rect")
    .data(function(d) { return d3v4.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
    .enter().append("rect")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", function(d) { return d3v4.timeWeek.count(d3v4.timeYear(d), d) * cellSize })
      .attr("y", function(d) { return d.getDay() * cellSize })
      .datum(format)

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
    .selectAll("path")
    .data(function(d) { return d3v4.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)) })
    .enter().append("path")
      .attr("d", monthPath)

  let tooltip = d3v4.select(element)
    .append("div").attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

  rect.filter(function(d) { return data.has(d) })
      .attr("fill", function(d) { return color(data.get(d)) })
    .append("title")
      .text(function(d) { return d + ": " + formattedData.formatter(data.get(d)) })
    .on("mouseenter", function(d) {
      tooltip.style("visibility", "visible")
      d.style("fill-opacity", .15)
      tooltip.transition()
        .duration(10)
        .style("opacity", .9)
        .style("visibility", "visible")
      tooltip.text(function(d) { return d + ": " + formattedData.formatter(data.get(d)) })
        .style("left",  (d3v4.event.pageX)+30 + "px")
        .style("top", (d3v4.event.pageY) + "px")
    })
    .on("mouseleave", function(d) {
      console.log("leave")
      tooltip.text("")
        .style("visibility", "hidden")
      d.style("fill-opacity", 1)
    })
}
