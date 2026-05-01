import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get configuration
API_HOST = os.getenv("API_HOST", "api.smsonlinegh.com")
API_KEY = os.getenv("API_KEY")
SENDER_ID = os.getenv("SENDER_ID", "ReekTickets")

# Validate required configuration
if API_KEY is None or len(API_KEY.strip()) == 0:
    raise RuntimeError("API_KEY must be set in python-backend/.env or environment")

# Import Zenoph SDK
try:
    from Zenoph.Notify.Request.AuthRequest import AuthRequest
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
    ZENOPH_AVAILABLE = True
except ImportError as e:
    print(f"WARNING: Failed to import Zenoph SDK: {e}", file=sys.stderr)
    ZENOPH_AVAILABLE = False

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Enable logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_auth_profile():
    """Authenticate with the SMS API"""
    try:
        auth_request = AuthRequest()
        auth_request.setHost(API_HOST)
        auth_request.setAuthApiKey(API_KEY)
        auth_response = auth_request.authenticate()
        
        http_status = auth_response.getHttpStatusCode()
        logger.info(f"Authentication response: {http_status}")
        
        if http_status >= 400:
            raise Exception(f"Authentication failed with status {http_status}")
        
        return auth_response
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise


def format_ticket_sms_message(data):
    ticket = data.get("ticket") or {}
    event = data.get("event") or ticket.get("event") or {}
    ticket_code = ticket.get("smsCode") or ticket.get("sms_code") or ticket.get("reference") or ticket.get("code") or ticket.get("ticketCode")
    access_code = ticket.get("smsCode") or ticket.get("sms_code") or ticket.get("accessCode") or ticket.get("access_code")
    event_title = event.get("title") or event.get("name") or ticket.get("eventName") or "Your Event"
    event_location = event.get("location") or ticket.get("location") or "Venue"
    event_date = event.get("date") or ticket.get("date") or ticket.get("eventDate")
    ticket_link = data.get("ticketLink") or data.get("ticket_link") or data.get("ticketUrl") or ticket.get("ticketLink") or ticket.get("url")

    if not ticket_link and ticket_code:
        frontend_url = os.getenv("FRONTEND_URL", "https://reektickets.com").rstrip("/")
        ticket_link = f"{frontend_url}/ticket/{ticket_code}?code={access_code or ''}"

    text_parts = [
        "Thank you for using ReekTickets!",
        f"Event: {event_title}",
    ]

    if event_date:
        text_parts.append(f"Date: {event_date}")
    text_parts.extend([
        f"Location: {event_location}",
        f"Ticket Code: {ticket_code}" if ticket_code else None,
        f"Access Code: {access_code}" if access_code else None,
        f"View your ticket: {ticket_link}" if ticket_link else None,
        "Show this SMS at the gate for quick entry."
    ])

    return "\n".join([part for part in text_parts if part])


@app.route("/api/send-sms", methods=["POST"])
@app.route("/api/sms/send", methods=["POST"])
@app.route("/sms/send", methods=["POST"])
def send_sms():
    """Send SMS via Zenoph SDK"""
    try:
        if not ZENOPH_AVAILABLE:
            return jsonify({"success": False, "error": "Zenoph SDK not available"}), 500

        data = request.get_json(force=True)

        phone = data.get("phone")
        message_text = data.get("message")

        if not message_text and (data.get("ticket") or data.get("ticketLink") or data.get("ticket_link")):
            message_text = format_ticket_sms_message(data)

        # Validate input
        if not phone or not message_text:
            logger.warning("Missing phone or message in request")
            return jsonify({"error": "phone and message are required"}), 400

        logger.info(f"Sending SMS to {phone}")

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
        
        logger.info(f"SMS sent with status {http_status}: {data_fragment}")
        
        return jsonify({
            "success": http_status < 400,
            "status": http_status,
            "data": data_fragment,
            "message": "SMS sent successfully" if http_status < 400 else "Failed to send SMS"
        }), 200 if http_status < 400 else 500
        
    except Exception as e:
        logger.error(f"Error sending SMS: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Failed to send SMS"
        }), 500


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "OK", "message": "ReekTickets SMS Backend is running"}), 200


@app.route("/api/health", methods=["GET"])
def api_health():
    """API health check"""
    return jsonify({
        "status": "healthy",
        "service": "SMS Backend",
        "host": API_HOST,
        "sender_id": SENDER_ID,
        "zenoph_available": ZENOPH_AVAILABLE
    }), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
