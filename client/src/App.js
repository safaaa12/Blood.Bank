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
import ResearchDataPage from './components/ResearchDataPage';
import MetaDataDisplay from './components/MetaDataDisplay'; 
import LogoutSuccessPage from './components/LogoutSuccessPage'; // Import LogoutSuccessPage
import ExplanationPage from './components/ExplanationPage'; // Import ExplanationPage
import BloodUnitListDisplay from "./components/BloodUnitListDisplay";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faPlusCircle, faHandHoldingHeart, faAmbulance, faChartPie, faClipboardList, faTint, faSignInAlt, faSignOutAlt, faUserPlus} from '@fortawesome/free-solid-svg-icons';
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
        localStorage.removeItem('token'); // Clear token on logout
        setIsLoggedIn(false);
        setUserRole('');
    };

    const fetchUserRole = async (userEmail) => {
        try {
            setLoadingRole(true);
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
                {(userRole === 'admin' || userRole === 'user') && (
                    <li>
                        <NavLink to="/add-donation" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faPlusCircle} className="icon" /> הוספת תרומה
                        </NavLink>
                    </li>
                )}
                {(userRole === 'admin' || userRole === 'user') && (
                    <li>
                        <NavLink to="/dispense-blood" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faHandHoldingHeart} className="icon" /> ניפוק דם 
                        </NavLink>
                    </li>
                )}
                {(userRole === 'admin' || userRole === 'user') && (
                    <li>
                        <NavLink to="/emergency-dispense" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faAmbulance} className="icon" /> ניפוק דם במצב חירום
                        </NavLink>
                    </li>
                )}
                {(userRole === 'admin' || userRole === 'student') && (
                    <li>
                        <NavLink to="/research-data" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faChartPie} className="icon" /> סטטיסטיקות סוגי דם
                        </NavLink>
                    </li>
                )}
                {userRole === 'admin' && (
                    <li>
                        <NavLink to="/meta-data" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faClipboardList} className="icon" /> נמסר
                        </NavLink>
                    </li>
                )}
                {userRole === 'admin' && (
                    <li>
                        <NavLink to="/donor-list" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faUserPlus} className="icon" /> רשימת התורמים  
                        </NavLink>
                    </li>
                )}
                {userRole === 'admin' && (
                    <li>
                        <NavLink to="/BloodUnitListDisplay" className={({ isActive }) => (isActive ? 'nav-link active-link' : 'nav-link')}>
                            <FontAwesomeIcon icon={faTint} className="icon" /> רשימת יחידות הדם
                        </NavLink>
                    </li>
                )}
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
                        <img 
                        style={{ width: '70px', height: '50px', marginTop: '-18px',marginRight: '1px' }} // הוספת ריווח בין הלוגו לטקסט
                        src="/bdrop.png" // נתיב הלוגו
                        alt="Blood Donation Logo" 
                        className="logo"
                         />
                    </span>
                    <div className="auth-buttons">
                        {isLoggedIn ? (
                            <NavLink to="/logout-success" onClick={handleLogout}>
                                <button className="logout-button">
                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                    התנתק
                                </button>
                            </NavLink>
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
                        <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/explanation" />} />
                        <Route path="/add-donation" element={isLoggedIn ? <AddDonation /> : <Navigate to="/login" />} />
                        <Route path="/dispense-blood" element={isLoggedIn ? <DispenseBlood /> : <Navigate to="/login" />} />
                        <Route path="/emergency-dispense" element={isLoggedIn ? <EmergencyDispense /> : <Navigate to="/login" />} />
                        <Route path="/donor-list" element={isLoggedIn ? <DonorListDisplay /> : <Navigate to="/login" />} />
                        <Route path="/meta-data" element={isLoggedIn ? <MetaDataDisplay /> : <Navigate to="/login" />} />
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/research-data" element={isLoggedIn ? <ResearchDataPage /> : <Navigate to="/login" />} />
                        <Route path="/logout-success" element={<LogoutSuccessPage />} /> {/* Route for Logout Success Page */}
                        <Route path="/explanation" element={<ExplanationPage />} /> {/* Route for the Explanation Page */}
                        <Route path="/BloodUnitListDisplay" element={<BloodUnitListDisplay />} /> {/* Route for the Explanation Page */}
                    </Routes>
                </main>

                {/* Footer Section */}
                <footer className="footer">
                   
                </footer>
            </div>
        </Router>
    );
}

export default App;
