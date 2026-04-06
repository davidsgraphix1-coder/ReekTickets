#!/usr/bin/env python3
"""
SMS Handler for ReekTickets
Sends SMS via Zenoph SDK (SMSONLINEGH API) with fallback to direct API
"""

import sys
import json
import os
import requests
from urllib.parse import urlencode

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


def send_sms_zenoph(phone, message):
    """Send SMS via Zenoph SDK"""
    try:
        if not ZENOPH_AVAILABLE:
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
                print(f"[SMS] Zenoph auth failed with {auth_status}", file=sys.stderr)
                return None
        except AttributeError:
            # If getHttpStatusCode not available, assume success and continue
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
            print(f"[SMS] Zenoph response parsing error: {str(e)}", file=sys.stderr)
            return None
    
    except Exception as e:
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
        print(f"[SMS] Direct API timeout", file=sys.stderr)
        return {
            "success": False,
            "status": 504,
            "error": "Request timeout",
            "message": "SMS request timed out"
        }
    except Exception as e:
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
        
        print(f"[SMS] Sending to {clean_phone}", file=sys.stderr)
        
        # Try Zenoph SDK first
        result = send_sms_zenoph(clean_phone, message)
        if result and result.get("success"):
            return result
        
        print(f"[SMS] Zenoph failed, trying direct API", file=sys.stderr)
        
        # Fallback to direct API
        result = send_sms_direct(clean_phone, message)
        return result
    
    except Exception as e:
        print(f"[SMS] Fatal error: {str(e)}", file=sys.stderr)
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
