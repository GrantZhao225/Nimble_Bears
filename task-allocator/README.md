# Task Allocator

A full-stack task management application with React frontend and Express backend.

## Project Structure

```
task-allocator/
├── frontend/          # React + Vite frontend application
│   ├── src/          # React components and pages
│   ├── public/       # Static assets
│   ├── index.html    # HTML entry point
│   ├── vite.config.js
│   └── package.json
├── backend/          # Express.js backend server
│   ├── server.js     # Main server file
│   └── package.json
└── package.json      # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database (connection string in backend/server.js)

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
npm install --workspace=frontend
```

3. Install backend dependencies:
```bash
npm install --workspace=backend
```

Or install all at once:
```bash
npm run install:all
```

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```

#### Option 2: Run separately

**Frontend only:**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

**Backend only:**
```bash
npm run dev:backend
# or
cd backend && npm run start
```

### Development

- **Frontend**: Runs on `http://localhost:5173`
- **Backend API**: Runs on `http://localhost:5001`

The frontend is configured to proxy API requests to the backend automatically.

### Building for Production

```bash
npm run build
```

This will build the frontend application in the `frontend/dist` directory.

## Features

- User authentication (Sign up / Login)
- Task management
- Project tracking
- Team chat with AI summarization
- File management
- Direct messaging

## Technologies

- **Frontend**: React 19, Vite, React Router
- **Backend**: Express.js, MongoDB (Mongoose), JWT authentication
- **AI**: Google Gemini AI for chat summarization
