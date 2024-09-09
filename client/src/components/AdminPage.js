import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPage.css'; // Add CSS file for styling

function AdminPage() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', username: '', role: 'user', password: '' });
    const [metaData, setMetaData] = useState([]);
    const [error, setError] = useState('');

    // Fetch existing users and metadata on load
    useEffect(() => {
        async function fetchData() {
            try {
                const usersResponse = await axios.get('http://localhost:3001/api/admin/users'); // Endpoint for fetching users
                const metaResponse = await axios.get('http://localhost:3001/api/admin/metadata'); // Endpoint for fetching metadata
                setUsers(usersResponse.data);
                setMetaData(metaResponse.data);
            } catch (err) {
                setError('Error fetching data from server');
                console.error(err);
            }
        }
        fetchData();
    }, []);

    // Handle user creation
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/admin/users', newUser);
            setNewUser({ email: '', username: '', role: 'user', password: '' });
            setError('');
            window.location.reload(); // Reload page to fetch updated users
        } catch (err) {
            setError('Error creating user');
            console.error(err);
        }
    };

    return (
        <div className="admin-page">
            <h2>Admin Dashboard</h2>

            {/* Error message */}
            {error && <p className="error-message">{error}</p>}

            {/* User Management Section */}
            <div className="user-management">
                <h3>Manage Users</h3>
                <form onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Role:</label>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">Blood Bank Worker</option>
                            <option value="admin">Admin</option>
                            <option value="research-student">Research Student</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-create">Create User</button>
                </form>
            </div>

            {/* Display Users */}
            <div className="user-list">
                <h3>Existing Users</h3>
                <ul>
                    {users.map((user) => (
                        <li key={user._id}>
                            {user.username} ({user.role})
                        </li>
                    ))}
                </ul>
            </div>

            {/* Metadata Section */}
            <div className="metadata-section">
                <h3>System Metadata</h3>
                <ul>
                    {metaData.map((data, index) => (
                        <li key={index}>{data}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminPage;
