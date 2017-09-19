(function() {
  var d3 = d3v4;
  var viz = {
    id: "highcharts_heatmap",
    label: "Heatmap",
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
      max_mes = 1
      min_dim = 2
      max_dim = 2
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

      let x = queryResponse.fields.dimensions[0]
      let y = queryResponse.fields.dimensions[1]
      let z = queryResponse.fields.measures[0]

      function aesthetic(datum, field) {
        let value = datum[field.name].value
        if (field.is_timeframe) {
          let date = datum[x.name].value
          switch(field.field_group_variant) {
            case "Month":
            case "Quarter":
              date = date + "-01"
              break;
            case "Year":
              date = date + "-01-01"
              break;
          }
          value = Date.UTC.apply(Date, date.split(/\D/))
        }
        return value
      }

      function fieldExtent(data, field) {
        let [min, max] = [null, null]
        let categories = null
        let fieldScale = null

        if (field.is_timeframe || field.is_numeric) {
          [min, max] = d3.extent(data, function(d) {return aesthetic(d, field)})
        } else {
          categories = d3.map(data, function(d) {return aesthetic(d, field)}).keys()
          fieldScale = d3.scaleOrdinal()
            .domain(categories)
            .range(d3.range(0, categories.length, 1))
        }
        return {
          min: min,
          max: max,
          categories: categories,
          fieldScale: fieldScale,
        }
      }

      let xExtent = fieldExtent(data, x)
      let yExtent = fieldExtent(data, y)

      let [minz, maxz] = d3.extent(data, function(d) {return aesthetic(d, z)})

      function scaledAesthetic(d, field, fieldScale) {
        let value = aesthetic(d, field)
        if (fieldScale != null) {
          return fieldScale(value)
        }
        return value
      }

      function aesthetics(d) {
        // return {
        //   x: aesthetic(d, x),
        //   y: aesthetic(d, y),
        //   z: aesthetic(d, z),
        // }
        return [
          scaledAesthetic(d, x, xExtent.fieldScale),
          scaledAesthetic(d, y, yExtent.fieldScale),
          aesthetic(d, z)]
      }

      // [{x: , y:, z:}, ...]
      let series = data.map(aesthetics)

      let options = {
        credits: {
          enabled: false
        },
        chart: {
          type: 'heatmap',
          plotBorderWidth: 1,
        },
        title: {text: config.chartName},
        legend: {enabled: false},
        xAxis: {
          type: x.is_timeframe ? "datetime" : x.is_numeric ? "linear" : "category",
          title: {
            text: config.xAxisName ? config.xAxisName : x.label_short
          },
          min: xExtent.min,
          max: xExtent.max,
          categories: xExtent.categories,
        },
        yAxis: {
          type: y.is_timeframe ? "datetime" : y.is_numeric ? "linear" : "category",
          title: {
            text: config.yAxisName ? config.yAxisName : y.label_short
          },
          min: yExtent.min,
          max: yExtent.max,
          categories: yExtent.categories,
        },
        colorAxis: {
          min: minz,
          max: maxz,
          minColor: '#3060cf',
          maxColor: '#c4463a',
        },
        series: [{
          data: series,
          borderWidth: 1,
          dataLabels: {
            enabled: true,
            color: '#000000'
          },
          tooltip: {
            headerFormat: z.label_short + '<br/>',
            pointFormatter: function() {
              let x = xExtent.fieldScale ? xExtent.categories[this.x] : this.x
              let y = yExtent.fieldScale ? yExtent.categories[this.y] : this.y
              let z = this.value
              return `${x} ${y} <b>${z}</b>`
            }
          },
        }]
      };

      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
