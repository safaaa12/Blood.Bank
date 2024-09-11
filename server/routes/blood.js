const express = require('express');
const router = express.Router();
const Donor = require('../models/donor');
const authenticateToken = require('../middleware/authenticateToken');

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
    const { bloodType, donationDate, donorId, donorName } = req.body;

    // Check required fields
    if (!bloodType || !donationDate || !donorId || !donorName) {
        return res.status(400).send('יש למלא את כל השדות הנדרשים.');
    }

    try {
        const donor = new Donor({ bloodType, donationDate, donorId, donorName });
        await donor.save();
        res.status(201).send('תרומה נרשמה בהצלחה');
    } catch (error) {
        console.error(error);
        res.status(500).send('שגיאה ברישום התרומה');
    }
});

// Route for dispensing blood regularly
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
        console.error(error);
        res.status(500).send('שגיאה בניפוק הדם');
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

module.exports = router;
