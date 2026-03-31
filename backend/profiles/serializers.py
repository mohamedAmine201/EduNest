from rest_framework import serializers
from .models import StudentProfile, TeacherProfile, HeadProfile
from courses.models import Course

class StudentSerializer(serializers.ModelSerializer):
    nom        = serializers.CharField(source='user.last_name')
    prenom     = serializers.CharField(source='user.first_name')
    email      = serializers.EmailField(source='user.email')
    year       = serializers.IntegerField(source='speciality_year.year', read_only=True)
    speciality = serializers.CharField(source='speciality_year.speciality', read_only=True)
    user_id    = serializers.IntegerField(source='user.id')
    role       = serializers.CharField(source='user.role')

    class Meta:
        model  = StudentProfile
        fields = ['id', 'matricule', 'nom', 'prenom', 'email', 'year', 'speciality', 'user_id', 'role']


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

class CourseWithTeacherSerializer(serializers.ModelSerializer):
    nom     = serializers.CharField(source='teacher.user.last_name', allow_null=True, default=None)
    prenom  = serializers.CharField(source='teacher.user.first_name', allow_null=True, default=None)
    email   = serializers.EmailField(source='teacher.user.email', allow_null=True, default=None)
    course  = serializers.CharField(source='name')
    user_id = serializers.IntegerField(source='teacher.user.id', allow_null=True, default=None)
    role    = serializers.CharField(source='teacher.user.role', allow_null=True, default=None)

    class Meta:
        model  = Course
        fields = ['id', 'course', 'nom', 'prenom', 'email', 'user_id', 'role']