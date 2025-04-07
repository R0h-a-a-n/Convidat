import dotenv from 'dotenv';

dotenv.config();

export const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MONGODB_URI = process.env.MONGODB_URI; 