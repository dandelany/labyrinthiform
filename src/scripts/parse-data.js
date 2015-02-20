var _ = require('lodash');

var dataErrors = {
    missingGeneType: "Row is missing gene type",
    missingExperiment: "Row does not contain all experiments",
    badNumbers: "Row contains bad numerical value for at least one experiment"
};

function isGoodString(s) { return _.isString(s) && s.length; }
function isGoodNumber(n) { return !_.isNaN(Number(n)); }
function getGeneType(metadata, row) { return row[metadata.geneTypeKey]; }
function hasGeneType(metadata, row) { return isGoodString(getGeneType(metadata, row)); }
function hasExperiment(row, experiment) { return (experiment.dataKey in row); }
function getExperiment(row, experiment) { return row[experiment.dataKey]; }
function hasGoodExperimentData(row, experiment) { return isGoodNumber(getExperiment(row, experiment)); }
function hasAllExperiments(metadata, row) { return _.every(metadata.experiments, _.partial(hasExperiment, row)); }
function hasAllExperimentsData(metadata, row) { return _.every(metadata.experiments, _.partial(hasGoodExperimentData, row)); }

function checkData(rows, metadata) {
    if(!_.every(rows, _.partial(hasGeneType, metadata))) throw dataErrors.missingGeneType;
    if(!_.every(rows, _.partial(hasAllExperiments, metadata))) throw dataErrors.missingExperiment;
    if(!_.every(rows, _.partial(hasAllExperimentsData, metadata))) throw dataErrors.badNumbers;
    return true;
}

function parseData(rows, metadata) {
    try { checkData(rows, metadata); }
    catch(e) {
        console.log("ERROR during checkData");
        throw e;
    }

    metadata.geneTypes = _.map(rows, getGeneType);

    // parse experiment values to numbers
    _.each(rows, function(row) {
        _.each(_.keys(row), function(key) {
            if(key !== metadata.geneTypeKey) {
                row[key] = Number(row[key]);
                if(_.isNaN(row[key])) throw dataErrors.badNumbers;
            }
        });
    });

    return {rows: rows, metadata: metadata};
}

module.exports = parseData;
