from django.urls import path 
from . import views

urlpatterns = [
    path('', views.CourseListeCreateAPIView.as_view(), name='course'),
    path('<int:pk>/', views.CourseDetailAPIView.as_view(), name='course-detail'),

    path('<int:course_id>/evaluations/', views.EvaluationListCreateView.as_view()),

    path('<int:course_id>/grades/upload/', views.GradeUploadPreviewAPIView.as_view()),
    path('<int:course_id>/grades/confirm/', views.GradeConfirmAPIView.as_view()),
    path('<int:course_id>/grades/', views.CourseGradesListView.as_view()),
]