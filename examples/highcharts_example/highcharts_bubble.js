(function() {
  var viz = {
    id: "highcharts_bubble",
    label: "Bubble",
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
      min_mes = 1
      max_mes = 2
      min_dim = 1
      max_dim = 2
      min_piv = 0
      max_piv = 1

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
    create: function(element, config) {
      element.innerHTML = ""
    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;
      let x = queryResponse.fields.dimension_like[0]
      let y = queryResponse.fields.measure_like[0]
      let z = queryResponse.fields.measure_like.length > 1 ? queryResponse.fields.measure_like[1] : null

      var fieldMap = function(p, idx, key, field, pivot) {
        let rawDatum = p[field.name]
        if (pivot && key != "x") {
          rawDatum = p[field.name][pivot]
        }
        let datum = {}
        datum[key] = rawDatum["value"]
        datum[key + "_rendered"] = rawDatum["rendered"] ? rawDatum["rendered"]: rawDatum["value"]

        if (field.is_timeframe) {
          datum["date"] = rawDatum["value"]
          switch(field.field_group_variant) {
            case "Month":
            case "Quarter":
              datum["date"] = datum["date"] + "-01"
              break;
            case "Year":
              datum["date"] = datum["date"] + "-01-01"
              break;
          }
          dateVal = Date.UTC.apply(Date, datum["date"].split(/\D/))
          datum[key] = dateVal
        }
        return datum
      }

      var dataMapping = function(p, idx, pivot) {
        const xDatum = fieldMap(p, idx, "x", x, pivot)
        const yDatum  = fieldMap(p, idx, "y", y, pivot)

        let point = Object.assign(xDatum, yDatum)
        if (z) {
          const zDatum  = fieldMap(p, idx, "z", z, pivot)
          point = Object.assign(point, zDatum)
        }
        return point
      }

      let series
      if (queryResponse.fields.pivots.length == 0) {
        let seriesData = data.map(function(p, idx) { return dataMapping(p, idx) })
        series = [{
          data: seriesData,
          tooltip: {
            pointFormat: z ? "{point.x_rendered}: {point.y_rendered}, {point.z_rendered}" : "{point.x_rendered}: {point.y_rendered}",
          },
          name: y.label_short ? y.label_short : y.label,
        }]
      } else {
        series = []
        pivots = Object.keys(data[0][y.name])
        for (i = 0; i < pivots.length; i++) {
          pivot = pivots[i]
          let seriesData = data.map(function(p, idx) { return dataMapping(p, idx, pivot) })
          series.push({
            name: pivot,
            data: seriesData,
            tooltip: {
              pointFormat: z ? "{point.x_rendered}: {point.y_rendered}, {point.z_rendered}" : "{point.x_rendered}: {point.y_rendered}",
            },
            // color: ,
          })
        }
      }

      let options = {
        credits: {
          enabled: false
        },
        chart: {
          type: "bubble",
          plotBorderWidth: 1,
          zoomType: "xy"
        },
        title: {text: config.chartName},
        legend: {enabled: false},

        xAxis: {
          type: x.is_timeframe ? "datetime" : x.is_numeric ? "linear" : "category",
          title: {
            text: config.xAxisName ? config.xAxisName : x.label_short ? x.label_short : x.label
          }
        },

        yAxis: {
          min: config.yAxisMinValue,
          max: config.yAxisMaxValue,
          labels: {
              format: '{value}'
          },
          title: {
            text: config.yAxisName
          },
        },

        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              format: "{point.name}"
            }
          }
        },
        series: series
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
