from ..models import Player



# creates a new player object with the specified role, starting money, and play style
def create_player(role, money, play_style):

    # invalid role
    if role not in (Player.ROLE_SYSTEM, Player.ROLE_PLAYER, Player.ROLE_BOT):
        return None
    
    player = Player()
    player.role = role
    player.money = money
    player.play_style = play_style

    player.save()

    return player

