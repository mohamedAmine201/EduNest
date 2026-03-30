from rest_framework import serializers 
from .models import Room, Message 

class RoomSerializer(serializers.ModelSerializer):
    host = serializers.CharField(source='host.username', read_only=True)
    host_id = serializers.IntegerField(source='host.id', read_only=True)
    class Meta:
        model = Room 
        fields = ['id', 'host', 'host_id', 'speciality_year','participants', 'topic', 'description', 'created']
        extra_kwargs = {
                'participants': {'required': False},
                'host': {'read_only': True},
                'created': {'read_only': True},
            }


class MessageSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='owner.username', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    room = serializers.CharField(source='room.topic', read_only=True)
    room_id = serializers.IntegerField(source='room.id', read_only=True)
    class Meta:
        model = Message 
        fields = ['id', 'room', 'room_id', 'owner', 'owner_id', 'body', 'attachment', 'created']

    def validate_attachment(self, value):
        if value and not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Only pdf files are allowed")
        return value