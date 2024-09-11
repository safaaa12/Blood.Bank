import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file for styling

const HomePage = () => {
    const [userRole, setUserRole] = useState('');
    const [stats, setStats] = useState(null); // New state for storing stats
    const navigate = useNavigate(); // To use for redirection if needed

    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        console.log('Email in localStorage:', userEmail); // Check if the email is stored

        if (userEmail) {
            console.log('User email from localStorage:', userEmail);
            fetchUserRole(userEmail);
        } else {
            console.log('No email found in localStorage');
            navigate('/login'); // Redirect to login page if no email is found
        }
    }, [navigate]); // Adding navigate to the dependency array

    const fetchUserRole = async (userEmail) => {
        const urlEncodedEmail = encodeURIComponent(userEmail);
        try {
            console.log('Fetching role for email:', userEmail); // Checking the email
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${urlEncodedEmail}`);
            console.log('Response from server:', response.data); // Check the response
            const { role } = response.data;
            console.log('Fetched user role:', role); // Log the fetched role
            setUserRole(role); // Set the role in state
            
            if (role === 'student') {
                fetchStats(); // Fetch stats if the user is a student
            }
        } catch (error) {
            console.log('Error fetching user role:', error); // Error from the server
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/stats');
            console.log('Fetched stats:', response.data);
            setStats(response.data);
        } catch (error) {
            console.log('Error fetching stats:', error);
        }
    };

    const renderButtonsForRole = () => {
        switch (userRole) {
            case 'admin':
                return (
                    <div className="button-container">
                        <NavLink to="/admin-management" className="page-button">ניהול מנהל</NavLink>
                        <NavLink to="/message-management" className="page-button">ניהול הודעות</NavLink>
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
                        {/* Render statistics if available */}
                        {stats && (
                            <div className="stats-container">
                                <h2>סטטיסטיקות</h2>
                                <p>מספר תרומות: {stats.totalDonations}</p>
                                <p>מספר תורמים: {stats.totalDonors}</p>
                                <p>מספר ניפוקים חירומיים: {stats.emergencyDispense}</p>
                                {/* Add more statistics as needed */}
                            </div>
                        )}
                    </div>
                );
            default:
                return <p>טוען...</p>;
        }
    };

    return (
        <div className="home-container">
            <h1>ברוכים הבאים</h1>
            {userRole && <p>תפקיד: {userRole}</p>} {/* Display the user role */}
            {renderButtonsForRole()}
        </div>
    );
};

export default HomePage;
