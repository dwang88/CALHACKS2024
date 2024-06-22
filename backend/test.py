from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo

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
        add_teacher("Dog", "Dogs", "Dogs2", db)
        add_to_class("Dog", "Class One", "Student One", "report", db)
    except Exception as e:
        print(e)
    finally:
        client.close()


def add_teacher(teacher, username, pwd, db):
    new_teacher = db[teacher]
    insert_new = {"username": username, "pwd": pwd}
    new_teacher.insert_one(insert_new)


def add_to_class(teacher, class_name, student_name, report, db):
    new_class = db[teacher][class_name]["students"]
    insert_new = {student_name: report}
    new_class.insert_one(insert_new)


wrap()

"""
{
teachers: {
    teacher1: {
        class1: {
            report: report,
            students: {
                student1: lfkjsflkjf,
                student2: lksjflsdfkjd,
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