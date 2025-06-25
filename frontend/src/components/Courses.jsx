// import { useEffect, useState } from 'react';
// import '../styles/Courses.css';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { FiClipboard, FiTrash2 } from 'react-icons/fi';
// import axios from 'axios';

// function Courses() {
//   const [courses, setCourses] = useState([]);
//   const [selectedQuiz, setSelectedQuiz] = useState(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, quiz: null });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [defaultCourses, setDefaultCourses] = useState([]);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const user = JSON.parse(localStorage.getItem('user'));
//   console.log(user.id);
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         setLoading(true);
//         setError('');
  
//         const response = await axios.get('http://localhost:5000/api/courses/quiz-list', {
//           params: {
//             userId: user.id
//           }
//         });
// console.log(response.data);
//         const fetchedCourses = response.data.map(course => ({
//           name: course.name || course.title || 'Unnamed Course',
//           description: course.description || `Custom Quiz created by a ${course.createdByName || 'user'}`,
//           image: course.image || '/groupq.jpg',
//           code: course._id,
//           isDefault: course.isDefault
//         }));
  
//         const localCustom = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
//         const formattedLocalCustom = localCustom.reverse().map(quiz => ({
//           ...quiz,
//           image: '/groupq.jpg',
//           isCustom: true,
//           creator: 'me'
//         }));
  
//         // ✅ Save defaultCourses for future reference
//         setCourses([...formattedLocalCustom, ...fetchedCourses]);
//         setDefaultCourses(fetchedCourses); // <-- new state
  
//         if (location.state?.reopenPopupFor) {
//           const quizToOpen = formattedLocalCustom.find(q => q.name === location.state.reopenPopupFor);
//           if (quizToOpen) {
//             setSelectedQuiz(quizToOpen);
//             setShowPopup(true);
//           }
//         }
  
//       } catch (err) {
//         setError('Failed to load courses. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
  
//     fetchCourses();
//   }, [location.state]);
  
//   if (loading) return <div className="loading">Loading courses...</div>;
//   if (error) return <div className="error-message">{error}</div>;

//   const handleClick = (course) => {
//     if (course.isCustom && course.creator === 'me') {
//       setSelectedQuiz(course);
//       setShowPopup(true);
//     } else {
//       navigate(`/quiz/${course.name}`, {
//         state: course.code ? { isCustom: true, code: course.code } : {}
//       });
//     }
//   };

//   const handleRightClick = (e, course) => {
//     e.preventDefault();
//     if (course.isCustom && course.creator === 'me') {
//       setContextMenu({ visible: true, x: e.pageX, y: e.pageY, quiz: course });
//     }
    
//   };

//   const handleDelete = () => {
//     const quizToDelete = contextMenu.quiz;
//     const existing = JSON.parse(localStorage.getItem('customQuizzes') || '[]');
//     const updated = existing.filter(q => q.name !== quizToDelete.name);
//     localStorage.setItem('customQuizzes', JSON.stringify(updated));
//     setContextMenu({ ...contextMenu, visible: false });

//     const formatted = updated
//       .slice()
//       .reverse()
//       .map((quiz) => ({
//         ...quiz,
//         image: '/groupq.jpg',
//         isCustom: true,
//         creator: 'me'
//       }));
//     setCourses([...formatted, ...defaultCourses]);
//   };

//   const getAttempts = (quizName) => {
//     const allAttempts = JSON.parse(localStorage.getItem('customQuizAttempts') || '{}');
//     return allAttempts[quizName] || [];
//   };

//   const copyToClipboard = (text) => {
//     if (navigator.clipboard && window.isSecureContext) {
//       navigator.clipboard.writeText(text).then(() => {
//         alert('Quiz code copied!');
//       }, (err) => {
//         console.error('Clipboard copy failed: ', err);
//       });
//     } else {
//       const textarea = document.createElement("textarea");
//       textarea.value = text;
//       textarea.style.position = "fixed";
//       document.body.appendChild(textarea);
//       textarea.focus();
//       textarea.select();
//       try {
//         document.execCommand('copy');
//         alert('Quiz code copied!');
//       } catch (err) {
//         console.error('Fallback copy failed: ', err);
//       }
//       document.body.removeChild(textarea);
//     }
//   };

