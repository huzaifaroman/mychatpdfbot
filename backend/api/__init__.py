from flask import Flask
from flask_cors import CORS
from api.chat import chat_app  # Import chat blueprint
from api.pdf_query import pdf_query_app  # Import pdf_query blueprint
from api.upload_pdf import upload_pdf_app  # Import upload_pdf blueprint

# Create Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Register blueprints
app.register_blueprint(chat_app, url_prefix="/api/chat")
app.register_blueprint(pdf_query_app, url_prefix="/api/pdf_query")
app.register_blueprint(upload_pdf_app, url_prefix="/api/upload_pdf")

# Start the application
if __name__ == "__main__":
    app.run(debug=True)
