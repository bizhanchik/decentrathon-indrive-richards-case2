# RichardsDECENTRATON Backend

FastAPI backend for Team Richards Decentrathon 2025 - Privacy-First Geotrack Analytics.

## Setup

### Prerequisites
- Python 3.8+
- pip

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Server

Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Core Endpoints
- `GET /` - Root endpoint and health check
- `GET /api/health` - Health check endpoint
- `GET /api/team` - Team information
- `GET /api/solution` - Solution overview
- `GET /api/analytics` - Mock analytics data

### CORS Configuration
The API is configured to accept requests from:
- http://localhost:5173 (Vite default)
- http://localhost:5174 (Vite alternate)
- http://localhost:3000 (React/Next.js default)

## Development

The server runs with hot reload enabled. Changes to Python files will automatically restart the server.

## Project Structure
```
backend/
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Features

### Privacy-First Architecture
- CORS configured for secure cross-origin requests
- Structured API responses
- Health monitoring endpoints
- Mock data for analytics demonstration

### Team Richards Integration
- Endpoints tailored for hackathon project
- Analytics data structure for geotrack processing
- Team and solution information APIs