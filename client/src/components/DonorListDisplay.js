import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DonorListDisplay.css'; // קובץ CSS לעיצוב

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
        <div className="donor-list-container">
            <h2 className='donor-list-container-title'>רשימת התורמים במערכת </h2>
            {error ? ( // אם יש שגיאה, תוצג השגיאה על המסך
                <p style={{ color: 'red' }}>שגיאה: {error}</p>
            ) : donors.length > 0 ? ( // אם יש תורמים, נציג אותם בטבלה
                <table className="donor-table">
                    <thead>
                        <tr>
                            <th>שם תורם</th>
                            <th>מחלה</th>
                            <th>גיל</th>
                            <th>סוג דם</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donors.map((donor) => (
                            <tr key={donor._id}>
                                <td>{donor.donorName}</td>
                                <td>{donor.disease || 'None'}</td>
                                <td>{donor.age}</td>
                                <td>{donor.bloodType || 'None'}</td>
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

