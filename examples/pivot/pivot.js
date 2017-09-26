(function() {
  var d3 = d3v4;
  var viz = {
    id: "pivot_table",
    label: "Pivot Table",
    options: {},
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
      if (this.grid) this.grid.destroy()
    },

    // Transform data
    prepare: function(data, config, queryResponse) {
      // ag-grid doesn't like periods in their field names...
      function cleanFieldName(name) {
        return name.split(".")[1]
      }

      function getFormatType(valueFormat) {
        let format
        switch(valueFormat) {
          case "$#,##0":
            format = d3.format("$,.0f"); break
          case "$#,##0.00":
            format = d3.format("$,.2f"); break
          case "#,##0.00%":
            format = d3.format(",.2%"); break
          case "#,##0%":
            format = d3.format(",.0%"); break
          case "#,##0":
            format = d3.format(",.0f"); break
          case "#,##0.00":
            format = d3.format(",.2f"); break
          default:
            format = function (x) { return x }; break
        }
        return format
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
      let fields = dimensions.concat(measures)

      let columnDefs = fields.map(function(f) {
        base = {
          field: cleanFieldName(f.name),
          headerName: f.label_short,
          valueGetter: function(params) {
            if (!params.data) {return }
            let point = params.data[cleanFieldName(f.name)]
            return point.value
          },
          valueFormatter: function(params) {
            let format = getFormatType(f.value_format)
            return format(params.value)
          },
        }
        if (dimensions.indexOf(f) > -1) {
          base['enableRowGroup'] = true
          base['enablePivot'] = true
        } else {
          base['enableValue'] = true
          base['aggFunc'] = 'sum'
        }
        return base
      })

      let vis = this
      let gridOptions = {
        columnDefs: columnDefs,
        rowData: cleanData,
        enableSorting: true,
        showToolPanel: true,
        pivotMode: true,
        rowGroupPanelShow: 'always',
        toolPanelSuppressPivotMode: true,
        enableStatusBar: true,
        alwaysShowStatusBar: false, //status bar can be be fixed
        enableRangeSelection: true,
        onColumnRowGroupChanged: function(event) {
          vis.trigger("updateConfig", [{pivotState: event.columnApi.getColumnState()}])
        },
        onColumnValueChanged: function(event) {
          vis.trigger("updateConfig", [{pivotState: event.columnApi.getColumnState()}])
        },
        onColumnPivotChanged: function(event) {
          vis.trigger("updateConfig", [{pivotState: event.columnApi.getColumnState()}])
        },
      }
      return gridOptions
    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!this.handleErrors(data, queryResponse)) return;

      let gridOptions = this.prepare(data, config, queryResponse)
      this.grid = new agGrid.Grid(element, gridOptions)
      if (config.pivotState) {
        gridOptions.columnApi.setColumnState(config.pivotState)
      }
      return this.grid
    }
  }
  looker.plugins.visualizations.add(viz);
}())
