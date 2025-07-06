from ..models import Player
from rest_framework.decorators import api_view
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.response import Response
from rest_framework import status

# creates a new player object with the specified role, starting money, and play style
def create_player(role, money, play_style, num_trading_days):

    # invalid role
    if role not in (Player.ROLE_SYSTEM, Player.ROLE_PLAYER, Player.ROLE_BOT):
        return None
    
    player = Player()
    player.role = role
    player.money = money
    player.play_style = play_style

    # initialize interest_earned and interest_paid arrays
    player.interest_earned = [0 for _ in range(num_trading_days)]
    player.interest_paid = [0 for _ in range(num_trading_days)]

    player.save()

    return player


# returns amount of interest earned and paid on a single day by a player
@api_view(['GET'])
def get_interest_earned_and_paid(request, player_id, trading_day):
    try:
        trading_day = int(trading_day)
        player = Player.objects.get(id=player_id)
    except ObjectDoesNotExist:
        return Response({
        "error": "Player does not exist, or traidng day is not a valid integer"
        }, status=status.HTTP_400_BAD_REQUEST)
    

    if trading_day < 1 or trading_day > len(player.interest_earned):
        return Response({
        "error": "Supplied trading day is out of bounds for the given player"
        }, status=status.HTTP_400_BAD_REQUEST)


    return Response({
        "success": f"Returned interest earned and gained on day {trading_day}",
        "interest_earned": player.interest_earned[trading_day - 1],
        "interest_paid":player.interest_paid[trading_day - 1]
        }, status=status.HTTP_200_OK)

