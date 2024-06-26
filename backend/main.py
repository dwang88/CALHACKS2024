from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
import json

app = Flask(__name__)
CORS(app)

uri = os.getenv("DB_URL", "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers")

client = MongoClient(uri, server_api=ServerApi('1'))
db = client['TestDB']
teachers_collection = db['Teachers']
students_collection = db['Students']
classes_collection = db['Classes']

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello from Flask!")

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify(message="Hello from Flask!")


# add a student - need to pass a student object into this function
# student in json format: {
#                           name: {name - string},
#                           report: {report - array}
#                       }
@app.route('/add_student', methods=['POST'])
def add_student():
    try:
        student_data = request.get_json()

        result = students_collection.insert_one(student_data)

        return jsonify({"message": "Student added successfully!", "student_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

"""
input for this method should be:
{
    "name": {name},
    "classes": Array of classes
}
"""
@app.route('/add_teacher', methods=['POST'])
def add_teacher():
    try:
        teacher_data = request.get_json()

        result = teachers_collection.insert_one(teacher_data)

        return jsonify({"message": "Teacher added successfully!", "teacher_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
"""
input for this method should be:
{
    "teacher_id": {get the firebase uid of the teacher},
    "class name": {name - String}
}
"""
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
                "report": "",
                "struggling": [],
            }}}
        )

        class_data['students'] = []

        classes_collection.insert_one(class_data)

        if result.modified_count == 1:
            return jsonify({"message": "Class added successfully!"}), 201
        else:
            return jsonify({"error": "Failed to add class."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

"""
{
    "class_id": {MongoDB id of the class},
    "student_id": {firebase id of the student}
}
"""
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

        student_result = students_collection.update_one(
            {"_id": student_obj_id},
            {"$push", {"classes": class_obj_id}}
        )
        if class_result.modified_count > 0 and student_result.modified_count > 0:
            return jsonify({"message": "Student enrolled successfully.", "student_id": str(student_id)}), 200
        else:
            return jsonify({"error": "Failed to enroll student in class."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'

    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
    prompt = f"Categorize the following questions into very specific subtopics. Find the percentage of each subtopic, and give me a dictionary where the subtopic is the key and the percentage is the value.Return only the dictionary with no additional text.\n"

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
    categories = result['completion']
    # categories = list(change_to_list(categories))

    if categories:
        classes = teachers_collection.find_one({"_id": teacher_id})['classes']

        new = {"struggling": categories}
        for class_n in classes:
            if(class_n['name'] == class_name):
                break
        
        print(type(categories))

        new_categories = ""

        for i in categories:
            if i == "\'":
                new_categories += '\"'
            else:
                new_categories += i

        print(new_categories)
        # adding the struggling categories to the class
        report = json.loads(new_categories)
        written_report = ""
        for i in list(report.keys()):
            written_report += f"{report[i]} percent of people need more help with {i}. "
        classes_collection.update_one(
            {"class_name": class_name},
            {"$push": new}
        )

        # adds the indivdual student report to the student
        students_collection.update_one(
            {"_id": student_id},
            {"$set": {"report": written_report}}
        )
        # classes.update_one({"name": class_name}, {"$set": new})
    
    return jsonify(class_n['report'])

@app.route('/generate_class_report', methods=['POST'])
def generate_class_report():
    data = request.get_json()
    teacher_id = data["_id"]
    class_name = data["class_name"]
    classes = teachers_collection.find_one({"_id": ObjectId(teacher_id)})["classes"]
    for class_n in classes:
        if class_n["name"] == class_name:
            break
    categories_list = classes_collection.find_one({"class_name": class_name})["struggling"]

    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

    prompt = "Categorize the following questions into very specific subtopics. Find the percentage of each subtopic, and give me a dictionary where the subtopic is the key and the percentage is the value.Return only the dictionary with no additional text.\n"
    for i in categories_list:
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
    report = json.loads(result["completion"])
    written_report = ""
    for i in list(report.keys()):
        written_report += f"{report[i]} percent of people need more help with {i}. "
    print(written_report)

    classes_collection.update_one({"class_name": class_name}, {"$set": {"report": written_report}})

    return jsonify(report)


if __name__ == '__main__':
    app.run(debug=True)
