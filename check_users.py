import os
from pymongo import MongoClient

uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/shoestar")
client = MongoClient(uri)
db = client.get_database()
users = db.get_collection("users")

for user in users.find().limit(5):
    print(f"ID: {user.get('id')}, _id: {user.get('_id')}, email: {user.get('email')}")
