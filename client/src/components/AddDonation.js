import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

function AddDonation() {
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
                    alert(`התורם ${response.data.donorName} כבר קיים במערכת עם תעודת זהות ${formData.donorId}.
                        לא ניתן לשנות פרטים אישיים כמו שם, גיל, ומחלות.
                        ניתן להוסיף תרומות דם חדשות.
                        אם הזנתם את התורם בטעות ורוצים להזין תורם אחר, אנא לחצו על כפתור האיפוס למטה כדי לאפס את השדות ולהזין פרטים חדשים.`);
                        
                } else {
                    setIsFieldsDisabled(false);
                    alert('התורם לא נמצא במערכת, ניתן להזין פרטים חדשים.');
                }
            } catch (error) {
                setIsFieldsDisabled(false);
                console.error('Error checking donor:', error);
                alert('התורם לא נמצא במערכת, ניתן להזין פרטים חדשים.');
            }
        } else {
            alert('יש להזין תעודת זהות לפני ביצוע הבדיקה.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { bloodType, donationDate, donorId, donorName, age, units } = formData;
        if (!bloodType || !donationDate || !donorId || !donorName || !age || !units || isNaN(units)) {
            alert('יש לוודא שכל השדות מלאים ותקינים.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            alert('לא נמצא טוקן, אנא התחבר מחדש.');
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
                alert('🟢התרומה נרשמה בהצלחה👍');
                resetForm();
                return;
            } else {
                alert('רישום התרומה נכשל, נא לנסות שוב.');
                return;
            }

        } catch (error) {
            console.error('Error submitting donation:', error);
            if (error.response && error.response.status === 400) {
                alert('בקשה לא תקינה, יש לבדוק את הנתונים שהוזנו.');
            } else if (error.response && error.response.status === 401) {
                alert('טוקן לא תקין או פג תוקף, נא התחבר מחדש.');
            } else if (error.response && error.response.status === 500) {
                alert('שגיאה בשרת, נא לנסות שוב מאוחר יותר.');
            } else {
                alert('שגיאה ברישום התרומה, נא לבדוק את החיבור ולנסות שוב.');
            }
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
    };

    return (
        <div className="addDonationPage">
            <div className="addDonation-container">
                <form onSubmit={handleSubmit}>
                    <h2 className="addDonation-title">הוספת תרומה</h2>
                    <small className="field-explanation">
                        אנא הזן את מספר תעודת הזהות של התורם ולחץ על כפתור הבדיקה כדי לבדוק אם התורם קיים במערכת.
                    </small>
                    <div className="btn-reset" onClick={resetForm}style={{ alignItems: 'center', 
                            justifyContent: 'center', padding: '5px 1px', borderRadius: '5px',
                             cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'}}>🔄אפס שדות</div>
                             
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
                    <div className="form-buttons">
                        <button type="submit" className="btn">הוסף תרומה</button>
                    </div>
                    <div className="message-container">

                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDonation;