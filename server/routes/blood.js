const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const BloodUnit = require('../models/bloodUnit');
const AuditLog = require('../models/auditLog');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function logAction(action, username, role, details) {
    try {
        const log = new AuditLog({ action, user: username, userRole: role, details });
        await log.save();
        console.log('Log saved successfully.');
    } catch (error) {
        console.error('Error saving log:', error);
    }
}
// פונקציית אימות טוקן JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Token missing');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).send('Token is not valid');
        }

        req.user = user; // שמירת המידע המאומת ב-req.user
        console.log('Authenticated user:', req.user); // הדפסת התוכן של req.user כדי לבדוק אם המידע נשלף
        next();
    });
};
// נתיב להוספת תרומת דם
router.post('/donate', authenticateToken, async (req, res) => {
    const { bloodType, donationDate, donorId, donorName, age, disease, units } = req.body;
    try {
        let donor = await Donor.findOne({ donorId });
        if (!donor) {
            donor = new Donor({
                donorName,
                age,
                disease,
                bloodType,
                donorId,
                createdBy: req.user._id
            });
            await donor.save();
            console.log(' userROLE:',req.user.role);
            await logAction('Blood Donation Added', req.user.username, req.user.role, `Added ${units} blood units for donor ID: ${donorId}`);
        }

        const bloodUnitsArray = [];
        for (let i = 0; i < parseInt(units); i++) {
            const bloodUnit = new BloodUnit({
                donor: donor._id,
                bloodType: donor.bloodType,
                donationDate: new Date(donationDate),
                expirationDate: new Date(new Date(donationDate).setDate(new Date(donationDate).getDate() + 30)),
                status: 'Pending',
                createdBy: req.user._id
            });
            bloodUnitsArray.push(bloodUnit.save());
            console.log('User ID:', req.user._id);
            console.log('Username:', req.user.username);
            console.log('Role:', req.user.role);
            await logAction('Blood Donation Added', req.user.username, req.user.role, `Added ${units} blood units for donor ID: ${donorId}`);
        }
        await Promise.all(bloodUnitsArray);
        res.status(201).send('תרומה נרשמה בהצלחה');
    } catch (error) {
        console.error('Error during donation registration:', error.message);  // הדפסת הודעת השגיאה
        console.error('Stack trace:', error.stack);  // הדפסת המעקב אחר השגיאה
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
router.post('/dispense', authenticateToken, async (req, res) => { 
    const { bloodType, amount } = req.body;
    try {
        const currentDate = new Date();

        const totalAvailableUnits = await BloodUnit.find({
            status: 'Pending',
            expirationDate: { $gt: currentDate },
            bloodType: bloodType
        });

        if (totalAvailableUnits.length < amount) {
            return res.status(400).send(`יש במלאי רק ${totalAvailableUnits.length} מנות מסוג ${bloodType}.`);
        }

        const bloodUnitsToDispense = totalAvailableUnits.slice(0, amount);
        const bloodUnitIds = bloodUnitsToDispense.map(unit => unit._id);

        await BloodUnit.updateMany({ _id: { $in: bloodUnitIds } }, { 
            $set: { status: 'Dispensed', requestDate: currentDate } 
        });

        // הוספת לוג
        await logAction('Blood Units Dispensed', req.user._id, `Dispensed ${amount} units of ${bloodType}`);

        return res.send({ message: 'ניפוק הדם הצליח', bloodUnits: bloodUnitsToDispense });
    } catch (error) {
        console.error('שגיאה בניפוק הדם:', error);
        return res.status(500).send('שגיאה בניפוק הדם');
    }
});

// פונקציה למציאת סוג דם חלופי
const findAlternativeBloodType = async (bloodType) => {
    const alternativeMap = {
        'A+': ['O+', 'A-'],
        'A-': ['O-'],
        'B+': ['O+', 'B-'],
        'B-': ['O-'],
        'AB+': ['A+', 'B+', 'O+', 'AB-'],
        'AB-': ['A-', 'B-', 'O-'],
        'O+': ['O-'],
        'O-': []
    };
    
    const alternatives = alternativeMap[bloodType];
    for (const altType of alternatives) {
        const availableUnits = await BloodUnit.countDocuments({ bloodType: altType, status: 'Pending' });
        if (availableUnits > 0) {
            return altType; // החזרת סוג הדם החלופי אם קיים
        }
    }
    return null; // אין סוג דם חלופי
};

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
        const totalBloodUnits = await BloodUnit.countDocuments({ status: 'Pending' });
        const totalDonors = await Donor.distinct('donorId').countDocuments();
         // מציאת כמות הניפוקים האחרונים (אפשר להחליף בתנאי מדויק יותר אם יש לך שדה לזמן ניפוק)
        // חישוב תאריך ההתחלה והסיום של היום הנוכחי
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // תחילת היום (00:00:00)
        
        const endOfDay = new Date(); // סיום היום (התאריך והשעה הנוכחית)

        // שאילתה שמוצאת תורמים שתרמו היום
        const donationsToday = await BloodUnit.find({
            requestDate: { $gte: startOfDay, $lte: endOfDay }
        }).populate('donor'); // טוענים את פרטי התורמים

        res.json({
            totalBloodUnits,
            totalDonors,
            recentDispenses: donationsToday.length
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
                $match: { status: 'Pending' } // סינון יחידות דם במצב Pending בלבד
            },
            {
                $group: {
                    _id: "$bloodType", // קיבוץ לפי סוג דם
                    count: { $sum: 1 } // ספירת כמות יחידות הדם בכל סוג דם
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

// Route to get all blood units with donor information
router.get('/units', async (req, res) => {
    try {
        // מציאת כל יחידות הדם ומילוי המידע על התורמים
        const bloodUnits = await BloodUnit.find().populate('donor');
        res.json(bloodUnits);
    } catch (error) {
        console.error('Error fetching blood units:', error);
        res.status(500).send('שגיאה בשליפת יחידות הדם');
    }
});
// Route for deleting a blood unit by ID
router.delete('/units/:id', async (req, res) => {
    const { id } = req.params; // קבלת מזהה היחידה מהבקשה

    try {
        // בדיקה אם יחידת הדם קיימת
        const bloodUnit = await BloodUnit.findById(id);
        if (!bloodUnit) {
            return res.status(404).send('לא נמצאה יחידת דם עם מזהה זה.');
        }

        // מחיקת יחידת הדם
        await BloodUnit.findByIdAndDelete(id);

        res.send({ message: 'יחידת הדם נמחקה בהצלחה' });
    } catch (error) {
        console.error('Error deleting blood unit:', error);
        res.status(500).send('שגיאה במחיקת יחידת הדם');
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

// דוח יחידות דם לפוג בשבוע הקרוב
router.get('/expiring-soon-report', async (req, res) => {
    try {
        const currentDate = new Date();
        const oneWeekFromNow = new Date(currentDate);
        oneWeekFromNow.setDate(currentDate.getDate() + 7);

        // מציאת יחידות הדם שתפוגתן בתוך 7 ימים
        const expiringUnits = await BloodUnit.find({
            expirationDate: { $gte: currentDate, $lte: oneWeekFromNow }
        }).populate('donor');

        res.json({ expiringUnits });
    } catch (error) {
        console.error('Error fetching expiring blood units report:', error);
        res.status(500).json({ message: 'Error fetching report' });
    }
});

const excel = require('exceljs'); // לספריית Excel
const PdfPrinter = require('pdfmake');
const path = require('path');
const { Console } = require('console');

// הגדרת הנתיב לגופנים שהורדת
const fonts = {
    Alef: {
        normal: path.join(__dirname, '../fonts/Alef-Regular.ttf'),
        bold: path.join(__dirname, '../fonts/Alef-Bold.ttf'),
    },
    Arimo: {
        normal: path.join(__dirname, '../fonts/Arimo-Regular.ttf'),
        bold: path.join(__dirname, '../fonts/Arimo-Bold.ttf'),
    }
};

// יצירת מדפסת PDF עם הגופנים שהוגדרו
const printer = new PdfPrinter(fonts);

// Route להורדת דוח תפוגות בפורמט Excel או PDF
router.get('/download-expiring-report', async (req, res) => {
    const { format } = req.query; // קבלת פורמט הדוח מהבקשה (excel או pdf)

    try {
        const currentDate = new Date();
        const oneWeekFromNow = new Date(currentDate);
        oneWeekFromNow.setDate(currentDate.getDate() + 7);

        // מציאת יחידות דם שתפוגתן בתוך 7 ימים
        const expiringUnits = await BloodUnit.find({
            expirationDate: { $gte: currentDate, $lte: oneWeekFromNow }
        }).populate('donor'); // קבלת פרטי התורם

        if (expiringUnits.length === 0) {
            return res.status(404).json({ message: 'אין יחידות דם שתפוגתן קרובה.' });
        }

        // יצירת דוח Excel או PDF בהתאם לפורמט הנדרש
        if (format === 'excel') {
            // יצירת דוח Excel
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Expiring Blood Units');

            worksheet.columns = [
                { header: 'שם תורם', key: 'donorName', width: 30 },
                { header: 'סוג דם', key: 'bloodType', width: 15 },
                { header: 'תאריך תרומה', key: 'donationDate', width: 20 },
                { header: 'תאריך תפוגה', key: 'expirationDate', width: 20 },
            ];

            expiringUnits.forEach(unit => {
                worksheet.addRow({
                    donorName: unit.donor.donorName,
                    bloodType: unit.bloodType,
                    donationDate: unit.donationDate.toLocaleDateString(),
                    expirationDate: unit.expirationDate.toLocaleDateString(),
                });
            });

            // שליחת הדוח כקובץ להורדה
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=expiring_blood_units.xlsx');
            await workbook.xlsx.write(res);
            res.end();

        } else if (format === 'pdf') {
            // יצירת דוח PDF
            const docDefinition = {
                content: [
                    { text: 'מתקרבת שתפוגתן דם יחידות  דוח', style: 'header', alignment: 'center', rtl: true },
                    ...expiringUnits.map(unit => {
                        return [
                            { text: `${unit.donor.donorName} : תורם שם  `, alignment: 'right', rtl: true },
                            { text: `${unit.expirationDate.toLocaleDateString()} : תפוגה תאריך  `, alignment: 'right', rtl: true },
                            { text: `${unit.donationDate.toLocaleDateString()} : תרומה תאריך  `, alignment: 'right', rtl: true },
                            { text: `${unit.bloodType} : דם סוג  `, alignment: 'right', rtl: true },
                            { text: '------------------------------------------', alignment: 'center' }
                        ];
                    })
                ],                
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    }
                },
                defaultStyle: {
                    font: 'Alef', // שימוש בגופן Alef התומך בעברית
                    alignment: 'right', // כיווניות ברירת מחדל מימין לשמאל (RTL)
                    rtl: true // כיווניות טקסט RTL
                }
            };

            // יצירת PDF ושליחתו בתור תגובה
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=expiring_blood_units.pdf');
            pdfDoc.pipe(res);
            pdfDoc.end();

        } else {
            res.status(400).send('פורמט לא נתמך. אנא בחר בפורמט PDF או Excel.');
        }
    } catch (error) {
        console.error('Error generating expiring report:', error);
        res.status(500).json({ message: 'Error generating report' });
    }
});

router.get('/download-full-donor-report', async (req, res) => {
    const { format } = req.query; // קבלת פורמט הדוח מהבקשה (excel או pdf)

    try {
        // שליפת כל יחידות הדם עם פרטי התורמים שלהם
        const bloodUnits = await BloodUnit.find().populate('donor');

        if (bloodUnits.length === 0) {
            return res.status(404).json({ message: 'אין תרומות במערכת.' });
        }

         // יצירת דוח Excel או PDF בהתאם לפורמט הנדרש
        if (format === 'excel') {
            // יצירת דוח Excel
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Expiring Blood Units');

            worksheet.columns = [
                { header: 'שם תורם', key: 'donorName', width: 30 },
                { header: 'גיל', key: 'age', width: 10 },
                { header: 'סוג דם', key: 'bloodType', width: 15 },
                { header: 'מזהה תורם', key: 'donorId', width: 15 },
                { header: 'מחלות רקע', key: 'disease', width: 20 },
                { header: 'תאריך תרומה', key: 'donationDate', width: 20 },
                { header: 'תאריך תפוגה', key: 'expirationDate', width: 20 },
                { header: 'סטטוס תרומה', key: 'status', width: 15 },
            ];

            bloodUnits.forEach(unit => {
                worksheet.addRow({
                    donorName: unit.donor.donorName,
                    age: unit.donor.age,
                    bloodType: unit.donor.bloodType,
                    donorId: unit.donor.donorId,
                    disease: unit.donor.disease,
                    donationDate: unit.donationDate.toLocaleDateString(),
                    expirationDate: unit.expirationDate.toLocaleDateString(),
                    status: unit.status
                });
            });
            // שליחת הדוח כקובץ להורדה
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=expiring_blood_units.xlsx');
            await workbook.xlsx.write(res);
            res.end();

        } else if (format === 'pdf') {
            // יצירת דוח PDF
            const docDefinition = {
                content: [
                    { text: 'תרומות ו תורמים של מלא  דוח', style: 'header', alignment: 'center', rtl: true },
                    ...bloodUnits.map(unit => {
                        return [
                            { text: `${unit.donor.donorName} : תורם שם  `, alignment: 'right', rtl: true },
                            { text: `${unit.donor.age} : גיל  `, alignment: 'right', rtl: true },
                            { text: `${unit.donor.bloodType} : דם סוג  `, alignment: 'right', rtl: true },
                            { text: `${unit.donor.donorId} : תורם מזהה  `, alignment: 'right', rtl: true },
                            { text: `${unit.donor.disease} : רקע מחלות  `, alignment: 'right', rtl: true },
                            { text: `${unit.donationDate.toLocaleDateString()} : תרומה תאריך  `, alignment: 'right', rtl: true },
                            { text: `${unit.expirationDate.toLocaleDateString()} : תפוגה תאריך  `, alignment: 'right', rtl: true },
                            { text: `${unit.status} : תרומה סטטוס  `, alignment: 'right', rtl: true },
                            { text: '------------------------------------------', alignment: 'center' }
                        ];
                    })
                ],                
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true
                    }
                },
                defaultStyle: {
                    font: 'Alef',
                    alignment: 'right',
                    rtl: true
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=full_donor_report.pdf');
            pdfDoc.pipe(res);
            pdfDoc.end();

        } else {
            res.status(400).send('פורמט לא נתמך. אנא בחר בפורמט PDF או Excel.');
        }
    } catch (error) {
        console.error('Error generating full donor report:', error);
        res.status(500).json({ message: 'Error generating report' });
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
