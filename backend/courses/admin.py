from django.contrib import admin
from .models import Course, Evaluation, StudentEvaluation, StudentCourse 

admin.site.register(Course),
admin.site.register(Evaluation),
admin.site.register(StudentEvaluation),
admin.site.register(StudentCourse),