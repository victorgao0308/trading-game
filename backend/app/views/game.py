from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from ..models import BaseGame, GameManager, Player
from ..engine.prices import getNextPriceSolo
from .player import create_player
from .stock import create_stock


import string
import random

@api_view(['POST'])
def create_base_game(request):
    num_players = request.data.get('num_players')
    total_ticks = request.data.get('total_ticks')
    seed = request.data.get('seed')

    # generate a random seed if no seed provided
    if seed is None or seed == "":
        characters = string.ascii_letters + string.digits
        seed = ''.join(random.choices(characters, k=16))


    stock, initial_prices = create_stock(seed, total_ticks)
    system = create_player(Player.ROLE_SYSTEM)
    player = create_player(Player.ROLE_PLAYER)
    if system is None or player is None:
        return Response({
        "error": "Error with player creation"    
        }, status=status.HTTP_400_BAD_REQUEST)

    base_game = BaseGame()
    
    base_game.seed = seed
    base_game.stock = stock
    base_game.num_players = 2
    base_game.save()

    base_game.players.set([system, player])


    if num_players is not None:
        base_game.num_players = num_players

    base_game.save()

    return Response({
        "success": "Base game created",
        "base_game": base_game.to_dict(),
        "initial_prices": initial_prices                   
    }, status=status.HTTP_200_OK)



@api_view(['POST'])
def create_tutorial(request):
    stock = create_stock("TUTORIAL")
    
    base_game = BaseGame()

    base_game.stock = stock

    base_game.save()
    return Response({
        "success": "Tutorial created",
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
            "note": f"Base game with id {game_id} already registered",
            "game_id" : game_id
            },status=status.HTTP_200_OK)
    

    if (ret == -2):
        return Response({
            "error": f"Base game with id {game_id} does not exist",
            "game_id" : game_id
            },status=status.HTTP_400_BAD_REQUEST)
    
    if (ret == 0):
        return Response({
            "success": f"Base game with id {game_id} registered successfully",
            "game_id" : game_id,
            "game": BaseGame.objects.get(id=game_id).to_dict()
            },status=status.HTTP_200_OK)
    

# removes game from game manager
@api_view(['DELETE'])
def remove_game_from_manager(request, game_id):
    manager = GameManager()
    print(game_id)
    ret = manager.remove_game(game_id)

    for game in manager.games:
        print(type(game))
    if (ret == -1):
        return Response({
            "note": f"Game with id {game_id} does not exist in game manager",
            "game_id" : game_id
            },status=status.HTTP_400_BAD_REQUEST)
    
    if (ret == 0):
        return Response({
            "success": f"Base game with id {game_id} removed from game manager successfully",
            "game_id" : game_id,
            "game_manager" : [game.to_dict() for game in manager.games.values()]
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


@api_view(['POST'])
def pause_base_game(request, game_id):
    pause_time = request.data.get('time')
    try:
        game = BaseGame.objects.get(id=game_id)  
        game.is_paused = True
        game.time_to_next_tick = pause_time
        game.save()
        return Response({
            "message": f"Base game with id {game_id} paused successfully",
            "game_id" : game_id,
            "time_to_next_tick": game.time_to_next_tick,
            "game": game.to_dict()
            }, status=status.HTTP_200_OK)
    
    except:
        return Response({
            "error": f"Base game pause failed. Either a base game with id {game_id} doesn't exist, or some server error occurred.",
            "game_id" : game_id,
            }, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def resume_base_game(request, game_id):
    try:
        game = BaseGame.objects.get(id=game_id)  
        game.is_paused = False
        game.time_to_next_tick = -1
        game.save()
        return Response({
            "message": f"Base game with id {game_id} resumed successfully",
            "game_id" : game_id,
            "game": game.to_dict()
            }, status=status.HTTP_200_OK)
    
    except:
        return Response({
            "error": f"Base game resume failed. Either a base game with id {game_id} doesn't exist, or some server error occurred.",
            "game_id" : game_id,
            }, status=status.HTTP_404_NOT_FOUND)