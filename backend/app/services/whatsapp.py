"""
WhatsApp messaging service using Meta's WhatsApp Business API.
Sends messages to phone numbers via the Cloud API.
"""
import os
import requests
import logging

logger = logging.getLogger(__name__)

WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "")
WHATSAPP_API_URL = f"https://graph.facebook.com/v21.0/{WHATSAPP_PHONE_ID}/messages"


def send_whatsapp_message(to_phone: str, message: str) -> dict:
    """
    Send a WhatsApp text message to a phone number.

    Args:
        to_phone: Phone number with country code (e.g., "919876543210")
        message: Text message to send

    Returns:
        dict with status and response
    """
    if not WHATSAPP_TOKEN or not WHATSAPP_PHONE_ID:
        logger.warning("WhatsApp credentials not configured. Message NOT sent.")
        return {"status": "skipped", "reason": "credentials not configured", "message_preview": message[:100]}

    # Clean phone number — remove spaces, dashes, +
    phone = to_phone.replace(" ", "").replace("-", "").replace("+", "")

    # Add India country code if not present
    if len(phone) == 10:
        phone = "91" + phone

    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": phone,
        "type": "text",
        "text": {"body": message},
    }

    try:
        resp = requests.post(WHATSAPP_API_URL, headers=headers, json=payload, timeout=10)
        resp_data = resp.json()

        if resp.status_code == 200:
            logger.info(f"WhatsApp message sent to {phone}")
            return {"status": "sent", "response": resp_data}
        else:
            logger.error(f"WhatsApp API error: {resp_data}")
            return {"status": "failed", "error": resp_data}

    except Exception as e:
        logger.error(f"WhatsApp send error: {str(e)}")
        return {"status": "error", "error": str(e)}
