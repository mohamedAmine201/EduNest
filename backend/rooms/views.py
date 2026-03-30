from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView 
from rest_framework import generics
from rest_framework import status, permissions
from rest_framework.response import Response
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer
from .permissions import IsTeacherOrHead

def get_rooms_for_user(user):
    if user.role == 'STUDENT':
        return Room.objects.filter(participants__user=user).order_by('-created')
    elif user.role == 'TEACHER':
        return Room.objects.filter(host=user).order_by('-created')
    elif user.role == 'HEAD':
        return Room.objects.all().order_by('-created')
    else:
        return Room.objects.none()
    
def get_messages_for_user(user):
    if user.role == 'STUDENT':
        return Message.objects.filter(room__participants__user=user)
    if user.role == 'TEACHER':
        return Message.objects.filter(room__host=user)
    if user.role == 'HEAD':
        return Message.objects.all()
    return Message.objects.none()

class RoomListCreateAPIView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsTeacherOrHead]

    def get_queryset(self):
        return get_rooms_for_user(self.request.user).order_by('-created')
    def perform_create(self, serializer):
        room = serializer.save(host=self.request.user)
        if room.speciality_year:
            from profiles.models import StudentProfile
            students = StudentProfile.objects.filter(speciality_year=room.speciality_year)
            room.participants.set(students)

class RoomRetrieveDestroy(generics.RetrieveDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class RoomCountAPIView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = get_rooms_for_user(self.request.user)
        return Response({'room_count': queryset.count()})



class MessageCreateAPIView(APIView):
    def post(self, request, room_id, *args, **kwargs):
        room = get_object_or_404(Room, id=room_id)
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user, room=room)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RoomMessageListAPIView(generics.ListAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        return Message.objects.filter(room__id=room_id)

class MessageListAPIView(generics.ListAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        return get_messages_for_user(self.request.user).order_by('-created')[:3]


class MessageDeleteAPIView(generics.DestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
