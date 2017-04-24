(function() {


  // function to format axis label (sort of)
  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }

  var viz = {
    id: 'bubble',
    label: 'Bubble Scatter',
    options: {
      colorRange: {
        type: 'array',
        label: 'Color Ranges',
        section: 'Style',
        placeholder: '#fff'
      }
      ,
      size: {
        type: 'array',
        label: 'Size Multiplier',
        section: 'Style',
        default: '1',
        placeholder: '1'
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
      if (resp.fields.measure_like.length < 2) {
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
      var chart = d3.select(element).empty();
      var chart = d3.select(element)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('class', 'chart');

      // create tooltip
      var tip = d3.tip()
        .attr('class', 'looker-chart-tooltip')
        .offset([-10, 0])
        .html(function(data) {
          var tip_string = "";
          tip_string += "<strong>" + data.dimension.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(data.dimension.name.split(".")[1])
            + "</strong> <span style='color:red'>" + data.n + "</span><br>";
            tip_string += "<strong>" + measure_1.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_1.name.split(".")[1] || "")
            + "</strong> <span style='color:red'>" + data.x_tip + "</span><br>";
            tip_string += "<strong>" + measure_2.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_2.name.split(".")[1] || "")
            + "</strong> <span style='color:red'>" + data.y_tip + "</span><br>";
            tip_string += "<strong>" + measure_3.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_3.name.split(".")[1] || "")
            + "</strong> <span style='color:red'>" + data.z_tip + "</span><br>";
            tip_string += "<strong>" + measure_4.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_4.name.split(".")[1] || "")
            + "</strong> <span style='color:red'>" + data.c_tip + "</span>";
            return tip_string;

        });

      // invoke tooltip
      chart.call(tip);


      // console.log(resp);

      var $el = $(element);

      // function to extract data
      function mkExtracter(data, names) {
                        return function (name) {
                                return data.map(function (x) {
                                        return x[name].value;
                                });
                        };
                };

                // function to grab tooltip formats
      function tipExtracter(data, names) {
                        return function (name) {
                                return data.map(function (x) {
                                        return x[name].rendered || x[name].value;
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
      var extractTip = tipExtracter(data);
      var extractDrill = drillExtracter(data);
      var dimension = resp.fields.dimension_like[0];    // meta data for dimension
      var measure_1 = resp.fields.measure_like[0];      // meta data for first measure
      var measure_2 = resp.fields.measure_like[1];      // meta data for second measure
      var measure_2_drill = extractDrill(measure_2.name)
      var measure_3 = resp.fields.measure_like[2] || measure_1;      // meta data for second measure
      var measure_4 = resp.fields.measure_like[3] || measure_1;      // meta data for second measure

      var xlabel = measure_1.label;
      var ylabel = measure_2.label;


      // get arrays of data
      var n = extractData(dimension.name)
      var x = extractData(measure_1.name)
      var y = extractData(measure_2.name)
      var z = extractData(measure_3.name)
      var c = extractData(measure_4.name)
      var x_tip = extractTip(measure_1.name)
      var y_tip = extractTip(measure_2.name)
      var z_tip = extractTip(measure_3.name)
      var c_tip = extractTip(measure_4.name)

      // iterate over data
      var data_zip = [];
      x.forEach(function(_, i){
        data_zip.push({
          x:x[i], y:y[i], z:z[i], c:c[i], n:n[i], drill:measure_2_drill[i],
           x_tip:x_tip[i], y_tip:y_tip[i], z_tip:z_tip[i], c_tip:c_tip[i]
        })
      });

      // console.log(data_zip);

      // define margin height and width
      var margin = {top: 10, right: 10, bottom: 10, left: 20};
      var width = $el.width() - margin.left - margin.right;
      var height = $el.height() - margin.top - margin.bottom;
      var padding = 60;

      var xmin = d3.min(x);
      var ymin = d3.min(y);
      if(xmin > 0){
        xmin = 0;
      }
      if(ymin > 0){
        ymin = 0;
      }


      // console.log(x);
      // console.log('xmin', xmin);
      var xScale = d3.scale.linear()
                     .domain([xmin, d3.max(x)])
                     .range([ padding, width - padding]);
                     // .rangePoints([padding, width - padding * 2]);

      var extentY = d3.extent(y);
      extentY[0] = 0;

      var yScale = d3.scale.linear()
                     .domain([ymin - 5, d3.max(y) + 5])
                     .range([height - padding, padding]);

      var rScale = d3.scale.linear()
                     .domain([d3.min(z), d3.max(z)])
                     .range([10, 35])
                     .nice();

      var range = settings['colorRange'] || ['green', 'red'];
      var cScale = d3.scale.category10().domain([d3.min(c), d3.max(c)]);
      if (settings['colorRange']){
        cScale = d3.scale.linear().domain([d3.min(c), d3.max(c)]).range(range);
      }

      // console.log([d3.min(c), d3.max(c)]);

      // create x,y axes
      var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .tickSize(1)
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
          // console.log(x);
          return xScale(x.x)||1 + padding;
        })
        .attr("cy", function(x) {
          return yScale(x.y);
        })
        .attr("r", function(x) {
          return rScale(x.z)*settings['size']||1.0;
        })
        .attr("fill", function(x) {
          return cScale(x.c);
        })
        .style("opacity", .5)
        .style("stroke", "black")
        .on("mouseover", function(data) {
                      d3.select(this).attr("r", 1.2*rScale(data.z) *settings['size']||1.0);
                      data.dimension = dimension;
                      tip.show(data);
                    })
        .on("mouseout", function(data) {
          d3.select(this).attr("r", rScale(data.z) *settings['size']||1.0);
          data.dimension = dimension;
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

      xAxisNodeSelection.attr("transform", "translate("+margin.left+"," + (height - padding) + ")")
        .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'})
        .attr('transform', 'translate(0, ' + yScale(0) + ')')
        .call(xAxis);

      // create Y axis
      var yAxisNodeSelection = chart.select('g.y.axis');
      if (yAxisNodeSelection.empty()) {
        yAxisNodeSelection = chart.append("g")
          .attr("class", "y axis");
      }

      yAxisNodeSelection.attr("transform", "translate(" + padding + margin.left + ",0)")
        .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '1px'})
        .attr('transform', 'translate( ' +  xScale(0) + ',0)')
        .call(yAxis);

      d3.selectAll('text.xlabel').remove();
      d3.selectAll('text.ylabel').remove();
      // create X-axis label
      chart.append("text")
           .attr("class", "xlabel")
           .attr("text-anchor", "middle")
           .attr("x", width/2)
           .attr("y", height - 10)
           .style({ 'fill': 'black', 'font-size':'12px'})
           .text(xlabel);
           // .text(measure_1.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_1.name.split(".")[1]));

      // create Y-axis label
      chart.append("text")
           .attr("class", "ylabel")
           .attr("text-anchor", "middle")
           .attr("y", 15)
           .attr("x", 0 - (height / 2))
           .attr("transform", "rotate(-90)")
           .style({ 'fill': 'black', 'font-size':'12px'})
           // .style("opacity", .4)
           .text(ylabel);
           // .text(measure_2.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(measure_2.name.split(".")[1]));

    }
  };

  looker.plugins.visualizations.add(viz);

}());
