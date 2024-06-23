import fitz  # PyMuPDF

def pdf_to_images(pdf_path, output_folder):
    # Open the PDF file
    pdf_document = fitz.open(pdf_path)

    # Iterate through each page
    for page_num in range(len(pdf_document)):
        # Select the page
        page = pdf_document.load_page(page_num)

        # Render the page to a pixmap (image)
        pix = page.get_pixmap()

        # Define the output image path
        output_image_path = f"{output_folder}/page_{page_num + 1}.png"

        # Save the image
        pix.save(output_image_path)

    print(f"PDF has been successfully converted to images in the folder: {output_folder}")

# Example usage
pdf_path = "latex.pdf"  # Path to your PDF file
output_folder = "output_images"  # Folder to save images
pdf_to_images(pdf_path, output_folder)
