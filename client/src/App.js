import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import AddDonation from './components/AddDonation';
import DispenseBlood from './components/DispenseBlood';
import EmergencyDispense from './components/EmergencyDispense';
import HomePage from './components/HomePage'; // ייבוא הקומפוננטה החדשה
function App() {
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                    <li>
                            <NavLink to="/" title="עמוד הבית">
                                <img src='/bdrop.png' alt="Logo" className="logo" />
                            </NavLink>
                        </li>
                        {/* <li>
                            <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>בית</NavLink>
                        </li>
                      <li>
                            <NavLink to="/add-donation" className={({ isActive }) => isActive ? 'active-link' : ''}>הוסף תרומה</NavLink>
                        </li>
                        <li>
                            <NavLink to="/dispense-blood" className={({ isActive }) => isActive ? 'active-link' : ''}>ניפוק דם</NavLink>
                        </li>
                        <li>
                            <NavLink to="/emergency-dispense" className={({ isActive }) => isActive ? 'active-link' : ''}>ניפוק חירום</NavLink>
                        </li> */}
                    </ul>
                <h1>ברוכים הבאים למערכת ניהול בנק הדם</h1>
                </nav>

                <div className="container">
                    <Routes>
                        <Route path="/add-donation" element={<AddDonation />} />
                        <Route path="/dispense-blood" element={<DispenseBlood />} />
                        <Route path="/emergency-dispense" element={<EmergencyDispense />} />
                        <Route path="/" element={<HomePage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
