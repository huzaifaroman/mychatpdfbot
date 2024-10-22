from flask import Flask, request, jsonify
from flask_cors import CORS
from models import process_pdf_query, handle_chat_query
import os
import logging

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])


# Configure logging
logging.basicConfig(level=logging.DEBUG, filename='app.log', 
                    format='%(asctime)s %(levelname)s:%(message)s')

# Set the absolute path for the uploads directory
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    """Endpoint to upload a PDF file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file.content_type != 'application/pdf':
        return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400

    # Use the original filename of the uploaded PDF
    pdf_filename = file.filename
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

    # Save the uploaded file
    file.save(pdf_path)

    app.logger.debug(f"Uploaded PDF saved at: {pdf_path}")

    return jsonify({'pdf_path': pdf_path, 'message': "Your PDF has been uploaded and processed."}), 200

@app.route('/api/pdf-query', methods=['POST'])
def pdf_query():
    """Endpoint to query the PDF content."""
    data = request.json
    app.logger.debug(f"Received query data: {data}")
    
    question = data.get('message')
    pdf_path = data.get('pdf_path')

    if question and pdf_path:
        app.logger.debug(f"Question: {question}, PDF Path: {pdf_path}")
        try:
            response = process_pdf_query(pdf_path, question)
            
            if 'error' in response:
                app.logger.error(f"Error from PDF query: {response['error']}")
                return jsonify(response), 500

            app.logger.debug(f"Response from PDF query: {response}")
            return jsonify({'text': response['text']}), 200

        except Exception as e:
            app.logger.error(f"Error processing PDF query: {str(e)}")
            return jsonify({"error": "Failed to process PDF query. " + str(e)}), 500
    else:
        app.logger.error(f"Invalid input: question={question}, pdf_path={pdf_path}")
        return jsonify({"error": "Invalid input. Please provide both question and pdf_path."}), 400


@app.route('/api/chat', methods=['POST'])
def chat():
    """Endpoint to handle chat messages."""
    data = request.json
    user_input = data.get('message')
    
    if user_input:
        try:
            response = handle_chat_query(user_input)

            if 'error' in response:
                app.logger.error(f"Error from chat handler: {response['error']}")
                return jsonify(response), 500

            app.logger.debug(f"Chat response: {response}")
            # Instead of wrapping the response in another dict, return it as is
            return jsonify({'text': response['text']}), 200

        except Exception as e:
            app.logger.error(f"Error during chat handling: {str(e)}")
            return jsonify({"error": "An error occurred while processing your chat input. " + str(e)}), 500
    else:
        app.logger.error("No input provided in chat request.")
        return jsonify({"error": "No input provided. Please send a message."}), 400


if __name__ == '__main__':
    app.run(debug=True, port=5000)



# # import os
# # import PyPDF2
# # import logging
# # import google.generativeai as genai
# # from dotenv import load_dotenv
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS

# # # Initialize Flask app
# # app = Flask(__name__)
# # CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# # # Configure logging
# # load_dotenv()
# # logging.basicConfig(level=logging.DEBUG)
# # genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# # # Generation configuration for Gemini
# # generation_config = {
# #     "temperature": 1,
# #     "top_p": 0.95,
# #     "top_k": 64,
# #     "max_output_tokens": 8192,
# #     "response_mime_type": "text/plain",
# # }

# # # Initialize the Gemini model with custom generation config for PDF and chat
# # model = genai.GenerativeModel(
# #     model_name="gemini-1.5-flash",
# #     generation_config=generation_config,
# # )

# # def extract_text_from_pdf(pdf_path):
# #     """Extracts text from a PDF file using PyPDF2."""
# #     try:
# #         with open(pdf_path, 'rb') as pdf_file:
# #             pdf_reader = PyPDF2.PdfReader(pdf_file)
# #             extracted_text = ""
# #             for page in pdf_reader.pages:
# #                 text = page.extract_text()
# #                 if text:
# #                     extracted_text += text
# #             logging.debug(f"Extracted PDF text: {extracted_text[:500]}...")  # Log a snippet of the extracted text
# #             return extracted_text
# #     except Exception as e:
# #         logging.error(f"Error extracting PDF context: {e}")
# #         return ""

# # def process_pdf_query(pdf_path, question):
# #     """Processes the PDF query by extracting text and asking a question."""
# #     try:
# #         context = extract_text_from_pdf(pdf_path)
# #         if not context:
# #             return {"error": "Failed to extract context from the PDF."}

# #         chat_session = model.start_chat(
# #             history=[
# #                 {"role": "user", "parts": [{"text": f"Context: {context}"}]},
# #                 {"role": "user", "parts": [{"text": f"Question: {question}"}]}
# #             ]
# #         )
# #         response = chat_session.send_message(question)
# #         return {"text": response.text}
    
# #     except Exception as e:
# #         logging.error(f"Error processing PDF query: {e}")
# #         return {"error": f"An error occurred while processing the PDF query: {str(e)}"}

# # def handle_chat_query(user_input):
# #     """Handles the chat query using the Gemini chat model."""
# #     try:
# #         chat_session = model.start_chat(history=[])
# #         response = chat_session.send_message(user_input)
# #         return {"text": response.text}
    
# #     except Exception as e:
# #         logging.error(f"Error during chat query: {e}")
# #         return {"error": f"An error occurred while processing the chat input: {str(e)}"}

# # @app.route('/api/chat', methods=['POST'])
# # def chat():
# #     """Endpoint to handle chat queries and PDF queries."""
# #     data = request.json
# #     user_input = data.get("input")
# #     pdf_path = data.get("pdf_path")  # Get the PDF path if provided

# #     # Check if the user is asking about a PDF
# #     if pdf_path and user_input:
# #         return jsonify(process_pdf_query(pdf_path, user_input))
# #     elif user_input:
# #         return jsonify(handle_chat_query(user_input))
# #     else:
# #         return jsonify({"error": "Invalid input. Please provide a question."}), 400

# # if __name__ == "__main__":
# #     app.run(debug=True)


# from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# from models import process_pdf_query_streaming, handle_chat_query_streaming
# import os
# import logging

# app = Flask(__name__)
# CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

# # Configure logging
# logging.basicConfig(level=logging.DEBUG, filename='app.log', 
#                     format='%(asctime)s %(levelname)s:%(message)s')

# # Set the absolute path for the uploads directory
# UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

# if not os.path.exists(UPLOAD_FOLDER):
#     os.makedirs(UPLOAD_FOLDER)

# @app.route('/api/upload-pdf', methods=['POST'])
# def upload_pdf():
#     """Endpoint to upload a PDF file."""
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file part'}), 400
    
#     file = request.files['file']
    
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400
    
#     if file.content_type != 'application/pdf':
#         return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400

#     # Use the original filename of the uploaded PDF
#     pdf_filename = file.filename
#     pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)

#     # Save the uploaded file
#     file.save(pdf_path)

#     app.logger.debug(f"Uploaded PDF saved at: {pdf_path}")

#     return jsonify({'pdf_path': pdf_path, 'message': "Your PDF has been uploaded and processed."}), 200

# @app.route('/api/pdf-query', methods=['POST'])
# def pdf_query():
#     """Endpoint to query the PDF content."""
#     data = request.json
#     app.logger.debug(f"Received query data: {data}")
    
#     question = data.get('message')
#     pdf_path = data.get('pdf_path')

#     if question and pdf_path:
#         app.logger.debug(f"Question: {question}, PDF Path: {pdf_path}")
        
#         # Start a new PDF query session (if needed)
#         # This part can be handled based on your logic for processing PDF queries
#         return jsonify({'pdf_path': pdf_path, 'message': 'Processing your PDF query.'}), 200

#     else:
#         app.logger.error(f"Invalid input: question={question}, pdf_path={pdf_path}")
#         return jsonify({"error": "Invalid input. Please provide both question and pdf_path."}), 400

# @app.route('/api/pdf-query/stream/<path:pdf_path>', methods=['GET'])
# def pdf_query_stream(pdf_path):
#     """Stream responses for PDF queries."""
#     question = request.args.get('question')  # Keep the question as a query parameter

#     if question:
#         def generate():
#             try:
#                 response = process_pdf_query_streaming(pdf_path, question)
#                 for chunk in response:
#                     yield f"data: {chunk}\n\n"  # SSE format for each chunk
#             except Exception as e:
#                 app.logger.error(f"Error processing PDF query: {str(e)}")
#                 yield f'data: {{"error": "An error occurred while processing the PDF query: {str(e)}"}}\n\n'
        
#         return Response(generate(), mimetype='text/event-stream')

#     else:
#         app.logger.error("No question provided for PDF query streaming.")
#         return jsonify({"error": "No question provided. Please include a question."}), 400

# @app.route('/api/chat', methods=['POST'])
# def chat():
#     """Endpoint to handle chat messages."""
#     data = request.json
#     user_input = data.get('message')
    
#     if user_input:
#         # Start a new chat session (if needed)
#         # This part can be handled based on your logic for processing chat queries
#         return jsonify({'message': 'Processing your chat input.'}), 200

#     else:
#         app.logger.error("No input provided in chat request.")
#         return jsonify({"error": "No input provided. Please send a message."}), 400

# @app.route('/api/chat/stream/<int:chat_id>', methods=['GET'])
# def chat_stream(chat_id):
#     """Stream responses for chat messages."""
#     user_input = request.args.get('message')  # Change this to query parameters instead of JSON body

#     if user_input:
#         def generate():
#             try:
#                 response = handle_chat_query_streaming(user_input)
#                 for chunk in response:
#                     yield f"data: {chunk}\n\n"  # SSE format for each chunk
#             except Exception as e:
#                 app.logger.error(f"Error during chat handling: {str(e)}")
#                 yield f'data: {{"error": "An error occurred while processing your chat input: {str(e)}"}}\n\n'

#         return Response(generate(), mimetype='text/event-stream')

#     else:
#         app.logger.error("No input provided in chat request.")
#         return jsonify({"error": "No input provided. Please send a message."}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)
