import React, { useState } from 'react';
import { registerUser } from '../firebase';
import { Mail, Lock, UserPlus, User, Phone, Car } from 'lucide-react';
import '../styles/Auth.css';

const Register = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !phoneNumber || !vehicleNumber || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    // Vehicle number validation
    if (vehicleNumber.trim().length < 5) {
      setError('Please enter a valid vehicle number');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Registering user with additional data for the parking system
      const userData = {
        name,
        email,
        phoneNumber,
        vehicleNumber,
      };
      
      const { user, error } = await registerUser(userData, password);
      
      if (error) {
        setError(error);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="auth-banner-content">
          <h1>Smart Parking System</h1>
          <p>
            Register for our smart parking system to enjoy hassle-free parking management.
            Find available parking spots, track your parking history, and manage payments effortlessly.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <Car size={24} />
              <span>Easy Vehicle Registration</span>
            </div>
            <div className="auth-feature">
              <Phone size={24} />
              <span>Quick OTP Access</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Create Account</h2>
          <p>Sign up to register your vehicle and start using our parking system</p>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <User size={20} />
                <input
                  type="text"
                  id="name"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={20} />
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={20} />
                <input
                  type="tel"
                  id="phoneNumber"
                  placeholder="10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="vehicleNumber">Vehicle Number</label>
              <div className="input-with-icon">
                <Car size={20} />
                <input
                  type="text"
                  id="vehicleNumber"
                  placeholder="Enter your vehicle registration number"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type="password"
                  id="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Vehicle & Create Account'}
              <UserPlus size={18} />
            </button>
          </form>
          
          <div className="auth-form-footer">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={onSwitch}>Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;