import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    let hasError = false;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check both empty
    if (!email && !password) {
      setEmailError('Email is required');
      setPasswordError('Password is required');
      setError('Email and password are required');
      return;
    }

    // Individual checks
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      // Send request to backend login route
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Store user credentials and token in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', password);
      // localStorage.setItem('token', response.data.token);

      // Store user data in localStorage if remember me is checked
      
        localStorage.setItem('user', JSON.stringify(response.data.user));
      

      // Navigate to profile page
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);

      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/nlo.png" alt="logo" className="login-logo" />
        <h2>Knowledge is power, but the ability to test it is where the fun begins!</h2>
        <p>Welcome back! Please login to your account.</p>

        {error && <p className="error-message">{error}</p>}

        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={emailError ? 'input-error' : ''}
        />
        {emailError && <p className="field-error">{emailError}</p>}

        <label>Password:</label>
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? 'input-error' : ''}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FiEyeOff size={20} color="#777" /> : <FiEye size={20} color="#777" />}
          </span>
        </div>
        {passwordError && <p className="field-error">{passwordError}</p>}

        <div className="login-options stacked">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="forgot">Forgot password?</a>
        </div>

        <div className="actions">
          <button className="login-btn" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>



        <p className="switch-auth">
          Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
        </p>
      </div>

      <div className="login-right">
        <img src="/cycle.jpeg" alt="Login Illustration" />
      </div>
    </div>
  );
}

export default Login;
