#!/usr/bin/env python3
"""
SMS Handler for ReekTickets
Sends SMS via Zenoph SDK (SMSONLINEGH API)
"""

import sys
import json
import os

# Get environment variables
SMS_API_HOST = os.getenv("SMS_API_HOST", "api.smsonlinegh.com")
SMS_API_KEY = os.getenv("SMS_API_KEY", "c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "ReekTickets")

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


def send_sms_direct(phone, message):
    """Send SMS via direct SMSONLINEGH API GET request"""
    try:
        # Clean phone number
        phone = phone.replace(" ", "").replace("+", "")
        
        # Convert to international format if local format
        if phone.startswith("0"):
            # 0273476701 -> 233273476701
            phone = "233" + phone[1:]
        elif not phone.startswith("233"):
            # Add 233 if neither format
            phone = "233" + phone
        
        # Build query string
        params = {
            "apikey": SMS_API_KEY,
            "sender": SMS_SENDER_ID,
            "message": message,
            "recipients": phone
        }
        
        url = f"https://{SMS_API_HOST}/sms/send/?{urlencode(params)}"
        
        print(f"[SMS] Phone normalized to: {phone}", file=sys.stderr)
        print(f"[SMS] Sending to {phone} via direct API", file=sys.stderr)
        print(f"[SMS] URL: {url[:100]}...", file=sys.stderr)
        
        response = requests.get(url, timeout=10)
        status_code = response.status_code
        response_text = response.text
        
        print(f"[SMS] HTTP Status: {status_code}", file=sys.stderr)
        print(f"[SMS] Response text: {response_text[:200]}", file=sys.stderr)
        
        try:
            data = response.json()
        except:
            data = {"raw_response": response_text if response_text else "EMPTY"}
        
        print(f"[SMS] Parsed response: {data}", file=sys.stderr)
        
        return {
            "success": status_code == 200 and response_text,
            "status": status_code,
            "data": data,
            "message": "SMS sent successfully" if (status_code == 200 and response_text) else f"Failed: {status_code}"
        }
    
    except requests.exceptions.Timeout:
        print(f"[SMS] Request timeout", file=sys.stderr)
        return {
            "success": False,
            "status": 504,
            "error": "Request timeout",
            "message": "SMS request timed out"
        }
    except Exception as e:
        print(f"[SMS] Exception: {str(e)}", file=sys.stderr)
        return {
            "success": False,
            "status": 500,
            "error": str(e),
            "message": f"Failed to send SMS: {str(e)}"
        }


def send_sms(phone, message):
    """Main SMS sending function"""
    try:
        if not phone or not message:
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
            return {
                "success": False,
                "status": 400,
                "error": f"Invalid phone format: {phone}",
                "message": "Invalid phone format. Use format like 0273476701 or 233273476701"
            }
        
        return send_sms_direct(clean_phone, message)
    
    except Exception as e:
        return {
            "success": False,
            "status": 500,
            "error": str(e),
            "message": f"Failed to send SMS: {str(e)}"
        }


if __name__ == "__main__":
    try:
        # Read input JSON from stdin
        input_data = json.loads(sys.stdin.read())
        phone = input_data.get("phone")
        message = input_data.get("message")
        
        result = send_sms(phone, message)
        
        # Output result as JSON
        print(json.dumps(result))
        
        # Exit with appropriate code
        sys.exit(0 if result["success"] else 1)
    
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "status": 400,
            "error": "Invalid JSON input",
            "message": str(e)
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "status": 500,
            "error": str(e),
            "message": f"Unexpected error: {str(e)}"
        }))
        sys.exit(1)
