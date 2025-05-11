from celery import shared_task 

@shared_task
def my_test_task():
    print("Celery task executed!")
    return "Task completed"


@shared_task
def handle_buy_stock(game_id, player_id, quantity, timestamp):
    # Perform the stock transaction logic here
    print(f"Buying {quantity} shares for player {player_id} in game {game_id} at {timestamp}")
    # Add your actual business logic here
    return {"status": "processed"}