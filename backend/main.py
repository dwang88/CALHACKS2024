from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
import json
import boto3

app = Flask(__name__)
CORS(app)

uri = os.getenv("DB_URL")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['TestDB']
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']

# helper method - change to list
def change_to_list(string):
    string_split = string.split(",")
    while "" in string_split:
        string_split.remove("")
    for i in string_split:
        yield i.strip()

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
                "report": [],
                "students": []
            }}}
        )

        classes_collection.insert_one(class_data)

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

@app.route('/get_students_by_class', methods=['GET'])
def get_students_by_class():
    try:
        data = request.get_json()
        class_id = ObjectId(data['class_id'])

        class_name = classes_collection.find_one({"_id": class_id})
        if not class_name:
            return jsonify({"error":"class not found"}), 404
        
        students = class_name['students']
        students_arr = []
        for student in students:
            student_id = ObjectId(student)
            student = students_collection.find_one({"_id": student_id})
            if student:
                student['_id'] = str(student['_id'])
                students_arr.append(student)

        return jsonify({"Message": "Student successfully retrieved", "Students": students_arr})
    except Exception as e:
        return jsonify({"error": str(e)})
    
@app.route('/add_report', methods=['PATCH'])
def add_report():
    try:
        data = request.get_json()
        class_id = ObjectId(data['class_id'])
        report = data['report']
        target_class = classes_collection.update_one(
            {"_id":class_id},
            {"$push": {"reports": report}}
        )

        if target_class.modified_count == 0:
            return jsonify({"error": "Class not found or report not added"}), 404

        return jsonify({"message": "Report added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add_question', methods=['PATCH'])
def add_question():
    try:
        data = request.get_json()
        student_id = ObjectId(data['student_id'])
        question = data['question']
        target_student = students_collection.update_one(
            {"_id":student_id},
            {"$push": {"questions": question}}
        )

        if target_student.modified_count == 0:
            return jsonify({"error": "Class not found or report not added"}), 404

        return jsonify({"message": "Question added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/generate_student_report', methods=['POST'])
def generate_student_report():
    data = request.get_json()
    student_id = ObjectId(data['student_id'])
    teacher_id = ObjectId(data['teacher_id'])
    class_name = data['class_name']
    questions_list = students_collection.find_one({"_id":student_id})['questions']

    os.environ['AWS_ACCESS_KEY_ID'] = "AKIAQ3EGRVDJD66V45W2"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "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"
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'

    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
    prompt = f"Categorize the following questions into very specific subtopics. Find the percentage of each subtopic, and give me a dictionary where the subtopic is the key and the percentage is the value.\n"

    for i in questions_list:
        prompt += (i + "\n")

    formatted_prompt = f'Human: {prompt}\nAssistant:'

    response = bedrock.invoke_model(
        modelId = "anthropic.claude-v2",
        body=json.dumps({
            "prompt": formatted_prompt,
            "max_tokens_to_sample": 2048,
            "temperature": 0.7
        })
    )

    result = json.loads(response.get("body").read())
    print("result: ", result['completion'])
    categories = result['completion']
    categories = list(change_to_list(categories))

    if categories:
        classes = teachers_collection.find_one({"_id": teacher_id})['classes']

        new = {"struggling": categories}
        for class_n in classes:
            if(class_n['name'] == class_name):
                break
        
        # adding the struggling categories to the class
        report = class_n['report']
        classes_collection.update_one(
            {"name": class_name},
            {"$push": new}
        )

        # adds the indivdual student report to the student
        students_collection.update_one(
            {"_id": student_id},
            {"$set": {"report": report}}
        )
        # classes.update_one({"name": class_name}, {"$set": new})
    
    return jsonify(class_n['report'])

if __name__ == '__main__':
    app.run(debug=True)