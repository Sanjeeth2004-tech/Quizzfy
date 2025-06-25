// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: String, // For default courses
  title: String, // For user-created quizzes
  description: String,
  image: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdByName: {
    type: String,
    default: null // e.g., "John Doe"
  }
});

module.exports = mongoose.model('Course', courseSchema);
