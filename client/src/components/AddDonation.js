import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function AddDonation() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [message2, setMessage2] = useState('');
    const [messageType2, setMessageType2] = useState('');
    const [isFieldsDisabled, setIsFieldsDisabled] = useState(true);
    const [formData, setFormData] = useState({
        bloodType: '',
        donationDate: '',
        donorId: '',
        donorName: '',
        age: '',
        disease: '',
        units: ''
    });

    useEffect(() => {
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

    const handleCheckDonor = async () => {
        if (formData.donorId) {
            try {
                const response = await axios.get(`http://localhost:3001/api/blood/donors/${formData.donorId}`);
                if (response.data) {
                    setFormData({
                        ...formData,
                        donorName: response.data.donorName,
                        age: response.data.age,
                        disease: response.data.disease,
                        bloodType: response.data.bloodType || formData.bloodType
                    });
                    setIsFieldsDisabled(true);
                    setMessage('התורם כבר קיים במערכת');
                    setMessageType('success');
                } else {
                    setIsFieldsDisabled(false);
                    setMessage('התורם לא נמצא במערכת, ניתן להזין פרטים');
                    setMessageType('error');
                }
            } catch (error) {
                setIsFieldsDisabled(false);
                setMessage('שגיאה בבדיקה: התורם לא נמצא במערכת');
                setMessageType('error');
            }
        } else {
            setMessage('יש להזין תעודת זהות לפני בדיקה');
            setMessageType('error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { bloodType, donationDate, donorId, donorName, age, units } = formData;
        if (!bloodType || !donationDate || !donorId || !donorName || !age || !units || isNaN(units)) {
            setMessage2('יש לוודא שכל השדות מלאים ותקינים');
            setMessageType2('error');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage2('לא נמצא טוקן, אנא התחבר מחדש.');
            setMessageType2('error');
            return;
        }
        try {
            // שליחת הבקשה עם ה-token בכותרת Authorization
            const response = await axios.post('http://localhost:3001/api/blood/donate', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200 || response.status === 201) { // כולל גם סטטוס 201
                setMessage2('תרומה נרשמה בהצלחה');
                setMessageType2('success');
                return;
            } else {
                setMessage2('רישום התרומה נכשל, נסה שוב.');
                setMessageType2('error');
                return;
            }

            resetForm();
        } catch (error) {
            const errorMessage = error.response && error.response.data ? error.response.data : 'שגיאה ברישום התרומה';
            setMessage2(errorMessage);
            setMessageType2('error');
        }
    };
    
    const resetForm = () => {
        setFormData({
            bloodType: '',
            donationDate: new Date().toISOString().split('T')[0],
            donorId: '',
            donorName: '',
            age: '',
            disease: '',
            units: ''
        });
        setIsFieldsDisabled(true);
        setMessage('');
        setMessage2('');
    };

    return (
        <div className="addDonationPage">
            <div className="addDonation-container">
                <form onSubmit={handleSubmit}>
                    <h2 className="addDonation-title">הוספת תרומה</h2>
                    <small className="field-explanation">
                        אנא הזן את מספר תעודת הזהות של התורם ולחץ על כפתור הבדיקה כדי לבדוק אם התורם קיים במערכת.
                    </small>
                    <div className="form-group">
                        <label>מספר ת"ז של התורם:</label>
                        <input type="text" name="donorId" value={formData.donorId} onChange={handleChange} />
                        <div className="btn-check" onClick={handleCheckDonor}style={{ alignItems: 'center', 
                            justifyContent: 'center', padding: '10px 15px', borderRadius: '5px',
                             cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'}}>🔍 בדוק</div>
                    </div>

                    <div className="form-group">
                        <label>סוג דם:</label>
                        <select name="bloodType" value={formData.bloodType} onChange={handleChange} disabled={isFieldsDisabled}>
                            <option value="">בחר סוג דם</option>
                            {bloodTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>תאריך התרומה:</label>
                        <input type="date" name="donationDate" value={formData.donationDate} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>שם מלא של התורם:</label>
                        <input type="text" name="donorName" value={formData.donorName} onChange={handleChange} disabled={isFieldsDisabled} />
                    </div>
                    <div className="form-group">
                        <label>גיל:</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} disabled={isFieldsDisabled} />
                    </div>
                    <div className="form-group">
                        <label>מחלה:</label>
                        <input type="text" name="disease" value={formData.disease} onChange={handleChange} disabled={isFieldsDisabled} />
                    </div>
                    <div className="form-group">
                        <label>מספר יחידות דם:</label>
                        <input type="number" name="units" value={formData.units} onChange={handleChange} />
                    </div>
                    <div className="btn-reset" onClick={resetForm}>🔄אפס שדות</div>
                    <div className="form-buttons">
                        <button type="submit" className="btn">הוסף תרומה</button>
                    </div>
                    <div className="message-container">
                    {message && (
        <p className={`message ${messageType}`}>
            {messageType === 'success' && <FaCheckCircle />}
            {messageType === 'error' && <FaExclamationCircle />}
            &nbsp; {message}
        </p>
    )}
    
    {message2 && (
        <p className={`message ${messageType2}`}>
            {messageType2 === 'success' && <FaCheckCircle />}
            {messageType2 === 'error' && <FaExclamationCircle />}
            &nbsp; {message2}
        </p>
    )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDonation;
