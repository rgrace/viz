(function() {
  var d3 = d3v4;
  var viz = {
    id: "highcharts_boxplot",
    label: "Highcharts Boxplot",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      xAxisName: {
        label: "Axis Name",
        section: "X",
        type: "string",
        placeholder: "Provide an axis name ..."
      },
      yAxisName: {
        label: "Axis Name",
        section: "Y",
        type: "string",
        placeholder: "Provide an axis name ..."
      },
      yAxisMinValue: {
        label: "Min value",
        default: null,
        section: "Y",
        type: "number",
        placeholder: "Any number",
        display_size: "half",
      },
      yAxisMaxValue: {
        label: "Max value",
        default: null,
        section: "Y",
        type: "number",
        placeholder: "Any number",
        display_size: "half",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 5
      max_mes = 5
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

      if (resp.fields.measure_like.length > max_mes) {
        this.addError({
          group: "mes-req",
          title: "Incompatible Data",
          message: "You need " + min_mes +" to "+ max_mes +" measures " +
            "requires a minimum, lower quartile (Q1), median (Q2), upper quartile (Q3), and maximum"
        });
        return false;
      } else {
        this.clearErrors("mes-req");
      }

      if (resp.fields.measure_like.length < min_mes) {
        this.addError({
          group: "mes-req",
          title: "Incompatible Data",
          message: "You need " + min_mes +" to "+ max_mes +" measures " +
            "requires a minimum, lower quartile (Q1), median (Q2), upper quartile (Q3), and maximum"
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

      let dim = queryResponse.fields.dimensions[0]
      let measures = queryResponse.fields.measures

      let categories = []
      let series = []
      data.forEach(function(datum) {
        let point = []

        if (dim.is_timeframe) {
          let date = datum[dim.name]["value"]
          switch(dim.field_group_variant) {
            case "Month":
            case "Quarter":
              date = date + "-01"
              break;
            case "Year":
              date = date + "-01-01"
              break;
          }
          dateVal = Date.UTC.apply(Date, date.split(/\D/))
          point.push(dateVal)
        } else if (dim.is_numeric) {
          point.push(datum[dim.name]["value"])
        } else {
          categories.push(datum[dim.name]["rendered"] ?
          datum[dim.name]["rendered"] :
          datum[dim.name]["value"])
        }

        measures.forEach(function(m) {
          point.push(datum[m.name]["value"])
        })

        series.push(point)
      })
      // series format:
      // [[1.5,25,44.4,72.98,999],[0.02,21.99,39.99,79,903]]

      let options = {
          chart: {type: "boxplot"},
          title: {text: config.chartName},
          legend: {enabled: false},

          xAxis: {
            type: dim.is_timeframe ? "datetime" : null,
            title: {
              text: config.xAxisName ? config.xAxisName : dim.label
            }
          },

          yAxis: {
            min: config.yAxisMinValue,
            max: config.yAxisMaxValue,
            title: {
              text: config.yAxisName
            }
          },

          series: [{
              data: series,
          },]
      };
      if (categories.length > 0) {
        options["xAxis"]["categories"] = categories
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
