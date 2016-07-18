// 01/18/2016 ERIC FEINSTEIN
// http://bl.ocks.org/mbostock/4062045

(function() {
looker.plugins.visualizations.add({
    id: 'force',
    label: 'Force',
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
        .empty();



    d3.select(element)
        .append("svg")
        .attr("id", "force")
        .attr('width', '100%')
        .attr('height', '100%') ;


        }
        ,
  update: function(data, element, settings, resp) {

  if (!this.handleErrors(data, resp)) return;

    // console.log(resp.fields.dimensions[0].name);
    // console.log(resp.fields.pivots[0].name);
    // console.log(resp.fields.measures[0].name);

// VARIABLES -- ONLY WORKS WITH 2 DIM AND ONE MEASURE

var src = resp.fields.dimensions[0].name,
    tgt = resp.fields.dimensions[1].name,
    grp = (resp.fields.dimensions[2]) ? resp.fields.dimensions[2].name : "DEFAULT",
    mes = resp.fields.measures[0].name;
    // console.log(data);





// DEFINE A UNIQUE FUNCTION
function uniquify(arr)
{
  // console.log(arr)
  var index = 0;
  var n = []; 
  // n.push({name: "none", group: "none", weight: 1});
  for(var i = 0; i < arr.length; i++) 
  {
    index = 0;
    for (var x = 0; x<n.length; x++)
    {
      if (arr[i].name == n[x].name  && arr[i].group == n[x].group) 
        index = -1;
    }
    if (index != -1) n.push(arr[i]);
    // if (n.indexOf(arr[i].name) == -1 && n.indexOf(arr[i].group) == -1) n.push(arr[i]);
  }
  // console.log(n);
  return n;
}

// DEFINE A LOOKUP FUNCTION:
function nodeNumber(node, group, nodes) {
  for(var i = 0; i < nodes.length; i++) 
  {
    if (nodes[i].name == node) // removing group && nodes[i].group == group) 
      return i;
  }
  return 0;
}

// CREATE NODES 
nodes = [];
// nodes.push({name: "none", group: 1, weight: 1});

for (var i = data.length - 1; i >= 0; i--) {
  var group = (grp != "DEFAULT") ? data[i][grp].value : "none"
  nodes.push({name: data[i][src].value, group: group, weight: 1});
  nodes.push({name: data[i][tgt].value, group: group, weight: 1});
}
 
uniqueNodes = uniquify(nodes);
// console.log(nodes);
// console.log(uniquify(nodes));

// CREATE LINKS

var links = [];
maxvalue = 1;

// CREATE SINGLE LINK and push to LINKS
for (var i = data.length -1; i>= 0; i--) {
  var group = (grp != "DEFAULT") ? data[i][grp].value : "none";
  var link = {source: nodeNumber(data[i][src].value, group, uniqueNodes) , target: nodeNumber(data[i][tgt].value, group, uniqueNodes), value: data[i][mes].value}; 
  // console.log(link);
  if (data[i][mes].value > maxvalue ) 
    maxvalue = data[i][mes].value;
  links.push(link);
}

nodearray = uniqueNodes;


// // LOOKER GRAPH

// var purple = "#8B81B9";
// var lOrange = "#F1B32E";
// var dOrange = "#E98A2D";
// var blue = "#26A4DE";
// var green = "#59BEBC";


// console.log(graph);

// console.log(nodearray);
// console.log(links);

// USE SETTINGS HERE -- 
    var color = d3.scale.category10();
    var svg = d3.selectAll("#force");

// // Height and Width
    var h = $(element).height();
    var w = $(element).width();

    var width = w, // NEED TO AUTOSIZE
        height = h; // NEED TO AUTOSIZE


// BUILD YOUR D3 FORCE LAYOUT
    var force = d3.layout.force()
      .charge(-120)
      .linkDistance( function(d){return maxvalue-d.value || 30;})
      .size([width, height])
      .nodes(nodearray)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link")
      // .attr("stroke", "#999")
      .attr("stroke", function(d) { return d.stroke || "#999";})
      .attr("stroke-opacity", 1)
      .style("stroke-width", function(d) { return d.value/maxvalue*4; }) // Math.sqrt(d.value/maxvalue); });
      .on("mouseover", function(d) {
          linktip.show(d);
        })                  
      .on("mouseout", function(d) {
          linktip.hide(d);
        });

  var node = svg.selectAll(".node")
      .data(nodearray)
      .attr("stroke", "#fff")
      .attr("stroke-width", "1.5px")
      .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)

      .style("fill", function(d) { return color(d.group) || "blue" ; })
      .on("mouseover", function(d) {
          tip.show(d);
        })                  
      .on("mouseout", function(d) {
          tip.hide(d);
        });
      // .call(force.drag); // TURN DRAGGABLE OFF




  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
     
  });

 
 var chart = d3.select(element)
      .append("svg")
 var tip = d3.tip()    
      .attr('class', 'looker-chart-tooltip')
      .offset([-10, 0])
      .html(function(d) {
      return "<span><strong>Name: </strong>" + d.name + "</span><br><br><span>Group: " + d.group + " </span>";
    })
   var linktip = d3.tip()    
      .attr('class', 'looker-chart-tooltip')
      .offset([-10, 0])
      .html(function(d) {
     return "<span><strong>Source: </strong>" + d.source.name + "</span><br><span><strong>Target: </strong>" + d.target.name + "</span><br><br><span>Value: " + d.value + " </span>";
     })
      
chart.call(linktip);
chart.call(tip);








  }
});
}());
