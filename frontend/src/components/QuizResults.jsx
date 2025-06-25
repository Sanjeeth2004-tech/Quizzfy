import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTrophy, FaMedal, FaAward, FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaList, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import '../styles/QuizResults.css';

const QuizResults = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  
  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        setLoading(true);
        
        // Get user credentials from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userPassword = localStorage.getItem('userPassword');
        
        if (!userEmail || !userPassword) {
          setError('Please log in to view quiz results');
          setLoading(false);
          return;
        }
        
        // Fetch quiz result from backend API
        const response = await axios.get(`http://localhost:5000/api/user/quiz-history/${quizId}`, {
          headers: {
            'X-User-Email': userEmail,
            'X-User-Password': userPassword
          }
        });
        
        const quizResult = response.data;
        console.log('Quiz result:', quizResult);
        
        // Calculate correct and incorrect answers based on score
        const totalQuestions = quizResult.answers.length;
        const correctAnswers = Math.round((quizResult.score / 100) * totalQuestions);
        const incorrectAnswers = totalQuestions - correctAnswers;
        
        // Set the results state
        setResults({
          score: quizResult.score,
          passed: quizResult.passed,
          correctAnswers,
          incorrectAnswers,
          timeSpent: quizResult.timeSpent
        });
        
        // Set the quiz data state
        setQuizData({
          course: quizResult.course,
          title: quizResult.course
        });

        // Set the questions state
        setQuestions(quizResult.questions || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch quiz results:', err);
        setError('Failed to fetch quiz results. Please try again later.');
        setLoading(false);
      }
    };
    
    if (quizId) {
      fetchQuizResults();
    }
  }, [quizId]);
  
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getPerformanceMessage = (score) => {
    if (score >= 90) return "Outstanding! You're a quiz master!";
    if (score >= 80) return "Excellent work! You really know your stuff!";
    if (score >= 70) return "Great job! You've got a solid understanding!";
    if (score >= 60) return "Good effort! Keep practicing!";
    if (score >= 40) return "You passed! Keep improving!";
    return "Keep studying! You'll do better next time!";
  };
  
  const getMedalIcon = (score) => {
    if (score >= 90) return <FaTrophy className="medal-icon gold" />;
    if (score >= 80) return <FaMedal className="medal-icon silver" />;
    if (score >= 70) return <FaAward className="medal-icon bronze" />;
    return null;
  };
  
  const handleGoToCourses = () => {
    navigate('/courses');
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading quiz results...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
        <button 
          className="browse-courses-button"
          onClick={() => navigate('/courses')}
        >
          Browse Courses
        </button>
      </div>
    );
  }
  
  if (!results || !quizData) {
    return (
      <div className="error-container">
        <div className="error-text">Quiz results not found</div>
        <button 
          className="browse-courses-button"
          onClick={() => navigate('/courses')}
        >
          Browse Courses
        </button>
      </div>
    );
  }
  
  return (
    <div className="quiz-results-container">
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="results-header">
        <h1>Quiz Results</h1>
        <p className="quiz-title">{quizData.course || quizData.title}</p>
      </div>
      
      <div className="results-summary">
        <div className="score-display">
          {getMedalIcon(results.score)}
          <div className="score-value">{results.score}%</div>
          <div className={`pass-status ${results.passed ? 'passed' : 'failed'}`}>
            {results.passed ? (
              <>
                <FaCheckCircle className="pass-icon" /> Passed
              </>
            ) : (
              <>
                <FaTimesCircle className="pass-icon" /> Failed
              </>
            )}
          </div>
        </div>
        
        <div className="performance-message">
          {getPerformanceMessage(results.score)}
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <FaCheck className="stat-icon correct" />
            <div className="stat-value">{results.correctAnswers}</div>
            <div className="stat-label">Correct</div>
          </div>
          
          <div className="stat-item">
            <FaTimes className="stat-icon incorrect" />
            <div className="stat-value">{results.incorrectAnswers}</div>
            <div className="stat-label">Incorrect</div>
          </div>
          
          <div className="stat-item">
            <FaClock className="stat-icon time" />
            <div className="stat-value">{formatTime(results.timeSpent)}</div>
            <div className="stat-label">Time Spent</div>
          </div>
        </div>
      </div>

      <div className="questions-review">
        <h2>Questions Review</h2>
        <div className="questions-list">
          {questions.map((question, index) => (
            <div key={index} className={`question-item ${question.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="question-status">
                  {question.isCorrect ? (
                    <FaCheck className="status-icon correct" />
                  ) : (
                    <FaTimes className="status-icon incorrect" />
                  )}
                </span>
              </div>
              <div className="question-text">{question.question}</div>
              <div className="options-list">
                {question.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className={`option ${
                      option.id === question.userAnswer ? 'selected' : ''
                    } ${
                      option.id === question.correctAnswer ? 'correct' : ''
                    }`}
                  >
                    <span className="option-marker">{option.id}</span>
                    <span className="option-text">{option.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="quiz-results-actions">
        <button 
          className="go-to-courses-btn"
          onClick={handleGoToCourses}
        >
          <FaList /> Go to Courses
        </button>
      </div>
    </div>
  );
};

export default QuizResults; 