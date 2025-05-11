from ..models import Player



# creates a new player object with the specified role
def create_player(role):

    # invlid role
    if role not in (Player.ROLE_SYSTEM, Player.ROLE_PLAYER, Player.ROLE_BOT):
        return None
    
    player = Player()
    player.role = role

    player.save()

    return player
