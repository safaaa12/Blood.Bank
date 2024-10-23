import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
            console.log('Login response:', response.data); // בדוק את תגובת השרת
    
            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // שמור את הטוקן
                console.log('Token saved:', localStorage.getItem('token')); // בדוק שהטוקן נשמר
            } else {
                console.error('No token found in the response');
            }
    
            localStorage.setItem('email', email); // שמור את האימייל ב-localStorage
            onLogin(); // קריאה לפונקציה אחרי התחברות מוצלחת
            navigate('/'); // נווט לאחר ההתחברות
        } catch (err) {
            setError('אימייל או סיסמה שגויים');
        }
    };
    
    
    
    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="login-title">כניסת תורם</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">שם משתמש:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">סיסמה:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">התחבר</button>
                    {error && <p className="error-message">{error}</p>}
                </form>
                <p className="signup-link">אין לך חשבון? <a href="/signup">לחץ כאן להרשמה</a></p>
            </div>
        </div>
    );
}

export default LoginPage;
