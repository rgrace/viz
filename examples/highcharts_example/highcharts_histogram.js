(function() {
  var viz = {
    id: "highcharts_histogram",
    label: "Histogram",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      color_range: {
        type: "array",
        label: "Color Range",
        display: "colors",
        default: ["#dd3333", "#80ce5d", "#f78131", "#369dc1", "#c572d3", "#36c1b3", "#b57052", "#ed69af"],
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
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = ""
    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!handleErrors(this, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 1, max_dimensions: 1,
        min_measures: 0, max_measures: 1,
      })) return;
      let d3 = d3v4;

      let x = queryResponse.fields.dimension_like[0]
      let y = queryResponse.fields.measure_like[0]

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
        colors: config.color_range,
        credits: {
          enabled: false
        },
        chart: {type: 'column'},
        title: {text: config.chartName},
        legend: {enabled: false},
        xAxis: {
          gridLineWidth: 1,
          type: x.is_timeframe ? "datetime" : x.is_numeric ? "linear" : "category",
          title: {
            text: config.xAxisName ? config.xAxisName : x.label_short ? x.label_short : x.label
          },
        },
        yAxis: [{
          title: {
            text: yAxisName,
          }
        }],
        series: [{
          name: x.label_short ? x.label_short : x.label,
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
