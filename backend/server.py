import os
import fitz
from PIL import Image
import base64
import openai
import boto3
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import shutil

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
print(OPENAI_API_KEY)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
OUTPUT_FOLDER = 'output_images'
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def pdf_to_images(pdf_path, output_folder):
    pdf_document = fitz.open(pdf_path)
    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)
        pix = page.get_pixmap()
        output_image_path = os.path.join(output_folder, f"page_{page_num + 1}.png")
        pix.save(output_image_path)
    print(f"PDF has been successfully converted to images in the folder: {output_folder}")

def image_to_base64(image_path):
    with open(image_path, 'rb') as img_file:
        print("Images have been successfully converted to text")
        return base64.b64encode(img_file.read()).decode('utf-8')
    
def clear_output_folder(output_folder):
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    os.makedirs(output_folder)

@app.post("/process")
async def process_pdf(pdf: UploadFile = File(...), student_question: str = Form(...)):
    print(f"debug output: {student_question}")
    try:
        # Save the uploaded PDF file
        pdf_path = os.path.join(UPLOAD_FOLDER, secure_filename(pdf.filename))
        with open(pdf_path, "wb") as buffer:
            buffer.write(await pdf.read())

        # Clear the output folder before processing new PDF
        clear_output_folder(OUTPUT_FOLDER)

        # Convert PDF to images
        pdf_to_images(pdf_path, OUTPUT_FOLDER)

        results = []
        image_files = sorted(os.listdir(OUTPUT_FOLDER))
        for image_name in image_files:
            image_path = os.path.join(OUTPUT_FOLDER, image_name)
            if os.path.isfile(image_path) and image_name.lower().endswith(('png', 'jpg', 'jpeg')):
                image_base64 = image_to_base64(image_path)

                # Call OpenAI API to transcribe image content to LaTeX
                response = openai.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Transcribe the image (which might contain latex) to text."},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{image_base64}",
                                    },
                                },
                            ],
                        }
                    ],
                    max_tokens=256,
                )

                user_prompt = response.choices[0].message.content.strip()

                # Call AWS Bedrock API
                bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')
                modelId = "anthropic.claude-3-haiku-20240307-v1:0"
                accept = "application/json"
                contentType = "application/json"
                system_prompt = "You are a helpful assistant. Do not give the user the answer directly, but guide them towards finding the answer. Keep your output relatively short. Format your answer in LaTeX."

                response = bedrock.invoke_model(
                    modelId=modelId,
                    contentType=contentType,
                    accept=accept,
                    body=json.dumps(
                        {
                            "anthropic_version": "bedrock-2023-05-31",
                            "max_tokens": 1000,
                            "messages": [
                                {
                                    "role": "user",
                                    "content": system_prompt + " " + student_question + " "+ user_prompt
                                }
                            ]
                        }
                    )
                )

                result = json.loads(response.get("body").read().decode('utf-8'))
                output_list = result.get("content", [])

                solution_outputs = [output["text"] for output in output_list]
                results.append({"image_name": image_name, "solution_outputs": solution_outputs})

        return JSONResponse(content=results)

    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail="Error processing PDF")

@app.get("/test-cors")
def test_cors():
    return {"message": "CORS is working!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")