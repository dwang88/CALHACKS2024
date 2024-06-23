import os
import fitz  # PyMuPDF

def pdf_to_images(pdf_path, output_folder):
    # Ensure output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Open the provided PDF file
    pdf_document = fitz.open(pdf_path)

    # Iterate through each page in the PDF
    for page_number in range(len(pdf_document)):
        # Get the page
        page = pdf_document.load_page(page_number)

        # Render the page to an image (PIL.Image)
        image = page.get_pixmap()

        # Define the output image path
        image_path = f"{output_folder}/page_{page_number + 1}.png"

        # Save the image
        image.save(image_path)

        print(f"Page {page_number + 1} saved as {image_path}")

    # Close the PDF document
    pdf_document.close()

# Example usage:
if __name__ == "__main__":
    # Replace with your PDF file path
    pdf_file = 'math.pdf'

    # Replace with the output folder where images will be saved
    output_folder = './imgs'

    # Convert PDF to images
    pdf_to_images(pdf_file, output_folder)
