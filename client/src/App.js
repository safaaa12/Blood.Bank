import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import AddDonation from './components/AddDonation';
import DispenseBlood from './components/DispenseBlood';
import EmergencyDispense from './components/EmergencyDispense';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import './App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div className="app-container">
                <nav className="main-nav">
                    <div className="logo-container">
                        <img src='/bdrop.png' alt="Logo" className="logo" />
                    </div>
                    <ul className="nav-links">
                        {isLoggedIn ? (
                            <li>
                                <button onClick={handleLogout} className="btn logout-btn">
                                    <i className="fas fa-sign-out-alt"></i> התנתק
                                </button>
                            </li>
                        ) : (
                            <>
                                <NavLink to="/login" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}>  היכנס</NavLink>
                                <NavLink to="/signup" className={({ isActive }) => (isActive ? 'active-link' : 'nav-link')}> הרשמה</NavLink>
                            </>
                        )}
                    </ul>
                </nav>

                <main className="container">
                    <Routes>
                        <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
                        <Route path="/add-donation" element={isLoggedIn ? <AddDonation /> : <Navigate to="/login" />} />
                        <Route path="/dispense-blood" element={isLoggedIn ? <DispenseBlood /> : <Navigate to="/login" />} />
                        <Route path="/emergency-dispense" element={isLoggedIn ? <EmergencyDispense /> : <Navigate to="/login" />} />
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
