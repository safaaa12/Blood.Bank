const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const BloodUnit = require('../models/bloodUnit');  // ודא שיש לך את השורה הזו
// Blood compatibility table
const bloodCompatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'A+', 'B+', 'O+', 'AB-', 'A-', 'B-', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
};

// Route for adding blood donation
router.post('/donate', async (req, res) => {
    const { bloodType, donationDate, donorId, donorName, age, disease, units } = req.body;

    if (!bloodType || !donationDate || !donorId || !donorName || !age || !units) {
        return res.status(400).send('יש למלא את כל השדות הנדרשים.');
    }

    try {
        // בדוק אם התורם קיים לפי תעודת זהות (donorId)
        let donor = await Donor.findOne({ donorId });

        if (!donor) {
            // אם התורם לא קיים, צור תורם חדש עם הפרטים הנדרשים
            donor = new Donor({
                donorName,
                age,
                disease,
                bloodType,
                donorId
            });

            await donor.save(); // שמור את התורם החדש במסד הנתונים
        }

        // הוספת יחידות דם חדשות עבור התורם
        const bloodUnitsArray = [];
        for (let i = 0; i < parseInt(units); i++) {
            const bloodUnit = new BloodUnit({
                donor: donor._id,
                bloodType: donor.bloodType, // ודא שסוג הדם נשמר נכון
                donationDate: new Date(donationDate),
                expirationDate: new Date(new Date(donationDate).setDate(new Date(donationDate).getDate() + 30)), // תפוגה 30 יום מתאריך התרומה
                status: 'Pending'
            });
            bloodUnitsArray.push(bloodUnit.save()); // שמור כל יחידת דם בנפרד
        }

        // המתן לשמירת כל יחידות הדם במסד הנתונים
        await Promise.all(bloodUnitsArray);

        res.status(201).send('תרומה נרשמה בהצלחה');
    } catch (error) {
        console.error(error);
        res.status(500).send('שגיאה ברישום התרומה');
    }
});

// Route for checking if donor exists by donorId
router.get('/donors/:donorId', async (req, res) => {
    const { donorId } = req.params;

    try {
        // מצא תורם לפי תעודת זהות
        const donor = await Donor.findOne({ donorId });

        if (donor) {
            // אם התורם נמצא, החזר את פרטי התורם
            return res.json(donor);
        } else {
            // אם התורם לא נמצא, החזר הודעת 404
            return res.status(404).send('תורם לא נמצא במערכת.');
        }
    } catch (error) {
        console.error('Error fetching donor:', error);
        res.status(500).send('שגיאה בשליפת פרטי התורם.');
    }
});
// Route for approving a blood donation
router.post('/approve', async (req, res) => {
    const { bloodUnitId } = req.body; // מזהה יחידת דם

    try {
        const bloodUnit = await BloodUnit.findById(bloodUnitId);
        if (!bloodUnit) {
            return res.status(404).send('לא נמצאה יחידת דם עם מזהה זה.');
        }

        bloodUnit.status = 'Approved'; // עדכון סטטוס לאישור
        await bloodUnit.save();

        res.send({ message: 'התרומה אושרה בהצלחה', bloodUnit });
    } catch (error) {
        console.error('Error approving donation:', error);
        res.status(500).send('שגיאה באישור התרומה');
    }
});

