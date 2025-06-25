const User = require('../models/User');
const bcrypt = require('bcryptjs');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    
    const userEmail = req.headers['x-user-email'];
    const userPassword = req.headers['x-user-password'];
    
    console.log('Auth headers:', {
      'x-user-email': userEmail ? 'present' : 'missing',
      'x-user-password': userPassword ? 'present' : 'missing'
    });

    if (!userEmail || !userPassword) {
      console.log('Missing credentials');
      return res.status(401).json({ message: 'Authentication required' });
    }

    console.log('Looking up user with email:', userEmail);
    const user = await User.findOne({ email: userEmail });
    console.log('User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Comparing passwords');
    const isMatch = await bcrypt.compare(userPassword, user.password);
    console.log('Password match:', isMatch ? 'yes' : 'no');
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Add user to request object
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    
    console.log('Authentication successful, user ID:', user._id);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = auth; 