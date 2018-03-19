# Looker Visualization API Examples [![Build Status](https://travis-ci.org/looker/visualization-api-examples.svg?branch=master)](https://travis-ci.org/looker/visualization-api-examples)

[Looker](https://looker.com/)'s Visualization API provides a simple JavaScript interface to creating powerful, customizable visualizations that seamlessly integrate into your data applications. :bar_chart: :chart_with_downwards_trend: :chart_with_upwards_trend:

### [Getting Started Guide &rarr;](docs/getting_started.md)

### [Visualization API Reference &rarr;](docs/api_reference.md)

### [View Examples Library &rarr;](examples)

----

**A Note on Support**

Visualizations provided as examples here are a community supported effort.

Looker's support team does not troubleshoot issues relating to these example visualizations or your custom visualization code.

Please use issues for tracking and closing out bugs, and visit [Looker Discourse](https://discourse.looker.com) for how-to articles, conversations, and tips regarding custom visualizations.

Currently, custom visualizations and their dependencies (like utils.js and d3v4.js) need to be written in ES5 to work with PhantomJS for downloading and scheduling. Code can easily be converted with a tool like [Babel](https://babeljs.io/repl/). Looker will be migrating to a different rendering engine in the near future which should alleviate this requirement.
