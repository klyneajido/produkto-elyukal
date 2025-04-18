#db/database.py
from supabase import create_client, Client
from core.config import settings

supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
