

import os
import PyPDF2
import logging
import google.generativeai as genai
from dotenv import load_dotenv

# Configure logging
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Generation configuration for Gemini
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Initialize the Gemini model with custom generation config for PDF and chat
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Directory to save uploaded files
# UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file using PyPDF2."""
    try:
        with open(pdf_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            extracted_text = ""
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text
            logging.debug(f"Extracted PDF text: {extracted_text[:500]}...")  # Log a snippet of the extracted text
            return extracted_text
    except Exception as e:
        logging.error(f"Error extracting PDF context: {e}")
        return ""

def process_pdf_query(pdf_path, question):
    """Processes the PDF query by uploading the PDF and asking a question."""
    try:
        # Extract context from PDF
        context = extract_text_from_pdf(pdf_path)

        if not context:
            return {"error": "Failed to extract context from the PDF."}

        # Start a chat session for PDF interaction
        chat_session = model.start_chat(
            history=[
                {"role": "user", "parts": [{"text": f"Context: {context}"}]},
                {"role": "user", "parts": [{"text": f"Question: {question}"}]}
            ]
        )

        # Get the response from the chat session
        response = chat_session.send_message(question)
        
        # Ensure that the response is formatted as a string
        return {"text": response.text.strip()}  # Strip to clean up any extra spaces or newlines
    
    except Exception as e:
        logging.error(f"Error processing PDF query: {e}")
        return {"error": f"An error occurred while processing the PDF query: {str(e)}"}


def handle_chat_query(user_input):
    """Handles the chat query using the Gemini chat model."""
    try:
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(user_input)

        # Check if the 'response.text' contains another 'text' field and return it correctly
        if isinstance(response.text, dict):
            # If there's a nested 'text', return that
            return {"text": response.text.get('text', 'No response available')}
        else:
            # Otherwise, just return 'response.text' directly
            return {"text": str(response.text)}
    except Exception as e:
        logging.error(f"Error during chat query: {e}")
        return {"error": f"An error occurred while processing the chat input: {str(e)}"}


# if __name__ == "__main__":
#     print("Welcome to the Chatbot! Type 'exit' to quit.")
#     while True:
#         user_input = input("User: ")
#         if user_input.lower() == "exit":
#             break
#         elif user_input.lower().startswith("pdf:"):
#             pdf_path = user_input.split(":")[1].strip()
#             question = input("Question about the PDF: ")
#             result = process_pdf_query(pdf_path, question)
#             if 'text' in result:
#                 print(f"Bot: {result['text']}\n")
#             else:
#                 print(f"Bot: {result['error']}\n")
#         else:
#             response = handle_chat_query(user_input)
#             print(f"Bot: {response['text'] if 'text' in response else response['error']}\n")




# import os
# import PyPDF2
# import logging
# import google.generativeai as genai
# import time  # Added to simulate streaming delay
# from dotenv import load_dotenv

# # Configure logging
# load_dotenv()

# logging.basicConfig(level=logging.DEBUG)
# genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# # Generation configuration for Gemini
# generation_config = {
#     "temperature": 1,
#     "top_p": 0.95,
#     "top_k": 64,
#     "max_output_tokens": 8192,
#     "response_mime_type": "text/plain",
# }

# # Initialize the Gemini model with custom generation config for PDF and chat
# model = genai.GenerativeModel(
#     model_name="gemini-1.5-flash",
#     generation_config=generation_config,
# )

# def extract_text_from_pdf(pdf_path):
#     """Extracts text from a PDF file using PyPDF2."""
#     try:
#         with open(pdf_path, 'rb') as pdf_file:
#             pdf_reader = PyPDF2.PdfReader(pdf_file)
#             extracted_text = ""
#             for page in pdf_reader.pages:
#                 text = page.extract_text()
#                 if text:
#                     extracted_text += text
#             logging.debug(f"Extracted PDF text: {extracted_text[:500]}...")  # Log a snippet of the extracted text
#             return extracted_text
#     except Exception as e:
#         logging.error(f"Error extracting PDF context: {e}")
#         return ""

# def simulate_streaming(text, delay=0.1):
#     """Helper function to simulate streaming by yielding text in chunks."""
#     words = text.split()
#     for i in range(0, len(words), 5):  # Yield 5 words at a time
#         yield ' '.join(words[i:i+5]) + " "
#         time.sleep(delay)  # Simulate delay for streaming effect

# def process_pdf_query_streaming(pdf_path, question):
#     """Processes the PDF query by extracting text and streaming the response."""
#     try:
#         # Extract context from PDF
#         context = extract_text_from_pdf(pdf_path)

#         if not context:
#             yield {"error": "Failed to extract context from the PDF."}
#             return

#         # Start a chat session for PDF interaction
#         chat_session = model.start_chat(
#             history=[
#                 {"role": "user", "parts": [{"text": f"Context: {context}"}]},
#                 {"role": "user", "parts": [{"text": f"Question: {question}"}]}
#             ]
#         )

#         # Get the response from the chat session (no streaming support natively)
#         response = chat_session.send_message(question)

#         # Simulate streaming by breaking the response text into chunks
#         for chunk in simulate_streaming(response.text.strip()):
#             yield chunk
    
#     except Exception as e:
#         logging.error(f"Error processing PDF query: {e}")
#         yield {"error": f"An error occurred while processing the PDF query: {str(e)}"}

# def handle_chat_query_streaming(user_input):
#     """Handles the chat query using the Gemini chat model with simulated streaming."""
#     try:
#         chat_session = model.start_chat(history=[])

#         # Get the response from the chat session (no streaming support natively)
#         response = chat_session.send_message(user_input)

#         # Simulate streaming by breaking the response text into chunks
#         for chunk in simulate_streaming(response.text.strip()):
#             yield chunk
    
#     except Exception as e:
#         logging.error(f"Error during chat query: {e}")
#         yield {"error": f"An error occurred while processing the chat input: {str(e)}"}

# # if __name__ == "__main__":
# #     print("Welcome to the Chatbot! Type 'exit' to quit.")
# #     while True:
# #         user_input = input("User: ")
# #         if user_input.lower() == "exit":
# #             break
# #         elif user_input.lower().startswith("pdf:"):
# #             pdf_path = user_input.split(":")[1].strip()
# #             question = input("Question about the PDF: ")
# #             result = process_pdf_query_streaming(pdf_path, question)
# #             for chunk in result:
# #                 print(chunk, end='', flush=True)
# #             print()  # Print a newline when done
# #         else:
# #             response = handle_chat_query_streaming(user_input)
# #             for chunk in response:
# #                 print(chunk, end='', flush=True)
# #             print()  # Print a newline when done
