/* global require,console */

var _ = require("underscore");
var fs = require("fs");
var ent = require("ent");
var PatternBuilder = require("./get_pattern_data");

function templifyPath(url) {
  return _.template(fs.readFileSync(url,{ encoding: "utf-8" }));
}

// various templates for assembling sample files.
var templates = {

  pattern : {
    svg : templifyPath("./src/templates/svg/pattern.svg"),
    css: templifyPath("./src/templates/css/pattern.css")
  },

  components: {
    rect: templifyPath("./src/templates/svg/rect.html"),
    div: templifyPath("./src/templates/css/div.html"),
    d3Snippet: templifyPath("./src/templates/d3/d3Snippet.js")
  },

  output: {
    svg: templifyPath("./src/templates/pages/sample_svg.html"),
    css: templifyPath("./src/templates/pages/sample_css.html"),
    d3: templifyPath("./src/templates/pages/sample_d3.html"),
    index: templifyPath("./src/templates/pages/index.html"),
    patterns_css: templifyPath("./src/templates/pages/patterns.css")
  }
};

var root = "./src/patterns/";
var patternGroups = fs.readdirSync(root);
var processingCount = patternGroups.length - 1; //-.DS_Store
var builder = new PatternBuilder(root);

getPatternData = builder.getSinglePatternData;

// groups of patterns.
var groups = [];
var patternNames = [];

function isValid(patternGroupName) {
  if (patternGroupName !== ".DS_Store" &&
    fs.lstatSync(root + patternGroupName).isDirectory()) {
    return true;
  }
  return false;
}

patternGroups.forEach(function(patternGroupName, groupIndex) {

  if (isValid(patternGroupName)) {

    var outputStrings = {
      groupName: /([0-9]+\-)(.+)/.exec(patternGroupName)[2],
      svg: [],
      escapedSVG: [],
      css: [],
      svgSamples: [],
      divSamples: [],
      div: [],
      d3Samples: []
    };

    var patternGroup = fs.readdirSync(root + patternGroupName);
    patternGroup.forEach(function(patternFile, patternIndex) {

      var data = builder.getSinglePatternData(patternGroupName, patternFile);
      patternNames.push(data.name);

      // pattern defs
      outputStrings.svg[patternIndex] = templates.pattern.svg(data);
      data.encodedSVG = ent.encode(outputStrings.svg[patternIndex]);

      // pattern css file
      outputStrings.css[patternIndex] = templates.pattern.css(data);
      data.encodedCSS = ent.encode(outputStrings.css[patternIndex]);

      // svg pattern using rects
      outputStrings.svgSamples[patternIndex] = templates.components.rect(data);
      // css pattern using divs
      outputStrings.divSamples[patternIndex] = templates.components.div(data);
      // d3 code pattern samples
      outputStrings.d3Samples[patternIndex] = templates.components.d3Snippet(data);

      if (patternIndex + 1 === patternGroup.length) {
        groups.push(outputStrings);
        finish();
      }
    });

  }
});


function writeOutFile(path, contents) {
  fs.writeFileSync(path, contents, {encoding: "utf-8"});
}

function finish() {

  if (!--processingCount) {


    // for ( var i = 0; i < groups.length; i++) {
    //   _.each(groups[i], function(value, key) {
    //     if (groups[i][key] instanceof Array) {
    //       groups[i][key] = value.join("");
    //     }
    //   });
    // }

    console.log("Writing pattern.css");
    writeOutFile("./public/patterns.css", templates.output.patterns_css({
      groups: groups
    }));

    console.log("Writing sample_css.html");
    writeOutFile("./public/sample_css.html", templates.output.css({
      groups: groups // outputStrings.divSamples
    }));

    console.log("Writing sample_svg.html");
    writeOutFile("./public/sample_svg.html", templates.output.svg({
      groups: groups
    }));

    console.log("Writing sample_d3.html");
    writeOutFile("./public/sample_d3.html", templates.output.d3({
      groups: groups,
    }));

    console.log("Writing pattern.css");
    writeOutFile("./public/index.html", templates.output.index({
      patterns: "\"" + patternNames.join("\",\"") + "\""
    }));

  }
}