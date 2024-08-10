// src/components/EmergencyDispense.js
import React, { useState } from 'react';
import axios from 'axios';

const EmergencyDispense = () => {
    const [message, setMessage] = useState('');
    const [remainingAmount, setRemainingAmount] = useState(null);
    const [amount, setAmount] = useState('');

    const handleDispense = async () => {
        try {
            const response = await axios.post('http://localhost:3001/api/emergency-dispense', { amount });
            console.log('Response from server:', response.data); // הודעת לוג למעקב

            setMessage(`הוצאו ${response.data.donors.length} מנות דם מסוג O-`);
            setRemainingAmount(response.data.remainingAmount);
        } catch (error) {
            console.error('Error from server:', error.response ? error.response.data : error.message); // הודעת לוג למעקב

            setMessage('שגיאה: אין מספיק מנות דם מסוג O- במלאי');
            setRemainingAmount(null);
        }
    };

    return (
        <div>
            <h2>ניפוק מנות דם במצב חירום</h2>
            <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="בחר כמות מנות" 
            />
            <button onClick={handleDispense}>הוצא מנות דם מסוג O-</button>
            {message && <p>{message}</p>}
            {remainingAmount !== null && <p>כמות נותרת: {remainingAmount}</p>}
        </div>
    );
};

export default EmergencyDispense;