//   return (
//     <div className="courses" onClick={() => setContextMenu({ visible: false })}>
//       <h2>Courses</h2>
//       <div className="course-list">
//         {courses.map((course) => (
//           <div
//             key={course.name}
//             className="course-card"
//             onClick={() => handleClick(course)}
//             onContextMenu={(e) => handleRightClick(e, course)}
//           >
//             <img src={course.image} alt={course.name} className="course-image" />
//             <div className="course-content">
//               <h3>{course.name}</h3>
//               <p>{course.description || 'Custom Quiz created by a user.'}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Right-click context menu */}
//       {contextMenu.visible && (
//         <div
//           className="custom-context-menu"
//           style={{
//             top: contextMenu.y,
//             left: contextMenu.x,
//             position: 'absolute',
//             background: '#fff',
//             padding: '10px',
//             borderRadius: '6px',
//             boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
//             zIndex: 999
//           }}
//         >
//           <div
//             onClick={handleDelete}
//             style={{ cursor: 'pointer', color: 'red', display: 'flex', alignItems: 'center' }}
//           >
//             <FiTrash2 style={{ marginRight: '8px' }} /> Delete Quiz
//           </div>
//         </div>
//       )}

//       {/* Quiz popup for creators */}
//       {showPopup && selectedQuiz && (
//         <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
//           <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
//             <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
//             <h2>Quiz: {selectedQuiz.name}</h2>

//             <div className="invite-section">
//               <label>Quiz Code:</label>
//               <div className="copy-code">
//                 <input value={selectedQuiz.code} readOnly />
//                 <FiClipboard
//                   className="copy-icon"
//                   onClick={() => copyToClipboard(selectedQuiz.code)}
//                   title="Copy Code"
//                 />
//               </div>
//             </div>

//             <h3>Leaderboard</h3>
//             <div className="leaderboard">
//               {getAttempts(selectedQuiz.name).length === 0 ? (
//                 <p style={{ fontStyle: 'italic', color: '#888' }}>No one has taken this quiz yet.</p>
//               ) : (
//                 getAttempts(selectedQuiz.name).map((entry, index) => {
//                   const correct = entry.answers.filter((ans, i) =>
//                     ans === selectedQuiz.questions[i].correctAnswer
//                   ).length;

//                   return (
//                     <div key={index} className="leaderboard-entry">
//                       <p><strong>Participant:</strong> {entry.name || 'Anonymous'}</p>
//                       <p><strong>Score:</strong> {correct}/{selectedQuiz.questions.length}</p>
//                       <p><strong>Time Taken:</strong> {entry.timeTaken || 'N/A'}</p>
//                       <div className="qa-review">
//                         {selectedQuiz.questions.map((q, i) => (
//                           <div key={i} className="review-question">
//                             <p><strong>Q{i + 1}:</strong> {q.question}</p>
//                             <p>
//                               Answered:{' '}
//                               <span style={{ color: entry.answers[i] === q.correctAnswer ? 'green' : 'red' }}>
//                                 {entry.answers[i] || '—'}
//                               </span>
//                             </p>
//                             <p>
//                               Correct Answer: <span style={{ color: 'green' }}>{q.correctAnswer}</span>
//                             </p>
//                             <hr />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//             <button
//               className="review-btn"
//               onClick={() =>
//                 navigate('/custom-quiz-review', {
//                   state: {
//                     course: selectedQuiz.name,
//                     questions: selectedQuiz.questions
//                   }
//                 })
//               }
//             >
//               Review Quiz
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default Courses;
import { useEffect, useState } from 'react';
import '../styles/Courses.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

