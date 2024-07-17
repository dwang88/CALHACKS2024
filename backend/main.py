from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
import json
from openai import OpenAI


app = Flask(__name__)
CORS(app)

load_dotenv()
uri = os.getenv("DB_URL")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['canvas-gpt-db']
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']

student_schema = {
    '_id': ObjectId,
    'student_id': str, #firebase uid
    'name': str,
    'classes': list,
    'report': list,
    'questions': list
}

teacher_schema = {
    '_id': ObjectId,
    'teacher_id': str, # firebase uid
    'name': str,
    'students': [],
    'classes': []
}

class_schema = {
    '_id': ObjectId,
    'class_id': str,
    'name': str,
    'students': [],
    'class_report': str,
    'Teacher': str # teacher_id
}

@app.route('/add_student', methods=['POST'])
def add_student():
    try:
        student_data = request.get_json()
        student_id = student_data['student_id']

        existing_student = students_collection.find_one({"student_id": student_id})
        if existing_student:
            return jsonify({"message": "Student already exists!", "student_id": student_id}), 200

        result = students_collection.insert_one(student_data)

        return jsonify({"message": "Student added successfully!", "student_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    try:
        teacher_data = request.get_json()
        teacher_id = teacher_data['teacher_id']

        existing_teacher = teachers_collection.find_one({'teacher_id': teacher_id})
        if existing_teacher:
            return jsonify({"Message": "Teacher already exists", 
                            "teacher_id": teacher_id}), 200

        result = teachers_collection.insert_one(teacher_data)

        return jsonify({"message": "Teacher added successfully!", "teacher_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add_class', methods=['POST'])
def add_class():
    try:
        class_data = request.get_json()

        classes_collection.insert_one(class_data)

        return jsonify({"message": "Class added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/enroll_student/<class_id>/', methods=['PATCH'])
def add_student_to_class(class_id):
    try:
        data = request.get_json()

        # frontend sends student id and class id
        student_id = data['student_id']

        student = students_collection.find_one({"student_id": student_id})
        if not student:
            return jsonify({"error": "Student not found."}), 404
        
        existing_class = classes_collection.find_one({"class_id": class_id})
        teacher_id = existing_class['Teacher']
        if not existing_class:
            return jsonify({"error": "Class does not exist"})
        
        teacher = teachers_collection.find_one({"teacher_id": teacher_id})
        if not teacher:
            return jsonify({"error": "Teacher does not exist"})
        
        class_result = classes_collection.update_one(
            {"class_id": class_id},
            {"$push": {"students": student_id}} 
        )

        student_result = students_collection.update_one(
            {"student_id": student_id},
            {"$push": {"classes": class_id}}
        )

        teacher_result = teachers_collection.update_one(
            {"teacher_id": teacher_id},
            {"$push": {"students": student_id}}
        )

        if class_result.modified_count > 0 and student_result.modified_count > 0 and teacher_result.modified_count > 0:
            return jsonify({"message": "Student enrolled successfully.", "student_id": str(student_id)}), 200
        else:
            return jsonify({"error": "Failed to enroll student in class."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# def enroll_teacher_in_class:
# will add a teacher as Teacher of class
# and add the class to the teacher's class[] array

#get all students
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
    
@app.route('/get_class/<class_id>/', methods=['GET'])
def get_class(class_id):
    try:
        specClass = classes_collection.find_one({'class_id': class_id})
        if not specClass:
            return jsonify({"error": "Class not found"}), 404
        specClass['_id'] = str(specClass['_id'])
        return jsonify({"Message": "Successfully got class " + class_id,
                        "Class": specClass}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_student/<student_id>/', methods=['GET'])
def get_student(student_id):
    try:
        student = students_collection.find_one({'student_id': student_id})
        if not student:
            return jsonify({"error": "Student not found"}), 404
        student['_id'] = str(student['_id'])
        return jsonify({"Message": "Successfully got student " + student_id,
                        "Student": student}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# get all students of a teacher
@app.route('/get_students_of_teacher/<teacher_id>/', methods=['GET'])
def get_students_of_teacher(teacher_id):
    try:
        teacher = teachers_collection.find_one({'teacher_id': teacher_id})
        if not teacher:
            return jsonify({"error": "Teacher not found"}), 404
        students = teacher['students']
        students_list = []

        for student in students:
            new_student = students_collection.find_one({"student_id": student})
            if new_student:
                new_student['_id'] = str(new_student['_id'])
                students_list.append(new_student)

        return jsonify({"Message": "Successfully got students",
                        "Students": students_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_classes_of_teacher/<teacher_id>/', methods=['GET'])
def get_classes_of_teacher(teacher_id):
    try:
        teacher = teachers_collection.find_one({'teacher_id':teacher_id})
        if not teacher:
            return jsonify({"Error": "Teacher not found"}), 404
        
        classes = teacher['classes']
        classes_list = []

        for class_id in classes:
            new_class = classes_collection.find_one({"class_id": class_id})
            if new_class:
                new_class['_id'] = str(new_class['_id'])
                classes_list.append(new_class)

        return jsonify({"Message": "Successfully retreived classes",
                        "Classes": classes_list}), 200
        
    except Exception as e:
        return jsonify({"Error": str(e)})

@app.route('/generate_student_report/<student_id>/', methods=['PATCH'])
def generate_student_report(student_id):
    try:
        questions_list = students_collection.find_one({'student_id': student_id})['questions']
        questions = ""
        for question in questions_list:
            questions += question + " "
        
        api_key = os.getenv('OPENAI_API_KEY')

        client = OpenAI(
            api_key=api_key
        )

        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", 
                 "content": "You are an educational assistant that helps teachers understand what their students are struggling in"},
                {"role": "user", 
                 "content": "Generate a concise 3-4 sentence report about a student's progress based on the following questions they've asked: " + questions}
            ]
        )

        report = completion.choices[0].message.content

        result = students_collection.update_one(
            {"student_id": student_id},
            {"$push": {"report": report}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Successfully added report", 
                            "Report": report}), 200
        else:
            return jsonify({"error": "Failed to add report"}), 400

    except Exception as e:
        return jsonify({"Error": str(e)})

# @app.route('/add_question', methods=['PATCH'])
# def add_question():
#     try:
#         data = request.get_json()
#         student_id = ObjectId(data['student_id'])
#         question = data['question']
#         target_student = students_collection.update_one(
#             {"_id":student_id},
#             {"$push": {"questions": question}}
#         )

#         if target_student.modified_count == 0:
#             return jsonify({"error": "Class not found or report not added"}), 404

#         return jsonify({"message": "Question added successfully!"}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.route('/generate_student_report', methods=['POST'])
# def generate_student_report():
#     data = request.get_json()
#     student_id = ObjectId(data['student_id'])
#     teacher_id = ObjectId(data['teacher_id'])
#     class_name = data['class_name']
#     questions_list = students_collection.find_one({"_id":student_id})['questions']

#     os.environ['AWS_ACCESS_KEY_ID'] = ""
#     os.environ["AWS_SECRET_ACCESS_KEY"] = ""
#     os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'

#     bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
#     prompt = f"Categorize the following questions into very specific subtopics. Find the percentage of each subtopic, and give me a dictionary where the subtopic is the key and the percentage is the value.Return only the dictionary with no additional text.\n"

#     for i in questions_list:
#         prompt += (i + "\n")

#     formatted_prompt = f'Human: {prompt}\nAssistant:'

#     response = bedrock.invoke_model(
#         modelId = "anthropic.claude-v2",
#         body=json.dumps({
#             "prompt": formatted_prompt,
#             "max_tokens_to_sample": 2048,
#             "temperature": 0.7
#         })
#     )

#     result = json.loads(response.get("body").read())
#     categories = result['completion']
#     # categories = list(change_to_list(categories))

#     if categories:
#         classes = teachers_collection.find_one({"_id": teacher_id})['classes']

#         new = {"struggling": categories}
#         for class_n in classes:
#             if(class_n['name'] == class_name):
#                 break
        
#         print(type(categories))

#         new_categories = ""

#         for i in categories:
#             if i == "\'":
#                 new_categories += '\"'
#             else:
#                 new_categories += i

#         print(new_categories)
#         # adding the struggling categories to the class
#         report = json.loads(new_categories)
#         written_report = ""
#         for i in list(report.keys()):
#             written_report += f"{report[i]} percent of people need more help with {i}. "
#         classes_collection.update_one(
#             {"class_name": class_name},
#             {"$push": new}
#         )

#         # adds the indivdual student report to the student
#         students_collection.update_one(
#             {"_id": student_id},
#             {"$set": {"report": written_report}}
#         )
#         # classes.update_one({"name": class_name}, {"$set": new})
    
#     return jsonify(class_n['report'])

# @app.route('/generate_class_report', methods=['POST'])
# def generate_class_report():
#     data = request.get_json()
#     teacher_id = data["_id"]
#     class_name = data["class_name"]
#     classes = teachers_collection.find_one({"_id": ObjectId(teacher_id)})["classes"]
#     for class_n in classes:
#         if class_n["name"] == class_name:
#             break
#     categories_list = classes_collection.find_one({"class_name": class_name})["struggling"]

#     os.environ['AWS_ACCESS_KEY_ID'] = ""
#     os.environ["AWS_SECRET_ACCESS_KEY"] = ""
#     os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
#     bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

#     prompt = "Categorize the following questions into very specific subtopics. Find the percentage of each subtopic, and give me a dictionary where the subtopic is the key and the percentage is the value.Return only the dictionary with no additional text.\n"
#     for i in categories_list:
#         prompt += (i + "\n")
    
#     formatted_prompt = f'Human: {prompt}\nAssistant:'

#     response = bedrock.invoke_model(
#         modelId = "anthropic.claude-v2",
#         body=json.dumps({
#             "prompt": formatted_prompt,
#             "max_tokens_to_sample": 2048,
#             "temperature": 0.7
#             })
#     )

#     result = json.loads(response.get("body").read())
#     report = json.loads(result["completion"])
#     written_report = ""
#     for i in list(report.keys()):
#         written_report += f"{report[i]} percent of people need more help with {i}. "
#     print(written_report)

#     classes_collection.update_one({"class_name": class_name}, {"$set": {"report": written_report}})

#     return jsonify(report)


if __name__ == '__main__':
    app.run(debug=True)
