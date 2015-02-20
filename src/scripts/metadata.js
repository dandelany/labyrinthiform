var species = {
    laby: {
        id: 'laby',
        shortName: "D. laby",
        name: "D. labyrinthiformis"
    },
    strig: {
        id: 'strig',
        shortName: "P. strig",
        name: "P. strigosa"
    }
};

var experiments = {
    labLaby: {
        id: 'labLaby',
        diff: "Lab Conditions",
        labOrField: 'lab',
        species: species.laby,
        dataKey: "Laboratory Experiments (D. labyrinthiformis)"
    },
    labStrig: {
        id: 'labStrig',
        diff: "Lab Conditions",
        labOrField: 'lab',
        species: species.strig,
        dataKey: "Laboratory Experiments (P. strigosa)"
    },

    fieldLaby: {
        id: 'fieldLaby',
        diff: "Seasonal",
        labOrField: 'field',
        species: species.laby,
        dataKey: "Seasonal (D. labyrinthiformis)"
    },
    fieldStrig: {
        id: 'fieldStrig',
        diff: "Seasonal",
        labOrField: 'field',
        species: species.strig,
        dataKey: "Seasonal (P. strigosa)"
    },

    labSpecies: {
        id: 'labSpecies',
        diff: "Species",
        labOrField: 'lab',
        species: [species.strig],
        dataKey: "Laboratory Experiments (between species)"
    },
    fieldSpecies: {
        id: 'fieldSpecies',
        diff: "Species",
        labOrField: 'lab',
        species: [species.strig],
        dataKey: "Seasonal (between species)"
    }
};

var geneTypeKey = "Expressed Gene Type";

module.exports = {
    species: species,
    experiments: experiments,
    geneTypeKey: geneTypeKey
};