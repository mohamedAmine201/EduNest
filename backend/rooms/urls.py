from django.urls import path 
from . import views 

urlpatterns = [
    path('', views.RoomListCreateAPIView.as_view(), name="room"),
    path('<int:pk>/', views.RoomRetrieveDestroy.as_view(), name='room-detail'),
    path('count/', views.RoomCountAPIView.as_view(), name='room-count'),

    path('messages/', views.MessageListAPIView.as_view(), name='message-list'),
    path('<int:room_id>/messages/', views.RoomMessageListAPIView.as_view(), name="room-message-list"),
    path('<int:room_id>/message-create/', views.MessageCreateAPIView.as_view(), name='message-create'),
    path('message-delete/<int:pk>/', views.MessageDeleteAPIView.as_view(), name='message-delete')
]