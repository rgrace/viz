(function() {
  var d3 = d3v4;
  var viz = {
    id: "pivot_table",
    label: "Pivot Table",
    options: {
      // chartName: {
      //   section: "Chart",
      //   label: "Chart Name",
      //   type: "string",
      // },
      row_dimensions: {
        section: "Pivot Table",
        label: "Row Dimensions",
        type: "array",
        order: 0,
      },
      // col_dimensions: {
      //   section: "Pivot Table",
      //   label: "Column Dimensions",
      //   type: "array",
      //   default: null,
      //   order: 1
      // },
      agg_measures: {
        section: "Pivot Table",
        label: "Measures",
        type: "array",
        order: 2
      },
      aggregation: {
        section: "Pivot Table",
        label: "Aggregation",
        type: "string",
        display: "select",
        values: [
           {"Sum": "sum"},
           {"Average": "average"},
           {"Count": "count"},
           {"Median": "median"},
           {"Min": "min"},
           {"Max": "max"},
           {"Variance": "variance"},
           // quantile, extent
        ],
        default: "sum",
        order: 3
      },
    },
    grid: null,
    // Require proper data input
    handleErrors: function(data, resp) {
      var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
      min_mes = 1
      max_mes = 3
      min_dim = 1
      max_dim = 5
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

      // If no errors found, then return true
      return true;
    },

    // Set up the initial state of the visualization
    create: function(element, config) {
      $(element).addClass("ag-bootstrap")
    },

    aggregationType: function(aggregation) {
      switch(aggregation) {
        case "average":
          return d3.mean; break
        case "median":
          return d3.median; break
        case "min":
          return d3.min; break
        case "max":
          return d3.max; break
        case "variance":
          return d3.variance; break
        case "count":
          return function(items) {return items.length}; break
        case "sum":
        default:
          return d3.sum; break
      }
    },

    // Transform data
    prepare: function(data, config, queryResponse) {
      let dimensions = queryResponse.fields.dimensions
      // todo filter to agg_measures
      let measures = queryResponse.fields.measures

      let aggregators = dimensions.filter(function(f) {
        return config.row_dimensions.indexOf(f.name) !== -1
      })
      if (!aggregators) aggregators = dimensions

      let aggMeasures = measures.filter(function(f) {
        return config.agg_measures.indexOf(f.name) !== -1
      })
      console.log("aggMeasures", aggMeasures)
      if (!aggMeasures) aggMeasures = measures


      let aggregationFunc = this.aggregationType(config.aggregation)

      //ag-grid doesn't like periods in their field names...
      function cleanFieldName(name) {
        return name.split(".")[1]
      }

      let my_nest = d3.nest()
      // group by each dimension
      aggregators.forEach(function(dim) {
        my_nest = my_nest.key(function(d) {
          return JSON.stringify({
            field: cleanFieldName(dim.name),
            value: d[dim.name]["rendered"] ? d[dim.name]["rendered"]: d[dim.name]["value"],
          })
          // return d[dim.name]["rendered"] ? d[dim.name]["rendered"]: d[dim.name]["value"]
        })
      })
      my_nest = my_nest.rollup(function(row) {
        obj = {}
        aggMeasures.map(function(m) {
          obj[cleanFieldName(m.name)] = aggregationFunc(row, function(d) {return d[m.name]["value"]})
        })
        return obj;
      })

      var formattedData = my_nest
        .entries(data)

      let fields = aggregators.concat(aggMeasures)
      let columnDefs = fields.map(function(f) {
        return {
          field: cleanFieldName(f.name),
          headerName: f.label_short,
        }
      })

      let rowData = []

      unnest = function(tree, idx, row) {
        if (row === undefined){
          row = {}
        }

        let key = JSON.parse(tree.key)
        row[key.field] = key.value
        if (tree.hasOwnProperty("values")) {
          tree.values.map(function(t) {unnest(t, idx, row)})
        } else {
          row = Object.assign(row, tree.value)
          // create copy for rows
          // objects are passed by reference and changed
          rowData.push(JSON.parse(JSON.stringify(row)))
        }
      }

      formattedData.map(function(t, idx) {unnest(t, idx)})

      var gridOptions = {
        columnDefs: columnDefs,
        rowData: rowData,
        enableSorting: true,
      };

      return gridOptions
    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;
      if (this.grid) this.grid.destroy()
      console.log(data, config, queryResponse)
      var gridOptions = this.prepare(data, config, queryResponse)
      console.log("gridOptions", gridOptions)
      this.grid = new agGrid.Grid(element, gridOptions)
      return this.grid
    }
  }
  looker.plugins.visualizations.add(viz);
}())
