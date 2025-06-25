import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff , FiUser} from 'react-icons/fi';
import '../styles/SignUp.css';
import axios from 'axios';
function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const handleSignup = async () => {
    setEmailError('');
    setUsernameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    }

    if (!username) {
      setUsernameError('Username is required');
      hasError = true;
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm password is required');
      hasError = true;
    } else if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);
      
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      // Store user credentials in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', password);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to profile page
      navigate('/profile');
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific error messages from the API
      if (err.response && err.response.data && err.response.data.message) {
        setGeneralError(err.response.data.message);
      } else {
        setGeneralError('An error occurred during signup. Please try again.');
        navigate('/error');
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="signup-container">
      <div className="signup-left">
        <img src="/signupbg.webp" alt="Background" className="signup-bg" />
        <div className="signup-left-overlay">
          <img src="/nlo.png" alt="Logo" className="signup-logo" />
          <div className="quote">
            <p>The only way to <strong>do great work</strong> is to <strong>love what you do.</strong></p>
            <span>- Steve Jobs</span>
          </div>
        </div>
      </div>

      <div className="signup-right">
        <h2>Sign Up</h2>
        <div className="input-wrapper">
          <FiUser className="input-icon" />
          <input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={usernameError ? 'input-error' : ''}
            disabled={isLoading}
          />
          <div className="error-space">
            {usernameError && <p className="field-error">{usernameError}</p>}
          </div>
        </div>
        <div className="input-wrapper">
          <FiMail className="input-icon" />
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? 'input-error' : ''}
          />
          <div className="error-space">
            {emailError && <p className="field-error">{emailError}</p>}
          </div>
        </div>

        <div className="input-wrapper password-field">
          <FiLock className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? 'input-error' : ''}
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
          <div className="error-space">
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>
        </div>

        <div className="input-wrapper password-field">
          <FiLock className="input-icon" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={confirmPasswordError ? 'input-error' : ''}
          />
          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </span>
          <div className="error-space">
            {confirmPasswordError && <p className="field-error">{confirmPasswordError}</p>}
          </div>
        </div>

        <button className="signup-btn" onClick={handleSignup}>Sign Up</button>

        <div className="divider">
          <hr /> <span>or</span> <hr />
        </div>

        <div className="social-buttons">
          <button className="social-btn">
            <img src="/google.jpg" alt="Google" />
            Google
          </button>
          <button className="social-btn">
            <img src="/facebook.jpg" alt="Facebook" />
            Facebook
          </button>
        </div>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/login')}>Log In</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
