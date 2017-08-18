// A simple word cloud built in d3, requires the cloud_function.js file in the same folder
(function() {
    looker.plugins.visualizations.add({
        id: 'words_new',
        label: 'Word Cloud',
        options: {
            fontSize: {
                type: 'string',
                display: 'select',
                label: 'Font Size',
                section: 'Data',
                values: [{
                        'X - Large': '100'
                    },
                    {
                        'Large': '50'
                    },
                    {
                        'Med': '50'
                    },
                    {
                        'Small': '25'
                    }
                ],
                default: '50',
                order: 1,

            }
        },


        handleErrors: function(data, resp) {
            return true;
        },
        create: function(element, settings) {

        },
        update: function(data, element, settings, resp) {
            if (!this.handleErrors(data, resp)) return;
            if (resp) {

                var dim = resp.fields.dimensions[0].name,
                    mes = resp.fields.measure_like[0].name;
            }

            if (typeof source == "undefined") {

                var source = [];
            };
            var max_value = 0;

            for (var i = data.length - 1; i >= 0; i--) {
                if (max_value < data[i][mes].value) {
                    max_value = data[i][mes].value
                }

            }



            for (var i = data.length - 1; i >= 0; i--) {
                source.push({
                    text: data[i][dim].value,
                    size: data[i][mes].value / max_value * settings.fontSize + 10 || 50,
                    url: data[i][mes].drilldown_uri
                });
            }


            var vals = [];
            for (var i = data.length - 1; i >= 0; i--) {
                vals[i] = data[i][mes].value;

            };


            var fill = d3.scale.category20();

            h = $(element).height() * .8;
            w = $(element).width() * .8;

            d3.layout.cloud().size([h, w])
                .words(source.map(function(d) {
                    return {
                        text: d.text,
                        size: d.size,
                        url: d.url
                    };
                }))
                .rotate(function() {
                    return ~~(Math.random() * 2) * 90;
                })
                .font("Impact")
                .fontSize(function(d) {
                    return d.size;
                })
                .on("end", draw)
                .start();


            function draw(words) {
                console.log("drawing");

                h = $(element).height();
                w = $(element).width();

                console.log("created");
                d3.select(element).selectAll("*").remove();
                d3.select(element)
                    .append("div")
                    .attr("id", "word-cloud")
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .append("g")
                    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ") rotate(-90)")
                    .selectAll("text")
                    .data(words)
                    .enter().append("a")
                    .attr("xlink:href", function(d) {
                        return d.url
                    })
                    .append("text")
                    .style("font-size", function(d) {
                        return d.size + "px";
                    })
                    .style("font-family", "Impact")
                    .style("fill", function(d, i) {
                        return fill(i);
                    })
                    .attr("text-anchor", "middle")

                    .attr("transform", function(d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .text(function(d) {
                        return d.text;
                    });


            }


        }

    });
}());