from celery import shared_task
from .models import Order, Stock, Player
from decimal import Decimal


SUCCESS = 1

@shared_task
def my_test_task():
    print("Celery task executed!")
    return "Task completed"


# handles purchasing of a stock by a player in solo mode
@shared_task
def handle_buy_stock_solo(order, stock):
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

    order.status = Order.STATUS_PENDING
    order.save()

    stock.pending_orders.add(order)
    stock.save()

    return SUCCESS
