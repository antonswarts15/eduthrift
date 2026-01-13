import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('http://localhost:3001/auth/login', { email, password });
      
      if (response.data.token) {
        // Check if the user is an admin
        // The backend should ideally return the user role in the response
        // For now, we'll fetch the profile to check the role
        const profileResponse = await axios.get('http://localhost:3001/auth/profile', {
          headers: { Authorization: `Bearer ${response.data.token}` }
        });

        if (profileResponse.data.userType === 'admin') {
          localStorage.setItem('adminToken', response.data.token);
          navigate('/dashboard');
        } else {
          setError('Access denied. You must be an administrator to log in here.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials or server error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Admin Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
