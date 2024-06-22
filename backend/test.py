from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pymongo

uri = "mongodb+srv://anniesy2:Calhacks2024@teachers.6rnbrpj.mongodb.net/?retryWrites=true&w=majority&appName=Teachers"

client = MongoClient(uri, server_api=ServerApi('1'))

try:
    mydb = client["testing"]
    two = mydb["here"]
    new = two.insert_one({"name": "Alice", "age": 30})
    # print("done")
except Exception as e:
    print(e)


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