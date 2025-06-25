import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaClock, FaCheck, FaTimes, FaArrowRight, FaRedo } from 'react-icons/fa';
import axios from 'axios';
import '../styles/QuizHistory.css';

function QuizHistory() {
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Get user credentials from localStorage
      const userEmail = localStorage.getItem('userEmail');
      const userPassword = localStorage.getItem('userPassword');
      
      if (!userEmail || !userPassword) {
        setError('Please log in to view your quiz history');
        setLoading(false);
        return;
      }
      
      // Fetch quiz history from backend API with increased timeout
      const response = await axios.get('http://localhost:5000/api/user/quiz-history', {
        headers: {
          'X-User-Email': userEmail,
          'X-User-Password': userPassword
        },
        timeout: 30000 // 30 second timeout for the request
      });
      
      // Transform the data to match our component's expected format
      const transformedHistory = response.data.map(result => {
        const totalQuestions = result.answers ? result.answers.length : 0;
        const correctAnswers = Math.round((result.score / 100) * totalQuestions);
        const incorrectAnswers = totalQuestions - correctAnswers;
        
        return {
          id: result._id,
          quizId: result._id,
          title: result.course,
          courseName: result.course,
          dateTaken: result.submittedAt,
          score: result.score,
          totalQuestions,
          correctAnswers,
          incorrectAnswers,
          timeSpent: result.timeSpent || 0,
          isFromCourse: true
        };
      });
      
      setQuizHistory(transformedHistory);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch quiz history:', err);
      
      // Provide more specific error messages
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response) {
        // Server responded with an error
        setError(`Server error: ${err.response.data?.message || err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('No response from server. Please check if the server is running.');
      } else {
        // Something else went wrong
        setError(`Failed to fetch quiz history: ${err.message}`);
      }
      
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizHistory();
  }, [retryCount]); // Re-fetch when retry count changes

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeSpent = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'very-poor';
  };

  const handleViewDetails = (quizId) => {
    navigate(`/quiz-history/${quizId}`);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading quiz history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
        <div className="error-actions">
          <button 
            className="retry-button"
            onClick={handleRetry}
          >
            <FaRedo /> Retry
          </button>
          <button 
            className="browse-courses-button"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-history-container">
      <div className="quiz-history-header">
        <FaHistory className="history-icon" />
        <h1>Quiz History</h1>
        <p className="history-description">Your completed quizzes from courses</p>
      </div>
      
      {quizHistory.length === 0 ? (
        <div className="no-history">
          <p>You haven't taken any quizzes from courses yet.</p>
          <button 
            className="browse-courses-button"
            onClick={() => navigate('/courses')}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="quiz-history-list">
          {quizHistory.map(quiz => (
            <div key={quiz.id} className="quiz-history-item">
              <div className="quiz-info">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="course-name">{quiz.courseName}</p>
                <p className="date-taken">Taken on: {formatDate(quiz.dateTaken)}</p>
              </div>
              
              <div className="quiz-stats">
                <div className="stat-item">
                  <span className="stat-label">Score:</span>
                  <span className={`stat-value score ${getScoreColor(quiz.score)}`}>
                    {quiz.score}%
                  </span>
                </div>
                
                <div className="stat-item">
                  <FaClock className="stat-icon" />
                  <span className="stat-label">Time:</span>
                  <span className="stat-value">{formatTimeSpent(quiz.timeSpent)}</span>
                </div>
                
                <div className="stat-item">
                  <FaCheck className="stat-icon correct" />
                  <span className="stat-label">Correct:</span>
                  <span className="stat-value">{quiz.correctAnswers}/{quiz.totalQuestions}</span>
                </div>
                
                <div className="stat-item">
                  <FaTimes className="stat-icon incorrect" />
                  <span className="stat-label">Incorrect:</span>
                  <span className="stat-value">{quiz.incorrectAnswers}</span>
                </div>
              </div>
              
              <button 
                className="view-details-button"
                onClick={() => handleViewDetails(quiz.quizId)}
              >
                View Details <FaArrowRight />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizHistory;
