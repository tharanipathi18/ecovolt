from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predictions, recommendations
from app.core.config import settings

app = FastAPI(
    title="EcoVolt AI Service",
    description="AI-powered microservices for renewable energy coordination, demand forecasting, battery health, predictive maintenance, and smart charging recommendations.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router mounting
app.include_router(predictions.router, prefix="/api/v1/predict", tags=["AI Predictions"])
app.include_router(recommendations.router, prefix="/api/v1/recommend", tags=["AI Recommendations"])

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }
