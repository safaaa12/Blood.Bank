import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file for styling

const HomePage = () => {
    const [userRole, setUserRole] = useState(''); // ניהול תפקיד המשתמש
    const [bloodStats, setBloodStats] = useState({}); // ניהול סטטיסטיקות הדם הכלליות
    const [bloodTypeCounts, setBloodTypeCounts] = useState({}); // ניהול כמות סוגי הדם
    const [isLoggedIn] = useState(!!localStorage.getItem('token')); // בדיקה אם משתמש מחובר

    useEffect(() => {
        const userEmail = localStorage.getItem('email'); // קבלת האימייל מה-localStorage
        if (userEmail) {
            fetchUserRole(userEmail); // קריאה לפונקציה לקבלת תפקיד המשתמש
        }
        fetchBloodStats(); // קריאה לפונקציה לקבלת נתוני הדם הכלליים
        fetchBloodTypeCounts(); // קריאה לפונקציה שמחזירה את כמות סוגי הדם
    }, []);
    

    const fetchUserRole = async (userEmail) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/auth/user/email/${encodeURIComponent(userEmail)}`);
            const { role } = response.data;
            setUserRole(role); // עדכון תפקיד המשתמש ב-state
        } catch (error) {
            console.error('Error fetching user role:', error); // שגיאה בשרת
        }
    };

    const fetchBloodStats = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/stats'); // קריאה לנתוני הדם הכלליים
            setBloodStats(response.data); // שמירת הנתונים במצב
        } catch (error) {
            console.error('Error fetching blood stats:', error);
        }
    };
    const fetchBloodTypeCounts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/bloodTypeCounts');
            
            // Log the response to ensure the data is correct
            console.log('Blood type counts response:', response.data);
            
            if (Array.isArray(response.data)) {
                const counts = response.data.reduce((acc, item) => {
                    if (item._id && item.count) {
                        acc[item._id] = item.count;
                    }
                    return acc;
                }, {});
        
                // Update the state with the new counts
                setBloodTypeCounts(counts);
            } else {
                console.error('Unexpected response format:', response.data);
            }
        
        } catch (error) {
            // Log any errors for debugging
            console.error('Error fetching blood type counts:', error.response?.data || error.message);
        }
    };
    const fetchDonationsToday = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/donations/today');
            setBloodStats(prevStats => ({
                ...prevStats,
                totalDonatedToday: response.data.totalDonatedToday,
                totalDonorsToday: response.data.totalDonorsToday
            }));
        } catch (error) {
            console.error('Error fetching today\'s donations:', error);
        }
    };
    
    useEffect(() => {
        fetchDonationsToday();
    }, []);
    
    
    const renderAdminView = () => {
        console.log('Rendering with bloodTypeCounts:', bloodTypeCounts); // לוג לבדיקת הנתונים בזמן הרינדור
        return (
            <div className="admin-stats-container">
                <h3>ברוך הבא אדמין!</h3> {/* הודעת ברוכים הבאים */}
                <h2>כמות דם זמינה לפי קבוצות בליטרים</h2>
                <div className="blood-stats-grid">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                        <div className="blood-group-card" key={group}>
                                <div className='sider'><span className="blood-group-label">🩸{group}</span></div>
                                <div className='sidele'><span className="blood-group-value">{bloodTypeCounts[group] || 0}</span> </div>
                        </div> ))}
                </div>

                <div className="general-stats-container">
                    <div className="general-stat-card">
                        <span className="general-stat-icon">👥</span>
                        <span>סה"כ תורמים</span>
                        <span>{bloodStats.totalDonors || 0}</span>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">🩸</span>
                        <span>סה"כ נתרם היום</span>
                        <span>{bloodStats.totalDonatedToday || 0}</span>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">📝</span>
                        <span>בקשות היום</span>
                        <span>{bloodStats.todayRequests || 0}</span>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">✔️</span>
                        <span>בקשות מאושרות היום</span>
                        <span>{bloodStats.todayApprovedRequests || 0}</span>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderUserView = () => {
        return (
            <div className="button-container">
                <NavLink to="/add-donation" className="page-button">הוסף תרומה</NavLink>
                <NavLink to="/dispense-blood" className="page-button">ניפוק דם</NavLink>
                <NavLink to="/emergency-dispense" className="page-button">ניפוק חירום</NavLink>
            </div>
        );
    };

    const renderStudentView = () => {
        return (
            <div className="button-container">
                <NavLink to="/research-data" className="page-button">נתוני מחקר</NavLink>
            </div>
        );
    };

    const renderButtonsForRole = () => {
        switch (userRole) {
            case 'admin':
                return renderAdminView();
            case 'user':
                return renderUserView();
            case 'student':
                return renderStudentView();
            default:
                return <p>טוען...</p>;
        }
    };

    if (!isLoggedIn) {
        // במצב של אי התחברות, מציג הסבר על המערכת עם אפשרויות התחברות והרשמה
        return (
            <div className="info-container">
                <h1>ברוכים הבאים למערכת ניהול תרומות דם</h1>
                <p>מערכת זו מאפשרת ניהול תורמי דם, ניפוק דם, בקשות חירום, והצגת נתוני מחקר. </p>
                <p>על מנת להשתמש בכלי המערכת, אנא התחבר או הירשם למערכת.</p>
            </div>
        );
    }
    return (
        <div className="home-container">
            {userRole ? (
                <>
                    {renderButtonsForRole()}
                </>
            ) : (
                <p>טוען נתונים...</p>
            )}
        </div>
    );
};

export default HomePage;
