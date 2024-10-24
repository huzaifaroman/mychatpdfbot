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
app.register_blueprint(chat_app)
app.register_blueprint(pdf_query_app)
app.register_blueprint(upload_pdf_app)

# Start the application
if __name__ == "__main__":
    app.run(debug=True)
