from django.urls import path 
from . import views 

urlpatterns = [
    path('', views.ProfileListAPIView.as_view()),
    path('update/', views.UpdateProfileView.as_view())
]