from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status 
from .models import StudentProfile, TeacherProfile
from .serializers import StudentSerializer, TeacherSerializer, CourseWithTeacherSerializer

class ProfileListAPIView(APIView):
    def get(self, request):
        role = request.query_params.get("role", 'student')
        year = request.query_params.get("year")
        speciality = request.query_params.get("speciality")

        if role == "student":
            qs = StudentProfile.objects.select_related('user', 'speciality_year')

            if year:
                qs = qs.filter(speciality_year__year=year)
            if speciality:
                qs = qs.filter(speciality_year__speciality=speciality)
            serializer = StudentSerializer(qs, many=True)

        else:  # teacher
            from courses.models import Course
            qs = Course.objects.select_related(
                'teacher__user',
                'semester__speciality_year'
            )
            if year:
                qs = qs.filter(semester__speciality_year__year=year)
            if speciality:
                qs = qs.filter(semester__speciality_year__speciality=speciality)
            serializer = CourseWithTeacherSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)