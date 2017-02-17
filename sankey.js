// this visualization requires the code that makes up the sankey plugin.
// personally, I just pasted that code into the same ~/looker/plugins/visualizations 
// directory as sankey-plugin.js

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
      return "<strong>" + data.measure2.name.split(".")[0].toUpperCase() + ' ' + capitalizeFirstLetter(data.measure2.name.split(".")[1]) 
        + "</strong> <span style='color:red'>" + data.z + "</span>";
    });

  var viz = {
    id: 'sankey',
    label: 'Sankey',
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
      if (resp.fields.dimensions.length != 2) {
        this.addError({
          group: 'dimension-req',
          title: 'Incompatible Data',
          message: 'Two dimensions are required'
        });
        return false;
      } else {
        this.clearErrors('dimension-req');
      }
      if (resp.fields.measures.length != 1) {
        this.addError({
          group: 'measure-req',
          title: 'Incompatible Data',
          message: 'A single measure is required'
        });
        return false;
      } else {
        this.clearErrors('measure-req');
      }
      return true;
    },

    create: function(element, settings) {
      
      // create SVG element
      var chart = d3.select(element)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')                 
        .attr('class', 'chart');
      
      // invoke tooltip
      chart.call(tip);
    },

    update: function(data, element, settings, resp) {   
      if (!this.handleErrors(data, resp)) return;

      var $el = $(element);
      var $svg = $el.find("svg");
      $svg.empty(); // Clear any existing chart

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

      var units = "Page Views";

      var formatNumber = d3.format(",.0f"),    // zero decimal places
          format = function(d) { return formatNumber(d) + " " + units; },
          color = d3.scale.category20();

      //  get meta data for labels, etc.
      var extractData = mkExtracter(data);
      var extractDrill = drillExtracter(data);
      var dimension_1 = resp.fields.dimensions[0];    // meta data for dimension
      var dimension_2 = resp.fields.dimensions[1];      // meta data for first measure
      var measure_1 = resp.fields.measures[0];      // meta data for second measure
      var measure_1_drill = extractDrill(measure_1.name)

      // get arrays of data
      var x = extractData(dimension_1.name)
      var y = extractData(dimension_2.name)
      var z = extractData(measure_1.name)

      // create a unique set of nodes
      function ArrNoDupe(a) {
          var temp = {};
          for (var i = 0; i < a.length; i++)
              temp[a[i]] = true;
          var r = [];
          for (var k in temp)
              r.push(k);
          return r;
      }
      var names = ArrNoDupe(x.concat(y));
      
      // construct node names
      var nodes = [];
      names.forEach(function(x, i){
          nodes.push({
              "name":x
          });
      });

      // iterate over data
      var data_zip = [];
        x.forEach(function(_, i){
          data_zip.push({
            "source":x[i], "target":y[i], "value":z[i]
          })
        });
      graph = {};
      graph["links"] = data_zip;
      graph["nodes"] = nodes;

      // define margin height and width
      var margin = {top: 10, right: 10, bottom: 10, left: 10};   
      var width = $el.width() - margin.left - margin.right;
      var height = $el.height() - margin.top - margin.bottom;
      var padding = 60;

      // set the sankey diagram properties
      var sankey = d3.sankey()
          .nodeWidth(36)
          .nodePadding(10)
          .size([width, height]);

      var path = sankey.link();

      // introduce the chart
      var chart = d3.select(element)
        .select('svg.chart')
        .attr( "viewBox",
        "" + (0 - horizontalMarginSize ) + " "    
        + cycleTopMarginSize + " "                
        + (960 + horizontalMarginSize * 2 ) + " " 
        + (500 + (-1 * cycleTopMarginSize)) + " " );

      // map nodes, links, and values
      var nodeMap = {};
      graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
      graph.links = graph.links.map(function(x) {
        return {
          source: nodeMap[x.source],
          target: nodeMap[x.target],
          value: x.value
        };
      });

      sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

      // add in the links
        var link = chart.append("g").selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", path)
            .style({ "stroke": "#000"
                    , "fill": "none"
                    , "opacity": '0.2'
                    , "stroke-width": function(d) { return Math.max(1, d.dy);} })         
      .on('mouseover', function(d){
        var nodeSelection = d3.select(this).style({opacity:'0.5'});
            nodeSelection.select("text").style({opacity:'0.1'});
      })
            .on('mouseout', function(d){
                  var nodeSelection = d3.select(this).style({opacity:'0.2'});
                  nodeSelection.select("text").style({opacity:'0.1'});
                })      
      .sort(function(a, b) { return b.dy - a.dy; });

      // handlize cycles
      link.filter( function(d) { return !d.causesCycle} )
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })

      // add the link titles
        link.append("title")
            .text(function(d) {
            return d.source.name + " → " + 
                   d.target.name + "\n" + format(d.value); });

      // add in the nodes
        var node = chart.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; })
            .call(d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", function() { 
            this.parentNode.appendChild(this); })
            .on("drag", dragmove));

      // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) { return Math.max(d.dy,0); })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
              return d.color = color(d.name.replace(/ .*/, "")); })
            .style("stroke", function(d) { 
              return d3.rgb(d.color).darker(2); })
            .append("title")
            .text(function(d) { 
              return d.name + "\n" + format(d.value); });

      // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

      // the function for moving the nodes
        function dragmove(d) {
          d3.select(this).attr("transform", 
              "translate(" + d.x + "," + (
                      d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
                  ) + ")");
          sankey.relayout();
          link.attr("d", path);
        };

      // more cycles stuff
      var numCycles = 0;
        for( var i = 0; i< sankey.links().length; i++ ) {
          if( sankey.links()[i].causesCycle ) {
            numCycles++;
          }
        }
      var cycleTopMarginSize = (sankey.cycleLaneDistFromFwdPaths() -
            ( (sankey.cycleLaneNarrowWidth() + sankey.cycleSmallWidthBuffer() ) * numCycles ) )
      var horizontalMarginSize = ( sankey.cycleDistFromNode() + sankey.cycleControlPointDist() );


    }
  };
  looker.plugins.visualizations.add(viz);

}());
