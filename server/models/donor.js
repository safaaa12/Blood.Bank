const mongoose = require('mongoose');

// סכמת התורם
const donorSchema = new mongoose.Schema({
    donorName: String,
    age: Number,
    bloodType: String,
    donorId: String,
    disease: { type: String, default: 'None' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // הפניה למשתמש שיצר את התורם
});

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;