import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import AddDonation from './components/AddDonation';
import DispenseBlood from './components/DispenseBlood';
import EmergencyDispense from './components/EmergencyDispense';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import DonorListDisplay from './components/DonorListDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHeartCircleBolt, faUsers, faTint, faSignInAlt, faSignOutAlt, faUserPlus, faExclamationCircle, faClipboardCheck, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(''); 
    const [loadingRole, setLoadingRole] = useState(true); 

    const handleLogin = () => {
        setIsLoggedIn(true);
        const userEmail = localStorage.getItem('email');
        fetchUserRole(userEmail);
    };

    const handleLogout = () => {
        localStorage.removeItem('email');
        localStorage.removeItem('token'); // הסרה של האסימון ב-log out
        setIsLoggedIn(false);
        setUserRole(''); 
    };

    const fetchUserRole = async (userEmail) => {
        try {
            setLoadingRole(true);
            // תיקון הבעיה ב-URL עם תבנית המחרוזת
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${encodeURIComponent(userEmail)}`);
            const { role } = response.data;
            setUserRole(role); 
        } catch (error) {
            console.error('Error fetching user role:', error);
        } finally {
            setLoadingRole(false); 
        }
    };

    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            fetchUserRole(userEmail); 
        }
    }, [isLoggedIn]);

    return (
        <Router>
            <div className="app-container">
                <aside className="sidebar">
                    <ul className="nav-links">
                        {isLoggedIn ? (
                            <>
                                <li>
                                    <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'homepage')}>
                                        <FontAwesomeIcon icon={faHome} className="icon" /> דף הבית
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/add-donation" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                                        <FontAwesomeIcon icon={faUsers} className="icon" /> הוספת תרומה
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/dispense-blood" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                                        <FontAwesomeIcon icon={faTint} className="icon" /> ניפוק דם 
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/emergency-dispense" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                                        <FontAwesomeIcon icon={faExclamationCircle} className="icon" /> ניפוק דם במצב חירום
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/meta-data" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                                        <FontAwesomeIcon icon={faClipboardCheck} className="icon" /> נמסר
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/donor-list" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                                        <FontAwesomeIcon icon={faUserFriends} className="icon" /> משתמשים
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <li>
                                 <NavLink to="/" className={({ isActive }) => (isActive ? 'homepage active-link' : 'homepage')}>
                                        <FontAwesomeIcon icon={faHome} className="icon" /> דף הבית
                                  </NavLink>
                            </li>
                        )}
                    </ul>
                </aside>
                <header className="header">
                    <span className="system-name">
                        ברוך הבא למערכת ניהול בנק הדם
                        <FontAwesomeIcon icon={faHeartCircleBolt} style={{ marginRight: '8px', paddingLeft: '9px' }} />
                    </span>
                    <div className="auth-buttons">
                        {isLoggedIn ? (
                            <button className="logout-button" onClick={handleLogout}>
                                <FontAwesomeIcon icon={faSignOutAlt} />
                                התנתק
                            </button>
                        ) : (
                            <div className="loginandsignup">
                                <button onClick={() => window.location.href = '/login'}>
                                    <FontAwesomeIcon icon={faSignInAlt} style={{ marginRight: '8px', paddingLeft: '9px' }} /> התחבר
                                </button>
                                <button onClick={() => window.location.href = '/signup'}>
                                    <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '8px', paddingLeft: '9px' }} /> הרשמה
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                <main className="container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/add-donation" element={isLoggedIn ? <AddDonation /> : <Navigate to="/login" />} />
                        <Route path="/dispense-blood" element={isLoggedIn ? <DispenseBlood /> : <Navigate to="/login" />} />
                        <Route path="/emergency-dispense" element={isLoggedIn ? <EmergencyDispense /> : <Navigate to="/login" />} />
                        <Route path="/donor-list" element={isLoggedIn ? <DonorListDisplay /> : <Navigate to="/login" />} />
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route path="/signup" element={<SignUpPage />} />
                    </Routes>
                </main>

                {/* Footer Section */}
                <footer className="footer">
                    <p>© 2024 Blood Donation Management. All rights reserved</p>
                    <p>
                        <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
                    </p>
                </footer>
            </div>
        </Router>
    );
}

export default App;
