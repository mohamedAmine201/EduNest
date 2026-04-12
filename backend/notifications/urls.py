from django.urls import path
from .views import SaveSubscriptionView, UnreadNotificationsView, DeleteSubscriptionView, CheckSubscriptionView

urlpatterns = [
    path("subscribe/", SaveSubscriptionView.as_view()),
    path("unsubscribe/", DeleteSubscriptionView.as_view()),
    path("subscription-status/", CheckSubscriptionView.as_view()),
    path("unread/", UnreadNotificationsView.as_view()),
]