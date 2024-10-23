import React from 'react';
import { NavLink } from 'react-router-dom';

const LogoutSuccessPage = () => {
    return (
        <div className="logout-success-container">
            <span style={{ fontSize: '100px', marginBottom: '20px' }}>👋</span> {/* אימוג'י התנתקות */}
            <h1>התנתקת בהצלחה!</h1>
            <p>תודה על השימוש במערכת ניהול תרומות הדם. נשמח לראותך שוב בקרוב.</p>
            <div className="auth-options">
                <NavLink to="/login" className="auth-link">התחבר שוב</NavLink>
                <NavLink to="/" className="auth-link">חזור לדף הבית</NavLink>
            </div>
        </div>
    );
};

export default LogoutSuccessPage;
