// This treemap requires 1 measure and one or two dimensions. 
/// The first dimension will be color when two are present
///
// WARNING: This file will get overwritten whenever Looker restarts.

/* TODOS
 -- options: colors, text size/color, line/border
 -- tooltips
 -- legend / filter
 -- headers for categories w/ drill
*/

(function() {
looker.plugins.visualizations.add({
  id: 'treemap',
  label: 'Treemap',
  options: {
    //start options
   /*   colorRange: {
      type: 'array',
      label: 'Color Ranges',
      section: 'Style',
      placeholder: '#fff, red, etc...',
      order: 5
    },
      textColor: {
      type: 'array',
      label: 'Text Color',
      section: 'Style',
      placeholder: '#fff',
      order: 6
    },*/

    dynamicFontSize: {
      type: 'boolean',
      label: 'Dynamic Font Size',
      section: 'Style',
      order: 1
    }

// end options
  },
  handleErrors: function(data, resp) {
    if (!resp || !resp.fields) return null;
    if (!(resp.fields.dimensions.length == 1 || resp.fields.dimensions.length == 2)) {
      this.addError({
        group: 'dimension-req',
        title: 'Incompatible Data',
        message: 'One or two dimension is required'
      });
      return false;
    } else {
      this.clearErrors('dimension-req');
    }
    if (resp.fields.pivots.length >= 1) {
      this.addError({
        group: 'pivot-req',
        title: 'Incompatible Data',
        message: 'No pivot is allowed'
      });
      return false;
    } else {
      this.clearErrors('pivot-req');
    }
    if (resp.fields.measures.length > 1) {
      this.addError({
        group: 'measure-req',
        title: 'Incompatible Data',
        message: 'One measure is required'
      });
      return false;
    } else {
      this.clearErrors('measure-req');
    }
    return true;
  },


  create: function(element, settings) {
      
   //   selectAll("chart").remove();
    //console.log(element);
      d3.selectAll("#chart").remove();
      var chart1 = d3.select(element)
        .append('div')
        .attr('width', '100%')
        .attr('height', '100%')                 
        .attr('id', 'chart');

  this.update();
      

      
  },
  update: function(data, element, settings, resp) {
    if (!this.handleErrors(data, resp)) return;

// process daterz
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}




//console.log(data);
//console.log(resp);


var parent_name = resp.fields.dimensions[0].name
var measure = resp.fields.measures[0].name;

if (resp.fields.dimensions.length==2)
  {
    var dimension = resp.fields.dimensions[1].name;
  } else {
    var dimension = resp.fields.dimensions[0].name;
  };

//console.log(parent_name);
//console.log(dimension);
//console.log(measure);

var parents = []
    for (var i = data.length - 1; i >= 0; i--) {
        parents[i] = data[i][parent_name].value; 
    };

//console.log(parents.unique());

var newdata = [];
var children = [];

var unique_parents = parents.unique();
var c = 0;
var p = 0;

for (var x = unique_parents.length - 1; x >= 0; x--) {
    c = 0;
        

        for (var i = data.length - 1; i >= 0; i--) {
//              console.log(c);
//              console.log(unique_parents[x]);
//             console.log(data[i][parent_name]);
              if (data[i][parent_name].value ==  unique_parents[x]){
                

                children[c] = {"name":  data[i][dimension].value , "value":  data[i][measure].value};
                c++;
//                console.log("match");
                }

      };
  //            console.log(children);
    newdata[p] = {"name":unique_parents[x],"children":children};
    children=[];
    //console.log(newdata[p])
    p++;
};
    

//console.log(newdata);
var root = {"name":"tree","children":newdata};
//var root = newdata;

  
// daterz is goodz

var margin = {top: 40, right: 10, bottom: 10, left: 10},
    width = $("#chart").width()- margin.left - margin.right,
    height = $("#chart").parent().height() - margin.top - margin.bottom;

var color = d3.scale.category20c();
//console.log(color("Calvin Klein"));

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.value; });

var div = d3.select("#chart").append("div")
    .style("position", "relative")
    .style("width", "100%")//(width + margin.left + margin.right) + "px")
    .style("height", "100%")//(height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

//d3.json("/plugins/visualizations/flare.json", function(error, root) {
/*
var node = div.datum(tree).selectAll(".node")
      .data(treemap.value( function(d) { return d.size; }).nodes)
      .enter().append("div")
      .attr("class", "node")
      .style("position","absolute")
      .style("border","solid 1px white")
      .call(position)
      .append('div')
      .style("background", function(d) { return d.children ? color(d.name) : null; })
      .style("font-size", function(d) {
          // compute font size based on sqrt(area)
          return Math.max(12, 0.18*Math.sqrt(d.area))+'px'; })
      .text(function(d) { return d.children ? null : d.name; });
*/
console.log(settings.dynamicFontSize);


  var node = div.selectAll(".node")
      .data(treemap.nodes(root))
    .enter().append("div")
      .attr("class", "node")
      .style("position","absolute")
     // .style("overflow","hidden")
      .style("border", "1px solid #FFFFFF")
      .style("background", function(d) { return d.children ? color(d.name) : null; } || '#FFFFFF' )
      //.attr("id", function(d) { return d.name })
      .style("font-size", function(d) {
          // compute font size based on sqrt(area)
          return  settings.dynamicFontSize ? ( d.children ? null : Math.max(20, 0.18*Math.sqrt(d.area))-10+'px' ) : '12px' ; })
      .call(position) 
      .text(function(d) { return d.children ? null : d.name; });

//console.log(root);

    //console.log("json");

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}
  },






});





}());

