from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import fitz
from PIL import Image
import base64
import openai
import boto3
import json
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

app = Flask(__name__)
CORS(app, supports_credentials=True)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['Access-Control-Allow-Origin'] = '*'

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
        return base64.b64encode(img_file.read()).decode('utf-8')

@app.route('/test-cors', methods=['GET'])
def test_cors():
    return jsonify({"message": "CORS is working!"})

@app.route('/process', methods=['POST', 'FETCH'])
def process_pdf():
    if 'pdf' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(pdf_path)

        output_folder = "output_images"
        os.makedirs(output_folder, exist_ok=True)
        pdf_to_images(pdf_path, output_folder)

        results = []

        image_files = sorted(os.listdir(output_folder))
        for image_name in image_files:
            image_path = os.path.join(output_folder, image_name)
            if os.path.isfile(image_path) and image_name.lower().endswith(('png', 'jpg', 'jpeg')):
                image_base64 = image_to_base64(image_path)

                response = openai.Completion.create(
                    engine="davinci-codex",  # or the appropriate engine
                    prompt=f"Transcribe the following image content to LaTeX: {image_base64}",
                    max_tokens=300,
                )

                user_prompt = response.choices[0].text.strip()

                bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

                modelId = "anthropic.claude-3-haiku-20240307-v1:0"

                accept = "application/json"
                contentType = "application/json"
                system_prompt = "You are a helpful assistant. Do not give the user the answer directly, but guide them towards finding the answer. format your answer in latex"

                response = bedrock.invoke_model(
                    modelId=modelId,
                    contentType=contentType,
                    accept=accept,
                    body=json.dumps(
                        {
                            "anthropic_version": "bedrock-2023-05-31",
                            "max_tokens": 1024,
                            "messages": [
                                {
                                    "role": "user",
                                    "content": system_prompt + " " + user_prompt
                                }
                            ]
                        }
                    )
                )

                result = json.loads(response.get("body").read().decode('utf-8'))
                output_list = result.get("content", [])

                solution_outputs = [output["text"] for output in output_list]
                results.append({"image_name": image_name, "solution_outputs": solution_outputs})

        response = make_response(jsonify(results))
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True)
