import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaKeyboard } from 'react-icons/fa';
import '../styles/JoinTest.css';

function JoinTest() {
  const navigate = useNavigate();
  const [testCode, setTestCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testCode.trim()) {
      setError('Please enter a test code');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const quizzes = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
      const foundQuiz = quizzes.find(q => q.code === testCode.trim());

      if (!foundQuiz) {
        setError('Invalid test code. Please try again.');
        setIsLoading(false);
        return;
      }

      navigate(`/quiz/${encodeURIComponent(foundQuiz.name)}`, {
        state: {
          isCustom: true,
          joinMode: true,
          code: foundQuiz.code,
          questions: foundQuiz.questions,
        }
      });
    }, 800);
  };

  return (
    <div className="join-test-container">
      <div className="join-test-image-section">
        <img src="/test.png" alt="Join Test Illustration" className="full-page-image" />
      </div>
      <div className="join-test-content">
        <div className="join-test-header">
          <div className="join-test-icon">
            <FaKeyboard />
          </div>
          <h1>Join a Test</h1>
          <p className="subtitle">Enter the test code provided by your instructor</p>
        </div>

        <form onSubmit={handleSubmit} className="join-test-form">
          <div className="form-group">
            <label htmlFor="testCode">Test Code</label>
            <div className="input-container">
              <input
                type="text"
                id="testCode"
                value={testCode}
                onChange={(e) => {
                  setTestCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter test code (e.g., ABC123)"
                className={error ? 'error' : ''}
                autoFocus
              />
              {isLoading && <div className="loading-spinner"></div>}
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>

          <button type="submit" className="join-button" disabled={isLoading}>
            {isLoading ? 'Joining...' : 'Join Test'}
          </button>
        </form>

        <div className="join-test-footer">
          <p>Need help? <a href="#">Contact support</a></p>
        </div>
      </div>
    </div>
  );
}

export default JoinTest;
