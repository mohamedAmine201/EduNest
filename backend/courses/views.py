from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListCreateAPIView 
from .models import Course
from .serializers import CourseSerializer
from .permissions import IsHeadOrReadOnly

class CourseListeCreateAPIView(ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsHeadOrReadOnly]

    def perform_create(self, serializer):
        course = serializer.save()
        from profiles.models import StudentProfile 
        students = StudentProfile.objects.filter(
            speciality_year=course.semester.speciality_year
        )
        course.students.set(students)

    def get_queryset(self):
        user = self.request.user
        roles = user.roles.values_list('role', flat=True)
        if 'STUDENT' in roles:
            return Course.objects.filter(students=user.student_profile)
        elif 'TEACHER' in roles:
            return Course.objects.filter(teacher=user.teacher_profile)
        elif 'HEAD' in roles:
            return Course.objects.all()
        return Course.objects.none()
    
class CourseDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsHeadOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        roles = user.roles.values_list('role', flat=True)
        if 'STUDENT' in roles:
            return Course.objects.filter(students=user.student_profile)
        elif 'TEACHER' in roles:
            return Course.objects.filter(teacher=user.teacher_profile)
        elif 'HEAD' in roles:
            return Course.objects.all()
        return Course.objects.none()