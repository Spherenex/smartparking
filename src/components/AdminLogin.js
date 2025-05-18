// Login.js
import React, { useState } from 'react';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';
import '../styles/AdminAuth.css'; // Adjust the path as necessary

const Login = ({ onLoginSuccess }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Default admin credentials
  const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
  const DEFAULT_ADMIN_PASSWORD = 'admin123';
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate authentication delay
    setTimeout(() => {
      // Check against default admin credentials
      if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
        // Call the success handler from parent
        onLoginSuccess(email);
      } else {
        setError('Invalid credentials. Please try again.');
      }
      
      setLoading(false);
    }, 800); // Simulate network delay
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-container">
            <Shield size={40} className="login-icon" />
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Parking Management System</p>
        </div>
        
        <div className="login-body">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Admin Email
              </label>
              <div className="input-container">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  id="admin-email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <Lock size={20} className="input-icon" />
                <input
                  type="password"
                  id="admin-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Admin Login'}
              {!loading && <LogIn size={18} className="button-icon" />}
            </button>
            
            <div className="login-credentials">
              <p>Default credentials for demo:</p>
              <p className="credentials-detail">Email: admin@gmail.com</p>
              <p className="credentials-detail">Password: admin123</p>
            </div>
          </form>
        </div>
        
        <div className="login-footer">
          <p>Secured admin portal for parking system management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;