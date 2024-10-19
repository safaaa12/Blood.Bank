import React, { useState } from 'react';
import axios from 'axios';

function DispenseBlood() {
    const [formData, setFormData] = useState({
        bloodType: '',
        amount: 1
    });
    const [response, setResponse] = useState(null);
    const [alternativeResponse, setAlternativeResponse] = useState(null);
    const [error, setError] = useState(null);
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponse(null);
        setAlternativeResponse(null);
        setError(null);
    
        // ולידציה לסוג דם נבחר
        if (!formData.bloodType) {
            setError('יש לבחור סוג דם.');
            return;
        }
    
        // ולידציה לכמות המנות
        if (formData.amount <= 0) {
            setError('כמות חייבת להיות גדולה מאפס.');
            return;
        }
    
        try {
            console.log("נשלחת בקשה לניפוק הדם עם הנתונים:", formData); // לוג לבדיקת הנתונים הנשלחים
            const res = await axios.post('http://localhost:3001/api/blood/dispense', formData);
            console.log("התקבלה תגובה מהשרת:", res.data);
        
            // בדיקה האם התקבל סוג דם חלופי
            if (res.data.alternativeType) {
                setAlternativeResponse(res.data);
            } else {
                setResponse(res.data);
            }
        } catch (error) {
            console.error("שגיאה במהלך ניפוק הדם:", error); // הצגת הודעת השגיאה
            if (error.response) {
                console.error("שגיאה מהשרת:", error.response.data); // בדיקת שגיאה שהתקבלה מהשרת
                setError(error.response.data); // הצגת שגיאה מהשרת למשתמש
            } else {
                setError('שגיאה בניפוק הדם או אין מלאי זמין');
            }
        }
    };
    
    return (
        <div className="dispenseBloodPage">
            <div className="dispenseBlood-container">
                <form onSubmit={handleSubmit}>
                    <h2 className="dispenseBlood-title">ניפוק דם</h2>
                    <div className="form-group">
                        <label>סוג דם מבוקש:</label>
                        <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                            <option value="">בחר סוג דם</option>
                            {bloodTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>כמות מנות:</label>
                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
                    </div>
                    <button type="submit" className="btn">נפק דם</button>
                    
                    {/* הצגת הודעות שגיאה */}
                    {error && (
                        <div className="message error">
                            {error}
                        </div>
                    )}
                </form>

                {/* הצגת תוצאות הניפוק אם הצליח */}
                {response && (
                    <div>
                        <h3>המלאי המבוקש זמין:</h3>
                        <p>כמות נותרת: {response.remainingAmount}</p>
                        <h4>פרטי תורמים:</h4>
                        <ul>
                            {response.bloodUnits.map(unit => (
                                <li key={unit._id}>
                                    <p>תאריך תרומה: {new Date(unit.donationDate).toLocaleDateString()}</p>
                                    <p>תאריך תפוגה: {new Date(unit.expirationDate).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* הצגת תוצאות אם הוצע סוג דם חלופי */}
                {alternativeResponse && (
                    <div>
                        <h3>המלצה לסוג דם חלופי:</h3>
                        <p>הסוג המבוקש: {formData.bloodType} אינו זמין במלאי.</p>
                        <p>המלצה: {alternativeResponse.alternativeType}</p>
                        <p>כמות נותרת: {alternativeResponse.remainingAmount}</p>
                        <h4>פרטי תורמים חלופיים:</h4>
                        <ul>
                            {alternativeResponse.bloodUnits.map(unit => (
                                <li key={unit._id}>
                                    <p>תאריך תרומה: {new Date(unit.donationDate).toLocaleDateString()}</p>
                                    <p>תאריך תפוגה: {new Date(unit.expirationDate).toLocaleDateString()}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DispenseBlood;
