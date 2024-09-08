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
                    <ul>
                        <li>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>דף הבית</NavLink>
                        </li>
                        <li>
                            <NavLink to="/add-donation" className={({ isActive }) => isActive ? 'active-link' : ''}>הוסף תרומה</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dispense-blood" className={({ isActive }) => isActive ? 'active-link' : ''}>ניפוק דם</NavLink>
                        </li>
                        <li>
                            <NavLink to="/emergency-dispense" className={({ isActive }) => isActive ? 'active-link' : ''}>ניפוק חירום</NavLink>
                        </li>
                        {isLoggedIn ? (
                            <li>
                                <button onClick={handleLogout} className="btn">התנתק</button>
                            </li>
                        ) : (
                            <>
                                <li>
                                    <NavLink to="/login" className={({ isActive }) => isActive ? 'active-link' : ''}>התחברות</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/signup" className={({ isActive }) => isActive ? 'active-link' : ''}>הרשמה</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                    <img src='/bdrop.png' alt="Logo" className="logo" />
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
            </div>
        </Router>
    );
}

export default App;
