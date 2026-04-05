from django.db import models
from django.contrib.auth.models import AbstractUser
from django.forms import ValidationError
from specialities.models import SpecialityYear

class User(AbstractUser):
    ROLE_CHOICES = [
            ('STUDENT', 'Student'),
            ('TEACHER', 'Teacher'),
            ('HEAD', 'Departement Head')
        ]

    identifier   = models.CharField(max_length=50, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    profile_pic = models.ImageField(upload_to='profiles/', blank=True, null=True, default='profiles/default.png')
    bio = models.TextField(blank=True)
    role = models.CharField(max_length=10, choices= ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} - {self.role}"
