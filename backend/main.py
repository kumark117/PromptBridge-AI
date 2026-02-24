"""
Pilot Premnath: CoPilot - FastAPI Backend
Simple, production-ready AI backend using OpenAI gpt-4o-mini
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from openai import OpenAI, APIError
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Pilot Premnath: CoPilot",
    description="Minimal AI backend powered by OpenAI",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

client = OpenAI(api_key=api_key)


# Pydantic Models
class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000, description="User prompt text")


class AIResponse(BaseModel):
    result: str


# Routes
@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Pilot Premnath: CoPilot is running"}


@app.post("/generate", response_model=AIResponse, tags=["AI"])
def generate(request: PromptRequest):
    """
    Generate AI response from user prompt
    
    Args:
        request: PromptRequest with 'prompt' field
        
    Returns:
        AIResponse with 'result' field containing AI response
        
    Raises:
        HTTPException 400: If prompt is empty
        HTTPException 500: If OpenAI API call fails
    """
    
    # Validate prompt
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Extract response
        ai_response = response.choices[0].message.content
        
        return AIResponse(result=ai_response)
    
    except APIError as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
