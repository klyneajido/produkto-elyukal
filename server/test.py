from app.db.database import supabase_client
response = supabase_client.table("products").select("name, town(name)").eq("town.name", "San Juan").execute()
print(response.data)