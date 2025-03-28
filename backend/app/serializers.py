from rest_framework import serializers
from .models import baseGame

class GameInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = baseGame
        fields = '__all__'

    def create(self, data):
        num_players = data.get("num_players", 1)

        return baseGame.objects.create(**data)