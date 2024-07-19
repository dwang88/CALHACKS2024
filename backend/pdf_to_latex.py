import os
import fitz 
from PIL import Image
import base64
import openai
import boto3
import json
from pypdf import PdfReader 


from dotenv import load_dotenv

load_dotenv()


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def pdf_to_images(pdf_path, output_folder):
    pdf_document = fitz.open(pdf_path)

    for page_num in range(len(pdf_document)):
        page = pdf_document.load_page(page_num)

        pix = page.get_pixmap()

        output_image_path = f"{output_folder}/page_{page_num + 1}.png"

        pix.save(output_image_path)

    print(f"PDF has been successfully converted to images in the folder: {output_folder}")

pdf_path = "math.pdf"  
output_folder = "output_images"
pdf_to_images(pdf_path, output_folder)

def image_to_base64(image_path):
    with open(image_path, 'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

image_files = sorted(os.listdir(output_folder))
for image_name in image_files:
    image_path = os.path.join(output_folder, image_name)
    if os.path.isfile(image_path) and image_name.lower().endswith(('png', 'jpg', 'jpeg')):
        image_base64 = image_to_base64(image_path)

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
            max_tokens=300,
        )

        print("RAW LATEX OUTPUT:")
        print(f"Response for {image_name}:")
        print(response.choices[0]) 
        
        # new part
        user_prompt = response.choices[0].message.content.strip()

        print("")
        print(user_prompt)

        bedrock = boto3.client(service_name="bedrock-runtime", region_name='us-east-1')

        modelId = "anthropic.claude-3-haiku-20240307-v1:0"

        accept = "application/json"
        contentType = "application/json"
        system_prompt = "Do not give the user the answer directly, but guide them towards finding the answer. Keep your output relatively short. Format your answer in latex"

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
                            "content": [{"type": "text", "text": system_prompt + " " + user_prompt}]
                        }
                    ]
                }
            )
        )

        result = json.loads(response.get("body").read().decode('utf-8'))
        output_list = result.get("content", [])

        for output in output_list:
            print("SOLUTION OUTPUT:")
            print(output["text"])
