import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle, FaSearch } from 'react-icons/fa';

function AddDonation() {
    const [formData, setFormData] = useState({
        bloodType: '',
        donationDate: '',
        donorId: '',
        donorName: '',
        age: '',
        disease: '',
        units: ''
    });

    const [message, setMessage] = useState('');
    const [message2, setMessage2] = useState('');
    const [messageType, setMessageType] = useState('');
    const [messageType2, setMessageType2] = useState('');
    const [isDonorExisting, setIsDonorExisting] = useState(false);
    const [isFieldsDisabled, setIsFieldsDisabled] = useState(true); // שדות מושבתים כברירת מחדל, פרט לשדה ת"ז

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
                    // התורם קיים - נוודא שסוג הדם נשמר ונעדכן את השדות האחרים
                    setFormData({
                        ...formData,
                        donorName: response.data.donorName,
                        age: response.data.age,
                        disease: response.data.disease,
                        bloodType: response.data.bloodType || formData.bloodType // נעדכן את סוג הדם מהשרת, או נשמור את מה שכבר הוזן
                    });
                    setIsDonorExisting(true);
                    setIsFieldsDisabled(true); // השבתת השדות
                    setMessage2('התורם כבר קיים במערכת');
                    setMessageType2('success');
                } else {
                    // התורם לא נמצא - אפשרות להזין כל הנתונים
                    setIsDonorExisting(false);
                    setIsFieldsDisabled(false); // הפעלת השדות להזנה
                    setMessage2('התורם לא נמצא במערכת, ניתן להזין פרטים');
                    setMessageType2('error');
                }
            } catch (error) {
                setIsDonorExisting(false);
                setIsFieldsDisabled(false); // הפעלת השדות להזנה
                setMessage2('התורם לא נמצא במערכת, ניתן להזין פרטים');
                setMessageType2('error');
            }
        } else {
            setMessage2('יש להזין תעודת זהות לפני בדיקה');
            setMessageType2('error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { bloodType, donationDate, donorId, donorName, age, units } = formData;

        if (!bloodType || !donationDate || !donorId || !donorName || !age || !units) {
            setMessage('יש למלא את כל השדות הנדרשים');
            setMessageType('error');
            return;
        }

        if (parseInt(units) <= 0) {
            setMessage('מספר היחידות חייב להיות גדול מאפס');
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
                donorName: '',
                age: '',
                disease: '',
                units: ''
            });
            setIsDonorExisting(false);
            setIsFieldsDisabled(true); // חזרה למצב השבתת שדות
        } catch (error) {
            const errorMessage = error.response && error.response.data ? error.response.data : 'שגיאה ברישום התרומה';
            setMessage(errorMessage);
            setMessageType('error');
        }
    };

    return (
        <div className="addDonationPage">
            <div className="addDonation-container">
                <form onSubmit={handleSubmit}>
                    <h2 className="addDonation-title">הוספת תרומה</h2>
                    <div className="form-group">
                        <label>מספר ת"ז של התורם:</label>
                        <input
                            type="text"
                            name="donorId"
                            value={formData.donorId}
                            onChange={handleChange}
                        />
                        <span type="button" onClick={handleCheckDonor} className="btn-icon"><FaSearch /></span>
                        <div className="message-container">
                            <p className={`message ${messageType2}`}>
                                {messageType2 === 'success' && <FaCheckCircle />}
                                {messageType2 === 'error' && <FaExclamationCircle />}
                                &nbsp; {message2}
                            </p>
                        </div>
                    </div>
                    
                    {/* הצגת כל השדות כל הזמן */}
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

                    <button type="submit" className="btn">הוסף תרומה</button>
                    <div className="message-container">
                        <p className={`message ${messageType}`}>
                            {messageType === 'success' && <FaCheckCircle />}
                            {messageType === 'error' && <FaExclamationCircle />}
                            &nbsp; {message}
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDonation;
