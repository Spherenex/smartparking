import React, { useState } from 'react';
import { loginUser, sendOTP, verifyOTP } from '../firebase';
import { Mail, Lock, LogIn, Phone, Car, RefreshCw } from 'lucide-react';
import '../styles/Auth.css';

const Login = ({ onSwitch }) => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  
  // Email login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone OTP login states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { user, error } = await loginUser(email, password);
      
      if (error) {
        setError(error);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };
  
  const generateOTP = () => {
    // Generate a random 6-digit OTP
    const randomOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(randomOTP);
    return randomOTP;
  };
  
  const handleSendOTP = async () => {
    // Phone number validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate OTP
      const newOTP = generateOTP();
      
      // In a real application, you would send the OTP via SMS
      // For this demo, we're displaying it on the screen
      const { success, error } = await sendOTP(phoneNumber, newOTP);
      
      if (error) {
        setError(error);
      } else {
        setOtpSent(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, you would verify the OTP through Firebase
      // For this demo, we're comparing with the generated OTP
      if (otp === generatedOTP) {
        const { user, error } = await verifyOTP(phoneNumber, otp);
        
        if (error) {
          setError(error);
          setLoading(false);
        }
      } else {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-banner">
        <div className="auth-banner-content">
          <h1>Smart Parking System</h1>
          <p>
            Welcome to our parking management platform. Log in to access your account,
            find available parking spots, and manage your parking details easily.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <Car size={24} />
              <span>Hassle-free Parking Management</span>
            </div>
            <div className="auth-feature">
              <Phone size={24} />
              <span>Quick Login with OTP</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>Welcome Back</h2>
          <p>Sign in to access the parking system</p>
          
          <div className="login-method-toggle">
            <button 
              className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button 
              className={`toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => setLoginMethod('phone')}
            >
              Phone OTP Login
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin}>
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
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <Lock size={20} />
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
                <LogIn size={18} />
              </button>
            </form>
          ) : (
            <div>
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
                    disabled={loading || otpSent}
                  />
                </div>
              </div>
              
              {!otpSent ? (
                <button 
                  className="btn" 
                  onClick={handleSendOTP} 
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                  <Phone size={18} />
                </button>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="otp-section">
                    <div className="generated-otp">
                      <p>Your OTP (for demo purposes):</p>
                      <span className="otp-display">{generatedOTP}</span>
                      <button 
                        type="button"
                        className="resend-btn"
                        onClick={handleSendOTP}
                        disabled={loading}
                      >
                        <RefreshCw size={16} /> Resend OTP
                      </button>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="otp">Enter OTP</label>
                      <div className="input-with-icon">
                        <Lock size={20} />
                        <input
                          type="text"
                          id="otp"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="btn" disabled={loading || otp.length !== 6}>
                      {loading ? 'Verifying...' : 'Verify & Login'}
                      <LogIn size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          
          <div className="auth-form-footer">
            <p>
              Don't have an account?{' '}
              <a href="#" onClick={onSwitch}>Register your vehicle</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;