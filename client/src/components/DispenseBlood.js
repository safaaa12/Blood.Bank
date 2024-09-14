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
        try {
            const res = await axios.post('http://localhost:3001/api/blood/dispense', formData);
            if (res.data.alternativeType) {
                setAlternativeResponse(res.data);
            } else {
                setResponse(res.data);
            }
        } catch (error) {
            console.error(error);
            setError('שגיאה בניפוק הדם או אין מלאי זמין.');
        }
    };

    return (
        <div>
            <h2>ניפוק דם לשגרה</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>סוג דם מבוקש:</label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                        <option value="">בחר סוג דם</option>
                        {bloodTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>כמות מנות:</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} />
                </div>
                <button type="submit">נפק דם</button>
            </form>
            {response && (
                <div>
                    <h3>המלאי המבוקש זמין:</h3>
                    <p>כמות נותרת: {response.remainingAmount}</p>
                    <h4>פרטי תורמים:</h4>
                    <ul>
                        {response.donors.map(donor => (
                            <li key={donor._id}>
                                <p>שם: {donor.donorName}</p>
                                <p>מספר ת"ז: {donor.donorId}</p>
                                <p>תאריך תרומה: {new Date(donor.donationDate).toLocaleDateString()}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {alternativeResponse && (
                <div>
                    <h3>המלצה לסוג דם חלופי:</h3>
                    <p>הסוג המבוקש: {formData.bloodType} אינו זמין במלאי.</p>
                    <p>המלצה: {alternativeResponse.alternativeType}</p>
                    <p>כמות נותרת: {alternativeResponse.remainingAmount}</p>
                    <h3>פרטי תורמים חלופיים:</h3>
                    <div className="donors-container">
    <ul>
        {alternativeResponse.donors.map(donor => (
            <li key={donor._id} className="donor-item">
                <ul className="donor-details">
                    <li>שם: {donor.donorName}</li>
                    <li>מספר ת"ז: {donor.donorId}</li>
                    <li>תאריך תרומה: {new Date(donor.donationDate).toLocaleDateString()}</li>
                </ul>
            </li>
        ))}
    </ul>
</div>

                </div>
            )}
            {error && (
                <div>
                    <h3>{error}</h3>
                </div>
            )}
        </div>
    );
}

export default DispenseBlood;
