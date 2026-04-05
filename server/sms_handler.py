#!/usr/bin/env python3
import sys
import json
import os
import requests
from urllib.parse import urlencode




# Get environment variables
SMS_API_HOST = os.getenv("SMS_API_HOST", "api.smsonlinegh.com")
SMS_API_KEY = os.getenv("SMS_API_KEY", "c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "ReekTickets")

# File logger setup - use absolute path
import datetime
# Get the directory of this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.getenv("SMS_LOG_FILE", os.path.join(SCRIPT_DIR, "sms_delivery.log"))

def log_to_file(data):
    try:
        with open(LOG_FILE, "a") as f:
            f.write(f"[{datetime.datetime.now().isoformat()}] {data}\n")
    except Exception as e:
        print(f"[SMS][LOGGING ERROR] {e} | LOG_FILE: {LOG_FILE}", file=sys.stderr)

# Import Zenoph SDK
try:
    from Zenoph.Notify.Request.AuthRequest import AuthRequest
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
    ZENOPH_AVAILABLE = True
    print("[SMS] Zenoph SDK loaded successfully", file=sys.stderr)
except ImportError as e:
    ZENOPH_AVAILABLE = False
    print(f"[SMS] Zenoph SDK not available: {e}", file=sys.stderr)
    print("[SMS] Will use fallback direct API method", file=sys.stderr)


def send_sms_zenoph(phone, message):
    """Send SMS via Zenoph SDK"""
    try:
        if not ZENOPH_AVAILABLE:
            log_to_file(f"Zenoph SDK not available for {phone} | {message}")
            return None
        print(f"[SMS] Attempting Zenoph SDK (host: {SMS_API_HOST})", file=sys.stderr)
        # Create authentication
        auth_request = AuthRequest()
        auth_request.setHost(SMS_API_HOST)
        auth_request.setAuthApiKey(SMS_API_KEY)
        auth_response = auth_request.authenticate()
        print(f"[SMS] Zenoph auth response type: {type(auth_response)}", file=sys.stderr)
        # Check if authentication succeeded
        try:
            auth_status = auth_response.getHttpStatusCode()
            print(f"[SMS] Zenoph auth status: {auth_status}", file=sys.stderr)
            if auth_status >= 400:
                log_to_file(f"Zenoph auth failed for {phone}: {auth_status}")
                print(f"[SMS] Zenoph auth failed with {auth_status}", file=sys.stderr)
                return None
        except AttributeError:
            print(f"[SMS] Zenoph auth successful (no status available)", file=sys.stderr)
        # Create SMS request
        sms_request = SMSRequest(auth_response)
        sms_request.setHost(SMS_API_HOST)
        sms_request.setSender(SMS_SENDER_ID)
        sms_request.setMessage(message)
        sms_request.addDestination(phone)
        print(f"[SMS] Sending SMS via Zenoph to {phone}", file=sys.stderr)
        # Send SMS
        response = sms_request.submit()
        print(f"[SMS] Zenoph submit response type: {type(response)}", file=sys.stderr)
        try:
            http_status = response.getHttpStatusCode()
            data_fragment = response.getDataFragment()
            print(f"[SMS] Zenoph send status: {http_status}", file=sys.stderr)
            log_to_file(f"Zenoph send {phone} | status: {http_status} | data: {data_fragment}")
            if http_status < 400:
                return {
                    "success": True,
                    "status": http_status,
                    "data": data_fragment,
                    "message": "SMS sent successfully via Zenoph"
                }
            else:
                print(f"[SMS] Zenoph failed with status {http_status}", file=sys.stderr)
                return None
        except Exception as e:
            log_to_file(f"Zenoph response parsing error for {phone}: {str(e)}")
            print(f"[SMS] Zenoph response parsing error: {str(e)}", file=sys.stderr)
            return None
    except Exception as e:
        log_to_file(f"Zenoph error for {phone}: {str(e)}")
        print(f"[SMS] Zenoph error: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return None


def send_sms_direct(phone, message):
    """Fallback: Send SMS via direct SMSONLINEGH API"""
    try:
        print(f"[SMS] Using fallback direct API", file=sys.stderr)
        # Clean phone number
        phone = phone.replace(" ", "").replace("+", "")
        # Convert to international format if local format
        if phone.startswith("0"):
            phone = "233" + phone[1:]
        elif not phone.startswith("233"):
            phone = "233" + phone
        # Build query string
        params = {
            "apikey": SMS_API_KEY,
            "sender": SMS_SENDER_ID,
            "message": message,
            "recipients": phone
        }
        url = f"https://{SMS_API_HOST}/sms/send/?{urlencode(params)}"
        print(f"[SMS] Direct API call to {phone}", file=sys.stderr)
        response = requests.get(url, timeout=10)
        status_code = response.status_code
        response_text = response.text
        print(f"[SMS] Direct API status: {status_code}", file=sys.stderr)
        try:
            data = response.json()
        except:
            data = {"raw_response": response_text if response_text else ""}
        log_to_file(f"DirectAPI send {phone} | status: {status_code} | data: {data}")
        if status_code == 200 and response_text:
            return {
                "success": True,
                "status": status_code,
                "data": data,
                "message": "SMS sent successfully via direct API"
            }
        else:
            print(f"[SMS] Direct API failed: {status_code}", file=sys.stderr)
            return {
                "success": False,
                "status": status_code,
                "data": data,
                "message": f"Failed: HTTP {status_code}"
            }
    except requests.exceptions.Timeout:
        log_to_file(f"DirectAPI timeout for {phone}")
        print(f"[SMS] Direct API timeout", file=sys.stderr)
        return {
            "success": False,
            "status": 504,
            "error": "Request timeout",
            "message": "SMS request timed out"
        }
    except Exception as e:
        log_to_file(f"DirectAPI error for {phone}: {str(e)}")
        print(f"[SMS] Direct API error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "status": 500,
            "error": str(e),
            "message": f"Failed to send SMS: {str(e)}"
        }


def send_sms(phone, message):
    """Main SMS sending function - tries Zenoph first, then direct API"""
    try:
        if not phone or not message:
            log_to_file(f"Missing phone or message: {phone} | {message}")
            return {
                "success": False,
                "status": 400,
                "error": "Phone and message are required",
                "message": "Phone and message are required"
            }
        # Clean phone
        clean_phone = phone.replace(" ", "")
        # Validate phone format (Ghana format)
        if not (clean_phone.startswith("0") and len(clean_phone) == 10) and \
           not (clean_phone.startswith("233") and len(clean_phone) == 12):
            log_to_file(f"Invalid phone format: {phone}")
            return {
                "success": False,
                "status": 400,
                "error": f"Invalid phone format: {phone}",
                "message": "Invalid phone format. Use format like 0273476701 or 233273476701"
            }
        # Log the final phone and message for debugging
        print(f"[SMS][DEBUG] Final phone: {clean_phone}", file=sys.stderr)
        print(f"[SMS][DEBUG] Message: {message}", file=sys.stderr)
        log_to_file(f"Attempting SMS: {clean_phone} | {message}")
        # Try Zenoph SDK first
        result = send_sms_zenoph(clean_phone, message)
        if result and result.get("success"):
            log_to_file(f"Zenoph success: {clean_phone} | {result}")
            return result
        print(f"[SMS] Zenoph failed, trying direct API", file=sys.stderr)
        # Fallback to direct API
        result = send_sms_direct(clean_phone, message)
        log_to_file(f"DirectAPI result: {clean_phone} | {result}")
        return result
    except Exception as e:
        log_to_file(f"Fatal error for {phone}: {str(e)}")
        print(f"[SMS] Fatal error: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "status": 500,
            "error": str(e),
            "message": f"Failed to send SMS: {str(e)}"
        }


# --- CLI/main block ---
if __name__ == "__main__":
    # Try to read from stdin first (Node.js spawn mode)
    phone = None
    message = None
    
    try:
        # Check if there's data from stdin
        if not sys.stdin.isatty():
            import select
            if select.select([sys.stdin], [], [], 0.1)[0]:
                stdin_data = sys.stdin.read()
                if stdin_data:
                    try:
                        data = json.loads(stdin_data)
                        phone = data.get('phone')
                        message = data.get('message')
                        print(f"[SMS][DEBUG] Stdin phone: {phone}", file=sys.stderr)
                        print(f"[SMS][DEBUG] Stdin message: {message}", file=sys.stderr)
                    except json.JSONDecodeError:
                        print(f"[SMS] Failed to parse stdin JSON", file=sys.stderr)
    except Exception as e:
        print(f"[SMS] Stdin read error: {str(e)}", file=sys.stderr)
    
    # Fall back to command-line arguments if no stdin data
    if not phone or not message:
        import argparse
        parser = argparse.ArgumentParser(description="Send SMS via Zenoph or direct API")
        parser.add_argument('--phone', type=str, help='Destination phone number')
        parser.add_argument('--message', type=str, help='Message text')
        args, unknown = parser.parse_known_args()
        
        phone = args.phone
        message = args.message
        
        print(f"[SMS][DEBUG] CLI phone: {phone}", file=sys.stderr)
        print(f"[SMS][DEBUG] CLI message: {message}", file=sys.stderr)

    if not phone or not message:
        print(json.dumps({
            "success": False,
            "status": 400,
            "error": "Missing phone or message",
            "message": "Both phone and message are required."
        }))
        sys.exit(1)

    result = send_sms(phone, message)
    print(json.dumps(result))
    sys.exit(0 if result["success"] else 1)
