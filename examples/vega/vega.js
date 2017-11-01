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
      // vega doesn't like periods in their field names...
      function fieldName(name) {
        return name.split(".")[1]
      }
      let fields = queryResponse.fields.dimension_like.concat(queryResponse.fields.measure_like);
      return data.map(function(d) {
        return fields.reduce(function(acc, cur) {
          acc[fieldName(cur.name)] = d[cur.name].value;
          return acc
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
      let jsonData = this.prepare(data, queryResponse);
      let spec = JSON.parse(config.spec);
      spec.data = {
        values: jsonData,
      };
      return vegaEmbed(element, spec, {
        actions: false
      });
    }
  }
  looker.plugins.visualizations.add(viz);
}());
