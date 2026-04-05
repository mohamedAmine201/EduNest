from .models import StudentCourse, Course
from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver

# When a student is added to course.students, create their StudentCourse
@receiver(m2m_changed, sender=Course.students.through)
def create_student_course_on_enrollment(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        for student_pk in pk_set:
            StudentCourse.objects.get_or_create(
                student_id=student_pk,
                course=instance
            )