import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            console.log('User email from localStorage:', userEmail); // בדיקת המייל
            fetchUserRole(userEmail);
        } else {
            console.log('No email found in localStorage'); // מייל לא נמצא
        }
    }, []);
    
    const fetchUserRole = async (userEmail) => {
        const urlEncodedEmail = encodeURIComponent(userEmail);
        try {
            console.log('Fetching role for email:', userEmail); // בדיקת הכתובת
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${urlEncodedEmail}`);
            console.log('Response from server:', response.data); // בדיקת התגובה
            const { role } = response.data;
            console.log('Fetched user role:', role); // בדיקת התפקיד
            setUserRole(role); // הגדרת התפקיד ב-state
        } catch (error) {
            console.log('Error fetching user role:', error); // שגיאה בשרת
        }
    };
    

    const renderButtonsForRole = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <div className="button-container">
                        <NavLink to="/admin-management" className="page-button">ניהול מנהל</NavLink>
                        <NavLink to="/message-management" className="page-button">ניהול הודעות</NavLink>
                    </div>
                );
            case 'user':
                return (
                    <div className="button-container">
                        <NavLink to="/add-donation" className="page-button">הוסף תרומה</NavLink>
                        <NavLink to="/dispense-blood" className="page-button">ניפוק דם</NavLink>
                        <NavLink to="/emergency-dispense" className="page-button">ניפוק חירום</NavLink>
                    </div>
                );
            case 'student':
                return (
                    <div className="button-container">
                        <NavLink to="/research-data" className="page-button">נתוני מחקר</NavLink>
                    </div>
                );
            default:
                return <p>טוען...</p>;
        }
    };

    return (
        <div>
            <h1>ברוכים הבאים</h1>
            {renderButtonsForRole()}
        </div>
    );
};

export default HomePage;
