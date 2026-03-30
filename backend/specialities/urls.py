from django.urls import path 
from . import views 

urlpatterns = [
    path('', views.SpecialityListAPIView.as_view())
]