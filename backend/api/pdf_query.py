# api/pdf_query.py
from flask import Flask, request, jsonify
from models import process_pdf_query  # Ensure this import works in your new structure
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create a Flask app instance if this file is run independently
app = Flask(__name__)

@app.route('/api/pdf_query', methods=['POST'])  # Define the route for querying PDFs
def query_pdf():
    """Endpoint to query the PDF content."""
    data = request.get_json()
    logging.debug(f"Received query data: {data}")
    
    question = data.get('message')
    pdf_path = data.get('pdf_path')

    if question and pdf_path:
        logging.debug(f"Question: {question}, PDF Path: {pdf_path}")
        try:
            response = process_pdf_query(pdf_path, question)
            
            if 'error' in response:
                logging.error(f"Error from PDF query: {response['error']}")
                return jsonify(response), 500

            logging.debug(f"Response from PDF query: {response}")
            return jsonify({'text': response['text']}), 200

        except Exception as e:
            logging.error(f"Error processing PDF query: {str(e)}")
            return jsonify({"error": "Failed to process PDF query. " + str(e)}), 500
    else:
        logging.error(f"Invalid input: question={question}, pdf_path={pdf_path}")
        return jsonify({"error": "Invalid input. Please provide both question and pdf_path."}), 400

if __name__ == '__main__':
    app.run(debug=True)
