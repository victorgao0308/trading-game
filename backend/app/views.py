from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import GameInstanceSerializer
from .models import baseGame

@api_view(['POST'])
def create_game(request):
    serializer = GameInstanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_game(request, game_id):
    try:
        game_instance = baseGame.objects.get(id=game_id)  
        game_instance.delete()
        return Response({"message": f"Game with id {game_id} deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except baseGame.DoesNotExist:
        return Response({"error": f"Game with id {game_id} not found"}, status=status.HTTP_404_NOT_FOUND)