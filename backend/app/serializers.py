from rest_framework import serializers
from .models import baseGame

class GameInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = baseGame
        fields = ['id', 'created_at']