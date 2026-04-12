from django.db import models

class Room(models.Model):
    host = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='rooms')
    speciality_year = models.ForeignKey('specialities.SpecialityYear', on_delete=models.CASCADE, null=True, related_name="rooms")
    participants = models.ManyToManyField('profiles.StudentProfile', related_name='rooms')
    topic = models.CharField(max_length=100)
    description = models.TextField()
    created = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Room - {self.topic}"
    class Meta:
        ordering = ['-created']

class Message(models.Model):
    owner = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='messages')
    room = models.ForeignKey('rooms.Room', on_delete=models.CASCADE, null=True, related_name='messages')
    body = models.CharField(max_length=200, blank=True, null=True)
    created = models.DateField(auto_now_add=True)
    attachment = models.FileField(
        upload_to='messaes_attachment/',
        null=True,
        blank=True
    )

    def __str__(self): 
        return f"Message from {self.owner.username} - {self.body[:30]}"
    class Meta:
        ordering = ['-created']