from rest_framework import serializers
from .models import BaseGame, GameManager

class BaseGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseGame
        fields = ['id', 'created_at', 'num_players']

    def create(self, data):
        return BaseGame.objects.create(**data)
    

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['request_queue'] = instance.request_queue if isinstance(instance.request_queue, list) else []

        return representation
    
