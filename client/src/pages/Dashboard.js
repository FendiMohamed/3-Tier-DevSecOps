// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import axios from '../axios';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: token },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch users failed:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/users',
        { ...formData, role: 'viewer' },
        { headers: { Authorization: token } }
      );
      setFormData({ name: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      alert('User creation failed');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2>User Manager (React + Node + MySQL)</h2>
        <div>
          {user?.name} (<b>{user?.role}</b>) <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ✅ SHOW form to ALL users */}
      <form className="user-form" onSubmit={handleAddUser}>
        <input
          className="form-field"
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          className="form-field"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="form-field"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Viewer User</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {/* ✅ Only admin sees edit/delete */}
                {user?.role === 'admin' ? (
                  <>
                    <button>Edit</button> <button>Delete</button>
                  </>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;

