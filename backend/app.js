const express = require('express');
const app = express();
const cron = require('node-cron');
const subscriptionController = require('./controllers/subscriptionController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const charityRoutes = require('./routes/charityRoutes');
const taskRoutes = require('./routes/taskRoutes');
const donationRoutes = require('./routes/donationRoutes');
const malaysianRoutes = require('./routes/malaysianRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/malaysian', malaysianRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Set up cron job to process recurring payments daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily subscription payment processing...');
  subscriptionController.processRecurringPayments();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

module.exports = app;