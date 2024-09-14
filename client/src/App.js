import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import AddDonation from './components/AddDonation';
import DispenseBlood from './components/DispenseBlood';
import EmergencyDispense from './components/EmergencyDispense';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ResearchDataPage from './components/ResearchDataPage';
import MetaDataDisplay from './components/MetaDataDisplay'; // Import MetaDataDisplay
import DonorListDisplay from './components/DonorListDisplay';
import axios from 'axios';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(''); // ניהול תפקיד המשתמש

    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            fetchUserRole(userEmail);
        }
    }, []);

    const fetchUserRole = async (userEmail) => {
        const urlEncodedEmail = encodeURIComponent(userEmail);
        try {
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${urlEncodedEmail}`);
            const { role } = response.data;
            setUserRole(role); // שמירת תפקיד המשתמש ב-state
        } catch (error) {
            console.log('Error fetching user role:', error);
        }
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    // ניווט הכפתורים לפי תפקיד המשתמש
    const renderNavLinks = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <>
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>עמוד הבית</NavLink>
                        <NavLink to="/add-donation" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>הוסף תרומה</NavLink>
                        <NavLink to="/dispense-blood" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>ניפוק דם</NavLink>
                        <NavLink to="/emergency-dispense" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>ניפוק חירום</NavLink>
                        <NavLink to="/meta-data" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>מטה-דאטה</NavLink>
                        <NavLink to="/DonorListDisplay" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>רשימת תורמים</NavLink>
                    </>
                );
            case 'user':
                return (
                    <>
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>עמוד הבית</NavLink>
                        <NavLink to="/add-donation" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>הוסף תרומה</NavLink>
                        <NavLink to="/dispense-blood" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>ניפוק דם</NavLink>
                        <NavLink to="/emergency-dispense" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>ניפוק חירום</NavLink>
                    </>
                );
            case 'student':
                return (
                    <>
                        <NavLink to="/research-data" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>נתוני מחקר</NavLink>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Router>
            <div className="app-container">
                <nav className="main-nav">
                    <ul className="nav-links">
                        {isLoggedIn ? (
                            <>
                                {renderNavLinks()}
                                <NavLink onClick={handleLogout} className="nav-link">התנתק</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>היכנס</NavLink>
                                <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>הרשמה</NavLink>
                            </>
                        )}
                    </ul>
                    <div className="logo-container"><NavLink to="/">
                     <img src='/bdrop.png' alt="Logo" className="logo" /> </NavLink></div>
                </nav>
                
                <main className="container">
                    <Routes>
                    <Route path="/research-data" element={<ResearchDataPage/>} />

                        <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
                        <Route path="/add-donation" element={isLoggedIn ? <AddDonation /> : <Navigate to="/login" />} />
                        <Route path="/dispense-blood" element={isLoggedIn ? <DispenseBlood /> : <Navigate to="/login" />} />
                        <Route path="/emergency-dispense" element={isLoggedIn ? <EmergencyDispense /> : <Navigate to="/login" />} />
                        <Route path="/meta-data" element={isLoggedIn ? <MetaDataDisplay /> : <Navigate to="/login" />} /> {/* MetaDataDisplay Route */}
                        <Route path="/DonorListDisplay" element={isLoggedIn ? <DonorListDisplay /> : <Navigate to="/login" />} /> {/* MetaDataDisplay Route */}
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
