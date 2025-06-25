import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import '../styles/Header.css';

function Header() {  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation(); // Get the current location/path

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Determine if we are on the /join-test page
  const isJoinTestPage = location.pathname === '/join-test';

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            <img src="/nlo.png" alt="Quizify Logo" />
          </Link>
        </div>

        {/* Only show the menu toggle if we are not on the /join-test page */}
        {!isJoinTestPage && (
          <div className="menu-toggle" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        {/* Conditionally render the sidebar links */}
        {!isJoinTestPage && (
          <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/courses" onClick={closeMenu}>Courses</Link>
            <Link to="/quiz-history" onClick={closeMenu}>Quiz History</Link>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            <Link to="/settings" onClick={closeMenu}>Settings</Link>

            <Link to="/join-test">
              <button className="join-test-btn" onClick={closeMenu}>Join Test</button>
            </Link>

            <div className="auth-buttons">
              <Link to="/login" className="login-btn" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="signup-btn" onClick={closeMenu}>Sign Up</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
