const express = require('express');
const app = express();
const malaysianRoutes = require('./routes/malaysianRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/malaysian', malaysianRoutes);

// ... rest of the file ... 