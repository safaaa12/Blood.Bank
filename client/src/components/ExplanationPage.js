import React from 'react';
import { NavLink } from 'react-router-dom';

const ExplanationPage = () => {
    return (
        <div className="explanation-container">
            <img 
            style={{ width: '450px', height: '370px' }}
                src="/bdrop.png" // נתיב הלוגו
                alt="Blood Donation Logo" 
                className="logo" // מחלקת עיצוב
            />
            <h1>ברוכים הבאים למערכת ניהול תרומות דם</h1>
            <p>מערכת זו מאפשרת ניהול תורמי דם, ניפוק דם, בקשות חירום, והצגת נתוני מחקר.</p>
            <p>על מנת להשתמש בכלי המערכת, אנא התחבר או הירשם למערכת.</p>
            <div className="auth-buttons">
                <NavLink to="/login" className="auth-link">התחבר</NavLink>
                <NavLink to="/signup" className="auth-link">הירשם</NavLink>
            </div>
        </div>
    );
};

export default ExplanationPage;