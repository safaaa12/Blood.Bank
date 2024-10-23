import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BloodUnitListDisplay.css'; // קובץ CSS לעיצוב

const BloodUnitListDisplay = () => {
    const [bloodUnits, setBloodUnits] = useState([]); // ניהול רשימת יחידות הדם
    const [error, setError] = useState(null); // ניהול שגיאות
    const [showConfirm, setShowConfirm] = useState(false); // ניהול מצב חלון אישור
    const [selectedUnitId, setSelectedUnitId] = useState(null); // ניהול יחידת הדם שנבחרה למחיקה

    useEffect(() => {
        axios.get('http://localhost:3001/api/blood/units') // הנחה שיש לך נתיב מתאים ליחידות דם
            .then(response => {
                setBloodUnits(response.data); // שמירת יחידות הדם ב-state
                setError(null); // אין שגיאה
            })
            .catch(error => {
                console.error('Error fetching blood units:', error); // הדפסה בקונסול
                setError(error.message); // שמירת הודעת השגיאה ב-state
            });
    }, []);

    // פונקציה שתבדוק מה אפשר לעשות לפי הסטטוס של יחידת הדם
    const getUsageStatusMessage = (status) => {
        if (status === 'Rejected') {
            return 'לא ניתן להשתמש ביחידה זו - היא כבר בשימוש';
        } else if (status === 'Approved') {
            return 'יחידה זו אינה זמינה לשימוש - תוקפה הסתיים';
        } else if (status === 'Pending') {
            return 'יחידה זו זמינה לשימוש';
        }
        return 'סטטוס לא ידוע';
    };

    // פונקציה שמופעלת בלחיצה על כפתור מחיקה, מציגה את חלון האישור
    const handleDeleteClick = (unitId) => {
        setSelectedUnitId(unitId); // שמירת מזהה יחידת הדם למחיקה
        setShowConfirm(true); // הצגת חלון האישור
    };

    // פונקציה למחיקת יחידת דם (אחרי אישור)
    const handleDeleteConfirm = () => {
        axios.delete(`http://localhost:3001/api/blood/units/${selectedUnitId}`)
            .then(() => {
                setBloodUnits(prevUnits => prevUnits.filter(unit => unit._id !== selectedUnitId)); // עדכון הרשימה לאחר מחיקה
                setShowConfirm(false); // סגירת חלון האישור
                setSelectedUnitId(null); // איפוס היחידה שנבחרה
            })
            .catch(error => {
                console.error('Error deleting blood unit:', error);
                setError('שגיאה במחיקת יחידת דם');
                setShowConfirm(false); // סגירת חלון האישור במקרה של שגיאה
            });
    };

    // פונקציה לביטול מחיקה
    const handleDeleteCancel = () => {
        setShowConfirm(false); // סגירת חלון האישור
        setSelectedUnitId(null); // איפוס היחידה שנבחרה
    };

    return (
        <div className="blood-unit-list-container">
            <h2 className='blood-unit-list-container-title'><span style={{ marginRight: '10px' }}>🩸</span>רשימת יחידות דם</h2>
            {error ? ( // אם יש שגיאה, תוצג השגיאה על המסך
                <p style={{ color: 'red' }}>שגיאה: {error}</p>
            ) : bloodUnits.length > 0 ? ( // אם יש יחידות דם, נציג אותן בטבלה
                <>
                    <table className="blood-unit-table">
                        <thead>
                            <tr>
                                <th>שם תורם</th>
                                <th>סוג דם</th>
                                <th>תאריך תרומה</th>
                                <th>תאריך תפוגה</th>
                                <th>סטטוס</th>
                                <th>פעולה</th> {/* עמודה לפעולות */}
                            </tr>
                        </thead>
                        <tbody>
                            {bloodUnits.map((unit) => (
                                <tr key={unit._id}>
                                    <td>{unit.donor.donorName}</td> {/* assuming populated donor field */}
                                    <td>{unit.bloodType}</td>
                                    <td>{unit.donationDate ? new Date(unit.donationDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>{new Date(unit.expirationDate).toLocaleDateString()}</td>
                                    <td>{getUsageStatusMessage(unit.status)}</td> {/* הצגת מצב השימוש */}
                                    <td>
                                        <button onClick={() => handleDeleteClick(unit._id)}>מחק</button> {/* כפתור מחיקה */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {showConfirm && (
                        <div className="modal">
                            <div className="modal-content">
                                <p>האם אתה בטוח שברצונך למחוק את יחידת הדם הזו?</p>
                                <div className="modal-actions">
                                    <button onClick={handleDeleteConfirm}>כן</button>
                                    <button onClick={handleDeleteCancel}>לא</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p>לא נמצאו יחידות דם</p> // אם אין יחידות דם
            )}
        </div>
    );
};

export default BloodUnitListDisplay;
