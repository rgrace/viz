(function() {


  // function to format axis label (sort of)
  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }  

  // create tooltip
  var tip = d3.tip()
    .attr('class', 'looker-chart-tooltip')
    .offset([-10, 0])
    .html(function(data) {
      return "<strong>" + data.measure2.label + ": "
        + "</strong> <span style=''>" + data.z + "</span>";
    });

  var viz = {
    id: 'bubble',
    label: 'Bubble',
    options: {
      colorRange: {
        type: 'array',
        label: 'Color Ranges',
        section: 'Style',
        placeholder: '#fff'
      }
    },
    handleErrors: function(data, resp) {
      if (!resp || !resp.fields) return null;
      if (resp.fields.dimension_like.length != 1) {
        this.addError({
          group: 'dimension-req',
          title: 'Incompatible Data',
          message: 'One dimension is required'
        });
        return false;
      } else {
        this.clearErrors('dimension-req');
      }
      if (resp.fields.measure_like.length != 2) {
        this.addError({
          group: 'measure-req',
          title: 'Incompatible Data',
          message: 'At least two measures are required'
        });
        return false;
      } else {
        this.clearErrors('measure-req');
      }
      return true;
    },

    create: function(element, settings) {
      
    },

    update: function(data, element, settings, resp) {   
      if (!this.handleErrors(data, resp)) return;

      $(element).html("")

      // create SVG element
      var chart = d3.select(element)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')                 
        .attr('class', 'chart');
      
      // invoke tooltip
      chart.call(tip);


      var $el = $(element);

      // function to extract data
      function mkExtracter(data, names) {
                        return function (name) {
                                return data.map(function (x) {
                                        return x[name].value;
                                });
                        };
                };

      // function to extract drill-down uri
      function drillExtracter(data, names) {
                        return function (name) {
                                return data.map(function (x) {
                                        return x[name].drilldown_uri;
                                });
                        };
                };     


      // introduce this later to handle axis labels for all field names 
      // var myString = 'orders.average_order_amount';

      // var mySepString = myString.split(/[.|_]/);

      // function capitalizeFirstLetter(string) {
      //          return string.charAt(0).toUpperCase() + string.slice(1);
      //      }

      // function mergeNice(stringArray){
      //    var fields = stringArray.slice(1, stringArray.length).map(capitalizeFirstLetter);
      //    return stringArray[0].toUpperCase() 
      //        + ' '
      //        + fields.join(' ');
      // }      

      //  get meta data for labels, etc.
      var extractData = mkExtracter(data);
      var extractDrill = drillExtracter(data);
      var dimension = resp.fields.dimension_like[0];    // meta data for dimension
      var measure_1 = resp.fields.measure_like[0];      // meta data for first measure
      var measure_2 = resp.fields.measure_like[1];      // meta data for second measure
      var measure_2_drill = extractDrill(measure_2.name)


      // get arrays of data
      var x = extractData(dimension.name)
      var y = extractData(measure_1.name)
      var z = extractData(measure_2.name)

      // iterate over data
      var data_zip = [];
      x.forEach(function(_, i){
        data_zip.push({
          x:x[i], y:y[i], z:z[i], drill:measure_2_drill[i]
        })
      });

      // define margin height and width
      var margin = {top: 10, right: 10, bottom: 10, left: 10};   
      var width = $el.width() - margin.left - margin.right;
      var height = $el.height() - margin.top - margin.bottom;
      var padding = 60;
      
      // create x,y,r scales
      var xScale = d3.scale.ordinal()
                     .domain(x)
                     .rangePoints([padding, width - padding * 2]);

      var extentY = d3.extent(y);
      extentY[0] = 0;

      var yScale = d3.scale.linear()
                     .domain(extentY)
                     .range([height - padding, padding])
                     .nice();

      var rScale = d3.scale.linear()
                     .domain([d3.min(z), d3.max(z)])
                     .range([10, 35])
                     .nice();

      // create x,y axes
      var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom');

      var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');

      // introduce the chart
      var chart = d3.select(element)
        .select('svg.chart');

      // draw circles
      var circles = chart.selectAll("circle")
        .data(data_zip);

      circles.enter()
        .append("circle");

      circles.attr("cx", function(x) {
          return xScale(x.x);
        })
        .attr("cy", function(x) {
          return yScale(x.y);
        })
        .attr("r", function(x) {
          return rScale(x.z);
        })
        .style("opacity", .2)
        .attr("fill", "purple")
        .style("stroke", "black")
        .on("mouseover", function(data) {
                      d3.select(this).attr("r", rScale(data.z) * 1.1);
                      data.measure2 = measure_2;
                      tip.show(data);
                    })                  
        .on("mouseout", function(data) {
          d3.select(this).attr("r", rScale(data.z));
          data.measure2 = measure_2;
          tip.hide(data);
        })
      .on('click', function(data) {
        d3.event.preventDefault();
        LookerCharts.Utils.openUrl(data.drill);
      });

      // cool it on the circles for a while
      circles.exit()
        .remove();

      // create X axis
      var xAxisNodeSelection = chart.select('g.x.axis');
      if (xAxisNodeSelection.empty()) {
        xAxisNodeSelection = chart.append("g")
          .attr("class", "x axis");
      }

      xAxisNodeSelection.attr("transform", "translate(0," + (height - padding) + ")")
        .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '.5px'})
        .call(xAxis); 

      // create Y axis
      var yAxisNodeSelection = chart.select('g.y.axis');
      if (yAxisNodeSelection.empty()) {
        yAxisNodeSelection = chart.append("g")
          .attr("class", "y axis");
      }
      
      yAxisNodeSelection.attr("transform", "translate(" + padding + ",0)")
        .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'})
        .call(yAxis);       

      // create X-axis label
      chart.append("text")
           .attr("class", "x label")
           .attr("text-anchor", "middle")
           .attr("x", width/2)
           .attr("y", height - 10)
           .style({ 'fill': 'black', 'font-size':'12px'})
           .text(dimension.label);

      // create Y-axis label
      chart.append("text")
           .attr("class", "y label")
           .attr("text-anchor", "middle")
           .attr("y", 15)
           .attr("x", 0 - (height / 2))
           .attr("transform", "rotate(-90)")
           .style({ 'fill': 'purple', 'font-size':'12px'})
           .style("opacity", .4)
           .text(measure_1.label);             

    }
  };

  looker.plugins.visualizations.add(viz);

}());
