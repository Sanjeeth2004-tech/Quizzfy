import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  FaUser,
  FaBookOpen,
  FaClock,
  FaCog,
  FaSignOutAlt,
  FaComments,
} from 'react-icons/fa';

import Home from './components/Home.jsx';
import Courses from './components/Courses.jsx';
import Profile from './components/Profile.jsx';
import Quiz from './components/Quiz.jsx';
import QuizHistory from './components/QuizHistory.jsx';
import QuizResults from './components/QuizResults.jsx';
import Settings from './components/Settings.jsx';
import Login from './components/Login.jsx';
import Signup from './components/Signup.jsx';
import CreateQuiz from './components/CreateQuiz.jsx';
import JoinTest from './components/JoinTest';
import ProtectedRoute from './components/ProtectedRoutes';
import Custom from './components/Custom.jsx';
import './index.css';
import './App.css';
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isQuizPage = /^\/quiz\/[^/]+$/.test(location.pathname); // /quiz/:course
  const isCustom = /^\/quiz-Custom\/[^/]+$/.test(location.pathname);
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleLogout = () => {
    // Clear all authentication-related data
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('userStats');
    navigate('/');
  };

  return (
    <div className="app-container">
      {!isHomePage && !isQuizPage && !isAuthPage &&  !isCustom &&(
        <nav className="sidebar">
          <div className="logo-container">
            <img src="/nlo.png" alt="Quizify Logo" className="logo" />
          </div>

          <ul>
            <li className={location.pathname === '/profile' ? 'active' : ''}>
              <Link to="/profile">
                <FaUser className="icon" /> Profile
              </Link>
            </li>
            <li className={location.pathname === '/courses' ? 'active' : ''}>
              <Link to="/courses">
                <FaBookOpen className="icon" /> Courses
              </Link>
            </li>
            <li className={location.pathname === '/quiz-history' ? 'active' : ''}>
              <Link to="/quiz-history">
                <FaClock className="icon" /> Quiz History
              </Link>
            </li>
            <li className={location.pathname === '/settings' ? 'active' : ''}>
              <Link to="/settings">
                <FaCog className="icon" /> Settings
              </Link>
            </li>
          </ul>

          <div className="support-logout">
            <div className="support" style={{ position: 'relative' }}>
              <img src="/supportrembg.png" alt="Support" className="support-image" />
              <button className="support-start-button">
                <FaComments style={{ marginRight: '6px' }} />
                Chat
              </button>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="icon" /> Log Out
            </button>
          </div>
        </nav>
      )}

      <div className={isHomePage || isQuizPage || isAuthPage || isCustom? 'full-content' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/quiz/:course" element={<Quiz />} />
          <Route path="/join-test" element={<JoinTest />} />
          <Route path="/quiz-Custom/:id" element={<Custom />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/quiz-history" element={
            <ProtectedRoute>
              <QuizHistory />
            </ProtectedRoute>
          } />
          <Route path="/quiz-history/:quizId" element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/create-quiz" element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
