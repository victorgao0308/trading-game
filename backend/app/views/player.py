from ..models import Player



# creates a new player object with the specified role and starting money
def create_player(role, money):

    # invalid role
    if role not in (Player.ROLE_SYSTEM, Player.ROLE_PLAYER, Player.ROLE_BOT):
        return None
    
    player = Player()
    player.role = role
    player.money = money

    player.save()

    return player
