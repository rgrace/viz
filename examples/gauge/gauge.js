looker.plugins.visualizations.add({
  id: 'gauge',
  label: 'Gauge',
  options: {
    colorRange: {
      type: 'array',
      label: 'Colors',
      section: 'Style',
      placeholder: '#fff, yellow, etc...'
    },
    colorTransitions: {
      type: 'array',
      section: 'Style',
      label: 'Color Transitions',
      placeholder: '75, 90'
    },
    minimum: {
        type: 'number',
        label: 'Minimum gauge value',
        section: 'Style',
        placeholder: '0'
    },
    maximum: {
        type: 'number',
        label: 'Maximum gauge value',
        section: 'Style',
        placeholder: '100'
    },
    majorTicks: {
        type: 'number',
        label: 'Number of Major Ticks',
        section: 'Style',
        placeholder: '5'
    },
    minorTicks: {
      type: 'number',
      label: 'Number of minor Ticks',
      section: 'Style',
      placeholder: '2'
    }
  },
  redraw: function(value, transitionDuration) {
      var pointerContainer = this.main.select(".pointerContainer");
      var self = this
      pointerContainer.selectAll("text").text(Math.round(value));

      var pointer = pointerContainer.selectAll("path");
      pointer.transition()
          .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
          .attrTween("transform", function()
          {
              var pointerValue = value;
              if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
              else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
              var targetRotation = (self.value_to_degrees(pointerValue) - 90);
              var currentRotation = self._currentRotation || targetRotation;
              self._currentRotation = targetRotation;

              return function(step)
              {
                  var rotation = currentRotation + (targetRotation-currentRotation)*step;
                  return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
              }
          });
  },
  buildPointerPath: function(value) {
      var self = this

      var delta = this.config.range / 13;

      var head = valueToPoint(value, 0.85);
      var head1 = valueToPoint(value - delta, 0.12);
      var head2 = valueToPoint(value + delta, 0.12);

      var tailValue = value - (this.config.range * (1/(270/360)) / 2);
      var tail = valueToPoint(tailValue, 0.28);
      var tail1 = valueToPoint(tailValue - delta, 0.12);
      var tail2 = valueToPoint(tailValue + delta, 0.12);

      return [head, head1, tail2, tail, tail1, head2, head];

      function valueToPoint(value, factor)  {
          var point = self.value_to_point(value, factor);
          point.x -= self.config.cx;
          point.y -= self.config.cy;
          return point;
      }
  },
  value_to_radians: function(value) {
      return this.value_to_degrees(value) * Math.PI / 180
  },
  value_to_point: function(value, factor) {
      return {
          x: this.config.cx - this.config.radius * factor * Math.cos(this.value_to_radians(value)),
          y: this.config.cy - this.config.radius * factor * Math.sin(this.value_to_radians(value))
      };
  },

  value_to_degrees: function(value) {
      return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45)
  },

  handleErrors: function(data, resp) {
    if (!resp || !resp.fields) {
      return false
    };

    if (resp.fields.measures.length != 1 || resp.fields.dimensions.length != 1) {
      this.addError({
        group: 'measure-req',
        title: 'Incompatible Data',
        message: 'One measure or one dimension is required'
      });
      return false;
    } else {
      this.clearErrors('measure-req');
    }
    return true;
  },

  initialize: function() {

  },
  create: function(element, settings) {
    d3.select(element)
      .append('div')
      .style('overflow', 'auto')
      .style('height', '100%')
      .append("svg:svg")
      .attr("class", "gauge")
      .attr("width", '90%')
      .attr("height", '90%');

  },
  update: function(data, element, settings, resp) {
    if (!this.handleErrors(data, resp)) return;


    this.clearErrors('color-error');
    this.clearErrors('bounds-error');
    var colorSettings = settings.colorRange || ['red', 'yellow', 'green'];
      settings.majorTicks = settings.majorTicks || 8;
      settings.minorTicks = settings.minorTicks || 2;
      var colorTransitions = settings.colorTransitions || [];

    settings.numTransitions = colorTransitions.length;

    if (colorSettings.length < settings.numTransitions) {
      this.addError({
        group: 'color-error',
        title: 'Invalid Setting',
        message: "For " + settings.numTransitions + " transition(s), you must specify at least " + (settings.numTransitions + 1) + " colors. Each value is separated by a comma. For example 'red, yellow, green'."
      });
      return false;
    }


    var dimension = resp.fields.dimensions[0];
    var measure = resp.fields.measures[0];

    field = measure || dimension;
    field_data = data[0][field.name];

    this.config = {};
    full_size = Math.min(element.offsetWidth, element.offsetHeight)
    this.config.size = full_size * 0.9;
    this.config.cx = element.offsetWidth * .9 / 2;
    this.config.cy = this.config.size / 2;
    this.config.radius  = this.config.size * 0.97 / 2;
    this.config.min = settings.minimum || 0;
    this.config.max = settings.maximum || 100;
    this.config.range = this.config.max - this.config.min;

    if (this.config.range <= 0) {
      this.addError({
        group: 'bounds-error',
        title: 'Invalid range',
        message: 'Minimum settings must be larger than maximum setting.'
      });
      return false
    }

    this.config.zones = [];

    for (var t = 0; t <= settings.numTransitions; t++) {
      this.config.zones.push({
        from: this.config.min + this.config.range * (colorTransitions[t - 1] || 0) / 100,
        to: this.config.min + this.config.range * (colorTransitions[t] || 100) / 100,
        color: colorSettings[t]
      });
    }

    // clear out any old SVGs
    this.main = d3.select(element)
      .select("svg");

    this.main.remove();

    // recreate the gauge svg
    d3.select(element).select('div')
      .append("svg:svg")
      .attr("class", "gauge")
      .attr("width", '90%')
      .attr("height", '90%');

    this.main = d3.select(element).select('svg');

    this.main.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", this.config.radius)
      .style("fill", "#ccc")
      .style("stroke", "#000")
      .style("stroke-width", "0.5px");

    this.main.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", 0.9 * this.config.radius)
      .style("fill", "#fff")
      .style("stroke", "#e0e0e0")
      .style("stroke-width", "2px");

    self = this;

    for (var index in this.config.zones) {
      color = this.config.zones[index].color
      start = this.value_to_radians(this.config.zones[index].from);
      end = this.value_to_radians(this.config.zones[index].to);
      this.main.append("svg:path")
        .style("fill", color)
        .attr("d", d3.svg.arc()
          .startAngle(start)
          .endAngle(end)
          .innerRadius(0.75 * this.config.radius)
          .outerRadius(0.85 * this.config.radius))
        .attr("transform", function () {
          return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)"
        });
    }

    var fontSize = Math.round(this.config.size / 16);

    var majorDelta = this.config.range / (settings.majorTicks - 1);
    major = this.config.min;
    for (var i = 0; i < settings.majorTicks; i++) {
      var minorDelta = majorDelta / settings.minorTicks;

      minor = major + minorDelta;
      if (i != settings.majorTicks - 1) {
        for (var j = 0; j < settings.minorTicks; j++) {
          var point1 = this.value_to_point(minor, 0.75);
          var point2 = this.value_to_point(minor, 0.85);

          this.main.append("svg:line")
            .attr("x1", point1.x)
            .attr("y1", point1.y)
            .attr("x2", point2.x)
            .attr("y2", point2.y)
            .style("stroke", "#666")
            .style("stroke-width", "1px");

          minor += minorDelta;
        }
      }

      var point1 = this.value_to_point(major, 0.7);
      var point2 = this.value_to_point(major, 0.85);

      this.main.append("svg:line")
        .attr("x1", point1.x)
        .attr("y1", point1.y)
        .attr("x2", point2.x)
        .attr("y2", point2.y)
        .style("stroke", "#333")
        .style("stroke-width", "2px");

      if (i == 0 || i == settings.majorTicks - 1) {
        var point = this.value_to_point(major, 0.63);
        this.main.append("svg:text")
          .attr("x", point.x)
          .attr("y", point.y)
          .attr("dy", fontSize / 3)
          .attr("text-anchor", major == this.config.min ? "start" : "end")
          .text(Math.round(major))
          .style("font-size", fontSize + "px")
          .style("fill", "#333")
          .style("stroke-width", "0px");
      }

      major += majorDelta

    }
    var pointerContainer = this.main.append("svg:g").attr("class", "pointerContainer");

    var midValue = (this.config.min + this.config.max) / 2;

    var pointerPath = this.buildPointerPath(midValue);

    var pointerLine = d3.svg.line()
      .x(function (d) {
        return d.x
      })
      .y(function (d) {
        return d.y
      })
      .interpolate("basis");

    pointerContainer.selectAll("path")
      .data([pointerPath])
      .enter()
      .append("svg:path")
      .attr("d", pointerLine)
      .style("fill", "#dc3912")
      .style("stroke", "#c63310")
      .style("fill-opacity", 0.7);

    pointerContainer.append("svg:circle")
      .attr("cx", this.config.cx)
      .attr("cy", this.config.cy)
      .attr("r", 0.12 * this.config.radius)
      .style("fill", "#4684EE")
      .style("stroke", "#666")
      .style("opacity", 1);

    var fs = Math.round(this.config.size / 8);
    pointerContainer.selectAll("text")
      .data([midValue])
      .enter()
      .append("svg:text")
      .attr("x", this.config.cx)
      .attr("y", this.config.size - this.config.cy / 4 - fs)
      .attr("dy", fs / 2)
      .attr("text-anchor", "middle")
      .style("font-size", fontSize + "px")
      .style("fill", "#000")
      .style("stroke-width", "0px");

    this.redraw(field_data.value, 10);
  }
});
