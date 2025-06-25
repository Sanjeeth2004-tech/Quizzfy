import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateQuiz.css';

function CreateQuiz() {
  const [quizName, setQuizName] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const [quizCreated, setQuizCreated] = useState(false);
  const [error, setError] = useState('');
  const questionRefs = useRef([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const handleQuizNameChange = (e) => {
    setQuizName(e.target.value);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, e) => {
    const updated = [...questions];
    updated[index].question = e.target.value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = e.target.value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, e) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = e.target.value;
    setQuestions(updated);
  };

  const handleOptionCountChange = (qIndex, e) => {
    const count = parseInt(e.target.value, 10);
    const updated = [...questions];
    let options = [...updated[qIndex].options];

    options = options.slice(0, count);
    while (options.length < count) options.push('');

    updated[qIndex].options = options;
    setQuestions(updated);
  };

  const handleSubmitQuiz = async () => {
    if (!quizName) {
      setError('Please enter a quiz name!');
      return;
    }

    // Validate questions
    const invalidQuestions = questions.some(q => 
      !q.question || 
      q.options.some(opt => !opt) || 
      !q.correctAnswer
    );

    if (invalidQuestions) {
      setError('Please fill in all questions, options, and select correct answers!');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/courses/create',
        {
          title: quizName,
          questions: questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
          })),
          user: user.id
        }
      );

      setQuizCreated(true);
      setTimeout(() => navigate('/courses'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz. Please try again.');
      console.error('Error creating quiz:', err);
    }
  };

  const scrollToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="create-quiz-container">
      {!quizCreated ? (
        <>
          <div className="quiz-name-section">
            <h2>Enter Quiz Name</h2>
            <input
              type="text"
              value={quizName}
              onChange={handleQuizNameChange}
              placeholder="Enter quiz name"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="questions-section">
            <h3>Questions</h3>
            {questions.map((question, index) => (
              <div
                key={index}
                className="question-card"
                ref={(el) => (questionRefs.current[index] = el)}
              >
                <h4>Question {index + 1}</h4>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(index, e)}
                  placeholder="Enter your question"
                />

                <div className="options-section">
                  <label>
                    Select Number of Options:
                    <select
                      value={question.options.length}
                      onChange={(e) => handleOptionCountChange(index, e)}
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </label>

                  {question.options.map((option, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, oIndex, e)}
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  ))}
                </div>

                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleCorrectAnswerChange(index, e)}
                >
                  <option value="">Select Correct Answer</option>
                  {question.options.map((option, oIndex) => (
                    <option key={oIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <button
                  className="delete-question-btn"
                  onClick={() => removeQuestion(index)}
                >
                  Delete Question
                </button>
              </div>
            ))}

            <button onClick={addQuestion}>+ Add Question</button>
          </div>

          <button onClick={handleSubmitQuiz} className="submit-quiz-btn">
            Create Quiz
          </button>

          <div className="question-navigator">
            <div className="navigator-list">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToQuestion(index)}
                  className="navigator-item"
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="quiz-created-message">
          <h2>Quiz Created!</h2>
          <p>
            Your quiz has been successfully created with {questions.length} questions and added to the courses page.
          </p>
        </div>
      )}
    </div>
  );
}

export default CreateQuiz;
