import json
import logging
from django.conf import settings
from pywebpush import webpush, WebPushException
from .models import Notification, PushSubscription

logger = logging.getLogger(__name__)

def notify_user(user_id: int, message: str, notif_type: str):
    Notification.objects.create(
        user_id=user_id,
        message=message,
        type=notif_type,
    )

    subscriptions = PushSubscription.objects.filter(user_id=user_id)
    print(f"[DEBUG] Found {subscriptions.count()} subscriptions for user {user_id}")

    for sub in subscriptions:
        try:
            webpush(
                subscription_info=sub.to_dict(),
                data=json.dumps({
                    "title": "EduNest",
                    "body": message,
                    "type": notif_type,
                    "icon": f"{settings.FRONTEND_URL}/logoIEC.png",
                    "url": "/",
                }),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"},
            )
        except WebPushException as e:
            if e.response and e.response.status_code == 410:
                # This specific device's subscription expired — remove it
                sub.delete()
            else:
                logger.error(f"Web push failed for user {user_id}: {e}")