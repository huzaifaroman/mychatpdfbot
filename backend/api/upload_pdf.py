# api/upload_pdf.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

print("Backend is running!")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/upload_pdf', methods=['POST'])  # Define the route
def upload_pdf():
    """Endpoint to upload a PDF file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file.content_type != 'application/pdf':
        return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400

    pdf_filename = file.filename
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    file.save(pdf_path)

    app.logger.debug(f"Uploaded PDF saved at: {pdf_path}")

    return jsonify({'pdf_path': pdf_path, 'message': "Your PDF has been uploaded and processed."}), 200

if __name__ == '__main__':
    app.run(debug=True)
