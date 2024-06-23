import os
import fitz 
from PIL import Image
import base64
import openai

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

pdf_path = "latex.pdf"  
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
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract the Latex code from the provided image. Just give me the Latex code in your response -- Nothing less, Nothing more."},
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

        latex_code = response.choices[0].message.content.strip()
        print(f"Response for {image_name}: {latex_code}")
                                
