// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authenticateUser = async (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   if (!authHeader) return res.status(401).json({ message: 'No token provided' });

//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, 'Quiz');
//     console.log(decoded);
//     req.user = await User.findById(decoded.id).select('-password');
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// module.exports = { authenticateUser };

// middlewares/authMiddleware.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const authMiddleware = async (req, res, next) => {
  const { email, password } = req.body;

  // If no email or password, continue without user info
  if (!email || !password) {
    console.log('No email or password provided, proceeding without authentication');
    req.user = null;
    return next();
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found, proceeding without user info');
      req.user = null;
      return next();
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log('Invalid password, proceeding without user info');
      req.user = null;
      return next();
    }
    
    // Attach user data to request object (excluding password)
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      profilePic: user.profilePic || '/default-profile.jpg',
      stats: user.stats || {
        quizzesPassed: 0,
        fastestTime: 0,
        correctAnswers: 0
      }
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    // Continue without user info if authentication fails
    req.user = null;
    next();
  }
};

module.exports = authMiddleware;
