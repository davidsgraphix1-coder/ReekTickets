#!/usr/bin/env python3
"""
Vercel Serverless Function for SMS via Zenoph SDK
Deploy this in the api/ folder for automatic Vercel runtime handling
"""

import os
import sys
import json
import traceback

# Add the Zenoph SDK to path
# On Vercel, we'll need to ensure the Zenoph SDK is present
try:
    from Zenoph.Notify.Request.AuthRequest import AuthRequest
    from Zenoph.Notify.Request.SMSRequest import SMSRequest
except ImportError:
    print("Warning: Zenoph SDK not available", file=sys.stderr)


def handler(request):
    """Main handler for Vercel serverless function"""
    
    # Only accept POST requests to /send endpoint
    if request.method != 'POST':
        return {
            'statusCode': 405,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(request.body) if isinstance(request.body, str) else request.body
        
        phone = body.get('phone')
        message = body.get('message')
        
        if not phone or not message:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing phone or message'})
            }
        
        # Get credentials from environment
        api_key = os.getenv('SMS_API_KEY')
        sender_id = os.getenv('SMS_SENDER_ID', 'ReekTickets')
        
        if not api_key:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': 'SMS_API_KEY not configured'})
            }
        
        print(f"[SMS Handler] Sending to {phone}", file=sys.stderr)
        
        # Send SMS via Zenoph SDK
        try:
            auth_request = AuthRequest()
            auth_request.setHost("api.smsonlinegh.com")
            auth_request.setAuthApiKey(api_key)
            auth_profile = auth_request.authenticate()
            
            sms_request = SMSRequest(auth_profile)
            sms_request.setHost("api.smsonlinegh.com")
            sms_request.setSender(sender_id)
            sms_request.setMessage(message)
            sms_request.addDestination(phone)
            response = sms_request.submit()
            
            http_status = response.getHttpStatusCode()
            
            result = {
                'success': http_status == 200,
                'status': http_status,
                'message': f'SMS sent successfully to {phone}' if http_status == 200 else f'SMS failed with status {http_status}'
            }
            
            status_code = 200 if http_status == 200 else 500
            
        except Exception as sdk_error:
            print(f"[SMS Handler] SDK Error: {str(sdk_error)}", file=sys.stderr)
            result = {
                'success': False,
                'error': str(sdk_error),
                'message': f'SMS sending failed: {str(sdk_error)}'
            }
            status_code = 500
        
        return {
            'statusCode': status_code,
            'body': json.dumps(result),
            'headers': {'Content-Type': 'application/json'}
        }
        
    except Exception as e:
        print(f"[SMS Handler] Error: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Server error'
            }),
            'headers': {'Content-Type': 'application/json'}
        }
