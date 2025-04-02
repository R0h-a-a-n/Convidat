# Convidat - Sustainable Travel Platform

A microservices-based sustainable travel platform built with MERN stack (MongoDB, Express.js, React, Node.js).

## Project Structure

```
convidat/
├── services/
│   ├── auth-service/        # Authentication and user management
│   ├── travel-service/      # Travel booking and management
│   ├── carbon-service/      # Carbon footprint tracking
│   └── rewards-service/     # Gamification and rewards
└── frontend/                # React frontend application
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation & Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd convidat
```

2. Install dependencies:

For Auth Service:
```bash
cd services/auth-service
npm install
```

For Frontend:
```bash
cd frontend
npm install
```

3. Set up environment variables:

Create `.env` file in `services/auth-service`:
```
MONGODB_URI=mongodb://127.0.0.1:27017/convidat-auth
JWT_SECRET=your-secret-key
PORT=3001
```

## Running the Application

1. Start MongoDB:
- Windows: Start MongoDB service
- Mac: `brew services start mongodb-community`

2. Start Auth Service:
```bash
cd services/auth-service
npm run dev
```

3. Start Frontend:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Auth Service: http://localhost:3001

## Features

- User Authentication (Register/Login)
- JWT-based Authorization
- Protected Routes
- Modern UI with Material-UI
- Responsive Design

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 