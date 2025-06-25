// routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Question = require('../models/questions');
const auth = require('../middleware/auth');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

// GET /api/courses - fetch all courses (default + user-created)
router.get('/quiz-list', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all questions for a course
router.get('/:course', async (req, res) => {
  const { course } = req.params;
  const decodedCourse = decodeURIComponent(course);

  try {
    console.log('Fetching questions for course:', decodedCourse);
    
    // First check if the course exists
    const courseExists = await Course.findOne({ 
      $or: [
        { name: decodedCourse },
        { title: decodedCourse }
      ]
    });
    
    if (!courseExists) {
      console.log(`Course not found: ${decodedCourse}`);
      return res.status(404).json({ 
        message: `Course "${decodedCourse}" not found`,
        error: 'Course not found'
      });
    }
    
    // Find questions for the course
    const questions = await Question.find({ 
      $or: [
        { course: decodedCourse },
        { course: courseExists.name },
        { course: courseExists.title }
      ]
    });
    
    console.log(`Found ${questions.length} questions for course: ${decodedCourse}`);
    
    if (questions.length === 0) {
      return res.status(404).json({ 
        message: `No questions found for course "${decodedCourse}"`,
        error: 'No questions found'
      });
    }
    
    res.status(200).json(questions);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
});

// Create a new quiz
router.post('/create', auth, async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required.' });
    }

    // Create a new course
    const newCourse = new Course({
      title,
      isDefault: false,
      createdBy: req.user.id,
      createdByName: req.user.username,
    });

    await newCourse.save();

    // Format and save questions
    const formattedQuestions = questions.map((q) => ({
      course: newCourse.title,
      text: q.question,
      options: q.options.map((opt, i) => ({
        id: String.fromCharCode(97 + i), // 'a', 'b', 'c', 'd'
        text: opt,
      })),
      correctAnswer: q.correctAnswer,
    }));

    await Question.insertMany(formattedQuestions);

    res.status(201).json({
      message: 'Quiz created successfully',
      course: newCourse,
    });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz answers
router.post('/:course/submit', auth, async (req, res) => {
  try {
    const { course } = req.params;
    const { answers } = req.body;
    const decodedCourse = decodeURIComponent(course);
    
    console.log('Submitting quiz for course:', decodedCourse);
    console.log('User:', req.user);
    console.log('Answers:', answers);

    // Get questions for the course
    const questions = await Question.find({ 
      $or: [
        { course: decodedCourse },
        { course: course }
      ]
    });
    
    console.log('Found questions:', questions.length);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      // Skip if answer is null or undefined
      if (!answers[index]) return;
      
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 40; // 40% passing threshold

    // Create quiz result
    const quizResult = new QuizResult({
      user: req.user.id,
      course: decodedCourse,
      score,
      passed,
      answers,
      timeSpent: req.body.timeSpent || 0
    });

    await quizResult.save();

    // Update user stats if passed
    if (passed) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.stats = user.stats || {};
        user.stats.quizzesPassed = (user.stats.quizzesPassed || 0) + 1;
        user.stats.correctAnswers = (user.stats.correctAnswers || 0) + correctAnswers;
        if (!user.stats.fastestTime || req.body.timeSpent < user.stats.fastestTime) {
          user.stats.fastestTime = req.body.timeSpent;
        }
        await user.save();
      }
    }

    res.json({
      score,
      passed,
      correctAnswers,
      totalQuestions: questions.length,
      quizResultId: quizResult._id
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard for a course
router.get('/:course/leaderboard', auth, async (req, res) => {
  try {
    const { course } = req.params;
    const decodedCourse = decodeURIComponent(course);

    const leaderboard = await QuizResult.find({ course: decodedCourse })
      .sort({ score: -1, timeSpent: 1 })
      .populate('user', 'username')
      .limit(10);

    res.json(leaderboard);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
