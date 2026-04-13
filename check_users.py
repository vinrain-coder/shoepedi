import os
from pymongo import MongoClient

uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/shoestar")
db_name = os.environ.get("MONGODB_DB", "shoestar")

client = MongoClient(
    uri,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000
)
db = client.get_database(db_name)
users = db.get_collection("users")

def redact_email(email):
    if not email:
        return "None"
    try:
        local, domain = email.split("@")
        return f"{local[0]}***@{domain}"
    except Exception:
        return "***@***"

def redact_id(val):
    if val is None:
        return "None"
    s = str(val)
    return f"...{s[-4:]}"

for user in users.find({}, {"email": 1, "id": 1, "_id": 1}).limit(5):
    r_id = redact_id(user.get("id"))
    r_oid = redact_id(user.get("_id"))
    r_email = redact_email(user.get("email"))
    print(f"ID: {r_id}, _id: {r_oid}, email: {r_email}")
