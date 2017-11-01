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

    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      this.create(element, config);
      console.log(data, queryResponse);
      let jsonData = this.prepare(data, queryResponse);
      var yourVlSpec = {
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
      return vegaEmbed("#vis", yourVlSpec);//config.spec);
    }
  }
  looker.plugins.visualizations.add(viz);
}());
