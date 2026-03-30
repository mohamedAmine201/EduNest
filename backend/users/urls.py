from django.urls import path
from . import views  

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),

    path('<int:user_id>/update/', views.UpdateUserView.as_view()),
    path('<int:user_id>/delete/', views.DeleteUserView.as_view()),

    path('spreadsheet-upload/', views.SpreadsheetUploadView.as_view()),
    path('bulk-import/', views.BulkImportView.as_view())
]