// Route for rejecting a blood donation
router.post('/reject', async (req, res) => {
    const { bloodUnitId } = req.body; // מזהה יחידת דם

    try {
        const bloodUnit = await BloodUnit.findById(bloodUnitId);
        if (!bloodUnit) {
            return res.status(404).send('לא נמצאה יחידת דם עם מזהה זה.');
        }

        bloodUnit.status = 'Rejected'; // עדכון סטטוס לדחייה
        await bloodUnit.save();

        res.send({ message: 'התרומה נדחתה בהצלחה', bloodUnit });
    } catch (error) {
        console.error('Error rejecting donation:', error);
        res.status(500).send('שגיאה בדחיית התרומה');
    }
});
router.post('/dispense', async (req, res) => { 
    const { bloodType, amount } = req.body;
    try {
        const currentDate = new Date();
        const bloodUnits = await BloodUnit.find({ 
            status: 'Pending', 
            expirationDate: { $gt: currentDate }, // לוודא שהדם לא פג תוקף
            bloodType: bloodType // חיפוש לפי סוג הדם
        })
        .limit(amount);
        const availableAmount = bloodUnits.length;
        // אם אין מספיק יחידות במלאי, החזר שגיאה
        if (availableAmount < amount) {
            return res.status(400).send(`יש במלאי רק ${availableAmount} מנות מסוג זה.`);
        }

        // עדכון הסטטוס ותאריך הבקשה לכל יחידה שננפקת
        const bloodUnitIds = bloodUnits.map(unit => unit._id);
        await BloodUnit.updateMany({ _id: { $in: bloodUnitIds } }, { 
            $set: { status: 'Rejected', requestDate: currentDate } 
        });

        // החזרת תגובה על הניפוק המוצלח
        return res.send({
            message: 'המלאי המבוקש זמין וניפוק הצליח',
            bloodUnits,
            remainingAmount: availableAmount - amount
        });

    } catch (error) {
        console.error('שגיאה בניפוק הדם:', error);
        res.status(500).send('שגיאה בניפוק הדם');
    }
});
// Route for emergency dispensing
router.post('/emergency-dispense', async (req, res) => {
    const { amount } = req.body;
    try {
        // חיפוש יחידות דם מאושרות מסוג O-
        const bloodUnits = await BloodUnit.find({
            status: 'Pending',
            bloodType: 'O-', // חיפוש ישיר לפי סוג הדם
            expirationDate: { $gt: new Date() } // לוודא שהיחידות לא פגו תוקפן
        })
        .sort({ donationDate: 1 }) // סידור לפי תאריך התרומה
        .limit(amount); // הגבלת הכמות לפי בקשת המשתמש

        // בדיקת זמינות במלאי
        if (bloodUnits.length === 0) {
            return res.status(400).send('אין מלאי דם מסוג O- זמין.');
        } else if (bloodUnits.length < amount) {
            return res.status(400).send(`זמינים רק ${bloodUnits.length} מנות דם מסוג O- במלאי.`);
        }

        // עדכון סטטוס לכל יחידות הדם שמנופקות
        const bloodUnitIds = bloodUnits.map(unit => unit._id);
        await BloodUnit.updateMany({ _id: { $in: bloodUnitIds } }, {
            $set: { status: 'Rejected', requestDate: new Date() } 
        });

        // חישוב כמות המנות שנותרו לאחר הניפוק
        const remainingAmount = await BloodUnit.countDocuments({
            status: 'Pending',
            bloodType: 'O-', 
            expirationDate: { $gt: new Date() } // ספירה רק של מנות לא פגות תוקף
        });

        // החזרת תגובה על הניפוק המוצלח
        res.send({
            message: 'הוצאו מנות דם מסוג O- בהצלחה',
            bloodUnits,
            remainingAmount
        });
    } catch (error) {
        console.error('Error during emergency dispense:', error);
        res.status(500).send('שגיאה בניפוק הדם לחירום');
    }
});

