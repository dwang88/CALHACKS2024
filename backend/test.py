from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import boto3
import json

uri = "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers"


def test():
    client = MongoClient(uri, server_api=ServerApi('1'))

    try:
        mydb = client["testing"]
        two = mydb["test3"]
        three = two["test4"]
        new = three.insert_one({"hi": "goodbye"})
        # new = two.insert_one({})
        # new = two.insert_one({"name": "Alice", "age": 30})
        # print("done")
    except Exception as e:
        print(e)


def wrap():
    client = MongoClient(uri, server_api=ServerApi('1'))
    try:
        db = client["StudentInformationTest"]
        # add_teacher("Dog", "Dogs", "Dogs2", db)
        # add_student_to_class("Dog", "Class One", "Student One", "report", db)
        # add_class_report("Dog", "Class One", "class report", db)
        # update_student("Dog", "Class One", "Student One", "new report", db)
        del_student("Dog", "Class One", "Student One", db)
    except Exception as e:
        print(e)
    finally:
        client.close()


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


def generate_student_report(teacher, class_name, student, db, questions: list=None):
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

    modelId = "anthropic.claude-3-haiku-20240307-v1:0"

    accept = "application/json"
    contentType = "application/json"
    prompt = f"Categorize the following questions into topic oriented categories and give me the categories only, separated by commas.\n"
    if not questions:
        return
    for i in questions:
        prompt += (i + "\n")

    response = bedrock.invoke_model(
        modelId=modelId,
        body=json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": prompt}]
                    }
                ]

            }
        )
    )

    result = json.loads(response.get("body").read())
    print(result)  # check what the output is

    add_student_to_class(teacher, class_name, student, result, db)

    # input_tokens = result["usage"]["input_tokens"]
    # output_tokens = result["usage"]["output_tokens"]
    # output_list = result.get("content", [])

    # print("Invocation details: ")
    # print(f"- The input length is {input_tokens} ttokens" )
    # print(f"- The output length is {output_tokens} ttokens" )

    # print(f" - The model returned {len(output_list)} messages")

    # for output in output_list:
    #     print(output["text"])



# can we assume that students cannot have the same name? --> student id solves this
# do we need a function to delete a student


def update_student(teacher, class_name, student, report, db):
    new_class = db[teacher][class_name]["students"][student]
    insert_new = {"report": report}
    new_class.update_one({"name": student}, {'$set': insert_new})


def del_student(teacher, class_name, student, db):
    db[teacher][class_name]["students"][student].drop()


def generate_class_report(teacher, class_name, db, categories: list=None):
    bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

    modelId = "anthropic.claude-3-haiku-20240307-v1:0"

    accept = "application/json"
    contentType = "application/json"
    prompt = "Recombine the following list of categories by similarity in specific topic and regroup. Return the resulting categories only, separated by commas.\n"
    if categories is None:
        return
    for i in categories:
        prompt += (i + "\n")

    response = bedrock.invoke_model(
        modelId=modelId,
        body=json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": [{"type": "text", "text": prompt}]
                    }
                ]

            }
        )
    )

    result = json.loads(response.get("body").read())
    print(result)  # check what the output is

    add_class_report(teacher, class_name, result, db)


wrap()

"""
{
teachers: {
    teacher1: {
        class1: {
            report: report,
            students: {
                student1: report,
                student2: report,
                student3: lksdjfldkjsd
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