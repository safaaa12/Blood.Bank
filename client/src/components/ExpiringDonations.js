import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExpiringDonations = () => {
    const [expiringDonations, setExpiringDonations] = useState([]);

    useEffect(() => {
        const fetchExpiringDonations = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/blood/notify-expiring-donations');
                setExpiringDonations(response.data.soonToExpireDonations);
            } catch (error) {
                console.error('שגיאה בקבלת התרומות שתפוגתן קרבה:', error);
            }
        };

        fetchExpiringDonations();
    }, []);

    return (
        <div>
            <h2>תרומות דם שתוקפן עומד לפוג</h2>
            {expiringDonations.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>שם התורם</th>
                            <th>סוג דם</th>
                            <th>תאריך תפוגה</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expiringDonations.map((donation) => (
                            <tr key={donation._id}>
                                <td>{donation.donorName}</td>
                                <td>{donation.bloodType}</td>
                                <td>{new Date(donation.expirationDate).toLocaleDateString('he-IL')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>אין תרומות שתוקפן קרוב</p>
            )}
        </div>
    );
};

export default ExpiringDonations;