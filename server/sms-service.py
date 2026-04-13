#!/usr/bin/env python3
"""
Flask SMS Service using Zenoph SDK
Deploy this to Vercel or Railway and call it from Node.js
"""

import os
import sys
import json
import traceback
from flask import Flask, request, jsonify

# Add Zenoph SDK to path
ZENOPH_PATH = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ZENOPH_PATH, '../zenoph.notify-2.23.10-python'))

try:
    from Zenoph.Notify.Request.AuthRequest import AuthRequest
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
except ImportError as e:
    print(f"[SMS Service] Warning: Zenoph SDK not installed - {e}")

app = Flask(__name__)

API_KEY = os.getenv('SMS_API_KEY', 'c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b')
SENDER_ID = os.getenv('SMS_SENDER_ID', 'ReekTickets')
HOST = "api.smsonlinegh.com"


def send_sms_zenoph(api_key, sender_id, phone, message):
    """Send SMS using Zenoph SDK"""
    try:
        # Authenticate
        auth_request = AuthRequest()
        auth_request.setHost(HOST)
        auth_request.setAuthApiKey(api_key)
        auth_profile = auth_request.authenticate()
        
        # Send SMS
        sms_request = SMSRequest(auth_profile)
        sms_request.setHost(HOST)
        sms_request.setSender(sender_id)
        sms_request.setMessage(message)
        sms_request.addDestination(phone)
        response = sms_request.submit()
        
        http_status = response.getHttpStatusCode()
        data_fragment = response.getDataFragment()
        
        return {
            'success': http_status == 200,
            'status': http_status,
            'data': str(data_fragment) if data_fragment else '',
            'message': f'SMS sent successfully to {phone}' if http_status == 200 else f'SMS send failed with status {http_status}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': f'SMS sending error: {str(e)}',
            'traceback': traceback.format_exc()
        }


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'SMS Gateway',
        'api_key': 'SET' if API_KEY else 'NOT SET',
        'sender_id': SENDER_ID
    })


@app.route('/send', methods=['POST'])
def send_sms():
    """Send SMS endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        phone = data.get('phone')
        message = data.get('message')
        
        if not phone or not message:
            return jsonify({'error': 'Missing phone or message'}), 400
        
        print(f"[SMS Service] Sending to {phone}: {message[:50]}...")
        
        result = send_sms_zenoph(API_KEY, SENDER_ID, phone, message)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Server error',
            'traceback': traceback.format_exc()
        }), 500


@app.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        phone = data.get('phone')
        otp = data.get('otp')
        
        if not phone or not otp:
            return jsonify({'error': 'Missing phone or otp'}), 400
        
        message = f"Your ReekTickets verification code is {otp}. It expires in 10 minutes."
        print(f"[SMS Service] Sending OTP to {phone}: {otp}")
        
        result = send_sms_zenoph(API_KEY, SENDER_ID, phone, message)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Server error'
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
