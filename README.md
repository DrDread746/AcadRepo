# AcadRepo - Academic Resource Hub

A full-stack Learning Management System for managing academic resources.

## Project Structure

```
acadrepo/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── server/          # Express backend
    ├── index.js
    ├── db.js
    └── package.json
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (installed and running)

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE acadrepo;
```

2. Update `server/.env` with your database credentials:
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables

### Server (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=acadrepo
DB_USER=your_username
DB_PASSWORD=your_password
```

## API Endpoints

- `GET /api/health` - Health check endpoint

## Features

- Dark mode only UI
- Modern, minimal design
- React Router for navigation
- Express backend with PostgreSQL
- CORS enabled for frontend-backend communication
