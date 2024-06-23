from flask import Flask, request, jsonify
import pyrebase
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

app = Flask(__name__)

load_dotenv()

config = {
  "apiKey": os.getenv("FIREBASE_API_KEY"),
  "authDomain": "canvas-gpt.firebaseapp.com",
  "projectId": "canvas-gpt",
  "storageBucket": "canvas-gpt.appspot.com",
  "messagingSenderId": "244500042332",
  "appId": "1:244500042332:web:e96d6c28f4a2876a4ecc99",
  "measurementId": "G-9J6KVLJXMG"
}

firebase = pyrebase.initialize_app(config)
auth = firebase.auth()

uri = "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers"

client = MongoClient(uri, server_api=ServerApi('1'))

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/add_student', methods=['POST'])
def add_student():
    students_db = client['StudentInformation']
    students_collection = students_db['StudentInformation']
    try:
        student_data = request.get_json()

        result = students_collection.insert_one(student_data)

        return jsonify({"message": "Student added successfully!", "student_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    teacher_data = request.get_json()





    
# @app.route('/get_teacher', methods=['GET'])
# def get_teacher():
#     try:
#         teacher_data = collection.find_one({""})


if __name__ == '__main__':
    app.run(debug=True)