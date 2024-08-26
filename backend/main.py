from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from werkzeug.utils import secure_filename
import logging
import gridfs

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
fs = gridfs.GridFS(db)
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']
assignments_collection = db['Assignments']
questions_collection = db['Questions']
responses_collection = db['Responses']

student_schema = {
    '_id': ObjectId,
    'student_id': str, #firebase uid
    'name': str,
    'classes': list,
    'report': list,
    'questions': list,
    'assignments': list
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
    'Teacher': str, # teacher_id,
    'homework': list,
    'assignments': list
}

assignment_schema = {
    '_id': ObjectId,
    'title': str,
    'description': str,
    'class_id': str,
    'completed': bool,
    'started': bool,
    'score': float,
    'url': str
}

questions_schema = {
    '_id': ObjectId,
    'question': str,
    'options': list,
    'type': str,
    'correct_answer': str
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
        # questions_list = students_collection.find_one({'student_id': student_id})['questions']
        api_key = os.getenv('OPENAI_API_KEY')

        client = OpenAI(
            api_key=api_key
        )

        assignment_list = students_collection.find_one({'student_id': student_id})['assignments']
        response_objs = []

        if(len(assignment_list) < 1):
            return jsonify({"Response": "Student has no assignments"})
        
        for assignment_id in assignment_list:
            student_response = responses_collection.find_one({'student_id': student_id,
                                                             'assignment_id': assignment_id})
            if student_response is None:
                continue
            
            for key, value in student_response['checks'].items():
                question_response = questions_collection.find_one({'_id': ObjectId(key)})
                question = question_response['question']
                correct_ans = question_response['correctAnswer']
                answer = student_response['answers'][key]
                if value == False:
                    obj = {
                        'question': question,
                        'correct_ans': correct_ans,
                        'student_ans': answer,
                        'score': student_response['score']
                    }
                    response_objs.append(obj)
        # store student responses in student collection
        
        # if len(questions_list) == 0:
        #     return jsonify({"Report": "No questions were asked by the student"})
        
        # questions = ""
        # for question in questions_list:
        #     questions += question + " "
                    
        SYS_PROMPT = """You are an educational assistant that helps teachers understand what their students are struggling in.
        The user will provide a list of student response objects, where a student response object follows this format:
        {
            'question': <question>, (this is the assignment question)
            'correct_ans': <correct answer>,
            'student_ans': <student answer>,
            'score': <assignment_score>
        }. 
        These are all the questions that the student got wrong. Given these student response objects,
        generate a concise 3-4 sentence report of the student's progress based on their score as well as the
        content of the answers they got wrong. For example, if they got a question about addition wrong,
        consider why or how they may have got it wrong. The goal is to provide the teacher with a report about the student's overall progress. 
        The user will provide the list of response objects.
        Report:"""

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", 
                 "content": SYS_PROMPT},
                {"role": "user", "content": f"Student responses: {response_objs}"}
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

@app.route('/get_questions/<student_id>/', methods=['GET'])
def get_questions(student_id):
    try:
        questions_list = students_collection.find_one({'student_id': student_id})['questions']
        print(questions_list)
        if len(questions_list) == 0:
            return jsonify({"Message": "No questions"})
        return jsonify({"Questions": questions_list})
    except Exception as e:
        return jsonify({"Error": str(e)})

@app.route('/upload_homework/<assignment_id>/', methods=['POST'])
def upload_homework(assignment_id):
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file part in the request'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected for uploading'}), 400

        filename = secure_filename(file.filename)
        file_id = fs.put(file, filename=filename, metadata={"assignment_id": assignment_id})
        assignment_result = assignments_collection.update_one(
            {"_id": ObjectId(assignment_id)},
            {"$set": {"url": str(file_id)}}
        )

        if assignment_result.modified_count > 0:
            return jsonify({'message': 'File successfully uploaded', 'file_id': str(file_id)}), 200
        else:
            return jsonify({"error": "Failed to add report"}), 400
    except Exception as e:
        return jsonify({'message': f'Error occurred: {str(e)}'}), 500
    
