import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUpPage.css';

function SignUpPage() {
    const [formValues, setFormValues] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        role: 'user',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password, confirmPassword, username, role } = formValues;

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('הסיסמאות אינן תואמות');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/api/auth/register', {
                email,
                password: formValues.password,
                username,
                role
            });
            console.log('Server response:', response.data);
            navigate('/login'); // Redirect to login on successful registration
        } catch (error) {
            console.error('Error during registration:', error);
            if (error.response) {
                if (error.response.status === 409) {
                    setError('האימייל כבר קיים במערכת'); // Email already exists
                } else {
                    setError(error.response.data.message || 'שגיאה במהלך הרישום');
                }
            }
        }
    };

    return (
        <div className="sign-up-page">
            <h2 className='signup'>הרשמה</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">אימייל:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">שם משתמש:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formValues.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">סיסמה:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formValues.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm-password">אישור סיסמה:</label>
                    <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        value={formValues.confirmPassword}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="role">תפקיד:</label>
                    <select
                        id="role"
                        name="role"
                        value={formValues.role}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="user">משתמש</option>
                        <option value="student"> סטודנט מחקר</option>
                    
                    </select>
                </div>
                <button type="submit" className="btn">הירשם</button>
            </form>
        </div>
    );
}

export default SignUpPage;
