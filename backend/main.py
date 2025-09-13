from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(
    title="RichardsDECENTRATON API",
    description="Backend API for Team Richards Decentrathon 2025 - Privacy-First Geotrack Analytics",
    version="1.0.0"
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "RichardsDECENTRATON API is running",
        "team": "Team Richards",
        "project": "Privacy-First Geotrack Analytics",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "RichardsDECENTRATON API"}

@app.get("/api/team")
async def get_team_info():
    """Get team information"""
    return {
        "team_name": "Team Richards",
        "hackathon": "Decentrathon 2025",
        "project": "Privacy-First Geotrack Analytics",
        "focus": "Advanced anonymization methods for mobility pattern analysis",
        "privacy_first": True
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)