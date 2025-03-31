from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import Stock, GameManager


@api_view(['POST'])
def create_stock(request):
    seed = request.data.get('seed')

    stock = Stock()

    if seed is not None:
        stock.seed = seed

    return Response({
        "success": "base_game created",
        "base_game": stock.to_dict()                    
    }, status=status.HTTP_200_OK)


    



    