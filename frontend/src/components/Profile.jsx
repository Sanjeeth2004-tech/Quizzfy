import { useState, useEffect } from 'react';
import { FaTrophy, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FiClipboard } from 'react-icons/fi';
import axios from 'axios';

import '../styles/Profile.css';

function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // User profile data
  const [userProfile, setUserProfile] = useState({
    username: '',
    email: '',
    bio: '',
    profilePic: '/default-profile.jpg'
  });

  // User performance statistics
  const [userStats, setUserStats] = useState({
    quizzesPassed: 0,
    fastestTime: 0,
    correctAnswers: 0
  });

  // Load user profile from API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get user credentials from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userPassword = localStorage.getItem('userPassword');
        
        if (!userEmail || !userPassword) {
          // If no user data, redirect to login
          navigate('/login');
          return;
        }
        
        // Fetch latest user data from backend API
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: {
            'X-User-Email': userEmail,
            'X-User-Password': userPassword
          }
        });
        
        const userData = response.data;
        
        // Update user profile state
        setUserProfile({
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || 'Quiz enthusiast and knowledge seeker',
          profilePic: userData.profilePic || '/default-profile.jpg'
        });
        
        // Update user stats
        setUserStats({
          quizzesPassed: userData.stats?.quizzesPassed || 0,
          fastestTime: userData.stats?.fastestTime || 0,
          correctAnswers: userData.stats?.correctAnswers || 0
        });
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate]);

  const handleJoinQuiz = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a code');
      return;
    }
    
    // Check if the code is from courses page (assuming course codes start with 'COURSE-')
    if (joinCode.trim().toUpperCase().startsWith('COURSE-')) {
      // Navigate directly to the test without asking for name
      navigate(`/test/${joinCode.trim().toUpperCase()}`, { 
        state: { 
          fromCourses: true,
          skipNameInput: true
        } 
      });
    } else {
      // For other tests, navigate to join-test page with the code
      navigate('/join-test', { state: { prefillCode: joinCode.trim().toUpperCase() } });
    }
  };

  const handleClipboardClick = async () => {
    try {
      const text = await navigator.clipboard.readText(); // Read text from clipboard
      setJoinCode(text); // Paste the clipboard content into the input box
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  const handleAchievementsClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    if (seconds === 0) return '0min';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <img src={userProfile.profilePic} alt="Profile" className="profile-image" />
        <div className="profile-info">
          <h1>{userProfile.username}</h1>
          <p>{userProfile.bio}</p>
          <div className="progress-bar">
            <div className="progress"></div>
          </div>
          <div className="stats">
            <div><FaTrophy size={28} color="#1935CA" /><span>{userStats.quizzesPassed} Quiz Passed</span></div>
            <div><FaClock size={28} color="#1935CA" /><span>{formatTime(userStats.fastestTime)} Fastest Time</span></div>
            <div><FaCheckCircle size={28} color="#1935CA" /><span>{userStats.correctAnswers} Correct Answers</span></div>
          </div>
        </div>
      </div>

      <div className="row-widgets">
        <div className="achievements half-width">
          <h3>Achievements</h3>
          <div className="achievements-card" onClick={handleAchievementsClick}>
            <div className="achievement-item" title="Answered 3 in a row">
              <img src="/b1.png" alt="Comeback" className="achievement-badge" />
              Comeback
            </div>
            <div className="achievement-item" title="Scored 100%">
              <img src="/b2.png" alt="Winner" className="achievement-badge" />
              Winner
            </div>
            <div className="achievement-item" title="Completed in 3 minutes">
              <img src="/b3.png" alt="Lucky" className="achievement-badge" />
              Lucky
            </div>
          </div>
        </div>

        <div className="custom-quiz-card half-width">
          <h3>Create Custom Quiz</h3>
          <p>Make and share your own quiz with friends!</p>
          <button onClick={() => navigate('/create-quiz')}>+ Create Quiz</button>
        </div>
      </div>

      <div className="play-with-friends-card">
        <h3>Play with Friends</h3>
        <p className="section-description">Enter a quiz code to join a friend's quiz</p>
        <div className="join-input">
          <input
            type="text"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value);
              setJoinError('');
            }}
          />
          <FiClipboard
            className="clipboard-icon"
            onClick={handleClipboardClick}
          />
          <button onClick={handleJoinQuiz}>Join</button>
        </div>
        {joinError && <p className="error-text">{joinError}</p>}
        <div className="join-test-link">
          <p>Or <a href="#" onClick={(e) => { e.preventDefault(); navigate('/join-test'); }}>go to Join Test page</a></p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCloseModal}>×</button>
            <h2>All Achievements</h2>
            <div className="scrollable-badges">
              {[{ src: '/b1.png', title: 'Comeback' }, { src: '/b2.png', title: 'Winner' }, { src: '/b3.png', title: 'Lucky' }, { src: '/b4.jpg', title: 'Speedster' }, { src: '/b5.jpg', title: 'Streak Master' }, { src: '/b6.png', title: 'Power Player' }, { src: '/b7.png', title: 'Perfectionist' }].map((badge, index) => (
                <div key={index} className="achievement-item" title={badge.title}>
                  <img src={badge.src} alt={badge.title} className="achievement-badge" />
                  <p>{badge.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
