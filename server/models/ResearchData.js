const mongoose = require('mongoose');

const researchDataSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ResearchData = mongoose.model('ResearchData', researchDataSchema);

module.exports = ResearchData;