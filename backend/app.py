from flask import Flask
from flask_cors import CORS  # Import CORS
from api.chat import chat_app  # Correct import for chat blueprint
from api.pdf_query import pdf_query_app  # Import the pdf_query blueprint
from api.upload_pdf import upload_pdf_app  # Import the upload PDF blueprint

app = Flask(__name__)
CORS(app)  # Initialize CORS for the main app

# Register the blueprints
app.register_blueprint(chat_app)
app.register_blueprint(pdf_query_app)
app.register_blueprint(upload_pdf_app)

if __name__ == "__main__":
    app.run(debug=True)
