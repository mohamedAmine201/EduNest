from django.db import models
from django.forms import ValidationError

class StudentProfile(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='student_profile')
    speciality_year = models.ForeignKey('specialities.SpecialityYear', on_delete=models.CASCADE, related_name='students', null=True, blank=True)

    def clean(self):
        if self.user.role != 'STUDENT':
            raise ValidationError("This user role isn't a Student")

    def __str__(self):
        return f"{self.user.identifier} {self.user.email}"


class TeacherProfile(models.Model): 
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='teacher_profile') 

    def clean(self):
        if self.user.role != 'TEACHER':
            raise ValidationError("This user role isn't a Teacher")

    def __str__(self): 
        return f"Teacher: {self.user.username}"


class HeadProfile(models.Model): 
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='head_profile') 

    def clean(self):
        if self.user.role != 'HEAD':
            raise ValidationError('This user role is not a head')

    def __str__(self): 
        return f"Head: {self.user.username}"