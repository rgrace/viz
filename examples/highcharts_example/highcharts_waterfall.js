(function() {
  var d3 = d3v4;
  var viz = {
    id: "highcharts_waterfall",
    label: "Waterfall",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      finalLabelOn: {
        section: "Waterfall",
        label: "Final Label On",
        type: "boolean",
        default: true,
        display_size: "half",
        order: 0,
      },
      finalLabel: {
        section: "Waterfall",
        label: "Final Label",
        type: "string",
        default: "Final",
        display_size: "half",
        order: 1,
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

      function formatType(valueFormat, significantDigits) {
        if (typeof valueFormat != "string") {
          return function (x) {return x}
        }
        let format = ""
        switch (valueFormat.charAt(0)) {
          case '$':
            format += '$'; break
          case '£':
            format += '£'; break
          case '€':
            format += '€'; break
        }
        if (valueFormat.indexOf(',') > -1) {
          format += ','
        }
        splitValueFormat = valueFormat.split(".")
        format += '.'
        if (splitValueFormat.length > 1) {
          format += d3.min([splitValueFormat[1].length, significantDigits])
        } else {
          format += 0
        }
        switch(valueFormat.slice(-1)) {
          case '%':
            format += '%'; break
          case '0':
            format += 'f'; break
        }
        return d3.format(format)
      }

      function diff(a) {
        return a.slice(1).map(function(n, i) { return n - a[i]; });
      }

      let x = queryResponse.fields.dimension_like[0]
      let y = queryResponse.fields.measure_like[0]
      let xCategories = data.map(function(row) {return row[x.name].value})
      let seriesData = data.map(function(row) {return row[y.name].value})

      let totalColor = "#5245ed"
      let upColor = "#008000"
      let downColor = "#FF0000"
      // first element, deltas
      let deltas = [{y: seriesData[0], color: totalColor}]
        .concat(diff(seriesData))

      if (config.finalLabelOn) {
        xCategories.push(config.finalLabel)
        deltas.push({y: seriesData[seriesData.length - 1], color: totalColor, isSum: true,})
      }

      let series = [{
        upColor: upColor,
        color: downColor,
        data: deltas,
      }]

      let options = {
        credits: {
          enabled: false
        },
        chart: {type: 'waterfall'},
        title: {text: config.chartName},
        legend: {enabled: false},
        xAxis: {
          categories: xCategories,
        },
        yAxis: {
          title: {
            text: y.label_short ? y.label_short : y.label
          },
          labels: {
            formatter: function() {
              return `<b>${formatType(y.value_format, 0)(this.value)}</b>`
            }
          },
        },
        tooltip: {
          pointFormatter: function() {
            return `<b>${formatType(y.value_format)(this.y)}</b>`
          }
        },
        series: series,
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
