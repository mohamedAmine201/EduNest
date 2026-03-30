from django.db import models
from django.forms import ValidationError

class StudentProfile(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE, related_name='student_profile')
    matricule = models.CharField(max_length=20, unique=True, blank=True)
    speciality_year = models.ForeignKey('specialities.SpecialityYear', on_delete=models.CASCADE, related_name='students', null=True, blank=True)

    def clean(self):
        if self.user.role != 'STUDENT':
            raise ValidationError("This user role isn't a Student")

    def __str__(self):
        return f"{self.matricule} - {self.user.email}"
    
    @property
    def courses(self):
        from courses.models import Course
        return Course.objects.filter(semester__speciality_year=self.speciality_year)
    
    def semester_avg(self, semester): 
        if not semester: 
            return None 
        total, coeff_sum = 0, 0
        for course in semester.courses.all():
            sc = self.course_grades.filter(course=course).first()
            if sc:
                sc.calculate_final_grade()
                if sc.final_grade is not None:
                    total += sc.final_grade * course.coefficient
                    coeff_sum += course.coefficient
        return total / coeff_sum if coeff_sum > 0 else None

    
    def year_avg(self):
        if not self.speciality_year:
            return None
        semesters = self.speciality_year.semesters.all()
        avgs = [avg for sem in semesters if (avg := self.semester_avg(sem)) is not None]
        return sum(avgs) / len(avgs) if avgs else None


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