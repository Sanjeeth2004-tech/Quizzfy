const mongoose = require('mongoose');

console.log('Defining User schema...');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: 'Quiz enthusiast and knowledge seeker'
  },
  profilePic: {
    type: String,
    default: '/default-profile.jpg'
  },
  stats: {
    quizzesPassed: {
      type: Number,
      default: 0
    },
    fastestTime: {
      type: Number,
      default: 0 // in seconds
    },
    correctAnswers: {
      type: Number,
      default: 0
    }
  },
  
});

console.log('Creating User model...');
const User = mongoose.model('User', userSchema);
console.log('User model created successfully');

module.exports = User;
