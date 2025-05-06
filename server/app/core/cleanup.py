# cleanup.py
from datetime import datetime, timedelta
import logging
from db.database import supabase_client

logger = logging.getLogger(__name__)

async def cleanup_unverified_users():
    """
    Delete unverified users and their verification codes after 7 days
    """
    try:
        # Calculate cutoff date (7 days ago)
        cutoff_date = (datetime.utcnow() - timedelta(days=7)).isoformat()
        
        # Get unverified users created before cutoff date
        response = supabase_client.table("users").select("email").eq("is_verified", False).lt("created_at", cutoff_date).execute()
        
        if not response.data or len(response.data) == 0:
            logger.info("No unverified users to clean up")
            return
            
        # Get emails of users to delete
        emails = [user["email"] for user in response.data]
        logger.info(f"Cleaning up {len(emails)} unverified users")
        
        # Delete verification codes
        supabase_client.table("email_verification").delete().in_("email", emails).execute()
        
        # Delete users
        supabase_client.table("users").delete().in_("email", emails).execute()
        
        logger.info(f"Successfully cleaned up {len(emails)} unverified users")
    except Exception as e:
        logger.error(f"Error cleaning up unverified users: {str(e)}")