// Visualisation adapted by Looker based on the work done by Imagination (https://www.imagination.com/)
// Credit to Imagination Group Limited


(function() {
looker.plugins.visualizations.add({

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This part adds the details about your visualization
  //
  // ---------------------------------------------------------------------------------------------------------------------------

    id: 'stopwatch',
    label: 'Stopwatch',
    options: {


  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  Here you list all your options to appear in the edit window:
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
        section: 'Style',
        placeholder: '#fff, red, etc...'
      }
  },

  handleErrors: function(data, resp) {

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This function deals with errors in your data: one measure when you need two, use a pivot, etc. It returns true or false
  //
  // ---------------------------------------------------------------------------------------------------------------------------


    // insert IF statements that return false when not met

    var min_mes, max_mes, min_dim, max_dim, min_piv, max_piv;
    min_mes = 1;
    max_mes = 1;
    min_dim = 0;
    max_dim = 0;
    min_piv = 0;
    max_piv = 0;

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

    if (resp.fields.measures.length > max_mes) {
      this.addError({
        group: 'mes-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_mes +' to '+ max_mes +' measures'
      });
      return false;
    } else {
      this.clearErrors('mes-req');
    }

    if (resp.fields.measures.length < min_mes) {
      this.addError({
        group: 'mes-req',
        title: 'Incompatible Data',
        message: 'You need ' + min_mes +' to '+ max_mes +' measures'
      });
      return false;
    } else {
      this.clearErrors('mes-req');
    }

    if (data[0][resp.fields.measures[0].name].value > 900) {
      this.addError({
        group: 'mes-size',
        title: 'Incompatible Data',
        message: 'The time value needs to be less than 15 minutes long'
      });
      return false;
    } else {
      this.clearErrors('mes-size');
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



  // clear it
    d3.select(element)
        .selectAll("*").remove();

  // Add stuff to your element

    d3.select(element)
        .append("svg")
        .attr("id", "stopwatchvis")
        .attr('width', '100%')
        .attr('height', '100%') ;

        },

  update: function(data, element, settings, resp) {

  // ---------------------------------------------------------------------------------------------------------------------------
  //
  //  This function is ran whenever a change is made (Run button, setting change, refresh, resize) It will create your 
  //  visualization, make sure to clear the old visualization first!
  //
  // ---------------------------------------------------------------------------------------------------------------------------


  if (!this.handleErrors(data, resp)) return;  // Check for errors!

  d3.select("stopwatchvis").empty();

  // View your data :

    // console.log(data); // (Data object)
    // console.log(resp); // (Metadata object)
    // console.log(settings); // (User inputted settings object)
    // console.log(element); // (HTML element)


    // console.log(resp.fields.dimensions[0].name);
    // console.log(resp.fields.pivots[0].name);
    // console.log(resp.fields.measures[0].name);

// Declare any variables

// // Height and Width
    // var h = $(element).height();
    // var w = $(element).width();

    var paths = {
        stopwatch: 'M195.4,41.8c0.8-0.8,1.3-1.7,1.7-2.6l10,10c1.4,1.4,3.3,2.1,5.2,2.1c1.9,0,3.7-0.7,5.2-2.1 c2.9-2.9,2.9-7.5,0-10.3L188.1,9.5c-2.9-2.9-7.5-2.9-10.3,0c-2.9,2.9-2.9,7.5,0,10.3l10,10c-1,0.4-1.9,0.9-2.6,1.7l-7.1,7.1 c-17-13.5-38-22-60.9-23.5V7.3c0-4-3.2-7.3-7.3-7.3c-4,0-7.7,3.3-7.7,7.3V15C44.9,18.8,0,65.9,0,124h14.6 c0-52.5,42.7-94.7,95.1-94.7c52.5,0,95.1,42.3,95.1,94.7h14.6c0-29.5-11.7-55.9-30.7-75.6L195.4,41.8z'
    };

    var options = {
        width: 219,
        height: 160,
        fontSize: 30,
        fontColor: '#808080',
        arcSettings: {
            backgroundColor: '#f2f2f2',
            foregroundColor: '#808080',
            diameter: 175,
            thickness: 87.5
        }
    };

        var mes = resp.fields.measures[0].name;
        
        var amountInSeconds = data[0][mes].value;

        var hourInSeconds = 3600;
        
        var percent = amountInSeconds / hourInSeconds;
        
        // var svg = d3.select(element).append("svg")
        //     .attr('viewBox','0 0 ' + this.options.width + ' ' + this.options.height)
        //     .attr("width", this.options.width)
        //     .attr("height", this.options.height);

        var svg = d3.select("#stopwatchvis");

        // Clear the svg
        svg.selectAll("*").remove();
            
        var timeText = svg.append('text')
            .text(getFormatedTime(amountInSeconds))
            .attr("x", d3.select(element).node().getBoundingClientRect().width/2)
            .attr("y", options.height/2 - 0.5 + d3.select(element).node().getBoundingClientRect().height/2)
            .style('font-size', 21)
            .style('fill', '#808080');
            // .attr('transform', function () {
            //     return 'translate(' + -(d3.select(this).node().getBBox().width / 2) + ')';
            // });
        
        var path = svg.append("path")
            .attr('d', paths.stopwatch)
            .attr('fill', '#CCCCCC')
            .attr("transform", "translate(" + (d3.select(element).node().getBoundingClientRect().width/2 - options.width/2)  + "," + (d3.select(element).node().getBoundingClientRect().height/2 - options.height/2) + ")");
        
        var innerArc = createArc(options.arcSettings);
            
        var timePercent = svg.append("path")
            .attr('class', 'timePercent')
            .datum({endAngle: getEndAngle(0)})
            .style("fill", settings.colorRange || ['#808080'])
            .attr("d", innerArc)
            .attr("transform", "translate(" + (d3.select(element).node().getBoundingClientRect().width/2) + "," + ((d3.select(element).node().getBoundingClientRect().height/2)+(options.height/2 - 36)) + ")");
        
        timePercent.transition()
            .duration(750)
            .attrTween('d', function (d) {
               var interpolate = d3.interpolate(d.endAngle, getEndAngle(percent));
               
              return function(t) {
                 d.endAngle = interpolate(t);
                  
                return innerArc(d);
              };
            });
            
        timeText
            .text(getFormatedTime(amountInSeconds))
            .attr('transform', function () {
                    return 'translate(' + -(d3.select(this).node().getBBox().width / 2) + ')';
            });

    function getFormatedTime(totalSec) {
        var hours = parseInt( totalSec / 3600 ) % 24;
        var minutes = parseInt( totalSec / 60 ) % 60;
        var seconds = totalSec % 60;
        
        return (minutes) + "min " + (Math.round(seconds)) + 'sec';  
    };

    function  getEndAngle(percent) {
        return percent * (2 * Math.PI);
    };

    function createArc(settings) {
        var arc = d3.svg.arc()
            .innerRadius((settings.diameter/2) - settings.thickness)
            .outerRadius(settings.diameter/2)
            .startAngle(0); 
            
        return arc;
    };



// Close Update function and rest of code.
        }

      })
    

}());
