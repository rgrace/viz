(function() {
looker.plugins.visualizations.add({
  id: 'heatmap',
  label: 'Heatmap',
  options: {
    colorRange: {
      type: 'array',
      label: 'Color Ranges',
      section: 'Style',
      placeholder: '#fff, red, etc...'
    },
    colorMeasure: {
      type: '',
      label: 'Color Ranges',
      section: 'Style',
      placeholder: '#fff, red, etc...'
    }
  },
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
    if (resp.fields.pivots.length != 1) {
      this.addError({
        group: 'pivot-req',
        title: 'Incompatible Data',
        message: 'One pivot is required'
      });
      return false;
    } else {
      this.clearErrors('pivot-req');
    }
    if (resp.fields.measures.length > 3) {
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
    d3.select(element)
      .append('div')
      .style('overflow', 'auto')
      .style('height', '100%')
      .append('table')
      .attr('class', 'heatmap')
      .attr('width', '100%')
      .attr('height', '100%');
  },
  update: function(data, element, settings, resp) {
console.log(data);
console.log(resp);
  if (!this.handleErrors(data, resp)) return;

    this.clearErrors('color-error');
    var colorSettings = settings.colorRange || ['white','#b3c8dc','#b3c8dc'];
    var gradientMeasure = settings.colorMeasure || '1';

    if (colorSettings.length <= 1) {
      this.addError({
        group: 'color-error',
        title: 'Invalid Setting',
        message: 'Colors must have two or more values. Each value is separated by a comma. For example "red, blue, green".'
      });
    }
    var dimension = resp.fields.dimensions[0];
    var measure = resp.fields.measures[0];
    var measure1 = resp.fields.measures[1] || {};
    var measure2 = resp.fields.measures[2] || {};
    var pivot = resp.pivots;

    var extents = d3.extent(data.reduce(function(prev, curr) {
      var values = pivot.map(function(pivot) {
        return curr[measure.name][pivot.key].value;
      });
      return prev.concat(values);
    }, []));

    //they want these to be hidden compeltely
    //if (!extents[0] && !extents[1]) {
    //  extents = [0, 0];
    //}

    var extentRange = extents[1] - extents[0];
    var extentInterval = extentRange / (colorSettings.length - 1);
    while(extents.length < colorSettings.length) {
      extents.splice(extents.length-1, 0, extents[extents.length-2]  + extentInterval);
    }

    var colorScale = d3.scale.linear().domain(extents).range(colorSettings);

    var table = d3.select(element)
      .select('table');

    var tableHeaderData = [null];
    pivot.forEach(function(pivot) {
      tableHeaderData.push(pivot.key);
    });

    var thead = table.selectAll('thead')
      .data([[tableHeaderData]]);

    thead.enter()
      .append('thead');

    var theadRow = thead.selectAll('tr')
      .data(function(d) { return d; });

    theadRow.enter()
      .append('tr');

    var theadTd = theadRow.selectAll('td')
      .data(function(d) { return d; });

    theadTd.enter()
      .append('td');

    theadTd.style('text-align','center');

    theadTd.exit()
      .remove();

    theadTd.text(function(d) {
        if (d == '$$$_row_total_$$$') {
          return 'Row Totals';
        } else {
          return d;
        }
      });

    var tbody = table.selectAll('tbody')
      .data([data]);

    tbody.enter()
      .append('tbody');

    var trs = tbody.selectAll('tr')
      .data(function(data) { return data; });

    trs.enter()
      .append('tr');

    trs.exit()
      .remove();

    var tds = trs.selectAll('td')
      .data(function(datum) {
        var tdData = [];
        tdData.push({type: 'dimension', data: datum[dimension.name]});
        datum[dimension.name];
        var measureData = datum[measure.name];
	var measureData1 = datum[measure1.name] || '';
	var measureData2 = datum[measure2.name] || '';
        pivot.forEach(function(pivot) {
          tdData.push({type: 'measure', data: measureData[pivot.key], data1: measureData1[pivot.key] || {} ,data2: measureData2[pivot.key] || {} });
        });
        return tdData;
      });
    tds.enter()
      .append('td');

    tds.exit()
      .remove();

    tds.style('background-color', function(d) {
        if (d.type == 'measure' && d.data.rendered !== '') {
          return colorScale(d.data.value || 0);
        }
      })
      .style('text-align', function(d) {
        if (d.type == 'measure') {
          return 'center';
        }
      })
      //.html(function(d) {
      //  return d.data.html || d.data.rendered || '∅';
      //})
      .html(function(d) {
	  if (d.type == 'measure' && d.data.rendered !== '') {
              return '<span style="color:#2c502a;font-weight:900">'+(d.data.rendered || '')+'<br/></span><span style="color:#2c502a;font-weight:300">'+(d.data1.rendered || '')+'<br/></span><span style="color:#2c502a;font-weight:300">'+(d.data2.rendered || '')+'</span>'}else{
              return '<span style="color:#2c502a;font-weight:900">'+(d.data.rendered || '')
          }
      })
      .on('click', function(d) {
        d3.event.preventDefault();
        LookerCharts.Utils.openUrl(d.data.drilldown_uri);
      })
      .classed('clickable', function(d) {
        return !!d.data.drilldown_uri;
      });

  }
});
}());
