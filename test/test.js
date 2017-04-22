// global scope of vis
global.d3 = require("d3")
global.looker = require("./looker_stub")

// test deps
var glob = require("glob")
var path = require("path")
var assert = require("assert")

// Require all visualizations
glob.sync("./examples/**/*.js" ).forEach(function( file ) {
  require( path.resolve( file ) );
});

looker.plugins.visualizations.all().forEach((vis) =>{
  describe(`${vis.label} (as ${vis.id})`, () => {
    it("should load and not use unavailable things", () => { assert(true) });

    it("should have an id", () => {
      assert(typeof vis.id === "string");
      assert(vis.id.length > 0);
    })

    it("should implement create", () => {
      assert(typeof vis.create === "function");
    })

    it("should implement update or updateAsync", () => {
      assert(typeof vis.update === "function" || typeof vis.updateAsync === "function");
    })

  });
});
