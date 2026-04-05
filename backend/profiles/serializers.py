from rest_framework import serializers
from .models import StudentProfile, TeacherProfile, HeadProfile
from courses.models import Course

class StudentSerializer(serializers.ModelSerializer):
    identifier = serializers.CharField(source='user.identifier')
    nom        = serializers.CharField(source='user.last_name')
    prenom     = serializers.CharField(source='user.first_name')
    email      = serializers.EmailField(source='user.email')
    year       = serializers.IntegerField(source='speciality_year.year', read_only=True)
    speciality = serializers.CharField(source='speciality_year.speciality', read_only=True)
    display_year       = serializers.CharField(source='speciality_year.year',       allow_null=True)
    display_speciality = serializers.CharField(source='speciality_year.speciality', allow_null=True)
    user_id    = serializers.IntegerField(source='user.id')
    role       = serializers.CharField(source='user.role')
    phone_number = serializers.CharField(source='user.phone_number')
    

    class Meta:
        model  = StudentProfile
        fields = ['id', 'identifier', 'nom', 'prenom', 'email', 'year', 'display_year', 'speciality',
                   'display_speciality', 'user_id', 'role', 'phone_number']


class TeacherSerializer(serializers.ModelSerializer):
    nom    = serializers.CharField(source='user.last_name')
    prenom = serializers.CharField(source='user.first_name')
    email  = serializers.EmailField(source='user.email')
    user_id    = serializers.IntegerField(source='user.id')

    class Meta:
        model  = TeacherProfile
        fields = ['id', 'nom', 'prenom', 'email', 'user_id']


class HeadSerializer(serializers.ModelSerializer):
    nom    = serializers.CharField(source='user.last_name')
    prenom = serializers.CharField(source='user.first_name')
    email  = serializers.EmailField(source='user.email')

    class Meta:
        model  = HeadProfile
        fields = ['id', 'nom', 'prenom', 'email']

class TeacherInCourseSerializer(serializers.ModelSerializer):
    nom    = serializers.CharField(source='user.last_name')
    prenom = serializers.CharField(source='user.first_name')
    email  = serializers.EmailField(source='user.email')
    user_id = serializers.IntegerField(source='user.id')
    role   = serializers.CharField(source='user.role')

    class Meta:
        model  = TeacherProfile
        fields = ['user_id', 'nom', 'prenom', 'email', 'role']


class CourseWithTeacherSerializer(serializers.ModelSerializer):
    course   = serializers.CharField(source='name')
    teachers = TeacherInCourseSerializer(many=True, read_only=True)

    class Meta:
        model  = Course
        fields = ['id', 'course', 'teachers']