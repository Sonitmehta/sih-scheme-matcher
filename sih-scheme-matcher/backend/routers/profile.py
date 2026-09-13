"""
Profile router — POST /api/profile
Accepts user profile and returns a session profile_id.
"""

import uuid
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()

# In-memory session store (MVP — no DB persistence)
_sessions: dict = {}


class UserProfile(BaseModel):
    category: str = Field(..., description="General/SC/ST/OBC/Women/Minority/PwD")
    state: str = Field(..., description="Indian state name")
    district: Optional[str] = Field(None, description="District name")
    sector: str = Field(..., description="e.g. Manufacturing, Services, Handicrafts")
    business_stage: str = Field(..., description="idea/early/existing")
    funding_need: Optional[int] = Field(None, description="Approximate funding needed in INR")
    annual_income: Optional[int] = Field(None, description="Annual family income in INR")
    age: Optional[int] = Field(None, description="Age of applicant")
    business_description: Optional[str] = Field(None, description="Free-text business description")


@router.post("/profile")
async def create_profile(profile: UserProfile):
    """Create a session-based user profile and return a profile_id."""
    profile_id = str(uuid.uuid4())
    _sessions[profile_id] = profile.model_dump()
    return {
        "profile_id": profile_id,
        "profile": profile.model_dump(),
        "message": "Profile created successfully"
    }


def get_profile(profile_id: str) -> Optional[dict]:
    """Retrieve a profile by ID (used by other routers)."""
    return _sessions.get(profile_id)
