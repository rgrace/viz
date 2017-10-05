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
  // require proper data input
  handleErrors: function(data, resp) {
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
    return true;
  },
  // Set up the initial state of the visualization
  create: function(element, config) {
    element.innerHTML = ""
  },
  // Transform data
  prepare: function(data, queryResponse) {
    var d3 = d3v4;
    let x = queryResponse.fields.dimensions[0]
    let y = queryResponse.fields.measures[0]

    // [{x.name: value, y.name: value}, ]
    let series = []
    data.forEach(function(datum) {
      let point = {}
      point[x.name] = datum[x.name]["value"]
      point[y.name] = datum[y.name]["value"]
      series.push(point)
    })

    // {date: value, }
    var formattedData = d3.nest()
      .key(function(d) { return d[x.name]; })
      .rollup(function(d) { return d[0][y.name]; })
      .map(series);

    var formatter = formatType(y.value_format);

    return {
      data: formattedData,
      formatter: formatter,
    }
  },

  // Render in response to the data or settings changing
  update: function(data, element, config, queryResponse) {
    if (!handleErrors(vis, data, queryResponse, {
      min_pivots: 0, max_pivots: 0,
      min_dimensions: 1, max_dimensions: 1,
      min_measures: 1, max_measures: 1,
    })) return;
    if (!this.handleErrors(data, queryResponse)) return;
    element.innerHTML = ""
    var formattedData = this.prepare(data, queryResponse)
    return calendarView(element, formattedData, config.color_range)
  }
});
