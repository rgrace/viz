(function() {
  var d3 = d3v4;
  var viz = {
    id: "highcharts_histogram",
    label: "Highcharts Histogram",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      bins: {
        label: "Number of Bins",
        default: 5,
        section: "Histogram",
        type: "number",
        placeholder: "Any number",
        display_size: "half",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 0
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

      if (!resp.fields.dimensions[0].is_numeric) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need to have a numeric dimension"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
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
      let y = queryResponse.fields.measures[0]

      function aesthetic(datum, field) {
        let value = datum[field.name].value
        if (field.is_timeframe) {
          let date = datum[field.name].value
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

      // function fieldExtent(data, field) {
      //   let [min, max] = [null, null]
      //   let categories = null
      //   let fieldScale = null

      //   if (field.is_timeframe || field.is_numeric) {
      //     [min, max] = d3.extent(data, function(d) {return aesthetic(d, field)})
      //   } else {
      //     categories = d3.map(data, function(d) {return aesthetic(d, field)}).keys()
      //     fieldScale = d3.scaleOrdinal()
      //       .domain(categories)
      //       .range(d3.range(0, categories.length, 1))
      //   }
      //   return {
      //     min: min,
      //     max: max,
      //     categories: categories,
      //     fieldScale: fieldScale,
      //   }
      // }

      // let xExtent = fieldExtent(data, x)

      function histogram(data, count, aesthetic) {
        var extent = d3.extent(data, aesthetic)
        var x = d3.scaleLinear().domain(extent).nice(count);
        var histo = d3.histogram()
          .value(aesthetic)
          .domain(x.domain())
          .thresholds(x.ticks(count));
        var bins = histo(data);
        return bins.map(function(d) { return [d.x0, d.length] })
      }

      let binnedData = histogram(data, config.bins, function(d) { return aesthetic(d, x)});

      let yAxisName = 'Count'
      if (config.yAxisName) {
        yAxisName = config.yAxisName + ' ' + yAxisName
      } else if (y && y.label) {
        if (y.label_short.indexOf("Count") !== -1) {
          yAxisName = y.label + ' ' + yAxisName
        } else {
          yAxisName = y.label_short + ' ' + yAxisName
        }
      }

      let options = {
        chart: {type: 'column'},
        title: {text: config.chartName},
        legend: {enabled: false},
        xAxis: {
          gridLineWidth: 1,
          type: x.is_timeframe ? "datetime" : x.is_numeric ? "linear" : "category",
          title: {
            text: config.xAxisName ? config.xAxisName : x.label_short
          },
        },
        yAxis: [{
          title: {
            text: yAxisName,
          }
        }],
        series: [{
          name: x.label_short,
          type: 'column',
          data: binnedData,
          pointPadding: 0,
          groupPadding: 0,
          pointPlacement: 'between',
        }]
      }
      let myChart = Highcharts.chart(element, options);
    }
  }
  looker.plugins.visualizations.add(viz);
}())
