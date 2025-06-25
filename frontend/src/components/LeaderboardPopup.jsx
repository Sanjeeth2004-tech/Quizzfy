// import React, { useState } from 'react';
// import '../styles/LeaderboardPopup.css';

// function LeaderboardPopup({ onClose, leaderboard, quizQuestions }) {
//   const [viewAnswersIndex, setViewAnswersIndex] = useState(null);

//   const handleViewAnswers = (index) => {
//     setViewAnswersIndex(index);
//   };

//   const handleBack = () => {
//     setViewAnswersIndex(null);
//   };

//   return (
//     <div className="leaderboard-overlay">
//       <div className="leaderboard-modal">
//         <button className="close-leaderboard" onClick={onClose}>×</button>

//         {!viewAnswersIndex && viewAnswersIndex !== 0 ? (
//           <>
//             <h2 className="leaderboard-heading">Leaderboard</h2>
//             <div className="leaderboard-table">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Participant</th>
//                     <th>Score</th>
//                     <th>Time Taken</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {leaderboard.map((entry, index) => (
//                     <tr key={index}>
//                       <td>{entry.name}</td>
//                       <td>{entry.score}</td>
//                       <td>{entry.time}</td>
//                       <td>
//                         <button className="view-btn" onClick={() => handleViewAnswers(index)}>
//                           View
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </>
//         ) : (
//           <div className="review-section">
//             <h3>Quiz Review - {leaderboard[viewAnswersIndex].name}</h3>
//             {quizQuestions.map((q, i) => (
//               <div key={i} className="review-question">
//                 <p><strong>Q{i + 1}:</strong> {q.question}</p>
//                 <p>Your Answer: <span className={leaderboard[viewAnswersIndex].answers[i] === q.correctAnswer ? 'correct' : 'wrong'}>{leaderboard[viewAnswersIndex].answers[i]}</span></p>
//                 <p>Correct Answer: <span className="correct">{q.correctAnswer}</span></p>
//               </div>
//             ))}
//             <button className="back-button" onClick={handleBack}>Back</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default LeaderboardPopup;
import React, { useState } from 'react';
import '../styles/LeaderboardPopup.css';

function LeaderboardPopup({ onClose, leaderboard, quizQuestions }) {
  const [viewAnswersIndex, setViewAnswersIndex] = useState(null);

  const handleViewAnswers = (index) => {
    setViewAnswersIndex(index);
  };

  const handleBack = () => {
    setViewAnswersIndex(null);
  };

  return (
    <div className="leaderboard-overlay">
      <div className="leaderboard-modal">
        <button className="close-leaderboard" onClick={onClose}>×</button>

        {viewAnswersIndex === null ? (
          <>
            <h2 className="leaderboard-heading">Leaderboard</h2>
            <div className="leaderboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Score</th>
                    <th>Time Taken (min)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.name}</td>
                      <td>{entry.score}</td>
                      <td>{entry.time}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => handleViewAnswers(index)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="review-section">
            <h3>
              Quiz Review - <span style={{ color: '#1935CA' }}>{leaderboard[viewAnswersIndex].name}</span>
            </h3>
            {quizQuestions.map((q, i) => {
              const userAnswer = leaderboard[viewAnswersIndex].answers[i];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div key={i} className="review-question">
                  <p><strong>Q{i + 1}:</strong> {q.question}</p>
                  <p>
                    Your Answer:{' '}
                    <span className={isCorrect ? 'correct' : 'wrong'}>
                      {userAnswer || 'No Answer'}
                    </span>
                  </p>
                  <p>
                    Correct Answer:{' '}
                    <span className="correct">{q.correctAnswer}</span>
                  </p>
                </div>
              );
            })}
            <button className="back-button" onClick={handleBack}>
              Back to Leaderboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeaderboardPopup;
