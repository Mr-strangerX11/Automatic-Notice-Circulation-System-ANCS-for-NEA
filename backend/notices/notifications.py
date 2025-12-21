import logging
import requests
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_email_notice(subject: str, html_body: str, recipients: list):
    if not recipients:
        return {"status": "skipped", "reason": "no recipients"}
    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send()
        logger.info("Email sent to %s", recipients)
        return {"status": "sent"}
    except Exception as exc:  # pragma: no cover - network dependent
        logger.error("Email send failed: %s", exc)
        return {"status": "failed", "reason": str(exc)}


def send_sms_notice(message: str, phone_numbers: list):
    # Mock Sparrow SMS / NTC integration
    if not phone_numbers:
        return {"status": "skipped", "reason": "no numbers"}
    try:
        for phone in phone_numbers:
            logger.info("SMS queued to %s: %s", phone, message)
        return {"status": "sent"}
    except Exception as exc:  # pragma: no cover
        logger.error("SMS send failed: %s", exc)
        return {"status": "failed", "reason": str(exc)}


def send_push_notice(title: str, body: str, tokens: list):
    if not settings.FCM_SERVER_KEY:
        return {"status": "skipped", "reason": "missing FCM_SERVER_KEY"}
    if not tokens:
        return {"status": "skipped", "reason": "no tokens"}
    headers = {
        "Authorization": f"key={settings.FCM_SERVER_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "registration_ids": tokens,
        "notification": {"title": title, "body": body},
    }
    try:
        resp = requests.post("https://fcm.googleapis.com/fcm/send", json=payload, headers=headers, timeout=10)
        resp.raise_for_status()
        logger.info("Push sent, status %s", resp.status_code)
        return {"status": "sent", "response": resp.json()}
    except Exception as exc:  # pragma: no cover
        logger.error("Push send failed: %s", exc)
        return {"status": "failed", "reason": str(exc)}
