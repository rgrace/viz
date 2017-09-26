(function() {
  var viz = {
    id: "card",
    label: "Card",
    options: {
      // template: {
      //   section: "Card",
      //   label: "Template - Mustache Markdown",
      //   type: "string",
      //   order: 0,
      // },
      elements: {
        section: "Card",
        label: "Elements per Row",
        type: "number",
        placeholder: "Number of cards per row.",
        order: 1,
      },
    },
    container: undefined,
    // Set up the initial state of the visualization
    create: function(element, config) {
      let input = element.appendChild(document.createElement("div"))
      let textarea = input.appendChild(document.createElement("textarea"))
      let button = input.appendChild(document.createElement("input"))
      button.value = "update"
      button.type = "button"


      let vis = this;
      button.addEventListener('click', function() {
        console.log(textarea.value)
        vis.trigger("updateConfig", [{template: textarea.value}])
      });

      this.container = element.appendChild(document.createElement("div"))
      this.container.setAttribute("class", "card-vis")

    },

    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      console.log(data, config, queryResponse)
      let fields = queryResponse.fields.dimensions
      fields = fields.concat(queryResponse.fields.measures)

      let converter = new showdown.Converter()

      let html = "<table><tbody>"

      let cards = data.map(function(row, idx) {
        if (idx % config.elements == 0) {
          html += "<tr>"
        }
        let datum = {}
        fields.map(function(field) {
          datum[field.label_short] = row[field.name]["value"]
        })
        let text = Mustache.render(config.template, datum)
        let markdown = converter.makeHtml(text)

        html += `<td><div class="card">${markdown}</div></td>`
        if (idx % config.elements == config.elements - 1) {
          html += "</tr>"
        }
      })
      html += "</tbody></table>"
      this.container.innerHTML = html
    }
  };
  looker.plugins.visualizations.add(viz);
}());
