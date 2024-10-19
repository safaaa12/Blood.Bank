import React, { useState } from 'react';
import axios from 'axios';
import { FaExclamationTriangle } from 'react-icons/fa'; // Emergency icon

const EmergencyDispense = () => {
    const [message, setMessage] = useState('');
    const [remainingAmount, setRemainingAmount] = useState(null);
    const [amount, setAmount] = useState('');

    const handleDispense = async () => {
        if (!amount || parseInt(amount) <= 0) {
            setMessage('יש להזין כמות חוקית של מנות.');
            setRemainingAmount(null);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/blood/emergency-dispense', { amount: parseInt(amount) });
            console.log('Response from server:', response.data);

            setMessage(`הוצאו ${response.data.bloodUnits.length} מנות דם מסוג O-`);
            setRemainingAmount(response.data.remainingAmount);
        } catch (error) {
            console.error('Error from server:', error.response ? error.response.data : error.message);
            setMessage(error.response?.data || 'שגיאה: אין מספיק מנות דם מסוג O- במלאי');
            setRemainingAmount(null);
        }
    };

    return (
        <div className="emergencyDispensePage">
            <div className="emergencyDispense-container">
                <p className="emergencyDispense-title">
                    <FaExclamationTriangle /> ניפוק מנות דם במצב חירום
                </p>
                <p className="emergency-info">
                    במצב חירום, ניתן לנפק מנות דם מסוג O- באופן מיידי. סוג דם זה מתאים למגוון רחב של מקבלי תרומות, במיוחד כאשר סוג דם מתאים אחר אינו זמין.
                </p>
                <div className="form-group">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="בחר כמות מנות"
                        className="input-amount"
                        min="1" // כמות מינימלית
                    />
                </div>
                <button onClick={handleDispense} className="emergencyDispensePage-btn">הוצא מנות דם מסוג O-</button>
                {message && <p className="message">{message}</p>}
                {remainingAmount !== null && <p className="remaining-amount">כמות נותרת: {remainingAmount}</p>}
            </div>
        </div>
    );
};

export default EmergencyDispense;
