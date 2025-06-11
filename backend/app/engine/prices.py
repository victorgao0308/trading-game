from ..models import GameManager
from app.tasks import process_buy_stock_solo, SUCCESS


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

    new_price = stock.next_values[0]

    stock.next_values = stock.next_values[1:]

    stock.current_price = new_price

    stock.ticks_generated += 1

    stock.past_values.append(stock.current_price)


    # move orders from pending to fulfilled, and process them via celery
    fulfilled_orders = stock.pending_orders.all()

    for order in fulfilled_orders:
        process_buy_stock_solo(order, stock)

    stock.fulfilled_orders.add(*fulfilled_orders)
    stock.pending_orders.clear()

    stock.save()

    return stock.current_price




    
