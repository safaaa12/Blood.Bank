const mongoose = require('mongoose');

// סכמת יחידת הדם
const bloodUnitSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }, // הפניה לתורם
    bloodType: { type: String, required: true }, // סוג הדם של יחידת הדם
    requestDate: { type: Date, default: Date.now }, // תאריך בקשת תרומה
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, // סטטוס הבקשה
    donationDate: Date,           // תאריך התרומה
    expirationDate: Date          // תאריך תפוגה
});

// פונקציה לחישוב תאריך תפוגה (30 ימים מתאריך התרומה)
bloodUnitSchema.pre('save', function(next) {
    const expirationDays = 30;
    this.expirationDate = new Date(this.donationDate);
    this.expirationDate.setDate(this.expirationDate.getDate() + expirationDays);
    next();
});

const BloodUnit = mongoose.model('BloodUnit', bloodUnitSchema);

module.exports = BloodUnit;
