from django.db import models

class SpecialityYear(models.Model):
    SPECIALITY_CHOICES = [
        ('DSIA', 'Data Science'),
        ('MI', 'Management Industriel')
    ]
    speciality = models.CharField(max_length=10, choices=SPECIALITY_CHOICES)
    year = models.PositiveIntegerField()

    def __str__(self):
        return f"Year {self.year} - {self.get_speciality_display()}"


class SpecialitySemester(models.Model):
    speciality_year = models.ForeignKey(SpecialityYear, on_delete=models.CASCADE, related_name='semesters')
    semester = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('speciality_year', 'semester')

    def __str__(self):
        return f"{self.speciality_year.get_speciality_display()} - Year {self.speciality_year.year}, Semester {self.semester}"
