<<<<<<< HEAD
from flask import Flask, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

app = Flask(__name__)

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
=======
from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

app = Flask(__name__)
CORS(app)

uri = os.getenv("DB_URL")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['TestDB']
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/add_student', methods=['POST'])
def add_student():
    try:
        student_data = request.get_json()

        result = students_collection.insert_one(student_data)

        return jsonify({"message": "Student added successfully!", "student_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    try:
        teacher_data = request.get_json()

        result = teachers_collection.insert_one(teacher_data)

        return jsonify({"message": "Teacher added successfully!", "teacher_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add_class', methods=['PATCH'])
def add_class():
    try:
        class_data = request.get_json()
        teacher_id = ObjectId(class_data['teacher_id'])
        class_name = class_data['class_name']

        teacher = teachers_collection.find_one({"_id": teacher_id})
        if not teacher:
            return jsonify({"error": "Student not found."}), 404

        result = teachers_collection.update_one(
            {"_id": teacher_id},
            {"$push": {"classes": {
                "name": class_name,
                "report": "N/A",
                "students": []
            }}}
        )

        if result.modified_count == 1:
            return jsonify({"message": "Class added successfully!"}), 201
        else:
            return jsonify({"error": "Failed to add class."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/enroll_student', methods=['PATCH'])
def add_student_to_class():
    try:
        data = request.get_json()

        # frontend sends student id and class id
        class_id = data['class_id']
        student_id = data['student_id']

        class_obj_id = ObjectId(class_id)
        student_obj_id = ObjectId(student_id)

        student = students_collection.find_one({"_id": student_obj_id})
        if not student:
            return jsonify({"error": "Student not found."}), 404
        class_result = classes_collection.update_one(
            {"_id": class_obj_id},
            {"$push": {"students": student_obj_id}} 
        )
        if class_result.modified_count > 0:
            return jsonify({"message": "Student enrolled successfully.", "student_id": str(student_id)}), 200
        else:
            return jsonify({"error": "Failed to enroll student in class."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_students', methods=['GET'])
def get_students():
    try:
        students = students_collection.find()

        return jsonify({"message": "Got all students"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_classes', methods=['GET'])
def get_classes():
    try:
        classes = classes_collection.find()

        return jsonify({"message": "Got all classess"}), 200
    except Exception as e:
        return jsonify({"error":str(e)}), 500

@app.route('/get_teachers', methods=['GET'])
def get_teachers():
    try:
        teachers = teachers_collection.find()

        return jsonify({"Message":"got all teachers"})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
>>>>>>> 08ee20ab183d08007cb20a36c78d77aaa08d34af
    app.run(debug=True)