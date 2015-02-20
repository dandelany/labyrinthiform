/** @jsx React.DOM */
var _ = require('lodash'),
    d3 = require('d3'),
    $ = require('jquery'),
    metadata = require('./metadata.js'),
    parseData = require('./parse-data.js');

d3.csv('coral-data.csv', function(rows) {
    var parsed = parseData(rows, metadata),
        svg = d3.select('#laby-strig>svg'),
    //renderChart = _.partial(renderBarChart, rows, metadata); // stacked bar chart
        renderChart = _.partial(renderPieChart, rows, metadata); // pie chart
    console.log(parsed);

    // table with four charts at top
    var table = svg.append('g').attr({
        transform: 'translate(0,0)',
        width: 900, height: 480,
        'class': 'legend-container'
    });
    //table.append('rect').attr({x:0, y:60, width: 900, height: 420, fill:'rgba(0,0,0,0.05)'});
    //table.append('rect').attr({x:300, y:0, width: 600, height: 480, fill:'rgba(0,0,0,0.05)'});

    renderColumnLabel(table, {x: 450, y: 40}, metadata.species.laby.name);
    renderColumnLabel(table, {x: 750, y: 40}, metadata.species.strig.name);

    renderRowLabel(table, {x: 150, y: 170}, 'Seasonal Differentially');
    renderRowLabel(table, {x: 150, y: 192}, 'Expressed Genes');

    renderChart(table, '(350,70)', metadata.experiments.fieldLaby);
    renderChart(table, '(350,270)', metadata.experiments.labLaby);

    renderRowLabel(table, {x: 150, y: 360}, 'Experimental Differentially');
    renderRowLabel(table, {x: 150, y: 382}, 'Expressed Genes');

    renderChart(table, '(650,70)', metadata.experiments.fieldStrig);
    renderChart(table, '(650,270)', metadata.experiments.labStrig);

    // legend
    var legend = svg.append('g').attr({
        transform: 'translate(0,520)',
        width: 340, height: 330,
        'class': 'legend-container'
    });
    //legend.append('rect').attr({x:0, y: 0, width: 340, height: 330, fill:'rgba(0,0,0,0.05)'});

    renderLegend(rows, metadata, legend, '(18,20)', 30, 50, 12);


    // bottom table - interspecies differentiation
    var interspecies = svg.append('g').attr({
        transform: 'translate(390,520)',
        width: 510, height: 330,
        'class': 'interspecies-charts'
    });
    //interspecies.append('rect').attr({x:0, y: 0, width: 510, height: 330, fill:'rgba(0,0,0,0.05)'});

    renderHeading(interspecies, {x: 255, y: 40}, "Interspecies Differentially");
    renderHeading(interspecies, {x: 255, y: 70}, "Expressed Genes");

    renderRowLabel(interspecies, {x: 130, y: 110}, "Field Samples");
    renderChart(interspecies, '(30,120)', metadata.experiments.fieldSpecies);

    renderRowLabel(interspecies, {x: 380, y: 110}, "Lab Samples");
    renderChart(interspecies, '(280,120)', metadata.experiments.labSpecies);
});

function renderLabel(svg, options, text) {
    svg.append('text').attr(_.extend(options, {'text-anchor': 'middle'})).html(text);
}

function renderColumnLabel(svg, options, text) {
    renderLabel(svg, _.extend(options, {'class': 'label-col'}), text);
}

function renderRowLabel(svg, options, text) {
    renderLabel(svg, _.extend(options, {'class': 'label-row'}), text);
}

function renderHeading(svg, options, text) {
    renderLabel(svg, _.extend(options, {'class': 'heading'}), text);
}

function renderBarChart(rows, metadata, svg, translate, experiment) {
    var width = 200,
        height = 200,
        getRowVal = function(row) { return row[experiment.dataKey]; },
        sum = _.reduce(rows, function(sum, row) {
            var rowVal = getRowVal(row);
            if(!_.isNumber(rowVal)) throw "bad experiment value";
            return sum + rowVal;
        }, 0),
        xScale = d3.scale.linear().domain([0, sum]).range([0, width]),
        xOffset = 0;

    var g = svg.append('g').attr({
        'class': 'bar-chart-' + experiment.id,
        width: 200, height: 100,
        transform: translate ? "translate" + translate : ''
    });

    var slices = g.selectAll('rect').data(rows);
    slices.enter().append('rect')
        .attr({
            y: 25,
            x: function(d) {
                var x = xOffset;
                xOffset += Math.round(xScale(getRowVal(d)));
                return x;
            },
            height: 150,
            width: function(d) { return Math.round(xScale(getRowVal(d))); },
            'class': function(d,i) { return 'slice-' + i; }
        });
    slices.exit().remove();
}

function renderPieChart(rows, metadata, svg, translate, experiment) {
    var width = 200,
        height = 200,
        radius = Math.min(width, height) / 2,
        getRowVal = function(row) { return row[experiment.dataKey]; };

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(getRowVal);

    var g = svg.append('g')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate" + translate + "translate(" + width / 2 + "," + height / 2 + ")");

    var inner = g.selectAll(".arc")
        .data(pie(rows))
        .enter().append("g")
        .attr("class", "arc");

    inner.append("path")
        .attr("d", arc)
        .attr('class', function(d, i) { return 'slice-' + i});
}

function renderLegend(rows, metadata, svg, translate, height, width, padding) {
    height = height || 30;
    width = width || 50;
    padding = padding | 10;
    var g = svg.append('g').attr({
        'class': 'legend',
        //width: 200, height: 100,
        transform: translate ? "translate" + translate : ''
    });

    var swatches = g.selectAll('rect').data(rows);
    swatches.enter().append('rect')
        .attr({
            x: 0,
            y: function(d, i) {
              return i * (height + padding);
            },
            height: height,
            width: width,
            'class': function(d,i) { return 'legend-swatch slice-' + i; }
        });
    swatches.exit().remove();

    var labels = g.selectAll('text').data(rows);
    labels.enter().append('text')
        .html(function(d) {
            return d[metadata.geneTypeKey].replace(' and ', ' &amp; ');
        })
        .attr({
            x: width + padding,
            y: function(d, i) {
                return (i * (height + padding)) + ((height + padding) / 2);
            },
            height: height,
            width: width,
            'class': 'legend-label'
        });
    labels.exit().remove();
}

_.extend(window, {
    _: _,
    $: $,
    d3: d3
});
