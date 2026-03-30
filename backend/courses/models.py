from django.db import models
from profiles.models import StudentProfile, TeacherProfile

class Course(models.Model):
    semester = models.ForeignKey('specialities.SpecialitySemester', on_delete=models.CASCADE, related_name='courses', null=True)
    name = models.CharField(max_length=150)
    coefficient = models.IntegerField(default=1)
    teacher = models.ForeignKey(
        TeacherProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='courses'
    )
    students = models.ManyToManyField(
        StudentProfile,
        related_name='courses',
        blank=True
    )

    def __str__(self):
        return self.name



class Evaluation(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='evaluations')
    name = models.CharField(max_length=100)
    weight = models.FloatField(default=0.0)
    def __str__(self):
        return f"{self.course.name} - {self.name}"
    


class StudentEvaluation(models.Model):
    student = models.ForeignKey('profiles.StudentProfile', on_delete=models.CASCADE, related_name='evaluations')
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='student_scores')
    grade = models.FloatField(null=True, blank=True)
    
    class Meta:
        unique_together = ('student', 'evaluation')

    def __str__(self): 
        return f"{self.student.user.user.username} - {self.evaluation.name}: {self.grade}"



class StudentCourse(models.Model):
    student = models.ForeignKey('profiles.StudentProfile', on_delete=models.CASCADE, related_name='course_grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_grades') 
    final_grade = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'course')

    def calculate_final_grade(self):
        evaluations = self.course.evaluations.all()
        total = 0 
        for eval in evaluations:
            student_eval = StudentEvaluation.objects.filter(student=self.student, evaluation=eval).first()
            if student_eval and student_eval.grade is not None:
                total += student_eval.grade * eval.weight
        self.final_grade = total 
        return self.final_grade