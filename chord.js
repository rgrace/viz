(function() {
looker.plugins.visualizations.add({
    id: 'chord',
    label: 'Chord Diagram',
    options: {
      colorRange: {
        type: 'array',
        label: 'Color Ranges',
        section: 'Style',
        placeholder: '#fff, red, etc...'
      }
  }
,
  handleErrors: function(data, resp) {
    return true;
  },
  create: function(element, settings) {
    d3.select(element)
        .append("svg")
      .attr("id", "mainchord")
        .attr('width', '100%')
        .attr('height', '100%') ;
        },
  update: function(data, element, settings, resp) {

  if (!this.handleErrors(data, resp)) return;

    // console.log(resp.fields.dimensions[0].name);
    // console.log(resp.fields.pivots[0].name);
    // console.log(resp.fields.measures[0].name);
var dim = resp.fields.dimensions[0].name,
    piv = resp.fields.pivots[0].name,
    mes = resp.fields.measures[0].name;
    console.log(data);

var source = []
    for (var i = data.length - 1; i >= 0; i--) {
        source[i] = data[i][dim].value; 
        // console.log(source[i][piv]);
    };
    y =[];
    for (var i = source.length -1; i>=0; i--){
      x = [];
        for (var j = source.length -1; j>=0; j--){
          console.log(data[j][mes][source[i]].value);
          x.push(data[j][mes][source[i]].value);
        }
      y.push(x);
    }
    console.log(y);
    //console.log(source);
// colors

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
console.log(myColors);
console.log(colors);

var width =  $("#mainchord").width(),
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
    .domain(d3.range(4))
   // .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

//var colors = [{"color":'#92EFFE','name':'A'},{"color":'green','name':'B'},{"color":'#957244','name':'C'},{"color":'yellow','name':'D'},{"color":'purple','name':'E'}];
//var matrix = [[1,9,3,1,1],[2,3,7,9,2],[10,4,1,2,5],[2,3,7,4,8],[10,4,1,2,10]];
//d3.csv("colors.csv", function(colors) {
 // d3.csv("matrix.csv", 
 //   function(matrix) {
myfunction();

function myfunction(){

// console.log(matrix);
    // Compute the chord layout.
    layout.matrix(matrix);

    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
         .on("mouseover", fade(.1))
         .on("mouseout", fade(1));
    //    .on("mouseover", mouseover);

    // Add a mouseover title.
    group.append("title").text(function(d, i) {
      return colors[i].name + ": " + Math.floor(d.value) ;
    });

    // Add the group arc.
    var groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d, i) { return colors[i].color; });

    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("xlink:href", function(d, i) { return "#group" + i; })
        .text(function(d, i) { return colors[i].name; });

    // Remove the labels that don't fit. :(
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength(); })
        .remove();

    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) { return colors[d.source.index].color; })
        .style("stroke", "gray")
        .attr("d", path)
         ;

    // Add an elaborate mouseover title for each chord.
    chord.append("title").text(function(d) {
      return colors[d.source.index].name
          + " → " + colors[d.target.index].name
          + ": " + (d.source.value)
          + "\n" + colors[d.target.index].name
          + " → " + colors[d.source.index].name
          + ": " + (d.target.value);
    });

    function fade(opacity) {
        return function(g, i) {
            svg.selectAll(".chord")
            .filter(function(d) {
                return d.source.index != i && d.target.index != i;
            })
            .transition()
            .style("opacity", opacity);
        
            // console.log(opacity);
    };
}
    
};


 // });
//});




  }
});
}());
