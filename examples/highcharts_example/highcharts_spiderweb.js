(function() {
  var viz = {
    id: "highcharts_spiderweb",
    label: "Spiderweb",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
    },
    // require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 1
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
      if (!handleErrors(vis, data, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 1, max_dimensions: 1,
        min_measures: 1, max_measures: undefined,
      })) return;

      let x = queryResponse.fields.dimension_like[0]
      let measures = queryResponse.fields.measure_like
      let xCategories = data.map(function(row) {return row[x.name].value})

      let series = measures.map(function(m) {
        let format = formatType(m.value_format)
        return {
          name: m.label_short ? m.label_short : m.label,
          pointPlacement: 'on',
          data: data.map(function(row) {
            return row[m.name].value
          }),
          tooltip: {
            pointFormatter: function() {
              return `<span style="color:${this.series.color}">${this.series.name}: <b>${format(this.y)}</b><br/>`
            }
          },
        }
      })

      let options = {
        credits: {
          enabled: false
        },
        chart: {
          polar: true,
          type: 'line'
        },
        title: {text: config.chartName},
        xAxis: {
          categories: xCategories,
        },
        yAxis: {
          gridLineInterpolation: 'polygon',
          min: 0,
          labels: {
            format: '{value}'
          },
        },
        tooltip: {
          shared: true,
        },
        series: series,
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());
