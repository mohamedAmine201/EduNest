from django.shortcuts import render
from rest_framework.generics import ListAPIView
from .models import SpecialityYear
from .serializers import SpecialityYearSerializer


class SpecialityListAPIView(ListAPIView):
    queryset = SpecialityYear.objects.all()
    serializer_class = SpecialityYearSerializer