require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3007;

// Connect to MongoDB
connectDB().then(() => {
  // Start server
  app.listen(PORT, () => {
    console.log(`Review service running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}`);
    console.log(`Health check at http://localhost:${PORT}/health`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
}); 