@app.route('/get_homework_files/<assignment_id>/', methods=['GET'])
def get_homework_files(assignment_id):
    try:
        files = fs.find({"metadata.assignment_id": assignment_id})
        file_list = [{"_id": str(file._id), "filename": file.filename} for file in files]
        return jsonify({"homework_files": file_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/get_file/<file_id>', methods=['GET'])
def get_file(file_id):
    try:
        file = fs.get(ObjectId(file_id))
        return file.read(), 200, {'Content-Type': 'application/pdf'}
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/create_assignment/', methods=['POST'])
def create_assignment():
    try:
        assignment_data = request.get_json()
        result = assignments_collection.insert_one(assignment_data)
        class_id = assignment_data['class_id']
        assignment_id = str(assignment_data['_id'])
        students_list = classes_collection.find_one({'class_id': class_id})['students']
        for student_id in students_list:
            student_result = students_collection.update_one(
                {'student_id': student_id},
                {"$push": {'assignments': assignment_id}}
            )
        classes_result = classes_collection.update_one(
            {'class_id': class_id},
            {'$push': {'assignments': assignment_id}}
        )
        if student_result.modified_count > 0 and classes_result.modified_count > 0:
            return jsonify({"message": "Assignment added successfully!", "assignment_id": str(result.inserted_id)}), 201
        else:
            return jsonify({"error": "Failed to add assignment."}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_assignments/<class_id>/', methods=['GET'])
def get_assignments(class_id):
    try:
        assignments_list = []
        class_data = classes_collection.find_one({'class_id': class_id})

        if class_data is None:
            return jsonify({'error': 'Class not found'}), 404
        
        assignment_ids = class_data['assignments']
        for assignment_id in assignment_ids:
            obj_id = ObjectId(assignment_id)
            assignment = assignments_collection.find_one({'_id': obj_id})
            if assignment:
                assignment['_id'] = str(assignment['_id'])
                assignments_list.append(assignment)
            else:
                # Handle the case where an assignment is not found
                assignments_list.append({'_id': assignment_id, 'error': 'Assignment not found'})
        return jsonify({"assignments": assignments_list}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get_assignment/<assignment_id>/', methods=['GET'])
def get_assignment(assignment_id):
    try:
        assignment_id = ObjectId(assignment_id)
        assignment = assignments_collection.find_one({'_id': assignment_id})

        if assignment is None:
            return jsonify({'error': 'Assignment not found'}), 404
        
        assignment['_id'] = str(assignment['_id'])

        return jsonify({'Assignment': assignment})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/create_assignment_question/', methods=['POST'])
def add_assignment_question():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid input, no JSON received"}), 400
        result = questions_collection.insert_one(data)
        return jsonify({"message": "Question added successfully!", "question_id": str(result.inserted_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_assignment_questions/<assignment_id>/', methods=['GET'])
def get_assignment_questions(assignment_id):
    try:
        assignment_data = assignments_collection.find_one({"assignment_id": ObjectId(assignment_id)})
        questions_list = assignment_data['questions']
        if questions_list is None:
            return jsonify({"error": "Assignment Id not found"}), 404
        if len(questions_list > 0):
            for question in questions_list:
                question['_id'] = str(question['_id'])
            return jsonify({"Questions": questions_list})
        else:
            return jsonify({"message": "No questions in this assignment"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/update_assignment_score/<assignment_id>/', methods=['PUT'])
def update_assignment_score(assignment_id):
    try:
        score_data = request.get_json()
        score = score_data.get('score')

        # Ensure that assignment_id is an ObjectId
        assignment_object_id = ObjectId(assignment_id)

        result = assignments_collection.update_one(
            {"_id": assignment_object_id},
            {"$set": {"score": score}}
        )

        if result.modified_count > 0:
            return jsonify({"message": "Score updated successfully!"}), 200
        else:
            return jsonify({"error": "Failed to update score."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
