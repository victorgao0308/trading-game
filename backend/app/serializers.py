from rest_framework import serializers
from .models import BaseGame

class GameInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseGame
        fields = '__all__'

    def create(self, data):
        return BaseGame.objects.create(**data)