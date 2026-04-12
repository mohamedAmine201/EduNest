from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from .models import Room
from notifications.utils import notify_user


@receiver(m2m_changed, sender=Room.participants.through)
def on_participant_added(sender, instance, action, pk_set, **kwargs):
    if action == "post_add":
        for user_id in pk_set:
            notify_user(
                user_id=user_id,
                message=f'You were added to room "{instance.name}".',
                notif_type="room",
            )