from rest_framework import serializers
from .models import Course, Evaluation
from profiles.models import StudentProfile

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'name', 'weight']

class EnrolledStudentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')

    class Meta:
        model = StudentProfile
        fields = ['id', 'first_name', 'last_name']

class CourseSerializer(serializers.ModelSerializer):
    evaluations = EvaluationSerializer(many=True, read_only=True)
    students = EnrolledStudentSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'coefficient', 'evaluations', 'students']