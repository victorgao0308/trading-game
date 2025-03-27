from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import baseGame
from .serializers import GameInstanceSerializer

@api_view(['POST'])
def create_game(request):
    serializer = GameInstanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)