const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    bloodType: String,
    donationDate: Date,
    donorId: String,
    donorName: String
});

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
