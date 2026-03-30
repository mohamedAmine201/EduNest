from django.contrib import admin
from .models import StudentProfile, TeacherProfile, HeadProfile

admin.site.register(StudentProfile),
admin.site.register(TeacherProfile),
admin.site.register(HeadProfile),