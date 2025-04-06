import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3008;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Destination service running on port ${PORT}`);
      console.log('Available endpoints:');
      console.log(`- GET /api/destinations/search?city=Chennai&country=India`);
      console.log(`- GET /api/destinations/:id`);
      console.log(`- GET /api/destinations/nearby?lat=13.0827&lng=80.2707&radius=5000`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  }); 