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
    if (!this.handleErrors(data, queryResponse)) return;
    element.innerHTML = ""
    var formattedData = this.prepare(data, queryResponse)
    return calendarView(element, formattedData, config.color_range)
  }
});
