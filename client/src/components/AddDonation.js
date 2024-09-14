import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // ייבוא האייקונים

function AddDonation() {
    const [formData, setFormData] = useState({
        bloodType: '',
        donationDate: '',
        donorId: '',
        donorName: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // success or error

    useEffect(() => {
        // הגדרת תאריך ברירת מחדל לזמן הנוכחי
        const today = new Date().toISOString().split('T')[0];
        setFormData((prevFormData) => ({
            ...prevFormData,
            donationDate: today
        }));
    }, []);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // בדיקת שדות חובה בטופס
        if (!formData.bloodType || !formData.donationDate || !formData.donorId || !formData.donorName) {
            setMessage('יש למלא את כל השדות הנדרשים');
            setMessageType('error');
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/blood/donate', formData);
            setMessage('תרומה נרשמה בהצלחה');
            setMessageType('success');
            setFormData({
                bloodType: '',
                donationDate: new Date().toISOString().split('T')[0],
                donorId: '',
                donorName: ''
            });
        } catch (error) {
            console.error(error);
            const errorMessage = error.response && error.response.data ? error.response.data : 'שגיאה ברישום התרומה';
            setMessage(errorMessage);
            setMessageType('error');
        }
    };


    return (
        <div>
            <h2>הוספת תרומה</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>סוג דם:</label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                        <option value="">בחר סוג דם</option>
                        {bloodTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>תאריך התרומה:</label>
                    <input type="date" name="donationDate" value={formData.donationDate} onChange={handleChange} />
                </div>
                <div>
                    <label>מספר ת"ז של התורם:</label>
                    <input type="text" name="donorId" value={formData.donorId} onChange={handleChange} />
                </div>
                <div>
                    <label>שם מלא של התורם:</label>
                    <input type="text" name="donorName" value={formData.donorName} onChange={handleChange} />
                </div>
                <button type="submit">הוסף תרומה</button>
                {message && (
                    <p className={`message ${messageType}`}>
                       {messageType === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />} &nbsp; {message}
                    </p>
                )}
            </form>
        </div>
    );
}

export default AddDonation;
