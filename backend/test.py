from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import boto3
import json
import os
from flask import Flask

uri = "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers"

app = Flask(__name__)


def test_wrap():
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        db = client["StudentInformationTest"]
        questions = ["Where do I start?", "How do I add two numbers together?", "How do I multiply two numbers together?", "In what order do I perform the operations?", "What is the first step?"]
        # generate_student_report("Dog", "Class One", "Student Two", db, questions)
        # student_exists("Dog", "Class One", "Student One", db)
        # add_teacher("Dog", "Dogs", "Dogs2", db)
        # add_student_to_class("Dog", "Class One", "Student One", "report", db)
        add_class_report("Dog", "Class One", "class report", db)
        # update_student("Dog", "Class One", "Student One", "new report", db)
        # del_student("Dog", "Class One", "Student Two", db)
    except Exception as e:
        print(e)
    finally:
        client.close()


def wrap(func):
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        db = client["StudentInformationTest"]
        def inner(*args, **kwargs):
            return func(*args, *kwargs, db=db)
        return inner
    except Exception as e:
        print(e)
    finally:
        client.close()


@app.route('/add_teacher')
def add_teacher(teacher, username, pwd, db):
    new_teacher = db[teacher]
    insert_new = {"username": username, "pwd": pwd}
    new_teacher.insert_one(insert_new)


def add_student_to_class(teacher, class_name, student_name, report, db):
    new_class = db[teacher][class_name]["students"][student_name]
    insert_new = {"name": student_name, "report": report}
    new_class.insert_one(insert_new)


def add_class_report(teacher, class_name, class_report, db):
    insert = db[teacher][class_name]
    insert_new = {"report": class_report}
    insert.insert_one(insert_new)


@app.route('/student_exists/<student>')
def student_exists(teacher, class_name, student, db):
    collection = db[teacher][class_name]["students"][student]
    students = collection.find()
    students_found = list(students)
    students.close()
    if students_found:
        return True
    return False


def get_class_total_categories():
    pass


@app.route('/<student>/student_report')
def generate_student_report(teacher, class_name, student, db, questions: list=None):
    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
    prompt = f"Categorize the following questions into specific subtopics oriented categories and give me the categories only, separated by commas.\n"
    if not questions:
        return
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

    if student_exists(teacher, class_name, student, db):
        update_student(teacher, class_name, student, categories, db)
    else:
        add_student_to_class(teacher, class_name, student, categories, db)


def update_student(teacher, class_name, student, report, db):
    new_class = db[teacher][class_name]["students"][student]
    insert_new = {"report": report}
    new_class.update_one({"name": student}, {'$set': insert_new})


@app.route('/<student>/delete')
def del_student(teacher, class_name, student, db):
    db[teacher][class_name]["students"][student].drop()


@app.route('/class/class_report')
def generate_class_report(teacher, class_name, db, categories: list=None):
    os.environ['AWS_ACCESS_KEY_ID'] = ""
    os.environ["AWS_SECRET_ACCESS_KEY"] = ""
    os.environ["AWS_DEFAULT_REGION"] = 'us-east-1'
    
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

    prompt = "Recombine the following list of categories by similarity in specific topic and regroup. Return the resulting categories only, separated by commas.\n"
    if categories is None:
        return
    for i in categories:
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
    print(result)
    # categories = result['completion']
    # add_class_report(teacher, class_name, result, db)


# wrap()

# if __name__ == "__main__":
#     app.run(debug=True)

"""
{
teachers: {
    teacher1: {
        class1: {
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
    },
students: {
    student1 username: {
        name: sdkljf,
        pwd: lskdjfg
        },
    student2 username: {
        username: lskdjflk,
        pwd: lksdjf}
    }
}
"""