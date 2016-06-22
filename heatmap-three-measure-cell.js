(function() {
looker.plugins.visualizations.add({
  id: 'heatmap',
  label: 'Heatmap',
  options: {
    
    colorPreSet:
    {
      type: 'string',
      display: 'select',
      label: 'Color Range',
      section: 'Data',
      values: [{'Custom': 'c'},
      {'Tomato to Steel Blue': '#F16358,#DF645F,#CD6566,#BB666D,#A96774,#97687B,#856982,#736A89,#616B90,#4F6C97,#3D6D9E'},
      {'Pink to Black': '#170108,#300211,#49031A,#620423,#79052B,#910734,#AA083D, #C30946,#DA0A4E,#F30B57,#F52368,#F63378,#F63C79,#F75389,#F86C9A,#F985AB,#FB9DBC,#FCB4CC,#FDCDDD,#FEE6EE'},
      {'Green to  Red': '#ff4000,#ff8000,#ffbf00,#ffff00,#bfff00,#80ff00,#40ff00,#00ff00'},
      {'White to Green': '#ffffe5,#f7fcb9,#d9f0a3,#addd8e,#78c679,#41ab5d,#238443,#006837,#004529'},
      {'Sunset': '#ffffcc,#ffeda0,#fed976,#feb24c,#fd8d3c,#fc4e2a,#e31a1c,#b10026'}],
       default: 'c',
      order: 1
    },
    colorRange: {
      type: 'array',
      label: 'Custom Color Ranges',
      section: 'Data',
      order: 2,
      placeholder: '#fff, red, etc...'
    },    
    colorMinRange: {
      type: 'number',
      label: 'Min Range to Color',
      section: 'Data',
      order: 2.51,
      placeholder: 'min'
    },
    colorMaxRange: {
      type: 'number',
      label: 'Max Range to Color',
      section: 'Data',
      order: 2.52,
      placeholder: 'max'
    },
    colorMeasure: {
      type: 'number',
      label: 'Measure to Color',
      section: 'Data',
      placeholder: '1,2 or 3',
      order: 3
    },
      cellBorders: {
      type: "boolean",
      label: "Show Cell Borders",
      section: "Data",
      default: true,
      order: 4
    },      
    nullCellBorders: {
      type: "boolean",
      label: "Show Cell Borders for null values",
      section: "Data",
      default: false,
      order: 5
    },      
    cellBorderColor: {
      type: "string",
      label: "Border Color",
      section: "Data",
      placeholder: '#000000',
      default: '#000000',
      order: 6
    },   
    verticalAlign: {
      type: 'string',
      display: 'select',
      label: 'Cell Alignment',
      section: 'Data',
      values: [{'Top': 'top'},
      {'Middle': 'middle'},
      {'Bottom': 'bottom'}],
       default: 'top',
       order: 8
    },      
    colorFirstColumn: {
      type: "boolean",
      label: "Color First Column",
      section: "Data",
      default: true,
      order: 10
    },    

    equalWidth: {
      type: "boolean",
      label: "Equal Width Columns",
      section: "Data",
      default: true,
      order: 11
    },    


    // ADD a toggle to color extremes or not
    colorExtremes: {
      type: "boolean",
      label: "Color Extremes",
      section: "Data",
      default: true,
      order: 3.1
    },    
    // colorBottom:

    // colorBottom: {
    //   type: "boolean",
    //   label: "Color Third Measure",
    //   section: "Data",
    //   default: true,
    //   order: 7
    // },   
    headBackground:  {
      type: 'string',
      label: 'Heading Background Color',
      section: 'Heading',
      placeholder: '#CCD8E4',
      order: 1
    },
    headText: {
      type: 'string',
      label: 'Heading Text Color',
      section: 'Heading',
      placeholder: '#000000',
      order: 2
    },
    headBorders: {
      type: "boolean",
      label: "Show Borders",
      section: "Heading",
      default: true,
      order: 3
    },
    headBorderColor: {
      type: "string",
      label: "Border Color",
      section: "Heading",
      placeholder: '#000000',
      default: '#000000',
      order: 4
    },
    headPrefix: {
      type: "string",
      label: "Prefix",
      section: "Heading",
      placeholder: "Week ",
      order: 6},

    headTitle: {
      type: "string",
      label: "Title",
      section: "Heading",
      placeholder: "Enter a new title ",
      order: 8}
  },

  handleErrors: function(data, resp) {

    if (!resp || !resp.fields) return null;
    if (resp.fields.dimensions.length != 1) {
      this.addError({
        group: 'dimension-req',
        title: 'Incompatible Data',
        message: 'One dimension is required'
      });
      return false;
    } else {
      this.clearErrors('dimension-req');
    }
    if (resp.fields.pivots.length != 1) {
      this.addError({
        group: 'pivot-req',
        title: 'Incompatible Data',
        message: 'One pivot is required'
      });
      return false;
    } else {
      this.clearErrors('pivot-req');
    }
    if (resp.fields.measures.length > 3) {
      this.addError({
        group: 'measure-req',
        title: 'Incompatible Data',
        message: 'One to Three measures are required'
      });
      return false;
    } else {
      this.clearErrors('measure-req');
    }
    return true;
  },
  create: function(element, settings) {
    d3.select(element)
      .append('div')
      .style('overflow', 'auto')
      .style('height', '100%')
      .append('table')
      .attr('class', 'heatmap')
      .attr('id', 'heatmap-table')
      .attr('width', '100%')
      .attr('height', '100%');
  },
  update: function(data, element, settings, resp) {
    var columncount = 1 + resp["pivots"].length || 0;
    // console.log(columncount);

      // var tableOffset = $("#heatmap-table").offset().top;
      // var $header = $("#heatmap-table1 > thead").clone();
      // var $fixedHeader = $("#heatmap-table").append($header);

      // $(window).bind("scroll", function() {
      //     var offset = $(this).scrollTop();

      //     if (offset >= tableOffset && $fixedHeader.is(":hidden")) {
      //         $fixedHeader.show();
      //     }
      //     else if (offset < tableOffset) {
      //         $fixedHeader.hide();
      //     }
      // });


    // var $sidebar = $(".thead"),
    //     $window = $('#heatmap-table'),
    //     offset = $sidebar.offset(),
    //     topPadding = 0;

    // $window.scroll(function() {
    //     console.log("scrolling");
    //     if ($window.scrollTop() > offset.top) {
    //         $sidebar.stop().animate({
    //             top: $window.scrollTop() - offset.top + topPadding
    //         });
    //     } else {
    //         $sidebar.stop().animate({
    //             top: 0
    //         });
    //     }
    // });



// console.log(resp);
  if (!this.handleErrors(data, resp)) return;
    this.clearErrors('color-error');
    //var customColorSettings = settings.colorRange || ['white','#b3c8dc','#b3c8dc'];
   
    if (settings.colorPreSet  == 'c') {
      var colorSettings =  settings.colorRange || ['white','#b3c8dc','#b3c8dc'];
    } else {
      var colorSettings =  settings.colorPreSet.split(",");
    };

    var colorMinMaxRange = [settings.colorMinRange || null , settings.colorMaxRange || null ];
    var gradientMeasure = settings.colorMeasure || 1;
    var headText = settings.headText || '#000000';
    var headerPrefix = settings.headPrefix || '';
    var headBackground = settings.headBackground || '#CCD8E4';
    var headTitle = settings.headTitle || '';
    var headBorders = settings.headBorders || false;
    var headBorderColor = settings.headBorderColor || '#000000';
    var cellBorders = settings.cellBorders || false;
    var cellBorderColor = settings.cellBorderColor || '#000000';
    // var colorBottom = settings.colorBottom || false;
    var colorFirstColumn = settings.colorFirstColumn || false;
    var nullCellBorders = settings.nullCellBorders || false;
    var verticalAlign = settings.verticalAlign || 'top';
    var equalWidth = settings.equalWidth || false;

    var colorExtremes = settings.colorExtremes || false;

    // var colorBottomInput = '';

    // if (!colorBottom) {
    //   colorBottomInput = 'background-color:#f6f8fa;';
    // }
    // else {
    //   colorBottomInput = '';
    // }

    if (colorSettings.length <= 1) {
      this.addError({
        group: 'color-error',
        title: 'Invalid Setting',
        message: 'Colors must have two or more values. Each value is separated by a comma. For example "red, blue, green".'
      });
    }
    var measures = [];
    if (resp.fields.measures[0] !== undefined) {
      measures.push(resp.fields.measures[0]);
    }
    if (resp.fields.measures[1] !== undefined) {
      measures.push(resp.fields.measures[1]);
    }
    if (resp.fields.measures[2] !== undefined) {
      measures.push(resp.fields.measures[2]);
    }
    if (resp.fields.table_calculations[0] !== undefined) {
      measures.push(resp.fields.table_calculations[0]);
    }
    if (resp.fields.table_calculations[1] !== undefined) {
      measures.push(resp.fields.table_calculations[1]);
    }
    var dimension = resp.fields.dimensions[0];
    var measure = measures[0];
    // console.log(resp);
    var measure1 = measures[1] || {};
    var measure2 = measures[2] || {};
    var pivot = resp.pivots;
    var coloredMeasure = measure.name

    if(gradientMeasure == '2'){
        coloredMeasure = measure1.name
    }else if(gradientMeasure == '3'){
        coloredMeasure = measure2.name
    };
// console.log(coloredMeasure);

    // return min/max of an array
    var extents = d3.extent(data.reduce(function(prev, curr) {
      var values = pivot.map(function(pivot) {
        // console.log(curr[coloredMeasure][pivot.key].value);

        // test min and max, return only values in between
        if(pivot.is_total){ // ignore totals
          return null;

        }
        // Below Min
        else if(!(colorMinMaxRange[0]==null) && curr[coloredMeasure][pivot.key].value < Number(colorMinMaxRange[0])){
          return colorMinMaxRange[0];

        }
        // Above Max
        else if(!(colorMinMaxRange[1]==null) && curr[coloredMeasure][pivot.key].value > Number(colorMinMaxRange[1])){
          return colorMinMaxRange[1]
        }
        else
          return curr[coloredMeasure][pivot.key].value;
      });
      return prev.concat(values);
    }, []));


    // over write extents if needed due to request 9/14
    extents = [Math.max(Number(colorMinMaxRange[1]),extents[1]) , Math.min(Number(colorMinMaxRange[0]),extents[0])];  
    var extentRange = extents[1] - extents[0];
    var extentInterval = extentRange / (colorSettings.length - 1);
    while(extents.length < colorSettings.length) {
      extents.splice(extents.length-1, 0, extents[extents.length-2]  + extentInterval);
    }
    // console.log(extents);
    // console.log(colorSettings);

    var colorScale = d3.scale.linear().domain(extents).range(colorSettings);

    // console.log(colorScale);

    var table = d3.select(element)
      .select('table');

    var tableHeaderData = [null];
    pivot.forEach(function(pivot) {
      // console.log(pivot.key);
        var outputHeader = "";

        if (headerPrefix == '') {
          outputHeader = pivot.key.toString();
        } else {
          outputHeader = outputHeader.concat(headerPrefix.trim() ,' '  , pivot.key.toString());
          // console.log(' key' + outputHeader);
        }

      tableHeaderData.push(outputHeader);
      tableHeaderData[0] = headTitle || null;
    });

    var thead = table.selectAll('thead')
      .data([[tableHeaderData]]);

    thead.enter()
      .append('thead');

    var theadRow = thead.selectAll('tr')
      .data(function(d) { return d; });

    theadRow.enter()
      .append('tr');

    var theadTd = theadRow.selectAll('td')
      .data(function(d) { 
        // console.log(d);
        return d;
      });

    theadTd.enter()
      .append('td');

    theadTd.style('text-align','center')      
    .style('border', function(d) {
        // console.log(headBorders);
        if (d == null|| d=='' || d==headTitle || headBorders == false) {  // from settings
          return '0px solid black';
        } else {
          return '1px solid ' + headBorderColor;
        }
      })
      .style('background-color',function(d) {
        // console.log(d);
        if (d == null|| d=='' || d==headTitle ) {
          return '';
        } else {
          return headBackground; // from settings
        }
      })
      .style('font-weight','900')
      .style('color', headText)      ; // from settings

    theadTd.exit()
      .remove();

    theadTd.text(function(d) {
        if (d == '$$$_row_total_$$$') {
          return 'Row Totals';
        } else {
          return d;
        }
      });

    // console.log(resp);

    var tbody = table.selectAll('tbody')
      .data([data]);

    tbody.enter()
      .append('tbody');

    var trs = tbody.selectAll('tr')
      .data(function(data) { return data; });

    trs.enter()
      .append('tr');

    trs.exit()
      .remove();
    
    var tds = trs.selectAll('td')
      .data(function(datum) {
        var tdData = [];
        tdData.push({type: 'dimension', data: datum[dimension.name]});
        datum[dimension.name];
        var measureData = datum[measure.name];
        var measureData1 = datum[measure1.name] || '';
        var measureData2 = datum[measure2.name] || '';
        var keyCount = 0; // to indicate column order
        pivot.forEach(function(pivot) {
          tdData.push({type: 'measure', column: keyCount ,data: measureData[pivot.key], data1: measureData1[pivot.key] || {} ,data2: measureData2[pivot.key] || {} });
          keyCount = keyCount + 1; // increment
        });
        return tdData;
      });
    tds.enter()
      .append('td');
    tds.exit()
      .remove();

    tds.style('background-color', function(d) {
        if ((d.type == 'measure' || d.type == 'table_calculations') && d.data.rendered !== '') {

            if(settings.colorFirstColumn == false && d.column == 0){ // check first column setting, leave blank if not enabled
                return '#f6f8fa';
            }
            // ignore row totals
            else if(pivot[d.column].is_total){
                return '#f6f8fa';
             }else if(settings.colorMeasure == '1'){
                if ((!(colorMinMaxRange[0]==null) && d.data.value < Number(colorMinMaxRange[0]) ) || ( !(colorMinMaxRange[1]==null) && d.data.value > Number(colorMinMaxRange[1])) ){ 
                  
                  if (colorExtremes){
                    if (d.data.value < Number(colorMinMaxRange[0])){
                      return colorScale(colorMinMaxRange[0]||0);
                    }
                    else if (d.data.value > Number(colorMinMaxRange[1])){
                      return colorScale(colorMinMaxRange[1]||0);
                    }
                    else{
                    return '#f6f8fa';
                     }
                  }
                  else{
                    return '#f6f8fa';
                  }
                                  }
                else{
                  return colorScale(d.data.value || 0);
                }

            }else if(settings.colorMeasure == '2'){
               if ((!(colorMinMaxRange[0]==null) && d.data1.value < Number(colorMinMaxRange[0]) ) || ( !(colorMinMaxRange[1]==null) && d.data1.value > Number(colorMinMaxRange[1]))){
                  if (colorExtremes){
                    if (d.data1.value < Number(colorMinMaxRange[0])){
                      return colorScale(colorMinMaxRange[0]||0);
                    }
                    else if (d.data1.value > Number(colorMinMaxRange[1])){
                      return colorScale(colorMinMaxRange[1]||0);
                    }
                    else{
                    return '#f6f8fa';
                     }
                  }
                  else{
                    return '#f6f8fa';
                  }
                                  }
                else{
                  return colorScale(d.data1.value || 0);
                }
            }else if(settings.colorMeasure == '3'){
             if ((!(colorMinMaxRange[0]==null) && d.data2.value < Number(colorMinMaxRange[0]) ) || ( !(colorMinMaxRange[1]==null) && d.data2.value > Number(colorMinMaxRange[1]))){
                 if (colorExtremes){
                    if (d.data2.value < Number(colorMinMaxRange[0])){
                      return colorScale(colorMinMaxRange[0]||0);
                    }
                    else if (d.data2.value > Number(colorMinMaxRange[1])){
                      return colorScale(colorMinMaxRange[1]||0);
                    }
                    else{
                    return '#f6f8fa';
                     }
                  }
                  else{
                    return '#f6f8fa';
                  }
                                  }
                else{
                  return colorScale(d.data2.value || 0);
                }
            };
        }
      })
      .style('border', function(d) {
        // console.log(d.data.value);
        if ((d.data.value  == null && !nullCellBorders) || d==headTitle|| !(d.type == 'measure') ) {
          return '0px solid black';
        } else if (!cellBorders) {
          return '0px solid black';
        } else {
          return '1px solid ' + cellBorderColor;
        }
      })
      .style('vertical-align', verticalAlign)
      .style('white-space', function(d) {
        // console.log(d.data.value); 
        if (!(d.type == 'measure')) {
          return 'nowrap';
        } else {
          return 'normal';
        }
      })  

      // smart width

        
      .style('width',function(){
            if(equalWidth) {
              return 100/columncount + '%'
        }
      })
        
      
      .style('text-align', function(d) {
        if (d.type == 'measure') {
          return 'center';
        }
      })
      //.html(function(d) {
      //  return d.data.html || d.data.rendered || 'âˆ…';
      //})
      .html(function(d) {
    if (d.type == 'measure' && d.data.rendered !== '') {
              var outputHtml = '';
              var addBreak = 0;

              if (d.data.rendered || '' !== ''){
                 outputHtml = outputHtml.concat('<span style="color:#2c502a;font-weight:900;">');
                 outputHtml = outputHtml.concat(d.data.rendered ||d.data.rendered || '' );
                 outputHtml = outputHtml.concat('</span>');
                 addBreak = 1
              };
              if (d.data1.rendered || '' !== ''){
                 outputHtml = outputHtml.concat('<span style="color:#2c502a;font-weight:300;">');
                 if(addBreak = 1){
                     outputHtml = outputHtml.concat('<br/>');
                 }; 
                 outputHtml = outputHtml.concat(d.data1.rendered || '' );                
                 outputHtml = outputHtml.concat('</span>');

                 addBreak = 1;
              };
              if (d.data2.rendered || '' !== ''){

                 outputHtml = outputHtml.concat('<span style="width:100%;display:block;color:#2c502a;font-weight:300;">');
                 // outputHtml = outputHtml.concat('<span style="',colorBottomInput,'width:100%;display:block;color:#2c502a;font-weight:300;">');
                 // if(addBreak = 1){
                 //     outputHtml = outputHtml.concat('<br/>');
                 // };                 
                 outputHtml = outputHtml.concat(d.data2.rendered || '' );
                 outputHtml = outputHtml.concat('</span>');
              };
              return outputHtml
            }
              else{
              return '<span style="color:#2c502a;font-weight:900">'+(d.data.rendered ||d.data.value || '')
               }
      })
      .on('click', function(d) {
        d3.event.preventDefault();
        LookerCharts.Utils.openUrl(d.data.drilldown_uri);
      })
      .classed('clickable', function(d) {
        return !!d.data.drilldown_uri;
      });

  }
});
}());
