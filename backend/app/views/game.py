from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import BaseGame, GameManager


from ..engine.prices import getNextPriceSolo

from .stock import create_stock

@api_view(['POST'])
def create_base_game(request):
    num_players = request.data.get('num_players')
    seed = request.data.get('seed')

    if seed is None:
        seed = ""

    stock = create_stock(seed)
    
    base_game = BaseGame()

    base_game.stock = stock

    if num_players is not None:
        base_game.num_players = num_players
    base_game.save()
    return Response({
        "success": "Base game created",
        "base_game": base_game.to_dict()                    
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def delete_base_game(request, game_id):
    try:
        game = BaseGame.objects.get(id=game_id)  
        stock = game.stock
        stock.delete()
        game.delete()
        return Response({
            "message": f"Base game with id {game_id} deleted successfully",
            "game_id" : game_id,
            }, status=status.HTTP_200_OK)
    
    except:
        return Response({
            "error": f"Base game deletion failed. Either a base game with id {game_id} doesn't exist, or the stock associated with the game does not exist.",
            "game_id" : game_id,
            }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def get_game_manager(request):
    manager = GameManager()

    serialized_games = {}

    for game_id, game in manager.games.items():
        serialized_games[game_id] = game.to_dict()

    return Response({
        "success": "Game manager returned",
        "game_manager": serialized_games
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def register_base_game(request, game_id):
    manager = GameManager()
    ret = manager.register_game(game_id)
    if (ret == -1):
        return Response({
            "error": f"Base game with id {game_id} already registered",
            "game_id" : game_id
            },status=status.HTTP_400_BAD_REQUEST)
    

    if (ret == -2):
        return Response({
            "error": f"Base game with id {game_id} does not exist",
            "game_id" : game_id
            },status=status.HTTP_400_BAD_REQUEST)
    
    if (ret == 0):
        return Response({
            "success": f"Base game with id {game_id} registered successfully",
            "game_id" : game_id
            },status=status.HTTP_200_OK)
    

@api_view(['GET'])
def get_next_base_game_price_solo(request, game_id):
    price = getNextPriceSolo(game_id)

    if price == -1:
         return Response({
            "error": f"Base game with id {game_id} not registered yet"            
            },status=status.HTTP_400_BAD_REQUEST)


    return Response({
            "success": f"Base game with id {game_id} price updated successfully",
            "price": price
            
            },status=status.HTTP_200_OK)


    