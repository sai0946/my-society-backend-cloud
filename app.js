require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/societies', require('./routes/society'));
app.use('/api/pending-users', require('./routes/pendingUsers'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/complaints', require('./routes/complaints'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 