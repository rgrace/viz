// Eric Feinstein
// This still needs work, the funnel has options to adjust based on area of each section. Currently the slope is constant


(function() {
looker.plugins.visualizations.add({
  id: 'funnel',
  label: 'Funnel'
   ,
  options: {
    newWidth: {
        type: 'array',
        label: 'Width %',
      section: 'Style',
     placeholder: '1% to 100%',
        order: 1
      }
      ,

  //   //start options
      colorRange: {
      type: 'array',
      label: 'Color Ranges (array)',
      section: 'Style',
      placeholder: '#fff, red, etc...',
      order: 7
    },
      textColor: {
      type: 'array',
      label: 'Text Color (only one',
      section: 'Style',
      placeholder: '#fff',
      order: 6
    },

    isCurved: {
        type: 'boolean',
        label: '3D Funnel',
      section: 'Style',
        order: 2,
        default: false
      }
      ,
    hoverEffects: {
        type: 'boolean',
        label: 'Hover Effects',
      section: 'Style',
        order: 3,
        default: false
      }     ,
    colorType: {
        type: 'boolean',
        label: 'Gradient Effects',
      section: 'Style',
        order: 5,
        default: false
      }
  //   , 
  //   , 
  //   isInverted: {
  //       type: 'boolean',
  //       label: 'Invert',
  //     section: 'Style',
  //       order: 4
  //     }
    , 

    dynamicArea: {
      type: 'boolean',
      label: 'Dynamic Area',
      section: 'Style',
      order: 4,
      default: false
    }

  }
// end options
  ,
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
    if (resp.fields.measures.length != 1) {
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

      var chart0 = d3.select('#chart').remove();
      

      var chart1 = d3.select(element)
        .append('div')
        .style('width', settings['newWidth']+'%'||'75%')
        .style('height', '100%')                 
        .style('align', 'center')                 
        .attr('id', 'chart');
     /* var chart2 = d3.select(element)
        .append("svg:svg")
        .attr("width", this.width)
        .attr("height", this.height)*/
      //  console.log("settings");
    //    console.log(settings);
      //  console.log(settings["is_curved"]);
    //var config = element;
      
  },
  update: function(data, element, settings, resp) {
    console.log('mysettings');
    console.log(settings);
    this.create(element,settings);
    var oldsettings = settings;

    if (!this.handleErrors(data, resp)) return;
    
    var dimension = resp.fields.dimensions[0].name;

    
    //console.log(dimension);
    
    var measure = resp.fields.measures[0].name;

  //  console.log(measure);

//    console.log(data);


    var newdata = [];

    for (var i = data.length - 1; i >= 0; i--) {
      newdata[i] = [data[i][dimension].value ,  data[i][measure].value];
    };
    
   // console.log(newdata);

 /*   var data = {
            normal: [
              ["Applicants",   1],
              ["Pre-screened", 2],
              ["Interviewed",  3],
              ["Hired",        4]
            ]};*/

    var options = {};

   // console.log(data);
    

    var chart = new D3Funnel("#chart",settings);
    chart.draw(newdata,options);

    

    

  },






});



// funnel code

  var D3Funnel = function(selector, settings)
  {
    this.selector = selector;

    // Default configuration values
    this.defaults = {
      width: '100%',
      height: '100%',
      bottomWidth: 1/4,
      bottomPinch: 0,
      isCurved: settings['isCurved'] || false,
      curveHeight: 50,
      fillType: settings['fillType'] || "gradient",
      isInverted: false,
      hoverEffects: settings['hoverEffects'] || false,
      dynamicArea: settings['dynamicArea'] || false,
      minHeight: true,
      animation: true,
      label: {
        fontSize: "14px",
        fill: settings['textColor'] || '#000000'
      },
      colorRange: settings['colorRange'],
      colorType: settings['colorType']

    };
  };
D3Funnel.prototype.__isArray = function(value)
  {
    return Object.prototype.toString.call(value) === "[object Array]";
  };

  /**
   * Extends an object with the members of another.
   *
   * @param {Object} a The object to be extended.
   * @param {Object} b The object to clone from.
   *
   * @return {Object}
   */
  D3Funnel.prototype.__extend = function(a, b, c)
  {
    var prop;
    for (prop in b) {
      if (b.hasOwnProperty(prop)) {
        a[prop] = b[prop];
      }
    }

    for (prop in c) {
      a[prop] = c[prop];
      }
    

    return a;
  };

  /**
   * Draw onto the container with the data and configuration specified. This
   * will clear any previous SVG element in the container and draw a new
   * funnel chart on top of it.
   *
   * @param {array}  data    A list of rows containing a category, a count,
   *                         and optionally a color (in hex).
   * @param {Object} options An optional configuration object for chart
   *                         options.
   *
   * @param {int}      options.width        Initial width. Specified in pixels.
   * @param {int}      options.height       Chart height. Specified in pixels.
   * @param {int}      options.bottomWidth  Specifies the width percent the
   *                                        bottom should be in relation to the
   *                                        chart's overall width.
   * @param {int}      options.bottomPinch  How many sections (from the bottom)
   *                                        should be "pinched" to have fixed
   *                                        width defined by options.bottomWidth.
   * @param {bool}     options.isCurved     Whether or not the funnel is curved.
   * @param {int}      options.curveHeight  The height of the curves. Only
   *                                        functional if isCurve is set.
   * @param {string}   options.fillType     The section background type. Either
   *                                        "solid" or "gradient".
   * @param {bool}     options.isInverted   Whether or not the funnel should be
   *                                        inverted to a pyramid.
   * @param {bool}     options.hoverEffects Whether or not the funnel hover
   *                                        effects should be shown.
   * @param {bool}     options.dynamicArea  Whether or not the area should be
   *                                        dynamically calculated based on
   *                                        data counts.
   * @param {bool|int} options.minHeight    The minimum height of a level.
   * @param {int}      options.animation    The load animation speed. If empty,
   *                                        there will be no load animation.
   * @param {Object}   options.label
   * @param {Object}   options.label.fontSize
   */
  D3Funnel.prototype.draw = function(data, options)
  {
    // Initialize chart options
    this.__initialize(data, options);

    // Remove any previous drawings
    d3.select(this.selector).selectAll("svg").remove();

      

    // Add the SVG and group element
    this.svg = d3.select(this.selector)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .append("g");

    this.sectionPaths = this.__makePaths();

    // Define color gradients
    if (this.fillType === "gradient") {
      this.__defineColorGradients(this.svg);
    }

    // Add top oval if curved
    if (this.isCurved) {
      this.__drawTopOval(this.svg, this.sectionPaths);
    }

    // Add each block section
    for (var i = this.data.length - 1; i >= 0; i--) {
      this.__drawSection(i);
    }; 
    

  };

  /**
   * Draw the next section in the iteration.
   *
   * @param {int} index
   */
  D3Funnel.prototype.__drawSection = function(index)
  {
    if (index === this.data.length) {
      return;
    }

    // Create a group just for this block
    var group = this.svg.append("g");

    // Fetch path element
    var path = this.__getSectionPath(group, index);
    path.data(this.__getSectionData(index));
   // console.log(path);

    // Add animation components
    if (this.animation !== false) {
      var self = this;
      path.transition()
        .duration(this.animation)
        .ease("linear")
        .attr("fill", this.__getColor(index))
        .attr("d", this.__getPathDefinition(index))
        .each("end", function() {
          self.__drawSection(index + 1);
        });
    } else {
      path.attr("fill", this.__getColor(index))
        .attr("d", this.__getPathDefinition(index));
      this.__drawSection(index + 1);
    }





    // Add the hover events
    if (this.hoverEffects) {
      path.on("mouseover", this.__onMouseOver)
        .on("mouseout", this.__onMouseOut);
    }

    // ItemClick event
    if ( this.onItemClick ) {
      path.on( "click", this.onItemClick );
    }

    this.__addSectionLabel(group, index);
  };

  /**
   * Return the color for the given index.
   *
   * @param {int} index
   */
  D3Funnel.prototype.__getColor = function(index)
  {
    if (this.fillType === "solid") {
      return this.data[index][2];
    } else {
      return "url(#gradient-" + index + ")";
    }

  };

  /**
   * @param {Object} group
   * @param {int}    index
   *
   * @return {Object}
   */
  D3Funnel.prototype.__getSectionPath = function(group, index)
  {
    var path = group.append("path");



    if (this.animation !== false) {
      this.__addBeforeTransition(path, index);
    }

    return path;
  };

  /**
   * Set the attributes of a path element before its animation.
   *
   * @param {Object} path
   * @param {int}    index
   */
  D3Funnel.prototype.__addBeforeTransition = function(path, index)
  {
    var paths = this.sectionPaths[index];

    var beforePath = "";
    var beforeFill = "";

    // Construct the top of the trapezoid and leave the other elements
    // hovering around to expand downward on animation
    console.log(this.isCurved);
    if (!this.isCurved) {
      beforePath = "M" + paths[0][0] + "," + paths[0][1] +
        " L" + paths[1][0] + "," + paths[1][1] +
        " L" + paths[1][0] + "," + paths[1][1] +
        " L" + paths[0][0] + "," + paths[0][1];
    } else {
      beforePath = "M" + paths[0][0] + "," + paths[0][1] +
        " Q" + paths[1][0] + "," + paths[1][1] +
        " " + paths[2][0] + "," + paths[2][1] +
        " L" + paths[2][0] + "," + paths[2][1] +
        " M" + paths[2][0] + "," + paths[2][1] +
        " Q" + paths[1][0] + "," + paths[1][1] +
        " " + paths[0][0] + "," + paths[0][1];
    }
    // Use previous fill color, if available
    if (this.fillType === "solid") {
      beforeFill = index > 0 ? this.__getColor(index - 1) : this.__getColor(index);
    // Use current background if gradient (gradients do not transition)
    } else {
      beforeFill = this.__getColor(index);
    }

    
    path.attr("fill", beforeFill)
      .attr("d", beforePath);

   // console.log("path");
   // console.log(path);
     
  };

  /**
   * @param {int} index
   *
   * @return {array}
   */
  D3Funnel.prototype.__getSectionData = function(index)
  {
    return [{
      index: index,
      label: this.data[index][0],
      value: this.data[index][1],
      stroke: "#000000",
      baseColor: this.data[index][2],
      fill: this.__getColor(index)
    }];
  };

  /**
   * @param {int} index
   *
   * @return {string}
   */
  D3Funnel.prototype.__getPathDefinition = function(index)
  {
    var pathStr = "";
    var point = [];
    var paths = this.sectionPaths[index];

    for (var j = 0; j < paths.length; j++) {
      point = paths[j];
      pathStr += point[2] + point[0] + "," + point[1] + " ";
    }

    return pathStr;
  };

  /**
   * @param {Object} group
   * @param {int}    index
   */
  D3Funnel.prototype.__addSectionLabel = function(group, index)
  {
    var i = index;
    var paths = this.sectionPaths[index];
    var textStr = this.data[i][0] + ": " + this.data[i][1].toLocaleString();
   // console.log(textStr)
    var textFill = this.data[i][3] || this.label.fill;

    var textX = this.width / 2;   // Center the text
    var textY = !this.isCurved ?  // Average height of bases
      (paths[1][1] + paths[2][1]) / 2 :
      (paths[2][1] + paths[3][1]) / 2 + (this.curveHeight / this.data.length);

    group.append("text")
      .text(textStr)
      .attr({
        "x": textX,
        "y": textY,
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "fill":  textFill,
        "pointer-events": "none"
      })
      .style("font-size", this.label.fontSize);
  };

  /**
   * Initialize and calculate important variables for drawing the chart.
   *
   * @param {array}  data
   * @param {Object} options
   */
  D3Funnel.prototype.__initialize = function(data, options, settings)
  {
    if (!this.__isArray(data) || data.length === 0 ||
      !this.__isArray(data[0]) ) {  //|| data[0].length < 2
      throw {
        name: "D3 Funnel Data Error",
        message: "Funnel data is not valid.",
        data: data
      };
    }



    // Initialize options if not set
    options = typeof options !== "undefined" ? options : {};

    this.data = data;

    // Counter
    var i = 0;

    // Prepare the configuration settings based on the defaults
    // Set the default width and height based on the container
    var settings = this.__extend({}, this.defaults, this.settings);
    console.log("settings_extended");
    console.log(settings);
    console.log(this.options);
    console.log(this.defaults);

    if (this.defaults['colorType'] == true) 
    {
      options['fillType'] = 'gradient';
      
      settings['fillType'] = 'gradient';
      

    } else {

      options['fillType'] = 'solid';
      settings['fillType'] = 'solid';
     
    }


    settings.width  = parseInt(d3.select(this.selector).style("width"), 10);
    settings.height = parseInt(d3.select(this.selector).style("height"), 10);

    // Overwrite default settings with user options
    var keys = Object.keys(options);
    for (i = 0; i < keys.length; i++) {
      if (keys[i] !== "label") {
        settings[keys[i]] = options[keys[i]];
      }
    }

    // Label settings
    if ("label" in options) {
      var validLabelOptions = /fontSize|fill/;
      var labelOption;
      for (labelOption in options.label) {
        if (labelOption.match(validLabelOptions)) {
          settings.label[labelOption] = options.label[labelOption];
        }
      }
    }
    this.label = settings.label;

    // In the case that the width or height is not valid, set
    // the width/height as its default hard-coded value
    if (settings.width <= 0) {
      settings.width = this.defaults.width;
    }
    if (settings.height <= 0) {
      settings.height = this.defaults.height;
    }

    // Initialize the colors for each block section
    var colorScale = d3.scale.category10();
    for (i = 0; i < this.data.length; i++) {
      var hexExpression = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

      // If a color is not set for the record, add one
      if (!("2" in this.data[i]) || !hexExpression.test(this.data[i][2])) {
        this.data[i][2] = (settings['colorRange'] != undefined) ? settings['colorRange'][i] : colorScale(i);
      }
    }
    console.log(settings['colorRange']);
    // Initialize funnel chart settings
    this.width = settings.width;
    this.height = settings.height;
    this.bottomWidth = settings.width * settings.bottomWidth;
    this.bottomPinch = settings.bottomPinch;
    this.isCurved = settings['isCurved'];
    this.curveHeight = settings.curveHeight;
    this.fillType = settings['fillType'];
    this.isInverted = settings.isInverted;
    this.hoverEffects = settings['hoverEffects'];
    this.dynamicArea = settings['dynamicArea'];
    this.minHeight = settings.minHeight;
    this.animation = settings.animation;
    this.colorRange = settings['colorRange'];


    // Calculate the bottom left x position
    this.bottomLeftX = (this.width - this.bottomWidth) / 2;

    // Change in x direction
    // Will be sharper if there is a pinch
    this.dx = this.bottomPinch > 0 ?
      this.bottomLeftX / (data.length - this.bottomPinch) :
      this.bottomLeftX / data.length;
    // Change in y direction
    // Curved chart needs reserved pixels to account for curvature
    this.dy = this.isCurved ?
      (this.height - this.curveHeight) / data.length :
      this.height / data.length;

    // Support for events
    this.onItemClick = settings.onItemClick;
   // console.log(this.data);
  };

  /**
   * Create the paths to be used to define the discrete funnel sections and
   * returns the results in an array.
   *
   * @return {array}
   */
  D3Funnel.prototype.__makePaths = function()
  {
    var paths = [];

    // Initialize velocity
    var dx = this.dx;
    var dy = this.dy;

    // Initialize starting positions
    var prevLeftX = 0;
    var prevRightX = this.width;
    var prevHeight = 0;

    // Start from the bottom for inverted
    if (this.isInverted) {
      prevLeftX = this.bottomLeftX;
      prevRightX = this.width - this.bottomLeftX;
    }

    // Initialize next positions
    var nextLeftX = 0;
    var nextRightX = 0;
    var nextHeight = 0;

    var middle = this.width / 2;

    // Move down if there is an initial curve
    if (this.isCurved) {
      prevHeight = 10;
    }

    var topBase = this.width;
    var bottomBase = 0;

    var totalArea = this.height * (this.width + this.bottomWidth) / 2;
    var slope = 2 * this.height / (this.width - this.bottomWidth);

    // This is greedy in that the section will have a guranteed height and
    // the remaining is shared among the ratio, instead of being shared
    // according to the remaining minus the guranteed
    if (this.minHeight !== false) {
      var height = (this.height - this.minHeight * this.data.length);
      totalArea = height * (this.width + this.bottomWidth) / 2;
    }

    var totalCount = 0;
    var count = 0;

    // Harvest total count
    for (var i = 0; i < this.data.length; i++) {
      totalCount += this.data[i][1];
    }
   // console.log("total count");
   // console.log(totalCount)
    // Create the path definition for each funnel section
    // Remember to loop back to the beginning point for a closed path
    for (i = 0; i < this.data.length; i++) {
      count = this.data[i][1];

      // Calculate dynamic shapes based on area
      if (this.dynamicArea) {
        var ratio = count / totalCount;
        var area  = ratio * totalArea;

        if (this.minHeight !== false) {
          area += this.minHeight * (this.width + this.bottomWidth) / 2;
        }

        bottomBase = Math.sqrt((slope * topBase * topBase - (4 * area)) / slope);
        dx = (topBase / 2) - (bottomBase / 2);
        dy = (area * 2) / (topBase + bottomBase);

        if (this.isCurved) {
          dy = dy - (this.curveHeight/this.data.length);
        }

        topBase = bottomBase;
      }

      // Stop velocity for pinched sections
      if (this.bottomPinch > 0) {

        // Check if we've reached the bottom of the pinch
        // If so, stop changing on x
        if (!this.isInverted) {
          if (i >= this.data.length - this.bottomPinch) {
            dx = 0;
          }
        }
        // Pinch at the first sections relating to the bottom pinch
        // Revert back to normal velocity after pinch
        else {
          // Revert velocity back to the intial if we are using
          // static area's (prevents zero velocity if isInverted
          // and bottomPinch are non trivial and dynamicArea is false)
          if (!this.dynamicArea) {
            dx = this.dx;
          }

          dx = i < this.bottomPinch ? 0 : dx;
        }
      }

      // Calculate the position of next section
      nextLeftX = prevLeftX + dx;
      nextRightX = prevRightX - dx;
      nextHeight = prevHeight + dy;

      // Expand outward if inverted
      if (this.isInverted) {
        nextLeftX = prevLeftX - dx;
        nextRightX = prevRightX + dx;
      }

      // Plot curved lines
      if (this.isCurved) {
        paths.push([
          // Top Bezier curve
          [prevLeftX, prevHeight, "M"],
          [middle, prevHeight + (this.curveHeight - 10), "Q"],
          [prevRightX, prevHeight, ""],
          // Right line
          [nextRightX, nextHeight, "L"],
          // Bottom Bezier curve
          [nextRightX, nextHeight, "M"],
          [middle, nextHeight + this.curveHeight, "Q"],
          [nextLeftX, nextHeight, ""],
          // Left line
          [prevLeftX, prevHeight, "L"]
        ]);
      }
      // Plot straight lines
      else {
        paths.push([
          // Start position
          [prevLeftX, prevHeight, "M"],
          // Move to right
          [prevRightX, prevHeight, "L"],
          // Move down
          [nextRightX, nextHeight, "L"],
          // Move to left
          [nextLeftX, nextHeight, "L"],
          // Wrap back to top
          [prevLeftX, prevHeight, "L"],
        ]);
      }

      // Set the next section's previous position
      prevLeftX = nextLeftX;
      prevRightX = nextRightX;
      prevHeight = nextHeight;
    }
   // console.log(paths);
    return paths;
  };

  /**
   * Define the linear color gradients.
   *
   * @param {Object} svg
   */
  D3Funnel.prototype.__defineColorGradients = function(svg)
  {
    var defs = svg.append("defs");

    // Create a gradient for each section
    for (var i = 0; i < this.data.length; i++) {
      var color = this.data[i][2];
      var shade = shadeColor(color, -0.25);

      // Create linear gradient
      var gradient = defs.append("linearGradient")
        .attr({
          id: "gradient-" + i
        });

      // Define the gradient stops
      var stops = [
        [0, shade],
        [40, color],
        [60, color],
        [100, shade]
      ];

      // Add the gradient stops
      for (var j = 0; j < stops.length; j++) {
        var stop = stops[j];
        gradient.append("stop").attr({
          offset: stop[0] + "%",
          style:  "stop-color:" + stop[1]
        });
      }
    }
  };

  /**
   * Draw the top oval of a curved funnel.
   *
   * @param {Object} svg
   * @param {array}  sectionPaths
   */
  D3Funnel.prototype.__drawTopOval = function(svg, sectionPaths)
  {
    var leftX = 0;
    var rightX = this.width;
    var centerX = this.width / 2;

    if (this.isInverted) {
      leftX = this.bottomLeftX;
      rightX = this.width - this.bottomLeftX;
    }

    // Create path form top-most section
    var paths = sectionPaths[0];
    var path = "M" + leftX + "," + paths[0][1] +
      " Q" + centerX + "," + (paths[1][1] + this.curveHeight - 10) +
      " " + rightX + "," + paths[2][1] +
      " M" + rightX + ",10" +
      " Q" + centerX + ",0" +
      " " + leftX + ",10";

    // Draw top oval
    svg.append("path")
      .attr("fill", shadeColor(this.data[0][2], -0.4))
      .attr("d", path);
  };

  /**
   * @param {Object} data
   */
  D3Funnel.prototype.__onMouseOver = function(data)
  {
    d3.select(this).attr("fill", shadeColor(data.baseColor, -0.2));
  };

  /**
   * @param {Object} data
   */
  D3Funnel.prototype.__onMouseOut = function(data)
  {
    d3.select(this).attr("fill", data.fill);
  };

  /**
   * Shade a color to the given percentage.
   *
   * @param {string} color A hex color.
   * @param {float}  shade The shade adjustment. Can be positive or negative.
   */
  function shadeColor(color, shade)
  {
    var f = parseInt(color.slice(1), 16);
    var t = shade < 0 ? 0 : 255;
    var p = shade < 0 ? shade * -1 : shade;
    var R = f >> 16, G = f >> 8 & 0x00FF;
    var B = f & 0x0000FF;

    var converted = (0x1000000 + (Math.round((t - R) * p) + R) *
      0x10000 + (Math.round((t - G) * p) + G) *
      0x100 + (Math.round((t - B) * p) + B));

    return "#" + converted.toString(16).slice(1);
  }


  // end funnel



}());

