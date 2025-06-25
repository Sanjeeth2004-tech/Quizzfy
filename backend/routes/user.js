const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Question = require('../models/questions');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profilePic) user.profilePic = profilePic;

    await user.save();
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic,
        stats: user.stats
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's quiz history
router.get('/quiz-history', auth, async (req, res) => {
  try {
    console.log('Fetching quiz history for user:', req.user.id);
    
    // Find all quiz results for the current user
    const quizResults = await QuizResult.find({ user: req.user.id })
      .sort({ submittedAt: -1 }); // Sort by most recent first
    
    console.log('Found quiz results:', quizResults ? quizResults.length : 0);
    
    if (!quizResults || quizResults.length === 0) {
      console.log('No quiz results found, returning empty array');
      return res.json([]);
    }

    // Log the first quiz result for debugging
    if (quizResults.length > 0) {
      console.log('First quiz result:', {
        id: quizResults[0]._id,
        course: quizResults[0].course,
        score: quizResults[0].score,
        answersCount: quizResults[0].answers ? quizResults[0].answers.length : 0
      });
    }

    console.log('Returning quiz results');
    res.json(quizResults);
  } catch (err) {
    console.error('Get quiz history error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get individual quiz result
router.get('/quiz-history/:quizId', auth, async (req, res) => {
  try {
    const quizResult = await QuizResult.findOne({
      _id: req.params.quizId,
      user: req.user.id
    });

    if (!quizResult) {
      return res.status(404).json({ message: 'Quiz result not found' });
    }

    // Get the questions for this quiz
    const questions = await Question.find({ 
      $or: [
        { course: quizResult.course },
        { course: decodeURIComponent(quizResult.course) }
      ]
    });

    // Create a detailed response with questions and answers
    const detailedResult = {
      ...quizResult.toObject(),
      questions: questions.map((question, index) => ({
        question: question.text,
        options: question.options,
        userAnswer: quizResult.answers[index],  
        correctAnswer: question.correctAnswer,
        isCorrect: quizResult.answers[index] === question.correctAnswer
      }))
    };

    res.json(detailedResult);
  } catch (err) {
    console.error('Get quiz result error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route to check MongoDB connection
router.get('/test', async (req, res) => {
  try {
    console.log('Test route called');
    
    // Check if we can connect to MongoDB
    const dbStatus = mongoose.connection.readyState;
    console.log('MongoDB connection status:', dbStatus);
    
    // Check if we can query the User model
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);
    
    // Check if we can query the QuizResult model
    const quizResultCount = await QuizResult.countDocuments();
    console.log('QuizResult count:', quizResultCount);
    
    res.json({
      message: 'Test route successful',
      dbStatus,
      userCount,
      quizResultCount
    });
  } catch (err) {
    console.error('Test route error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 