// Route for statistics (accessible only by students)
router.get('/stats', async (req, res) => {
    try {
        const totalDonations = await Donor.countDocuments();
        const totalDonors = await Donor.distinct('donorId').countDocuments(); // Count unique donors
        const emergencyDispenseCount = await Donor.countDocuments({ bloodType: 'O-' }); // Example count for emergency dispense
        const bloodTypeCounts = await Donor.aggregate([
            { $group: { _id: "$bloodType", count: { $sum: 1 } } }
        ]);
        res.json({
            bloodTypeCounts,
            totalDonations,
            totalDonors,
            emergencyDispense: emergencyDispenseCount
        });
    } catch (error) {
        console.error('Error fetching statistics:', error.message);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Route for fetching meta data (accessible only by admins)
router.get('/meta', async (req, res) => {
    try {
        const totalBloodUnits = await Donor.countDocuments();
        const totalDonors = await Donor.distinct('donorId').countDocuments();
        const recentDispenses = await Donor.aggregate([
            { $match: {} },
            { $group: { _id: null, recentDispenseCount: { $sum: 1 } } }
        ]);

        res.json({
            totalBloodUnits,
            totalDonors,
            recentDispenses: recentDispenses.length > 0 ? recentDispenses[0].recentDispenseCount : 0
        });
    } catch (error) {
        console.error('Error fetching meta data:', error.message);
        res.status(500).json({ message: 'Error fetching meta data' });
    }
});

// Route to get all donors
router.get('/donors', async (req, res) => {
    console.log('Request received for fetching donors');  // לוג לבדיקת קבלת הבקשה
    try {
        const donors = await Donor.find({});
        res.json(donors);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).send('שגיאה בשליפת התורמים');
    }
});

// פונקציה לשליפת תרומות שתפוגתן קרבה
async function getExpiringDonations() {
    const expirationDays = 5; // מספר הימים עד שתפוגת התרומה קרבה
    const currentDate = new Date();

    // חישוב התאריך שבו תפוגת התרומה מתקרבת (5 ימים קדימה)
    const notificationDate = new Date();
    notificationDate.setDate(currentDate.getDate() + expirationDays);

    try {
        // שליפת יחידות דם שתפוגתן תסתיים תוך 5 ימים
        const soonToExpireDonations = await BloodUnit.find({
            expirationDate: { $lte: notificationDate, $gt: currentDate }
        }).populate('donor');

        return soonToExpireDonations;
    } catch (error) {
        console.error('Error fetching expiring donations:', error);
        throw error;
    }
}

// נתיב לשליחת התרומות שתוקפן יפוג בקרוב
router.get('/notify-expiring-donations', async (req, res) => {
    try {
        const soonToExpireDonations = await getExpiringDonations();
        res.json({ soonToExpireDonations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expiring donations' });
    }
});

// נתיב לחישוב כמות יחידות הדם לפי סוג דם
router.get('/bloodTypeCounts', async (req, res) => {
    try {
        const bloodTypeCounts = await BloodUnit.aggregate([
            {
                $group: {
                    _id: "$bloodType", // קיבוץ לפי סוג הדם של יחידת הדם
                    count: { $sum: 1 } // ספירת כמות יחידות הדם
                }
            }
        ]);
        res.json(bloodTypeCounts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blood type counts' });
    }
});
router.get('/donations/today', async (req, res) => {
    try {
        // קבלת תאריך התחלה וסוף עבור היום הנוכחי (מחצות ועד עכשיו)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // תחילת היום (00:00:00)
        
        const endOfDay = new Date(); // סיום היום (התאריך והשעה הנוכחית)

        // שאילתה שמוצאת תורמים שתרמו היום
        const donationsToday = await BloodUnit.find({
            donationDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('donor'); // טוענים את פרטי התורמים

        // חישוב כמות התורמים הייחודיים
        const uniqueDonorsToday = new Set(donationsToday.map(unit => unit.donor._id));
        const countDonors = uniqueDonorsToday.size;

        res.json({
            totalDonatedToday: donationsToday.length, // סך כל התרומות
            totalDonorsToday: countDonors // כמות התורמים הייחודיים
        });
    } catch (error) {
        console.error('Error fetching today\'s donations:', error);
        res.status(500).send('שגיאה בשליפת תרומות היום.');
    }
});

// Route for emergency dispensing
router.post('/emergency-dispense', async (req, res) => {
    const { amount } = req.body;
    try {
        const donors = await Donor.find({ bloodType: 'O-' }).sort({ donationDate: 1 }).limit(amount);
        console.log('Found donors:', donors);

        if (donors.length === 0) {
            console.log('No O- donors found');
            return res.status(400).send('אין מלאי דם מסוג O- זמין.');
        } else if (donors.length < amount) {
            console.log('Not enough O- donors found');
            return res.status(400).send(`זמינים רק ${donors.length} מנות דם מסוג O- במלאי.`);
        }

        const donorIds = donors.map(donor => donor._id);
        console.log('Donor IDs to delete:', donorIds);

        await Donor.deleteMany({ _id: { $in: donorIds } });

        const remainingAmount = await Donor.countDocuments({ bloodType: 'O-' });
        console.log('Remaining O- donors:', remainingAmount);

        res.send({
            message: 'הוצאו מנות דם מסוג O- בהצלחה',
            donors,
            remainingAmount
        });
    } catch (error) {
        console.error('Error during emergency dispense:', error);
        res.status(500).send('שגיאה בניפוק הדם לחירום');
    }
});

// Route for statistics (accessible only by students)
// Route for statistics (accessible only by students)
router.get('/stats', async (req, res) => {
    try {
        const totalDonations = await Donor.countDocuments();
        const totalDonors = await Donor.distinct('donorId').countDocuments(); // Count unique donors
        const emergencyDispenseCount = await Donor.countDocuments({ bloodType: 'O-' }); // Example count for emergency dispense
        const bloodTypeCounts = await Donor.aggregate([
            { $group: { _id: "$bloodType", count: { $sum: 1 } } }
        ]);
        res.json({
            bloodTypeCounts,
            totalDonations,
            totalDonors,
            emergencyDispense: emergencyDispenseCount
        });
    } catch (error) {
        console.error('Error fetching statistics:', error.message);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Route for fetching meta data (accessible only by admins)
router.get('/meta', async (req, res) => {
    try {
        const totalBloodUnits = await Donor.countDocuments();
        const totalDonors = await Donor.distinct('donorId').countDocuments();
        const recentDispenses = await Donor.aggregate([
            { $match: {} },
            { $group: { _id: null, recentDispenseCount: { $sum: 1 } } }
        ]);

        res.json({
            totalBloodUnits,
            totalDonors,
            recentDispenses: recentDispenses.length > 0 ? recentDispenses[0].recentDispenseCount : 0
        });
    } catch (error) {
        console.error('Error fetching meta data:', error.message);
        res.status(500).json({ message: 'Error fetching meta data' });
    }
});

// Route to get all donors
router.get('/donors', async (req, res) => {
    console.log('Request received for fetching donors');  // לוג לבדיקת קבלת הבקשה
    try {
        const donors = await Donor.find({});
        res.json(donors);
    } catch (error) {
        console.error('Error fetching donors:', error);
        res.status(500).send('שגיאה בשליפת התורמים');
    }
});


module.exports = router;
