(function() {
  var viz = {
    id: "vega",
    label: "Vega",
    options: {
      spec: {
        type: "string",
        label: "Vega JSON Spec",
      },
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = ""
    },
    // Transform data
    prepare: function(data, queryResponse) {
      let fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);
      return data.map(function(d) {
        let row = fields.reduce(function(acc,  cur) {
          acc[cur.name] = d[cur.name].value;
        }, {});
      })
    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!handleErrors(this, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 0, max_dimensions: undefined,
        min_measures: 0, max_measures: undefined,
      })) return;
      this.create(element, config);
      console.log(data, queryResponse);
      let jsonData = this.prepare(data, queryResponse);
      config.spec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.0.json",
        "description": "A simple bar chart with embedded data.",
        "data": {
          "values": [
            {"a": "A","b": 28}, {"a": "B","b": 55}, {"a": "C","b": 43},
            {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
            {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
          ]
        },
        "mark": "bar",
        "encoding": {
          "x": {"field": "a", "type": "ordinal"},
          "y": {"field": "b", "type": "quantitative"}
        }
      }
      let spec = JSON.parse(config.spec);
      spec.data = {
        values: jsonData,
      };
      return vegaEmbed("#vis", spec);
    }
  }
  looker.plugins.visualizations.add(viz);
}());
