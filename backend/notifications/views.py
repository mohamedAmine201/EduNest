from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification, PushSubscription
from django.db import transaction

class SaveSubscriptionView(APIView):
    def post(self, request):
        data = request.data.get("subscription", {})
        keys = data.get("keys", {})
        endpoint = data.get("endpoint")

        if not endpoint:
            return Response({"error": "missing endpoint"}, status=400)

        with transaction.atomic():
            PushSubscription.objects.update_or_create(
                endpoint=endpoint,
                defaults={
                    "user": request.user,
                    "p256dh": keys.get("p256dh"),
                    "auth": keys.get("auth"),
                },
            )
        return Response({"status": "subscribed"})


class DeleteSubscriptionView(APIView):
    def post(self, request):
        endpoint = request.data.get("endpoint")
        if not endpoint:
            return Response({"error": "missing endpoint"}, status=400)
        PushSubscription.objects.filter(
            user=request.user, endpoint=endpoint
        ).delete()
        return Response({"status": "unsubscribed"})


class CheckSubscriptionView(APIView):
    def post(self, request):  # POST so we can send the endpoint
        endpoint = request.data.get("endpoint")
        if not endpoint:
            return Response({"subscribed": False})
        exists = PushSubscription.objects.filter(
            user=request.user, endpoint=endpoint
        ).exists()
        return Response({"subscribed": exists})


class UnreadNotificationsView(APIView):
    """Fetch unread notifications on login, mark them read."""
    def get(self, request):
        notifs = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).values("id", "message", "type", "created_at")
        return Response(list(notifs))

    def post(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)
        return Response({"status": "ok"})