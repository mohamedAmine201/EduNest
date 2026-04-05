from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework import status 
from rest_framework.parsers import MultiPartParser, FormParser
from .models import StudentProfile, TeacherProfile
from .serializers import StudentSerializer, TeacherSerializer, CourseWithTeacherSerializer

class ProfileListAPIView(APIView):
    def get(self, request):
        from courses.models import Course
        from collections import defaultdict

        students = StudentSerializer(
            StudentProfile.objects.select_related('user', 'speciality_year'),
            many=True
        ).data

        # Start from TeacherProfile, not from Course
        teacher_profiles = TeacherProfile.objects.select_related('user')

        # Build course data per teacher
        course_map = defaultdict(list)
        year_map   = defaultdict(set)
        spec_map   = defaultdict(set)

        courses_qs = Course.objects.prefetch_related(
            'teachers__user'
        ).select_related('semester__speciality_year')

        for course in courses_qs:
            for teacher in course.teachers.all():
                tid = teacher.user.id
                course_map[tid].append(course.name)
                if course.semester and course.semester.speciality_year:
                    year_map[tid].add(str(course.semester.speciality_year.year))
                    spec_map[tid].add(course.semester.speciality_year.speciality)

        teachers = []
        for tp in teacher_profiles:
            uid = tp.user.id
            teachers.append({
                'user_id':      uid,
                'identifier':   tp.user.identifier,
                'nom':          tp.user.last_name,
                'prenom':       tp.user.first_name,
                'email':        tp.user.email,
                'phone_number': tp.user.phone_number,
                'role':         tp.user.role,
                'courses':      ', '.join(course_map[uid]) or None,
                'year':         ', '.join(year_map[uid])   or None,
                'speciality':   ', '.join(spec_map[uid])   or None,
                'display_year': None,
                'display_speciality': None
            })

        return Response({
            'students': students,
            'teachers': teachers,
        }, status=status.HTTP_200_OK)
    

class UpdateProfileView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    def patch(self, request):
        user = request.user
        profile = user.studentprofile if hasattr(user, 'studentprofile') else \
                  user.teacherprofile if hasattr(user, 'teacherprofile') else None
        user.bio = request.data.get('bio', user.bio)
        user.phone_number = request.data.get('phone_number', user.phone_number)

        if 'profile_pic' in request.FILES:
            user.profile_pic = request.FILES['profile_pic']

        user.save()
        return Response({
            'bio': user.bio,
            'phone_number': user.phone_number,
            'profile_pic': request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else None,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role
        })