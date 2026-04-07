#!/usr/bin/env python3
"""
Example usage of the Zenoph SMS SDK for Python.

Fill in your API key, sender ID, and destination phone number.
"""

from Zenoph.Notify.Request.AuthRequest import AuthRequest
from Zenoph.Notify.Request.SMSRequest import SMSRequest

HOST = "api.smsonlinegh.com"
API_KEY = "c6f61e914257462812deaff55c412a213cbf61a6388761016a1b2263d347948b"
SENDER_ID = "ReekTickets"
DESTINATION_PHONE = "0273476701"
MESSAGE_TEXT = "am tired of this ugh"


def authenticate(api_key: str):
    auth_request = AuthRequest()
    auth_request.setHost(HOST)
    auth_request.setAuthApiKey(api_key)
    return auth_request.authenticate()


def send_sms(auth_profile, sender_id: str, destination_phone: str, message: str):
    sms_request = SMSRequest(auth_profile)
    sms_request.setHost(HOST)
    sms_request.setSender(sender_id)
    sms_request.setMessage(message)
    sms_request.addDestination(destination_phone)
    return sms_request.submit()


def main():
    if API_KEY == "YOUR_API_KEY":
        raise SystemExit("Please set API_KEY in this script before running.")

    if SENDER_ID == "YOUR_SENDER_ID":
        raise SystemExit("Please set SENDER_ID in this script before running.")

    if DESTINATION_PHONE == "233XXXXXXXXX":
        raise SystemExit("Please set DESTINATION_PHONE in this script before running.")

    auth_profile = authenticate(API_KEY)

    response = send_sms(auth_profile, SENDER_ID, DESTINATION_PHONE, MESSAGE_TEXT)

    print("HTTP status code:", response.getHttpStatusCode())
    print("Response data fragment:", response.getDataFragment())


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("Error:", exc)
