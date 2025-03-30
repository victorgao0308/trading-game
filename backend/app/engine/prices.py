'''
calculates and returns the price of a given stock


eventually, will use real-world data, current supply/demand, and random events to do so
'''

import random


from ..models import GameManager


def getNextPrice(game_id):
    manager = GameManager()

    game = manager.get_game(game_id)

    if game == None:
        return -1
    
    rand = random.uniform(-2.5, 3.5)

    game.cur_price = max(0, game.cur_price + rand)

    return game.cur_price




    
