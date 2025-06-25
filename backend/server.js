const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://quizapp:quizapp123@cluster0.mongodb.net/quiz-app?retryWrites=true&w=majority';

console.log('Attempting to connect to MongoDB...');

// Set up MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');

    // Create collections if they don't exist
    const collections = ['users', 'courses', 'questions', 'quizresults'];
    collections.forEach(async (collection) => {
      try {
        await mongoose.connection.createCollection(collection);
        console.log(`✅ Collection '${collection}' created or already exists`);
      } catch (error) {
        console.log(`ℹ️ Collection '${collection}' already exists`);
      }
    });

    // Log model information
    console.log('Available models:', Object.keys(mongoose.models));
    console.log('QuizResult model exists:', !!mongoose.models.QuizResult);  
    console.log('User model exists:', !!mongoose.models.User);

    // Check if collections exist
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
      } else {
        console.log('Available collections:', collections.map(c => c.name));
      }
    });

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('Error stack:', err.stack);
    process.exit(1); // Exit if cannot connect to database
  });

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const courseRoutes = require('./routes/courses');
app.use('/api/courses', courseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});
