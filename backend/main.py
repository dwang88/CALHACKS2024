from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
import json

app = Flask(__name__)
CORS(app)

uri = os.environ.get('MONGODB_URI')

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['TestDB']
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello from Flask!")

# Get all students
@app.route('/get_students', methods=['GET'])
def get_students():
    try:
        students = list(students_collection.find())
        for student in students:
            student['_id'] = str(student['_id'])
        return jsonify(students), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get all classes
@app.route('/get_classes', methods=['GET'])
def get_classes():
    try:
        classes = list(classes_collection.find())
        for class_ in classes:
            class_['_id'] = str(class_['_id'])
        return jsonify(classes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get all teachers
@app.route('/get_teachers', methods=['GET'])
def get_teachers():
    try:
        teachers = list(teachers_collection.find())
        for teacher in teachers:
            teacher['_id'] = str(teacher['_id'])
        return jsonify(teachers), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
