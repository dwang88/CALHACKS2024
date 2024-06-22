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
    except Exception as e:
        print(e)
    finally:
        client.close()


def add_teacher(teacher, username, pwd, db):
    new_teacher = db[teacher]
    insert_new = {"username": username, "pwd": pwd}
    new_teacher.insert_one(insert_new)
    
wrap()

"""
{
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
}
"""