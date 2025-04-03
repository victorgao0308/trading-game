'''
calculates and returns the price of a given stock


eventually, will use real-world data, current supply/demand, and random events to do so
'''
from decimal import Decimal, ROUND_DOWN
import random
from ..models import GameManager


'''
Gets next price in solo mode.

In solo mode, there are no bots. The player can directly sell/buy at the listed price.
Price is based on historical stock data, random events that occur in game, and based 
on the player's purchasing patterns.
'''
def getNextPriceSolo(game_id):
    manager = GameManager()
    
    game = manager.get_game(game_id)

    if game == None:
        return -1
    
    stock = game.stock

    if stock == None:
        return -1
    

    delta = Decimal(str(round(random.uniform(-2.5, 2.5), 2)))

    # ensure new price is non-negative
    new_price = max(Decimal(0), stock.current_price + delta)


    # ensure rounding to 2 decimal places
    stock.current_price = new_price.quantize(Decimal('0.01'), rounding=ROUND_DOWN)

    return stock.current_price




    
