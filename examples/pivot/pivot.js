(function() {
  var d3 = d3v4;
  var viz = {
    id: "pivot_table",
    label: "Pivot Table",
    options: {
      row_dimensions: {
        section: "Pivot Table",
        label: "Row Dimensions",
        type: "array",
        order: 0,
      },
      col_dimensions: {
        section: "Pivot Table",
        label: "Column Dimensions",
        type: "array",
        default: null,
        order: 1
      },
      aggregation: {
        section: "Pivot Table",
        label: "Aggregation",
        type: "string",
        display: "select",
        values: [
           {"Sum": "sum"},
           {"Average": "avg"},
           {"Count": "count"},
           {"Min": "min"},
           {"Max": "max"},
           {"First": "first"},
           {"Last": "last"},
           // TODO quantile, extent, median
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
      min_dim = 0
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

      if (resp.fields.dimensions.length < min_dim) {
        this.addError({
          group: "dim-req",
          title: "Incompatible Data",
          message: "You need " + min_dim + " dimensions"
        });
        return false;
      } else {
        this.clearErrors("dim-req");
      }

      if (resp.fields.measure_like.length < min_mes) {
        this.addError({
          group: "mes-req",
          title: "Incompatible Data",
          message: "You need " + min_mes + " measures"
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
      $(element).addClass("ag-fresh")
    },

    // Transform data
    prepare: function(data, config, queryResponse) {
      //ag-grid doesn't like periods in their field names...
      function cleanFieldName(name) {
        return name.split(".")[1]
      }

      let cleanData = data.map(function(row) {
        cleanObj = {}
        Object.keys(row).map(function(key) {
          cleanObj[cleanFieldName(key)] = row[key]
        })
        return cleanObj
      })

      let dimensions = queryResponse.fields.dimensions
      let measures = queryResponse.fields.measures

      let columnDefs = dimensions.map(function(f) {
        return {
          field: cleanFieldName(f.name),
          headerName: f.label_short,
          valueGetter: function(params) {
            if (!params.data) {return }
            let point = params.data[cleanFieldName(f.name)]
            return point.value
          },
          valueFormatter: function(params) {
            if (!params.data) {return }
            let point = params.data[cleanFieldName(f.name)]
            return point.rendered ? point.rendered : point.value
          },
          enableRowGroup: true,
          enablePivot: true,
        }
      })
      columnDefs = columnDefs.concat(measures.map(function(f) {
        return {
          field: cleanFieldName(f.name),
          headerName: f.label_short,
          valueGetter: function(params) {
            if (!params.data) {return }
            let point = params.data[cleanFieldName(f.name)]
            return point.value
          },
          valueFormatter: function(params) {
            if (!params.data) {return }
            let point = params.data[cleanFieldName(f.name)]
            return point.rendered ? point.rendered : point.value
          },
          enableValue: true,
          aggFunc: config.aggregation,
        }
      }))

      var gridOptions = {
        columnDefs: columnDefs,
        rowData: cleanData,
        enableSorting: true,
        showToolPanel: true,
        pivotMode: true,
        rowGroupPanelShow: 'always',
        toolPanelSuppressPivotMode: true,
        rowGroupColumns: config.row_dimensions,
        pivotColumns: config.col_dimensions,
        enableStatusBar: true,
        alwaysShowStatusBar: false, //status bar can be be fixed
        enableRangeSelection: true,
      }

      return gridOptions
    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;
      if (this.grid) this.grid.destroy()

      var gridOptions = this.prepare(data, config, queryResponse)
      this.grid = new agGrid.Grid(element, gridOptions)
      return this.grid
    }
  }
  looker.plugins.visualizations.add(viz);
}())
