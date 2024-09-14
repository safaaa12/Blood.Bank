import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file for styling
import MetaDataDisplay from './MetaDataDisplay'; // Import the new MetaDataDisplay component
import DonorListDisplay from "./DonorListDisplay";

const HomePage = () => {
    const [userRole, setUserRole] = useState(''); // ניהול תפקיד המשתמש
    const navigate = useNavigate(); // To use for redirection if needed

    useEffect(() => {
        const userEmail = localStorage.getItem('email'); // קבלת האימייל מה-localStorage
        if (userEmail) {
            fetchUserRole(userEmail);
        } else {
            navigate('/login'); // הפניה לדף ההתחברות אם אין אימייל
        }
    }, [navigate]); // הוספת navigate כתלות

    const fetchUserRole = async (userEmail) => {
        const urlEncodedEmail = encodeURIComponent(userEmail);
        try {
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${urlEncodedEmail}`);
            const { role } = response.data;
            setUserRole(role); // עדכון תפקיד המשתמש ב-state
        } catch (error) {
            console.log('Error fetching user role:', error); // שגיאה בשרת
        }
    };

    const renderButtonsForRole = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <div className="button-container">
                        <NavLink to="/add-donation" className="page-button">הוסף תרומה</NavLink>
                        <NavLink to="/dispense-blood" className="page-button">ניפוק דם</NavLink>
                        <NavLink to="/emergency-dispense" className="page-button">ניפוק חירום</NavLink>
                        <MetaDataDisplay /> {/* תצוגת המטה-דאטה */}
                        <DonorListDisplay /> {/* תצוגת רשימת התורמים */}
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
        <div className="home-container">
            <h1>ברוכים הבאים למערכת ניהול תרומות דם</h1>
            {userRole && <p className="role-display">תפקיד: {userRole}</p>} {/* תצוגת תפקיד המשתמש */}
            {renderButtonsForRole()}
        </div>
    );
};

export default HomePage;
