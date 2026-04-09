import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# Get configuration
API_HOST = os.getenv("API_HOST", "api.smsonlinegh.com")
API_KEY = os.getenv("API_KEY")
SENDER_ID = os.getenv("SENDER_ID", "ReekTickets")

# Import Zenoph SDK
try:
    from Zenoph.Notify.Request.AuthRequest import AuthRequest
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
    ZENOPH_AVAILABLE = True
except ImportError as e:
    print(f"WARNING: Failed to import Zenoph SDK: {e}")
    ZENOPH_AVAILABLE = False

def create_auth_profile():
    """Authenticate with the SMS API"""
    if not ZENOPH_AVAILABLE:
        raise Exception("Zenoph SDK not available")

    auth_request = AuthRequest()
    auth_request.setHost(API_HOST)
    auth_request.setAuthApiKey(API_KEY)
    return auth_request.authenticate()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'SMS Backend',
        'host': API_HOST,
        'sender_id': SENDER_ID,
        'zenoph_available': ZENOPH_AVAILABLE
    })

@app.route("/api/send-sms", methods=["POST"])
def send_sms():
    try:
        if not ZENOPH_AVAILABLE:
            return jsonify({"success": False, "error": "Zenoph SDK not available"}), 500

        data = request.get_json(force=True)
        phone = data.get("phone")
        message_text = data.get("message")

        if not phone or not message_text:
            return jsonify({"error": "phone and message are required"}), 400

        # Authenticate and send SMS
        auth_profile = create_auth_profile()

        sms_request = SMSRequest(auth_profile)
        sms_request.setHost(API_HOST)
        sms_request.setSender(SENDER_ID)
        sms_request.setMessage(message_text)
        sms_request.addDestination(phone)

        response = sms_request.submit()

        http_status = response.getHttpStatusCode()
        data_fragment = response.getDataFragment()

        return jsonify({
            "success": http_status < 400,
            "status": http_status,
            "data": data_fragment,
            "message": "SMS sent successfully" if http_status < 400 else "Failed to send SMS"
        }), 200 if http_status < 400 else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to send SMS"
        }), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({'message': 'SMS Backend API'})
