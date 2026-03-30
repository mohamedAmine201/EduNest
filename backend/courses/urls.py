from django.urls import path 
from . import views

urlpatterns = [
    path('', views.CourseListeCreateAPIView.as_view(), name='course'),
    path('<int:pk>/', views.CourseDetailAPIView.as_view(), name='course-detail')
]