function Courses() {
  const [defaultCourses, setDefaultCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, quiz: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get('http://localhost:5000/api/courses/quiz-list', {
          params: { userId: user.id }
        });

        const fetchedCourses = response.data.map(course => ({
          name: course.name || course.title || 'Unnamed Course',
          description: course.description || `Custom Quiz created by ${course.createdByName || 'a user'}`,
          image: course.image || '/groupq.jpg',
          code: course._id,
          isDefault: course.isDefault,
          createdBy: course.createdBy,
          questions: course.questions || []
        }));

        setDefaultCourses(fetchedCourses.filter(course => course.isDefault));
        setUserCourses(fetchedCourses.filter(course => !course.isDefault && course.createdBy === user.id));

        if (location.state?.reopenPopupFor) {
          const quizToOpen = fetchedCourses.find(q => q.name === location.state.reopenPopupFor);
          if (quizToOpen) {
            setSelectedQuiz(quizToOpen);
            setShowPopup(true);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [location.state, user.id]);

  const handleClick = (course) => {
    if (!course.isDefault && course.createdBy === user.id) {
      setSelectedQuiz(course);
      setShowPopup(true);
    } else {
      navigate(`/quiz/${course.code}`, {
        state: { isCustom: !course.isDefault, code: course.code }
      });
      console.log(course.id);
    }
  };

  const handleRightClick = (e, course) => {
    e.preventDefault();
    if (!course.isDefault && course.createdBy === user.id) {
      setContextMenu({ visible: true, x: e.pageX, y: e.pageY, quiz: course });
    }
  };

  const handleDelete = async () => {
    const quizToDelete = contextMenu.quiz;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${quizToDelete.code}`);
      setUserCourses(prev => prev.filter(q => q.code !== quizToDelete.code));
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      alert('Error deleting quiz.');
    } finally {
      setContextMenu({ visible: false, x: 0, y: 0, quiz: null });
    }
  };

  const getAttempts = (quizName) => {
    const allAttempts = JSON.parse(localStorage.getItem('customQuizAttempts') || '{}');
    return allAttempts[quizName] || [];
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => alert('Quiz code copied!'));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Quiz code copied!');
    }
  };

  if (loading) return <div className="loading">Loading courses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="courses" onClick={() => setContextMenu({ ...contextMenu, visible: false })}>
      <h2>Courses</h2>

      {/* Default Courses Section */}
      <h3 className="section-heading">Default Courses</h3>
      <div className="course-list">
        {defaultCourses.map(course => (
          <div
            key={course.code}
            className="course-card"
            onClick={() => handleClick(course)}
          >
            <img src={course.image} alt={course.name} className="course-image" />
            <div className="course-content">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User Created Quizzes Section */}
      <h3 className="section-heading">Your Quizzes</h3>
      <div className="course-list">
        {userCourses.map(course => (
          <div
            key={course.code}
            className="course-card"
            onClick={() => handleClick(course)}
            onContextMenu={(e) => handleRightClick(e, course)}
          >
            <img src={course.image} alt={course.name} className="course-image" />
            <div className="course-content">
              <h3>{course.name}</h3>
              <p>{course.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="custom-context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'absolute',
            background: '#fff',
            padding: '10px',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            zIndex: 999
          }}
        >
          <div
            onClick={handleDelete}
            style={{ cursor: 'pointer', color: 'red', display: 'flex', alignItems: 'center' }}
          >
            <FiTrash2 style={{ marginRight: '8px' }} /> Delete Quiz
          </div>
        </div>
      )}

      {/* Quiz Popup */}
      {showPopup && selectedQuiz && (
        <div className="quiz-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h2>Quiz: {selectedQuiz.name}</h2>

            <div className="invite-section">
              <label>Quiz Code:</label>
              <div className="copy-code">
                <input value={selectedQuiz.code} readOnly />
                <FiClipboard
                  className="copy-icon"
                  onClick={() => copyToClipboard(selectedQuiz.code)}
                  title="Copy Code"
                />
              </div>
            </div>

            <h3>Leaderboard</h3>
            <div className="leaderboard">
              {getAttempts(selectedQuiz.name).length === 0 ? (
                <p style={{ fontStyle: 'italic', color: '#888' }}>No one has taken this quiz yet.</p>
              ) : (
                getAttempts(selectedQuiz.name).map((entry, index) => {
                  const correct = entry.answers.filter((ans, i) =>
                    ans === selectedQuiz.questions[i].correctAnswer
                  ).length;

                  return (
                    <div key={index} className="leaderboard-entry">
                      <p><strong>Participant:</strong> {entry.name || 'Anonymous'}</p>
                      <p><strong>Score:</strong> {correct}/{selectedQuiz.questions.length}</p>
                      <p><strong>Time Taken:</strong> {entry.timeTaken || 'N/A'}</p>
                      <div className="qa-review">
                        {selectedQuiz.questions.map((q, i) => (
                          <div key={i} className="review-question">
                            <p><strong>Q{i + 1}:</strong> {q.question}</p>
                            <p>
                              Answered:{' '}
                              <span style={{ color: entry.answers[i] === q.correctAnswer ? 'green' : 'red' }}>
                                {entry.answers[i] || '—'}
                              </span>
                            </p>
                            <p>
                              Correct Answer: <span style={{ color: 'green' }}>{q.correctAnswer}</span>
                            </p>
                            <hr />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              className="review-btn"
              onClick={() =>
                navigate('/custom-quiz-review', {
                  state: {
                    course: selectedQuiz.name,
                    questions: selectedQuiz.questions
                  }
                })
              }
            >
              Review Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
