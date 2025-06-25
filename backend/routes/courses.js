// routes/courses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const Question = require('../models/questions');
const auth = require('../middleware/auth');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');

// GET /api/courses - fetch all courses (default + user-created)
// router.get('/quiz-list', async (req, res) => {
//   try {
//     const courses = await Course.find({isDefault: true, createdBy: req.params.user});
//     res.json(courses);
//   } catch (err) {
//     console.error('Error fetching courses:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
// GET /api/courses/quiz-list?userId=xxxx
router.get('/quiz-list', async (req, res) => {
  try {
    const { userId } = req.query;

    const courses = await Course.find({
      $or: [
        { isDefault: true },
        { createdBy: userId }
      ]
    });

    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Get all questions for a course
// router.get('/:course', async (req, res) => {
//   const { course } = req.params;
//   const decodedCourse = decodeURIComponent(course);

//   try {
//     console.log('Fetching questions for course:', decodedCourse);
    
//     // First check if the course exists
//     const courseExists = await Course.findOne({ 
//       $or: [
//         { name: decodedCourse },
//         { title: decodedCourse }
//       ]
//     });
    
//     if (!courseExists) {
//       console.log(`Course not found: ${decodedCourse}`);
//       return res.status(404).json({ 
//         message: `Course "${decodedCourse}" not found`,
//         error: 'Course not found'
//       });
//     }
    
//     // Find questions for the course
//     const questions = await Question.find({ 
//       $or: [
//         { course: decodedCourse },
//         { course: courseExists.name },
//         { course: courseExists.title }
//       ]
//     });
    
//     console.log(`Found ${questions.length} questions for course: ${decodedCourse}`);
    
//     if (questions.length === 0) {
//       return res.status(404).json({ 
//         message: `No questions found for course "${decodedCourse}"`,
//         error: 'No questions found'
//       });
//     }
    
//     res.status(200).json(questions);
//   } catch (err) {
//     console.error('Error fetching questions:', err);
//     res.status(500).json({ 
//       message: 'Server error', 
//       error: err.message 
//     });
//   }
// });
router.get('/:course', async (req, res) => {
  const { course } = req.params;
  const decodedCourse = decodeURIComponent(course);

  try {
    console.log('Fetching questions for course:', decodedCourse);
    
    // Try to find course by _id first, then name/title
    const courseDoc = await Course.findOne({
      $or: [
        { _id: decodedCourse }, // Lookup by ObjectId
      ]
    });

    if (!courseDoc) {
      console.log(`Course not found: ${decodedCourse}`);
      return res.status(404).json({
        message: `Course "${decodedCourse}" not found`,
        error: 'Course not found'
      });
    }

    // Get the questions for that course
    const questions = await Question.find({ course: courseDoc._id });

    res.json({
      course: courseDoc,
      questions
    });
  } catch (err) {
    console.error('Error fetching course questions:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Create a new quiz
router.post('/create', async (req, res) => {
  try {
    const { title, questions, user } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required.' });
    }

    // Create a new course
    const newCourse = new Course({
      title,
      isDefault: false,
      createdBy: user,
      createdByName: 'Anonymous'
    });

    await newCourse.save();

    // Format and save questions
    const formattedQuestions = questions.map((q) => {
      // Find the index of the correct answer in the options array
      const correctAnswerIndex = q.options.findIndex(opt => opt === q.correctAnswer);
      const correctAnswerId = String.fromCharCode(97 + correctAnswerIndex); // 'a', 'b', 'c', 'd'

      return {
        course: newCourse._id,
        text: q.question,
        options: q.options.map((opt, i) => ({
          id: String.fromCharCode(97 + i), // 'a', 'b', 'c', 'd'
          text: opt,
        })),
        correctAnswer: correctAnswerId, // Store the option ID instead of the text
      };
    });

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
router.post('/:course/submit', async (req, res) => {
  try {
    const { course } = req.params;
    const { answers, timeSpent, userId } = req.body;
    const decodedCourse = decodeURIComponent(course);

    // First try to find course by _id
    let courseFound = await Course.findOne({ _id: decodedCourse });
    
    // If not found by _id, try to find by name or title
    // if (!courseFound) {
    //   courseFound = await Course.findOne({
    //     $or: [
    //       { name: decodedCourse },
    //       { title: decodedCourse }
    //     ]
    //   });
    // }

    if (!courseFound) {
      return res.status(404).json({ message: 'Course not found' });
    }

    console.log('Submitting quiz for course:', courseFound._id);
    console.log('Answers:', answers);
    console.log('User ID:', userId);

    // Get questions for the course
    const questions = await Question.find({ course: courseFound._id });
    
    console.log('Found questions:', questions.length);

    if (questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this course' });
    }

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      // Skip if answer is null or undefined
      if (!answers[index]) return;
      
      // Compare the answer ID with the correct answer ID
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 40; // 40% passing threshold

    // Create quiz result with user ID
    const quizResult = new QuizResult({
      user: userId,
      course: courseFound._id, // Store the course ID instead of name
      courseName: courseFound.name,
      score,
      passed,
      answers,
      timeSpent: timeSpent || 0
    });

    await quizResult.save();

    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      // Initialize stats if they don't exist
      if (!user.stats) {
        user.stats = {
          quizzesPassed: 0,
          fastestTime: 0,
          correctAnswers: 0
        };
      }

      // Update stats
      if (passed) {
        user.stats.quizzesPassed += 1;
      }
      user.stats.correctAnswers += correctAnswers;
      
      // Update fastest time if this is faster or if no previous time
      if (!user.stats.fastestTime || timeSpent < user.stats.fastestTime) {
        user.stats.fastestTime = timeSpent;
      }

      await user.save();
      console.log('Updated user stats:', user.stats);
    }

    res.json({
      score,
      passed,
      correctAnswers,
      totalQuestions: questions.length,
      quizResultId: quizResult._id,
      updatedStats: user ? user.stats : null
    });
  } catch (err) {
    console.error('Error submitting quiz:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
