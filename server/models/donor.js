const mongoose = require('mongoose');

// סכמת התורם
const donorSchema = new mongoose.Schema({
    donorName: String,            // שם התורם
    disease: { type: String, default: 'None' }, // מחלה (ברירת מחדל - 'None')
    age: Number,                  // גיל התורם
    bloodType: String,            // סוג דם
    donorId: String               // מזהה התורם
});

const Donor = mongoose.model('Donor', donorSchema);

module.exports = Donor;
