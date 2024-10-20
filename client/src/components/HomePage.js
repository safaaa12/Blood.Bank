import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css'; // Import the CSS file for styling

const HomePage = () => {
    const [userRole, setUserRole] = useState(''); // ניהול תפקיד המשתמש
    const [bloodStats, setBloodStats] = useState({}); // ניהול סטטיסטיקות הדם הכלליות
    const [bloodTypeCounts, setBloodTypeCounts] = useState({}); // ניהול כמות סוגי הדם
    const [expiringBloodUnits, setExpiringBloodUnits] = useState([]); // יחידות דם שפג תוקפן בקרוב

    useEffect(() => {
        const userEmail = localStorage.getItem('email'); // קבלת האימייל מה-localStorage
        if (userEmail) {
            fetchUserRole(userEmail); // קריאה לפונקציה לקבלת תפקיד המשתמש
        }
        fetchBloodStats(); // קריאה לפונקציה לקבלת נתוני הדם הכלליים
        fetchBloodTypeCounts(); // קריאה לפונקציה שמחזירה את כמות סוגי הדם
        fetchExpiringBloodUnits(); // קריאה לפונקציה לקבלת יחידות הדם שתפוגתן קרובה
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
            setBloodStats(prevStats => ({
                ...prevStats, // שמירת הנתונים הקיימים
                ...response.data // עדכון עם הנתונים החדשים מהשרת
            }));
        } catch (error) {
            console.error('Error fetching blood stats:', error);
        }
    };

    const fetchBloodTypeCounts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/bloodTypeCounts');
            const counts = response.data.reduce((acc, item) => {
                if (item._id && item.count) {
                    acc[item._id] = item.count;
                }
                return acc;
            }, {});
            setBloodTypeCounts(counts);
        } catch (error) {
            console.error('Error fetching blood type counts:', error.response?.data || error.message);
        }
    };

    // פונקציה לשליפת יחידות דם שתפוגתן מתקרבת
    const fetchExpiringBloodUnits = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/blood/notify-expiring-donations'); // הנחה שהנתיב מחזיר יחידות דם שתפוגתן קרובה
            setExpiringBloodUnits(response.data.soonToExpireDonations); // שמירת יחידות הדם שפג תוקפן בקרוב
        } catch (error) {
            console.error('Error fetching expiring blood units:', error);
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

    // פונקציה להורדת דוח יחידות הדם לפוג
    const downloadExpiringReport = async (format) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/blood/download-expiring-report?format=${format}`, {
                responseType: 'blob', // חשוב לוודא שהתגובה היא קובץ בינארי
            });
    
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expiring_blood_units.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('שגיאה בהורדת הדוח');
        }
    };
    const downloadAllDonations = async (format) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/blood/download-full-donor-report?format=${format}`, {
                responseType: 'blob', // קבלת התגובה כקובץ
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `expiring_blood_units.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('שגיאה בהורדת הדוח');
        }
    };
    
    
    useEffect(() => {
        fetchDonationsToday();
    }, []);

    const renderAdminView = () => {
        return (
            <div className="admin-stats-container">
                <h3>ברוך הבא אדמין!</h3> {/* הודעת ברוכים הבאים */}
                <h2>כמות דם זמינה לפי קבוצות בליטרים</h2>
                <div className="blood-stats-grid">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                        <div className="blood-group-card" key={group}>
                            <div className='sider'><span className="blood-group-label">🩸{group}</span></div>
                            <div className='sidele'><span className="blood-group-value">{bloodTypeCounts[group] || 0}</span> </div>
                        </div>
                    ))}
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
                        <span className="stat-title">הורדת דוח כל התרומות עם פרטי תורם</span>
                        <button className="download-report-button" onClick={() => downloadAllDonations('excel')}>הורד דוח Excel</button>
                        <button className="download-report-button" onClick={() => downloadAllDonations('pdf')}>הורד דוח PDF</button>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">⚠️</span>
                        <span>יחידות דם שתפוגתן מתקרבת</span>
                        {expiringBloodUnits.length > 0 ? (
                            expiringBloodUnits.map((unit) => (
                                <div key={unit._id} className="expiring-blood-unit">
                                    <p>⚠️ יחידת דם מסוג {unit.bloodType} מתורם {unit.donor.donorName} תפוג בעוד {Math.ceil((new Date(unit.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))} ימים.</p>
                                </div>
                            ))
                        ) : (
                            <p>אין יחידות דם שתפוגתן קרובה.</p>
                        )}
                        <button className="download-report-button" onClick={() => downloadExpiringReport('excel')}>הורדת דוח ב-Excel</button>
                        <button className="download-report-button" onClick={() => downloadExpiringReport('pdf')}>הורדת דוח ב-PDF</button>
    

                    </div>
                </div>
            </div>
        );
    };

    const renderUserView = () => {
        return (
            <div className="user-stats-container">
                <h3>ברוך הבא משתמש!</h3> {/* הודעת ברוכים הבאים */}
                <div className="general-stats-container">
                    <div className="general-stat-card">
                        <span className="general-stat-icon">➕</span>
                        <span>הוסף תרומה</span>
                        <NavLink to="/add-donation" className="general-stat-link">לעבור</NavLink>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">🩸</span>
                        <span>ניפוק דם</span>
                        <NavLink to="/dispense-blood" className="general-stat-link">לעבור</NavLink>
                    </div>
                    <div className="general-stat-card">
                        <span className="general-stat-icon">⚠️</span>
                        <span>ניפוק חירום</span>
                        <NavLink to="/emergency-dispense" className="general-stat-link">לעבור</NavLink>
                    </div>
                </div>
            </div>
        );
    };

    const renderStudentView = () => {
        return (
            <div className="student-stats-container">
                <h3>ברוך הבא סטודנט!</h3> {/* הודעת ברוכים הבאים */}
                <h2 className="student-research-title">נתוני מחקר📊</h2>
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
