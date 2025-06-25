// models/Question.js

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true
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
