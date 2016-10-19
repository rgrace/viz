 // Eric Feinstein, built as an adaptation of the current single-value-vis boxed with looker
 // Currently a single value shows one measure:
 // This custom visualization will add the ability to scroll through each line 

  // TODO a lot to do in terms of options and formatting, also remove elements when undefined or only single record/measure


(function() {
looker.plugins.visualizations.add({
  id: 'panes',
  label: 'Single Value Panes',
  options: {
    font_size: {
      type: 'string',
      values: [
        {
          'Large': 'large'
        }, {
          'Medium': 'medium'
        }, {
          'Small': 'small'
        }
      ],
      display: 'radio',
      "default": 'medium',
      label: "Font Size",
      order: 0
    },
    // Add a 
    // },
    font: {
      type: 'string',
      placeholder: "Verdana",
      "default": "verdana",
      label: "Font"
    }
  },
  handleErrors: function (data, resp) {

  data = this.queryResponse;

  var  rec = 0;
  
},
  create: function(element,settings){
  console.log(settings);

  chart = d3.select(element)
    .append('div')
    .attr('id','vis-data');
  console.log('chart made');
  
  } ,  

  update: function(data, element, settings, resp) {

  this.handleErrors(data,resp);

  var curr_rec = 0;
  loadData(curr_rec);

  function loadData(curr_rec) {
  var rec = curr_rec;
  console.log("record " + rec);

  // Set font size

  var font_size = ''; //default'

  if (settings['font_size'] =='large'){
    font_size = '12em';
  } else   if (settings['font_size'] =='medium'){
    font_size = '6em';
  } else   if (settings['font_size'] =='small'){
    font_size = '3em';
  } else {
    font_size = '6em';
  }
  var font = settings['font'] || 'Verdana'

//value
  var visData = data[rec][resp.fields.measures[0].name].rendered || data[rec][resp.fields.measures[0].name].value;
// category or dimension
  var visCat = data[rec][resp.fields.dimensions[0].name].rendered || data[rec][resp.fields.dimensions[0].name].value;
  var data_length = data.length;
  var visPage = (rec+1) + ' of ' +  data.length;

  var pane = d3.select('#visValue').remove();
  pane = d3.select('#bottomVis').remove();

  pane = d3.select('#vis-data')
      .style('text-align','center')
      .append('div')
      .append('span')
      .attr('id','visValue')
      .style('font-size', font_size)
      .style('font-family', font)
      .text(visData);

  console.log(font);


  pane = d3.select(element)
      .append('div')
      .attr('id','bottomVis')
      .style('text-align','center')

// ---- button
if(rec>0){
    pane = d3.select('#bottomVis')
        .append('span')
        .attr('id','leftPointer')
        .style('display', 'inline-block')
        .append('button')
        .attr('id','leftButton')

        .attr('padding-left','10')
        .attr('padding-right','10')
        .text('<<');

      // on click, increment one

    document.getElementById('leftButton').addEventListener('click', function() {
      curr_rec--;
      // console.log(curr_rec);
      loadData(curr_rec);

  }, false);


}
// ---- data

  pane = d3.select('#bottomVis')
      .append('span')
      .attr('id','bottomInfo')
      .style('display', 'inline-block')
      .append('div')
      .style('font-size', '1.5em')
      .append('b')
      .text(visCat);

  pane = d3.select('#bottomInfo')
      .append('div')
      .style('font-size', '1.5em')
      .text(visPage);

// ---- button

if(data_length-rec-1>0){

  pane = d3.select('#bottomVis')
      .append('span')
      .attr('id','rightPointer')
      .style('display', 'inline-block')
      .append('button')
      .attr('id','rightButton')
        .attr('padding-left','10')
        .attr('padding-right','10')
      .text('>>');

      // on click, increment one

  document.getElementById('rightButton').addEventListener('click', function() {
    curr_rec++;
    // console.log(curr_rec);
    loadData(curr_rec);
}, false);

    }


}





  
  }


});
}());
