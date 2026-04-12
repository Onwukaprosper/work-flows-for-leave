from flask import Flask, request, jsonify
import smtplib

app = Flask(__name__)

# Your email credentials
SENDER_EMAIL = "yourmouau.edu.ng"
SENDER_PASSWORD = "your_app_password"  # Use Gmail App Password

@app.route('/')
def home():
    return "Email API is running..."

@app.route('/api/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json

        to_email = data.get('to')
        subject = data.get('subject')
        message = data.get('message')

        if not to_email or not subject or not message:
            return jsonify({"error": "Missing fields"}), 400

        # Format email
        email_message = f"Subject: {subject}\n\n{message}"

        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)

        # Send email
        server.sendmail(SENDER_EMAIL, to_email, email_message)
        server.quit()

        return jsonify({"status": "Email sent successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)