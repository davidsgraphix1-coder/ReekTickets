"""
Reusable helper for sending SMS through the Zenoph SDK.

Use this module from your application after installing the package in the target environment.
"""

from Zenoph.Notify.Request.AuthRequest import AuthRequest
from Zenoph.Notify.Request.SMSRequest import SMSRequest
from Zenoph.Notify.Store.AuthProfile import AuthProfile
from Zenoph.Notify.Response.MessageResponse import MessageResponse

API_HOST = "api.smsonlinegh.com"


def create_auth_profile(api_key: str) -> AuthProfile:
    if api_key is None or len(api_key.strip()) == 0:
        raise ValueError("API key must be provided.")

    auth_request = AuthRequest()
    auth_request.setHost(API_HOST)
    auth_request.setAuthApiKey(api_key)
    auth_response = auth_request.authenticate()
    return auth_response


def send_sms(auth_profile: AuthProfile, sender_id: str, destination_phone: str, message_text: str) -> MessageResponse:
    if auth_profile is None:
        raise ValueError("Authenticated AuthProfile must be provided.")

    if sender_id is None or len(sender_id.strip()) == 0:
        raise ValueError("Sender ID must be provided.")

    if destination_phone is None or len(destination_phone.strip()) == 0:
        raise ValueError("Destination phone number must be provided.")

    if message_text is None or len(message_text.strip()) == 0:
        raise ValueError("Message text must be provided.")

    sms_request = SMSRequest(auth_profile)
    sms_request.setHost(API_HOST)
    sms_request.setSender(sender_id)
    sms_request.setMessage(message_text)
    sms_request.addDestination(destination_phone)
    return sms_request.submit()


def send_sms_with_api_key(api_key: str, sender_id: str, destination_phone: str, message_text: str) -> MessageResponse:
    auth_profile = create_auth_profile(api_key)
    return send_sms(auth_profile, sender_id, destination_phone, message_text)
