#!/usr/bin/env python3
"""
Zenoph SMS Backend Service
Exposes HTTP endpoints for SMS sending via Zenoph SDK
Can be deployed to Railway, Render, or other Python platforms
"""

import os
import sys
import json
from flask import Flask, request, jsonify
from datetime import datetime

# Import the Zenoph SMS client
from zenoph_client import send_sms_with_api_key, create_auth_profile, send_sms

# Environment variables
SMS_API_KEY = os.getenv("SMS_API_KEY", "")
SMS_SENDER_ID = os.getenv("SMS_SENDER_ID", "ReekTickets")
SMS_API_HOST = os.getenv("SMS_API_HOST", "api.smsonlinegh.com")
PORT = int(os.getenv("PORT", 5000))

# Create Flask app
app = Flask(__name__)

# Logging setup
LOG_FILE = os.path.join(os.path.dirname(__file__), "sms_delivery.log")

def log_sms(message):
    """Log SMS events to file"""
    try:
        with open(LOG_FILE, "a") as f:
            f.write(f"[{datetime.now().isoformat()}] {message}\n")
    except Exception as e:
        print(f"[LOGGING ERROR] {e}", file=sys.stderr)


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "SMS Backend (Zenoph)",
        "host": SMS_API_HOST,
        "sender_id": SMS_SENDER_ID
    }), 200


@app.route("/api/send-sms", methods=["POST"])
def send_sms_endpoint():
    """
    Send SMS via Zenoph SDK
    
    Request body:
    {
      "phone": "0273476701",
      "message": "Test message"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON body provided"
            }), 400
        
        phone = data.get("phone", "").strip()
        message = data.get("message", "").strip()
        
        if not phone or not message:
            return jsonify({
                "success": False,
                "error": "phone and message are required"
            }), 400
        
        if not SMS_API_KEY:
            log_sms(f"ERROR: SMS_API_KEY not set")
            return jsonify({
                "success": False,
                "error": "SMS_API_KEY is not configured"
            }), 500
        
        # Format phone number
        clean_phone = phone.replace(" ", "").replace("+", "").lstrip("0")
        if not clean_phone.startswith("233"):
            clean_phone = f"233{clean_phone}"
        
        print(f"[SMS] Sending to {clean_phone}: {message[:50]}...", file=sys.stderr)
        log_sms(f"Request: {clean_phone} | {message[:100]}")
        
        try:
            # Send SMS using Zenoph SDK
            auth_profile = create_auth_profile(SMS_API_KEY)
            response = send_sms(auth_profile, SMS_SENDER_ID, clean_phone, message)
            
            http_status = response.getHttpStatusCode()
            data_fragment = response.getDataFragment()
            
            print(f"[SMS] Zenoph response status: {http_status}", file=sys.stderr)
            log_sms(f"Zenoph send {clean_phone} | status: {http_status} | data: {data_fragment}")
            
            if http_status < 400:
                return jsonify({
                    "success": True,
                    "status": http_status,
                    "message": f"SMS sent successfully to {clean_phone}",
                    "data": data_fragment
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "status": http_status,
                    "error": f"Zenoph returned HTTP {http_status}",
                    "data": data_fragment
                }), 500
        
        except Exception as e:
            error_msg = str(e)
            print(f"[SMS] Error: {error_msg}", file=sys.stderr)
            log_sms(f"Error for {clean_phone}: {error_msg}")
            import traceback
            traceback.print_exc(file=sys.stderr)
            
            return jsonify({
                "success": False,
                "error": error_msg,
                "message": "Failed to send SMS via Zenoph"
            }), 500
    
    except Exception as e:
        error_msg = str(e)
        print(f"[SMS] Endpoint error: {error_msg}", file=sys.stderr)
        return jsonify({
            "success": False,
            "error": error_msg
        }), 500


@app.route("/api/send-otp", methods=["POST"])
def send_otp_endpoint():
    """
    Send OTP via Zenoph SDK
    
    Request body:
    {
      "phone": "0273476701",
      "otp": "123456"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON body provided"
            }), 400
        
        phone = data.get("phone", "").strip()
        otp = data.get("otp", "").strip()
        
        if not phone or not otp:
            return jsonify({
                "success": False,
                "error": "phone and otp are required"
            }), 400
        
        message = f"Your ReekTickets verification code is {otp}"
        
        # Format phone number
        clean_phone = phone.replace(" ", "").replace("+", "").lstrip("0")
        if not clean_phone.startswith("233"):
            clean_phone = f"233{clean_phone}"
        
        print(f"[OTP] Sending OTP to {clean_phone}", file=sys.stderr)
        log_sms(f"OTP Request: {clean_phone} | {otp}")
        
        try:
            if not SMS_API_KEY:
                log_sms(f"ERROR: SMS_API_KEY not set")
                return jsonify({
                    "success": False,
                    "error": "SMS_API_KEY is not configured"
                }), 500
            
            auth_profile = create_auth_profile(SMS_API_KEY)
            response = send_sms(auth_profile, SMS_SENDER_ID, clean_phone, message)
            
            http_status = response.getHttpStatusCode()
            data_fragment = response.getDataFragment()
            
            print(f"[OTP] Zenoph response status: {http_status}", file=sys.stderr)
            log_sms(f"OTP Zenoph send {clean_phone} | status: {http_status} | data: {data_fragment}")
            
            if http_status < 400:
                return jsonify({
                    "success": True,
                    "status": http_status,
                    "message": f"OTP sent successfully to {clean_phone}",
                    "data": data_fragment
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "status": http_status,
                    "error": f"Zenoph returned HTTP {http_status}",
                    "data": data_fragment
                }), 500
        
        except Exception as e:
            error_msg = str(e)
            print(f"[OTP] Error: {error_msg}", file=sys.stderr)
            log_sms(f"OTP Error for {clean_phone}: {error_msg}")
            import traceback
            traceback.print_exc(file=sys.stderr)
            
            return jsonify({
                "success": False,
                "error": error_msg,
                "message": "Failed to send OTP via Zenoph"
            }), 500
    
    except Exception as e:
        error_msg = str(e)
        print(f"[OTP] Endpoint error: {error_msg}", file=sys.stderr)
        return jsonify({
            "success": False,
            "error": error_msg
        }), 500


@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return jsonify({
        "status": "running",
        "service": "ReekTickets SMS Backend (Zenoph)",
        "endpoints": {
            "/api/health": "GET - Health check",
            "/api/send-sms": "POST - Send SMS",
            "/api/send-otp": "POST - Send OTP"
        }
    }), 200


if __name__ == "__main__":
    print(f"Starting SMS Backend on port {PORT}", file=sys.stderr)
    print(f"API Key configured: {bool(SMS_API_KEY)}", file=sys.stderr)
    print(f"Sender ID: {SMS_SENDER_ID}", file=sys.stderr)
    print(f"API Host: {SMS_API_HOST}", file=sys.stderr)
    app.run(host="0.0.0.0", port=PORT, debug=False)
