# api/chat.py
from flask import request, jsonify
from models import handle_chat_query  # Ensure this import works in your new structure
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def handler(request):
    """Endpoint to handle chat messages."""
    data = request.get_json()
    user_input = data.get('message')
    
    if user_input:
        try:
            response = handle_chat_query(user_input)

            if 'error' in response:
                logging.error(f"Error from chat handler: {response['error']}")
                return jsonify(response), 500

            logging.debug(f"Chat response: {response}")
            return jsonify({'text': response['text']}), 200

        except Exception as e:
            logging.error(f"Error during chat handling: {str(e)}")
            return jsonify({"error": "An error occurred while processing your chat input. " + str(e)}), 500
    else:
        logging.error("No input provided in chat request.")
        return jsonify({"error": "No input provided. Please send a message."}), 400
