// models/Question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: false,
    default: null
  },
  text: {
    type: String,
    required: true
  },
  options: [
    {
      id: {
        type: String,
        required: true
      },
      text: {
        type: String,
        required: true
      }
    }
  ],
  correctAnswer: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('questions', questionSchema);
