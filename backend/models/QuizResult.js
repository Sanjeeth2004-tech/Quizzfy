const mongoose = require('mongoose');

console.log('Defining QuizResult schema...');

const quizResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: {
    type: [String],
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

quizResultSchema.pre('save', function(next) {
  console.log('Saving quiz result:', {
    user: this.user,
    course: this.course,
    score: this.score,
    answersCount: this.answers ? this.answers.length : 0
  });
  next();
});

console.log('Creating QuizResult model...');
const QuizResult = mongoose.model('QuizResult', quizResultSchema);
console.log('QuizResult model created successfully');

module.exports = QuizResult; 