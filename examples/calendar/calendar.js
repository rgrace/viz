/*!
 * An implementation of Mike Bostock's Calendar View within the Looker custom visualization API
 *
 * https://bl.ocks.org/mbostock/4063318
 */

looker.plugins.visualizations.add({
  id: "calendar",
  label: "Calendar",
  options: {
    color_range: {
      type: "array",
      label: "Color Range",
      display: "colors",
      default: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
    },
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    element.innerHTML = ""
  },
  // Transform data
  prepare: function(data, queryResponse) {
    let x = queryResponse.fields.dimensions[0]
    let y = queryResponse.fields.measures[0]

    // [{x.name: value, y.name: value}, ]
    let series = []
    data.filter(function(d) {
      return d3v4.timeParse("%Y-%m-%d")(d[x.name]["value"])
    }).forEach(function(d) {
      let point = {}
      point[x.name] = d[x.name]["value"]
      point[y.name] = d[y.name]["value"]
      series.push(point)
    })

    // {date: value, }
    let formattedData = d3v4.nest()
      .key(function(d) { return d[x.name] })
      .rollup(function(d) { return d[0][y.name] })
      .map(series)

    let formatter = formatType(y.value_format)

    return {
      data: formattedData,
      formatter: formatter,
    }
  },
  handleErrors(queryResponse) {
    if (!(queryResponse.fields.dimensions[0].is_timeframe &&
          queryResponse.fields.dimensions[0].time_interval.name === "day")) {
      this.addError({
        group: "date-req",
        title: "Incompatible Data",
        message: "Calendar Visualization Requires a Date Dimension",
      })
      return false
    } else {
      this.clearErrors("date-req")
    }
    return true
  },
  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    if (!handleErrors(this, queryResponse, {
      min_pivots: 0, max_pivots: 0,
      min_dimensions: 1, max_dimensions: 1,
      min_measures: 1, max_measures: 1,
    })) return
    if (!this.handleErrors(queryResponse)) return
    this.create(element, config)
    let formattedData = this.prepare(data, queryResponse)
    return calendarView(element, formattedData, config.color_range)
  }
})
