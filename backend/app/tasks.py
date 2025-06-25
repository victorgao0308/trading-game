from celery import shared_task
from .models import Order, Stock, Player
from decimal import Decimal


SUCCESS = 1

@shared_task
def my_test_task():
    print("Celery task executed!")
    return "Task completed"


# handles purchasing of a stock by a player in solo mode
# this function will move the order into the pending orders list of the stock object, and update the status of the order
# the process_buy_stock_solo object, which will get triggered on the next game tick, will apply changes to the models
@shared_task
def handle_buy_stock_solo(order, stock):
    order.status = Order.STATUS_FILLED
    order.save()
    stock.pending_orders.add(order)
    stock.save()
    return SUCCESS


# this function runs every game tick, processing all the orders in the pending orders list of the stock object
@shared_task
def process_buy_stock_solo(order, stock):
    player = order.from_player
    quantity = order.quantity
    price = order.price
    stock_id = str(stock.id)

    total_cost = Decimal(str(quantity * price)).quantize(Decimal("0.01"))

    # add check to see if player has enough money? or allow player to go negative?
    player.money -= total_cost

    if stock_id not in player.owned_stocks:
        player.owned_stocks[stock_id] = 0

    player.owned_stocks[stock_id] += quantity

    player.save()

    order.status = Order.STATUS_CONFIRMED
    order.day_confirmed_on = order.day_placed_on
    order.save()

    return SUCCESS


# handles purchasing of a stock in regular mode
# TODO
@shared_task
def handle_buy_stock_regular(order, stock):
    order.status = Order.STATUS_PLACED
    order.save()
    stock.pending_orders.add(order)
    stock.save()
    return SUCCESS