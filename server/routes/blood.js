const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const bloodCompatibility = require('../utils/bloodCompatibility'); // טבלת התאמה לסוגי דם

// מסלול להוספת תרומת דם - מורשה רק ליוזר
router.post('/add-donation', async (req, res) => {
    const { bloodType, donationDate, donorId, donorName } = req.body;

    if (!bloodType || !donationDate || !donorId || !donorName) {
        return res.status(400).send('יש למלא את כל השדות הנדרשים.');
    }

    try {
        const donor = new Donor({ bloodType, donationDate, donorId, donorName });
        await donor.save();
        res.status(201).send('תרומה נרשמה בהצלחה');
    } catch (error) {
        res.status(500).send('שגיאה ברישום התרומה');
    }
});

// מסלול לניפוק דם לשגרה - מורשה ליוזר
router.post('/dispense', async (req, res) => {
    const { bloodType, amount } = req.body;
    try {
        const donors = await Donor.find({ bloodType }).limit(amount);
        const availableAmount = await Donor.countDocuments({ bloodType });

        if (donors.length >= amount) {
            const donorIds = donors.map(donor => donor._id);
            await Donor.deleteMany({ _id: { $in: donorIds } });
            return res.send({
                message: 'המלאי המבוקש זמין',
                donors,
                remainingAmount: availableAmount - amount
            });
        } else {
            const alternativeTypes = bloodCompatibility[bloodType];
            for (let type of alternativeTypes) {
                const alternativeDonors = await Donor.find({ bloodType: type }).limit(amount);
                const alternativeAvailableAmount = await Donor.countDocuments({ bloodType: type });
                if (alternativeDonors.length >= amount) {
                    const donorIds = alternativeDonors.map(donor => donor._id);
                    await Donor.deleteMany({ _id: { $in: donorIds } });
                    return res.send({
                        message: 'המלאי המבוקש אזל, מצאנו סוג דם חלופי זמין',
                        alternativeType: type,
                        donors: alternativeDonors,
                        remainingAmount: alternativeAvailableAmount - amount
                    });
                }
            }
            return res.status(400).send('מלאי הדם המבוקש אזל, ואין סוג דם חלופי זמין במלאי.');
        }
    } catch (error) {
        res.status(500).send('שגיאה בניפוק הדם');
    }
});

module.exports = router;
