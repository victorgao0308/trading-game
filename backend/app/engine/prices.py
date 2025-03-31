'''
calculates and returns the price of a given stock


eventually, will use real-world data, current supply/demand, and random events to do so
'''

import random


from ..models import GameManager


'''
Gets next price in solo mode.

In solo mode, there are no bots. The player can directly sell/buy at the listed price.
Price is based on historical stock data, random events that occur in game, and based 
on the player's purchasing patterns
'''
def getNextPriceSolo(game_id):
    manager = GameManager()

    game = manager.get_game(game_id)

    if game == None:
        return -1
    
    rand = random.uniform(-2.5, 3.5)

    game.cur_price = max(0, game.cur_price + rand)

    return game.cur_price




    
