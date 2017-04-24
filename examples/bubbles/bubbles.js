// bubbles, from https://bl.ocks.org/mbostock/4063269




(function() {
looker.plugins.visualizations.add({

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This part adds the details about your visualization
  //
  // ---------------------------------------------------------------------------------------------------------------------------

    id: 'bubbles',
    label: 'Area Bubbles',
    options: {


  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  Here you list all your options to appear in teh edit window:
  //      type: array, string, boolean, 
  //      label: Label
  //      section: creates a new tab
  //      placeholder: faint/example text to indicate how to write the setting
  //      display: Select, Radio, Colors, Null (text)
  //      values: options to provide (radio buttons, drop downs)
  //      default: Default value of the setting
  //      order: order on the page Sm --> Lg
  //
  // ---------------------------------------------------------------------------------------------------------------------------


  // put your settings here, they live in the settings variable

      colorRange: {
        type: 'array',
        label: 'Color Ranges',
        display: 'Colors',
        section: 'Style',
        placeholder: '#fff, red, etc...'
      }
  }
,
  handleErrors: function(data, resp) {

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This function deals with errors in your data: one measure when you need two, use a pivot, etc. It returns true or false
  //
  // ---------------------------------------------------------------------------------------------------------------------------

// insert IF statements that return false when not met

    console.log('number of pivots: ' + resp.fields.pivots.length );
    console.log('number of dimension: ' + resp.fields.dimensions.length );
    console.log('number of measures: ' + resp.fields.measures.length);


    var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
    min_mes = 1
    max_mes = 1
    min_dim = 1
    max_dim = 2
    min_piv = 0
    max_piv = 0

    if (resp.fields.pivots.length > max_piv) {
      this.addError({
        group: 'pivot-req',
        title: 'Incompatible Data',
        message: 'No pivot is allowed'
      });
      return false;
    } else {
      this.clearErrors('pivot-req');
    }

    if (resp.fields.pivots.length < min_piv) {
      this.addError({
        group: 'pivot-req',
        title: 'Incompatible Data',
        message: 'Add a Pivot'
      });
      return false;
    } else {
      this.clearErrors('pivot-req');
    }

    if (resp.fields.dimensions.length > max_dim) {
      this.addError({
        group: 'dim-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_dim +' to '+ max_dim +' dimensions'
      });
      return false;
    } else {
      this.clearErrors('dim-req');
    }

    if (resp.fields.dimensions.length < min_dim) {
      this.addError({
        group: 'dim-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_dim +' to '+ max_dim +' dimensions'
      });
      return false;
    } else {
      this.clearErrors('dim-req');
    }

    if (resp.fields.measure_like.length > max_mes) {
      this.addError({
        group: 'mes-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_mes +' to '+ max_mes +' measures'
      });
      return false;
    } else {
      this.clearErrors('mes-req');
    }

    if (resp.fields.measure_like.length < min_mes) {
      this.addError({
        group: 'mes-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_mes +' to '+ max_mes +' measures'
      });
      return false;
    } else {
      this.clearErrors('mes-req');
    }





    // If no errors found, then return true
    return true;
  },


  create: function(element, settings) {

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This function creates whatever html elements you need to put your vis in, its ran when you select your visualization, 
  //  make sure to clear the old visualization first!
  //
  // ---------------------------------------------------------------------------------------------------------------------------




    d3.select(element)
      .selectAll("*").remove();

        // Add stuff to your element





        },
  update: function(data, element, settings, resp) {

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This function is ran whenever a change is made (Run button, setting change, refresh, resize) It will create your 
  //  visualization, make sure to clear the old visualization first!
  //
  // ---------------------------------------------------------------------------------------------------------------------------


  if (!this.handleErrors(data, resp)) return;  // Check for errors!

  // View your data :

      console.log(data); // (Data object)
      console.log(resp); // (Metadata object)
      console.log(settings); // (User inputted settings object)
      console.log(element); // (HTML element)


    // console.log(resp.fields.dimensions[0].name);
    // console.log(resp.fields.pivots[0].name);
    // console.log(resp.fields.measures[0].name);

// Declare any variables




var dim_1 = resp.fields.dimensions[0].name,
    dim_2 = dim_1,
    mes_1 = resp.fields.measures[0].name;

if (resp.fields.dimensions.length>1) { 
        dim_2 = resp.fields.dimensions[1].name; } 
      


var vis_box = element.getBoundingClientRect(),
    height = vis_box.height,
    width = vis_box.width;

// console.log(settings['colorRange']);


var diameter = Math.max(width,height) ,  // remove
    format = d3.format(",d"),
    color = d3.scale.category20c();
    if (settings.colorRange && settings.colorRange != "") {

    color_vals = []
    for (var i = data.length - 1; i >= 0; i--) {
      color_vals.push(data[i][dim_2].value)

     }
     console.log(color_vals);
    color = d3.scale.ordinal().domain(color_vals).range(settings.colorRange) 

    }


var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(1.5);

// empty element
d3.select(element).selectAll("*").remove();

var svg = d3.select(element).append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");



d3.json(data, function(error, root) {

  // if (error) throw error;

  var node = svg.selectAll(".node")
      .data(bubble.nodes(classes(data))
      .filter(function(d) { return !d.children; }))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  node.append("title")
      .text(function(d) { return d.className.rendered + ',' + d.packageName.rendered + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return color(d.packageName.value); });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.className.rendered.substring(0, d.r / 3); 
      });
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(data) {
  var classes = [];

  // function recurse(name, node) {
  //   // if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
  //   // else classes.push({packageName: name, className: node.name, value: node.size});
  //   console.log(name);  
  //   classes.push({packageName: node[dim_1], className: node.name, value: node.size});
  // }

  // recurse(null, root);

    for (var i = data.length - 1; i >= 0; i--) {
      classes.push({packageName: data[i][dim_2], className: data[i][dim_1], value: data[i][mes_1].value});
    }



  return {children: classes};
}

d3.select(self.frameElement).style("height", diameter + "px");




        } //close function

      }) // close add
    

}());
