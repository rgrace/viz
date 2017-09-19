(function() {
  var d3 = d3v4;
  var viz = {
    id: "highcharts_treemap",
    label: "Treemap",
    options: {
      chart_name: {
        label: "Chart Name",
        type: "string",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 1
      max_mes = 2
      min_dim = 1
      max_dim = 5
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

      if (resp.fields.dimension_like.length > max_dim) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need " + min_dim +" to "+ max_dim +" dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
      }

      if (resp.fields.dimension_like.length < min_dim) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need " + min_dim +" to "+ max_dim +" dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
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
    create: function(element, config) {},

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;

      let dims = queryResponse.fields.dimension_like
      let measure = queryResponse.fields.measure_like[0]

      // walks tree to flatten and pull right fields
      function formatNestedData(tree, idx, parent) {
        let datum = {
          name: tree["key"],
        }
        if (parent == null) {
          datum["id"] = "id_" + idx
          datum["color"] = Highcharts.getOptions().colors[idx]
        } else {
          datum["id"] = [parent.id, idx].join("_")
          datum["parent"] = parent.id
        }
        let formatted_data = []
        if (tree.hasOwnProperty("values") && tree["values"][0].hasOwnProperty(measure.name)) {
          let rawDatum = tree["values"][0][measure.name]
          datum["value"] = rawDatum["value"]

          if (rawDatum["rendered"] == null){
          } else {
            datum["rendered"] = rawDatum["rendered"]
          }
          formatted_data = [datum]
        } else {
          subdata = []

          tree["values"].forEach(function(subtree, i) {
            subdata = subdata.concat(formatNestedData(subtree, i, datum))
          })
          // if (parent == null) {
          //   datum["value"] = d3.sum(subdata, function(d) {return d["value"];})
          // }
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
        credits: {
          enabled: false
        },
        title: {text: config.chart_name},
        series: [{
          type: "treemap",
          data: series,
          layoutAlgorithm: 'squarified',
          allowDrillToNode: true,
          dataLabels: {
              enabled: false
          },
          levelIsConstant: false,
          levels: [{
              level: 1,
              dataLabels: {
                  enabled: true
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
