const mongoose = require('mongoose');

// סכמת יחידת הדם
const bloodUnitSchema = new mongoose.Schema({
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }, // הפניה לתורם
    bloodType: { type: String, required: true }, // סוג הדם של יחידת הדם
    requestDate: { type: Date, default: Date.now }, // תאריך בקשת תרומה
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, // סטטוס הבקשה
    donationDate: { type: Date, required: true }, // תאריך התרומה
    expirationDate: { type: Date, required: true }, // תאריך תפוגה
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'} // הפניה למשתמש שיצר את התורם
});

// פונקציה לחישוב תאריך התפוגה (30 ימים מתאריך התרומה)
bloodUnitSchema.pre('save', function(next) {
    const expirationDays = 30;
    
    if (!this.expirationDate) {
        this.expirationDate = new Date(this.donationDate);
        this.expirationDate.setDate(this.expirationDate.getDate() + expirationDays);
    }
    next();
});

// בדיקה אם תאריך התפוגה עובר, אם כן, לעדכן סטטוס ל'Rejected' לפני כל שליפה של יחידת דם
bloodUnitSchema.pre('find', async function(next) {
    const currentDate = new Date();

    // עדכון סטטוס ל'Rejected' עבור כל יחידות הדם שפג תוקפן, אך שעדיין לא נדחו
    await this.model.updateMany(
        { expirationDate: { $lt: currentDate }, status: { $ne: 'Approved' } },
        { $set: { status: 'Approved' } }
    );
    
    next();
});

bloodUnitSchema.pre('findOne', async function(next) {
    const currentDate = new Date();

    // עדכון סטטוס ל'Rejected' עבור יחידת דם שתוקפה עבר, אך עדיין לא נדחתה
    await this.model.updateOne(
        { expirationDate: { $lt: currentDate }, status: { $ne: 'Approved' } },
        { $set: { status: 'Approved' } }
    );

    next();
});

const BloodUnit = mongoose.model('BloodUnit', bloodUnitSchema);

module.exports = BloodUnit;