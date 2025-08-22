from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get Groq API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

# ✅ Add this route to handle root URL
@app.route("/", methods=["GET"])
def home():
    return "Robin AI Chat backend is running!"

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message").lower().strip()

    # Custom response for name-related questions
    if "your name" in user_input or "who are you" in user_input:
        return jsonify({"reply": "My name is Robin AI. I'm here to help you!"})

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3-8b-8192",  # or try "llama3-70b-8192" if you want a larger model
        "messages": [{"role": "user", "content": user_input}]
    }

    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=data)
        response.raise_for_status()
        result = response.json()

        # Safely extract the message content
        message_content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response from Groq.")
        return jsonify({"reply": message_content})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

