looker.plugins.visualizations.add({
  id: 'chord',
  label: 'Chord Diagram',
  create: function(element, settings) {
    d3.select(element).empty();
    d3.select(element)
      .append("svg")
      .attr("id", "mainchord")
      .attr('width', '100%')
      .attr('height', '100%');
  },
  update: function(data, element, settings, resp) {

    var dim = resp.fields.dimensions[0].name,
      piv = resp.fields.pivots[0].name,
      mes = resp.fields.measure_like[0].name;

    var source = []
    for (var i = data.length - 1; i >= 0; i--) {
      source[i] = data[i][dim].value;
    };
    y = [];
    for (var i = source.length - 1; i >= 0; i--) {
      x = [];
      for (var j = source.length - 1; j >= 0; j--) {
        x.push(data[j][mes][source[i]].value);
      }
      y.push(x);
    }

    var myColors = d3.scale.category10();

    // Make data source
    var matrix = y;
    var colors = [];
    for (var i = source.length - 1; i >= 0; i--) {
      var color = new Object();
      color.name = source[i];
      color.color = myColors(i);
      colors.push(color);
    };

    var width = $("#mainchord").width(),
      height = $("#mainchord").height(),
      outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

    var formatPercent = d3.format(".1%");

    var arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    var layout = d3.layout.chord()
      .padding(.04)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

    var path = d3.svg.chord()
      .radius(innerRadius);

    var svg = d3.select("#mainchord")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("id", "circle")
      .attr("fill", "white")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("circle")
      .attr("r", outerRadius);

    var fill = d3.scale.ordinal()
      .domain(d3.range(4));
    myfunction();

    function myfunction() {
      // Compute the chord layout.
      layout.matrix(matrix);

      // Add a group per neighborhood.
      var group = svg.selectAll(".group")
        .data(layout.groups)
        .enter().append("g")
        .attr("class", "group")
        .on("mouseover", fade(.1))
        .on("mouseout", fade(1));

      // Add a mouseover title.
      group.append("title").text(function(d, i) {
        return colors[i].name + ": " + Math.floor(d.value);
      });

      // Add the group arc.
      var groupPath = group.append("path")
        .attr("id", function(d, i) {
          return "group" + i;
        })
        .attr("d", arc)
        .style("fill", function(d, i) {
          return colors[i].color;
        });

      // Add a text label.
      var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

      groupText.append("textPath")
        .attr("xlink:href", function(d, i) {
          return "#group" + i;
        })
        .text(function(d, i) {
          return colors[i].name;
        });

      // Remove the labels that don't fit. :(
      groupText.filter(function(d, i) {
          return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
        })
        .remove();

      // Add the chords.
      var chord = svg.selectAll(".chord")
        .data(layout.chords)
        .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) {
          return colors[d.source.index].color;
        })
        .style("stroke", "gray")
        .attr("d", path);

      // Add an elaborate mouseover title for each chord.
      chord.append("title").text(function(d) {
        return colors[d.source.index].name +
          " → " + colors[d.target.index].name +
          ": " + (d.source.value) +
          "\n" + colors[d.target.index].name +
          " → " + colors[d.source.index].name +
          ": " + (d.target.value);
      });

      function fade(opacity) {
        return function(g, i) {
          svg.selectAll(".chord")
            .filter(function(d) {
              return d.source.index != i && d.target.index != i;
            })
            .transition()
            .style("opacity", opacity);
        };
      }
    };
  }
});
