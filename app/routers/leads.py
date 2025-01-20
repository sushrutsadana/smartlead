from fastapi import APIRouter, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from ..schemas.lead import LeadCreate, Activity
from ..services.lead_service import LeadService
from ..services.email_processor import EmailProcessor
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/leads", tags=["leads"])

@router.post("/")
async def create_lead(lead: LeadCreate):
    try:
        lead_record = await LeadService.create_lead(lead)
        return {"status": "success", "data": lead_record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{lead_id}/activities")
async def create_activity(lead_id: str, activity: Activity):
    try:
        # Convert activity to dict using dict() instead of model_dump()
        activity_data = activity.dict()
        activity_data["lead_id"] = lead_id
        # Convert datetime to ISO format string
        activity_data["activity_datetime"] = activity_data["activity_datetime"].isoformat()
        
        activity_record = await LeadService.log_activity(activity_data)
        return {"status": "success", "data": activity_record}
    except Exception as e:
        logger.error(f"Error in create_activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process-emails")
async def process_emails():
    try:
        processor = EmailProcessor()
        result = await processor.process_new_emails()
        return {"status": "success", "message": result}
    except Exception as e:
        logger.error(f"Error processing emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 