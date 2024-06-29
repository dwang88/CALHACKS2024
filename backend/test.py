from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import boto3
import json
import os
from flask import Flask

uri = "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers"

app = Flask(__name__)


def wrap():
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        db = client["StudentInformationTest"]
        questions = ["Where do I start?", "How do I add two numbers together?", "How do I multiply two numbers together?", "In what order do I perform the operations?", "What is the first step?"]
        # generate_student_report("Dog", "Class One", "Student Two", db, questions)
        # student_exists("Dog", "Class One", "Student One", db)
        # add_teacher("Dog", "Dogs", "Dogs2", db)
        add_student_to_class("Dog", "Class One", "Student One", db)
        generate_student_report("Dog", "Class One", "Student One", db, questions)
        # add_class_report("Dog", "Class One", "class report", db)
        # update_student("Dog", "Class One", "Student One", "new report", db)
        # del_student("Dog", "Class One", "Student Two", db)
        # add_class("Dog", "Class One", db)
        # categories = get_class_total_categories(db, "Dog", "Class One")
        # generate_class_report("Dog", "Class One", db, categories)
    except Exception as e:
        print(e)
        raise
    finally:
        client.close()


@app.route('/add_teacher')
def add_teacher(teacher_name, teacher_id, email, db):
    new_teacher = db[teacher_id]
    insert_new = {"name": teacher_name, "email": email, "firebase id": teacher_id}
    new_teacher.insert_one(insert_new)


def create_student(student_name, firebase_id, email, db):
    new_student = db["students"][firebase_id]
    insert_new = {"name": student_name, "email": email, "firebase id": firebase_id}
    new_student.insert_one(insert_new)


def add_class(teacher, class_name, db):
    new_class = db[teacher][class_name]
    insert_new = {"name": class_name, "struggling": [], "report": None}
    new_class.insert_one(insert_new)

    # updated in main
    # do we still want a list of courses under the teacher?


def add_student_to_class(teacher_id, class_name, student_id, db, report=None):
    new_class = db[teacher_id][class_name][student_id]
    # a = db[student_id]
    # b = a.find()
    # c = list(b)[0]
    # b.close()

    insert_new = {"student id": student_id, "report": report}
    new_class.insert_one(insert_new)


def add_class_report(teacher_id, class_name, class_report, db):
    insert = db[teacher_id][class_name]
    insert_new = {"report": class_report}
    insert.update_one({"name": class_name}, insert_new)


@app.route('/student_exists/<student>')
def student_exists(teacher_id, class_name, student_id, db):
    collection = db[teacher_id][class_name][student_id]
    students = collection.find()
    students_found = list(students)
    students.close()
    if students_found:
        return True
    return False


def get_class_total_categories(db, teacher_id, class_name):
    observe = db[teacher_id][class_name]
    cursor = observe.find()
    data = list(cursor)[0]
    cursor.close()
    return data["struggling"]


def change_to_list(string):
    string_split = string.split(",")
    while "" in string_split:
        string_split.remove("")
    for i in string_split:
        yield i.strip()


@app.route('/<student>/student_report')
def generate_student_report(teacher_id, class_name, student_id, db, questions: list=None):
    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
    prompt = f"Categorize the following questions into specific subtopics oriented categories and give me the categories only, separated by commas.\n"
    for i in questions:
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
    categories = list(change_to_list(categories))

    if categories:
        class_update = db[teacher_id][class_name]

        observe = class_update.find()
        old_data = list(observe)[0]
        observe.close()

        old = old_data["struggling"]

        new = {"struggling": old + categories}
        class_update.update_one({"name": class_name}, {"$set": new})

    if student_exists(teacher_id, class_name, student_id, db):
        update_student(teacher_id, class_name, student_id, categories, db)
    else:
        add_student_to_class(teacher_id, class_name, student_id, categories, db)


def update_student(teacher_id, class_name, student_id, report, db):
    new_class = db[teacher_id][class_name][student_id]
    insert_new = {"report": report}
    new_class.update_one({"student id": student_id}, {'$set': insert_new})


@app.route('/<student>/delete')
def del_student(teacher_id, class_name, student_id, db):
    removal = db[teacher_id][class_name][student_id]
    cursor = removal.find()
    try:
        data = list(cursor)[0]["report"]
    except IndexError:
        data = []
    finally:
        cursor.close()
    
    class_select = db[teacher_id][class_name]

    observe = class_select.find()
    old_data = list(observe)[0]
    observe.close()

    old = old_data["struggling"]

    for i in data:
        old.remove(i)

    class_select.update_one({"name": class_name}, {"$set": {"struggling": old}})

    removal.drop()


@app.route('/class/class_report')
def generate_class_report(teacher_id, class_name, db, categories: list=None):
    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

    prompt = "Recombine the following list of categories by similarity in specific topic and regroup and remove duplicates. Return the resulting categories only, separated by commas, with no extra text.\n"
    if categories is None:
        return
    for i in categories:
        prompt += (i + "\n")

    # print("prompt:", prompt)

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
    print("result:", result)

    update_collection = db[teacher_id][class_name]
    update_collection.update_one({"name": class_name}, {"$set": {"report": list(change_to_list(result["completion"]))}})

    # categories = result['completion']
    # add_class_report(teacher, class_name, result, db)


wrap()

# if __name__ == "__main__":
#     app.run(debug=True)

"""
{
teacher1: {
    class1: {
        name: name,
        report: report,
        students: {
            student_name1: {
                name: name,
                report: report
                },
            student_name2: {
                name: name,
                report: report
                }
            }
        }
    class2: {
        report: report,
        students: {
            student1: lfkjsflkjf,
            student2: lksjflsdfkjd,
            student3: lksdjfldkjsd
            }
        }
    }
}

"""