from celery import shared_task
from .models import Player, GameManager


@shared_task
def my_test_task():
    print("Celery task executed!")
    return "Task completed"


# handles purchasing of a stock by a player in solo mode
@shared_task
def handle_buy_stock_solo(player, quantity, price, stock_id):

    return player