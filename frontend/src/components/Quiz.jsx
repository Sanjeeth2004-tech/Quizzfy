import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { FaClock, FaArrowLeft, FaArrowRight, FaCheck, FaExclamationTriangle, FaExpand, FaCompress, FaTrophy } from 'react-icons/fa'
import QuizResults from './QuizResults';
import Leaderboard from './LeaderboardPopup';
import axios from 'axios';
import { submitQuiz } from '../services/quizAPI';
import '../styles/Quiz.css';


function Quiz() {
  const { course } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const quizContainerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [allSubmissionsCompleted, setAllSubmissionsCompleted] = useState(false)
  const [isFriendQuiz, setIsFriendQuiz] = useState(false)
  const [participantName, setParticipantName] = useState('')
  const [showNameEntry, setShowNameEntry] = useState(false)
  const [nameError, setNameError] = useState('')
  const [isNameSubmitting, setIsNameSubmitting] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)


  // Check if this is a friend quiz or course quiz
  useEffect(() => {
    // Check if the quiz is from a course list or from friends
    const isFromCourseList = location.state?.fromCourseList || false;
    setIsFriendQuiz(!isFromCourseList);
    
    // If this is a friend quiz, show the name entry form
    if (!isFromCourseList) {
      setShowNameEntry(true);
    }
  }, [location]);

  // Function to toggle full screen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      // Enter full screen
      if (quizContainerRef.current) {
        if (quizContainerRef.current.requestFullscreen) {
          quizContainerRef.current.requestFullscreen()
        } else if (quizContainerRef.current.webkitRequestFullscreen) {
          quizContainerRef.current.webkitRequestFullscreen()
        } else if (quizContainerRef.current.msRequestFullscreen) {
          quizContainerRef.current.msRequestFullscreen()
        }
        setIsFullScreen(true)
      }
    } else {
      // Exit full screen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
      setIsFullScreen(false)
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange)
    document.addEventListener('msfullscreenchange', handleFullScreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange)
      document.removeEventListener('msfullscreenchange', handleFullScreenChange)
    }
  }, [])

  // Enter full screen when quiz starts
  useEffect(() => {
    if (!loading && !error && !showResults && !showLeaderboard) {
      // Small delay to ensure the quiz is rendered
      const timer = setTimeout(() => {
        toggleFullScreen()
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [loading, error, showResults, showLeaderboard])

  // Exit full screen when showing results or leaderboard
  useEffect(() => {
    if ((showResults || showLeaderboard) && document.fullscreenElement) {
      toggleFullScreen()
    }
  }, [showResults, showLeaderboard])

  // Check if all submissions are completed
  useEffect(() => {
    const checkAllSubmissionsCompleted = async () => {
      try {
        // Only check for friend quizzes
        if (!isFriendQuiz) return;
        
        // Simulate API call to check if all submissions are completed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll randomly decide if all submissions are completed
        // In a real app, this would be based on actual data from your backend
        const isCompleted = Math.random() > 0.5;
        setAllSubmissionsCompleted(isCompleted);
        
        // If all submissions are completed and we're showing results, show the leaderboard
        if (isCompleted && showResults) {
          setShowLeaderboard(true);
        }
      } catch (err) {
        console.error('Failed to check submission status:', err);
      }
    };
    
    if (showResults) {
      checkAllSubmissionsCompleted();
    }
  }, [showResults, isFriendQuiz]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        console.log('Fetching quiz data for course:', course);
        // Updated API endpoint to use the correct route
        const response = await axios.get(`http://localhost:5000/api/courses/${encodeURIComponent(course)}`);
        console.log('Quiz data response:', response.data);
        
        if (!response.data || response.data.length === 0) {
          setError(`No questions found for the course "${course}". Please try another course.`);
          setLoading(false);
          return;
        }
        
        setQuizData(response.data);
        setTimeRemaining(150); // Fallback to 30 mins if undefined
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz data:', err);
        setError(`Failed to fetch quiz data for "${course}". Error: ${err.message}`);
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [course]);
  

  useEffect(() => {
    if (!timeRemaining || showResults || showLeaderboard) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults, showLeaderboard]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionId) => {
    console.log(`Selected answer: ${optionId} for question ${currentQuestionIndex + 1}`);
    setSelectedAnswer(optionId);
    setAnswers(prev => {
      const newAnswers = {
      ...prev,
      [currentQuestionIndex]: optionId
      };
      console.log('Updated answers:', newAnswers);
      return newAnswers;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Check if all questions are answered
      const unansweredCount = Object.keys(answers).length;
      const totalQuestions = quizData.length;
      
      if (unansweredCount < totalQuestions) {
        const confirmSubmit = window.confirm(
          `You have ${totalQuestions - unansweredCount} unanswered questions. Are you sure you want to submit?`
        );
        
        if (!confirmSubmit) {
          setIsSubmitting(false);
          return;
        }
      }

      // Calculate the score by comparing the answers with the correct answers
      let correctAnswersCount = 0;
      const results = quizData.map((question, index) => {
        const selectedAnswer = answers[index];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        if (isCorrect) correctAnswersCount++;
        
        return {
          question: question.text,
          selectedAnswer: question.options.find(opt => opt.id === selectedAnswer)?.text || 'Not answered',
          correctAnswer: question.options.find(opt => opt.id === question.correctAnswer)?.text || 'Unknown',
          isCorrect
        };
      });

      // Calculate score percentage
      const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);
      
      // Check if user passed (40% threshold)
      const passed = scorePercentage >= 40;

      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // Calculate incorrect answers
      const incorrectAnswersCount = totalQuestions - correctAnswersCount;

      // Submit results to backend
      try {
        // Get user credentials from localStorage
        const userEmail = localStorage.getItem('userEmail');
        const userPassword = localStorage.getItem('userPassword');
        
        // Make sure the course ID is properly encoded for the URL
        const encodedCourse = encodeURIComponent(course);
        
        // Convert answers object to array in the correct order
        const answersArray = [];
        for (let i = 0; i < quizData.length; i++) {
          answersArray[i] = answers[i] || null;
        }
        
        const response = await submitQuiz(encodedCourse, answersArray, timeSpent);

        // If submission was successful and we have user stats, update them
        if (response.updatedStats) {
          // Update user stats in localStorage
          const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
          Object.assign(userStats, response.updatedStats);
          localStorage.setItem('userStats', JSON.stringify(userStats));
        }

        // Show results regardless of backend submission success
        setQuizResults({
          _id: response.quizResultId, // Store the quiz result ID
          score: scorePercentage,
          correctAnswers: correctAnswersCount,
          incorrectAnswers: incorrectAnswersCount,
          timeSpent,
          passed,
          results
        });
        setShowResults(true);
      } catch (err) {
        console.error('Error submitting results:', err);
        // Show results even if backend submission fails
        setQuizResults({
          score: scorePercentage,
          correctAnswers: correctAnswersCount,
          incorrectAnswers: incorrectAnswersCount,
          timeSpent,
          passed,
          results
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleViewLeaderboard = () => {
    setShowLeaderboard(true);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    
    if (!participantName.trim()) {
      setNameError('Please enter your name');
      return;
    }
    
    setIsNameSubmitting(true);
    
    // In a real application, you would save the user's name to the backend
    // For now, we'll simulate a successful submission
    setTimeout(() => {
      // Store the name in localStorage for use in the quiz
      localStorage.setItem('quizParticipantName', participantName);
      
      setIsNameSubmitting(false);
      setShowNameEntry(false);
    }, 1000);
  };

  useEffect(() => {
    // Check if user is authenticated
    const userEmail = localStorage.getItem('userEmail');
    setIsAuthenticated(!!userEmail);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    );
  }

  if (showLeaderboard && isFriendQuiz) {
    return <Leaderboard quizData={quizData} testCode={testCode} />;
  }

  if (showResults && quizResults) {
    // Navigate to the quiz results page with the quiz ID
    navigate(`/quiz-history/${quizResults._id}`);
    return null;
  }

  if (showConfirmation) {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = quizData.length;
    const unansweredCount = totalQuestions - answeredCount;

    return (
      <div className="confirmation-dialog">
        <div className="confirmation-content">
          <div className="confirmation-icon">
            <FaExclamationTriangle />
          </div>
          <h2>Submit Quiz?</h2>
          <p>Are you sure you want to submit your quiz?</p>
          <div className="confirmation-details">
            <div className="detail-item">
              <span className="detail-label">Time Remaining:</span>
              <span className="detail-value">{formatTime(timeRemaining)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Questions Answered:</span>
              <span className="detail-value">{answeredCount} of {totalQuestions}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Unanswered Questions:</span>
              <span className="detail-value">{unansweredCount}</span>
            </div>
          </div>
          <div className="confirmation-buttons">
            <button 
              className="cancel-button"
              onClick={handleCancelSubmit}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="button-spinner" /> Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showNameEntry) {
    return (
      <div className="quiz-container" ref={quizContainerRef}>
        <div className="quiz-header">
          <h1>Enter Your Name</h1>
          <p className="quiz-description">
            Please enter your name to appear in the quiz "{quizData.title}".
          </p>
          
          <form onSubmit={handleNameSubmit} className="name-entry-form">
            <div className="form-group">
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className={nameError ? 'error' : ''}
                autoFocus
              />
              {nameError && <p className="error-message">{nameError}</p>}
            </div>
            
            <button 
              type="submit" 
              className="start-quiz-button"
              disabled={isNameSubmitting}
            >
              {isNameSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Starting Quiz...
                </>
              ) : (
                'Start Quiz'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="quiz-container" ref={quizContainerRef}>
      <div className="quiz-header">
        <h1>{quizData.course}</h1>
        {/* <p className="quiz-description">{quizData.description}</p> */}
        <div className="header-controls">
          <div className="timer">
            <FaClock className="timer-icon" />
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
          <button 
            className="fullscreen-button"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullScreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {quizData.length}
        </div>
      </div>

      <div className="question-container">
        <h2 className="question-text">{currentQuestion.text}</h2>
        <div className="options-container">
          {currentQuestion.options.map((option, index) => {
            console.log(`Rendering option ${index}:`, option);
            return (
            <div
              key={option.id}
              className={`option ${selectedAnswer === option.id ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(option.id)}
            >
              <div className="option-marker">{option.id.toUpperCase()}</div>
              <div className="option-text">{option.text}</div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <FaArrowLeft /> Previous
        </button>
        
        {currentQuestionIndex === quizData.length - 1 ? (
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            className="nav-button"
            onClick={handleNext}
          >
            Next <FaArrowRight />
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz

