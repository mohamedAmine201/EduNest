from django.urls import path 
from . import views 

urlpatterns = [
    path('', views.ProfileListAPIView.as_view()),
    path('<int:profile_id>/', views.ProfileDetailAPIView.as_view()),
    path('search/', views.ProfileSearchAPIView.as_view()),
    path('update/', views.UpdateProfileView.as_view())
]