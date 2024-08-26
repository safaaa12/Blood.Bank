import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import AddDonation from './components/AddDonation';
import DispenseBlood from './components/DispenseBlood';
import EmergencyDispense from './components/EmergencyDispense';
import HomePage from './components/HomePage';
import "./App.css";

function App() {
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
                    </ul> 
                    <img src='/bdrop.png' alt="Logo" className="logo" />
                </nav>

                <main className="container">
                    <Routes>
                        <Route path="/add-donation" element={<AddDonation />} />
                        <Route path="/dispense-blood" element={<DispenseBlood />} />
                        <Route path="/emergency-dispense" element={<EmergencyDispense />} />
                        <Route path="/" element={<HomePage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
