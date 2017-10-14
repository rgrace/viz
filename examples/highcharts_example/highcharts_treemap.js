(function() {
  var viz = {
    id: "highcharts_treemap",
    label: "Treemap",
    options: {
      chart_name: {
        label: "Chart Name",
        type: "string",
      },
      color_range: {
        type: "array",
        label: "Color Range",
        display: "colors",
        default: ["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"],
      },
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = ""
    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!handleErrors(this, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 1, max_dimensions: undefined,
        min_measures: 1, max_measures: 1,
      })) return;

      let d3 = d3v4;

      let dims = queryResponse.fields.dimension_like
      let measure = queryResponse.fields.measure_like[0]


      let mFormat = formatType(measure.value_format)

      // walks tree to flatten and pull right fields
      function formatNestedData(tree, idx, parent) {
        let datum = {
          name: tree["key"],
        }
        if (parent == null) {
          datum["id"] = "id_" + idx
          datum["color"] = config.color_range[idx]
        } else {
          datum["id"] = [parent.id, idx].join("_")
          datum["parent"] = parent.id
        }
        let formatted_data = []
        if (tree.hasOwnProperty("values") && tree["values"][0].hasOwnProperty(measure.name)) {
          let rawDatum = tree["values"][0][measure.name]
          datum["value"] = rawDatum["value"]
          formatted_data = [datum]
        } else {
          subdata = []

          tree["values"].forEach(function(subtree, i) {
            subdata = subdata.concat(formatNestedData(subtree, i, datum))
          })
          formatted_data = [datum]
          formatted_data = formatted_data.concat(subdata)
        }
        return formatted_data
      }

      let my_nest = d3.nest()
      // group by each dimension
      dims.forEach(function(dim) {
        my_nest = my_nest.key(function(d) { return d[dim.name]["value"]; })
      })
      nested_data = my_nest
        .entries(data)

      series = []
      nested_data.forEach(function(tree, idx) {
        series = series.concat(formatNestedData(tree, idx))
      })

      let options = {
        colors: config.color_range,
        credits: {
          enabled: false
        },
        title: {text: config.chart_name},
        series: [{
          type: "treemap",
          data: series,
          tooltip: {
            pointFormatter: function() {
              return `<span style="color:${this.series.color}">\u25CF</span> ${this.name}: <b>${mFormat(this.value)}</b><br/>`
            },
          },
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          dataLabels: {
            enabled: false
          },
          levelIsConstant: false,
          levels: [{
              level: 1,
              dataLabels: {
                enabled: true,
              },
              borderWidth: 3
          }],
        }],
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
