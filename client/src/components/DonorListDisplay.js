import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DonorListDisplay = () => {
    const [donors, setDonors] = useState([]); // ניהול רשימת התורמים
    const [error, setError] = useState(null); // ניהול שגיאות

    useEffect(() => {
        axios.get('http://localhost:3001/api/blood/donors')
            .then(response => {
                setDonors(response.data); // שמירת התורמים ב-state
                setError(null); // אין שגיאה
            })
            .catch(error => {
                console.error('Error fetching donors:', error); // הדפסה בקונסול
                setError(error.message); // שמירת הודעת השגיאה ב-state
            });
    }, []);

    return (
        <div>
            <h2>רשימת תורמים</h2>
            {error ? ( // אם יש שגיאה, תוצג השגיאה על המסך
                <p style={{ color: 'red' }}>שגיאה: {error}</p>
            ) : donors.length > 0 ? ( // אם יש תורמים, נציג אותם בטבלה
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid black', padding: '8px' }}>שם התורם</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>סוג דם</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>תאריך תרומה</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>מזהה תורם</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donors.map((donor) => (
                            <tr key={donor._id}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{donor.donorName}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{donor.bloodType}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(donor.donationDate).toLocaleDateString('he-IL')}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{donor.donorId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>לא נמצאו תורמים</p> // אם אין תורמים
            )}
        </div>
    );
};

export default DonorListDisplay;
