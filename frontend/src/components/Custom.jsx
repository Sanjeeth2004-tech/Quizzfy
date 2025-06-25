import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Custom.css';
import '../styles/LeaderboardPopup.css';

function Quiz() {
  const { course } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isCustomQuiz = location.state?.isCustom;
  const joinMode = location.state?.joinMode;
  const customQuestions = location.state?.questions;
  const quizCode = location.state?.code;

  // const [timeLeft, setTimeLeft] = useState(900);
  // Replace only the top portion of your file
  // const initialTime = (location.state?.timer || 1) * 30;
  const initialTime = (customQuestions?.length || 1) * 30; // 30 seconds per question

  const [timeLeft, setTimeLeft] = useState(initialTime);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const activeQuestions = customQuestions;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (answer) => {
    setSelectedOption(answer);
    const updated = [...answers];
    updated[currentQuestion] = answer;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(answers[currentQuestion + 1] || null);
    } else {
      setShowConfirmation(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] || null);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    setSelectedOption(answers[index] || null);
  };

  const handleSubmit = () => {
    const score = answers.reduce((acc, ans, idx) => ans === activeQuestions[idx].correctAnswer ? acc + 1 : acc, 0);
    const percentage = (score / activeQuestions.length) * 100;

    const history = JSON.parse(localStorage.getItem('quizHistory')) || [];
    history.push({ course, score: percentage, date: new Date().toLocaleString(), answers });
    localStorage.setItem('quizHistory', JSON.stringify(history));

    if (joinMode && isCustomQuiz && quizCode) {
      const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${quizCode}`) || '[]');
      leaderboard.push({
        name: 'You',
        score: `${score}/${activeQuestions.length}`,
        time: `${((900 - timeLeft) / 60).toFixed(1)} min`,
        answers
      });
      localStorage.setItem(`leaderboard_${quizCode}`, JSON.stringify(leaderboard));
      setShowLeaderboard(true);
    } else {
      setShowCongratulations(true);
    }
  };

  const handleReviewQuiz = () => {
    navigate('/quiz-history', { state: { reviewQuiz: true, answers, course } });
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;
  // const progress = (timeLeft / 900) * 360;
  const progress = (timeLeft / initialTime) * 360;

  time: `${((initialTime - timeLeft) / 60)} min`


  if (showLeaderboard) {
    const leaderboard = JSON.parse(localStorage.getItem(`leaderboard_${quizCode}`) || '[]');
    return (
      <div className="confirmation leaderboard-popup">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz leaderboard-frame">
          <h2>Leaderboard</h2>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span>Name</span>
              <span>Score</span>
              <span>Time</span>
            </div>
            {leaderboard.map((entry, index) => (
              <div className="leaderboard-row" key={index}>
                <span>{entry.name}</span>
                <span>{entry.score}</span>
                <span>{entry.time}</span>
              </div>
            ))}
          </div>
          <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
        </div>
      </div>
    );
  }

  if (showCongratulations) {
    const score = answers.filter((ans, idx) => ans === activeQuestions[idx].correctAnswer).length;
    const percentage = (score / activeQuestions.length) * 100;
    return (
      <div className="confirmation">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <img src="/b2.png" alt="Trophy" className="trophy-icon" />
          <h2>Congratulations, you have passed</h2>
          <p>You scored {percentage}%</p>
          <div className="confirmation-buttons">
            <button className="go-home-button" onClick={() => navigate('/profile')}>Go Home</button>
            <button onClick={handleReviewQuiz}>Review Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="confirmation">
        <img src="/qlo.jpg" className="logo-top-left" />
        <div className="quiz">
          <img src="/qm.jpg" className="qm-icon" />
          <h2>Are you sure you want to submit Quiz?</h2>
          <p><strong>⏳ Time Remaining:</strong> {formatTime(timeLeft)}</p>
          <p><strong>❗ Unanswered Questions:</strong> {activeQuestions.length - answers.filter(Boolean).length}</p>
          <div className="confirmation-buttons">
            <button onClick={() => setShowConfirmation(false)}>No</button>
            <button className="yes-button" onClick={handleSubmit}>Yes</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <img src="/qlo.jpg" className="logo-top-left" width="220px" height="68px" />
      <h2 style={{ color: '#FFFFFF' }}>{course} Quiz</h2>
      <div className="quiz-container">
        <div className="quiz">
          <div className="quiz-header">
            {currentQuestion > 0 && <button onClick={handlePrevious} className="previous-button">Previous</button>}
            <p className="question-number">{currentQuestion + 1}/{activeQuestions.length}</p>
            <div className="timer-container">
              <div className="timer-circle" style={{ background: `conic-gradient(#1935CA ${progress}deg, #e6e6e6 ${progress}deg)` }}>
                <p className="timer">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="question">
            <h3>Question {currentQuestion + 1}</h3>
            <p>{activeQuestions[currentQuestion].question}</p>
            <div className="options">
              {activeQuestions[currentQuestion].options.map((option) => (
                <button
                  key={option}
                  className={selectedOption === option ? 'selected' : ''}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="next-button">
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        </div>
        <div className="question-navigator">
          {activeQuestions.map((_, i) => (
            <div
              key={i}
              className={`navigator-item ${i === currentQuestion ? 'active' : ''} ${answers[i] ? 'answered' : ''}`}
              onClick={() => handleQuestionSelect(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
