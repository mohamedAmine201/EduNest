from rest_framework.serializers import ModelSerializer
from .models import SpecialityYear


class SpecialityYearSerializer(ModelSerializer):
    class Meta:
        model = SpecialityYear 
        fields = '__all__'