from ..models import Stock, Order, Player, BaseGame
import random
import json
import os
from app.data.data_processing.compress_data import uncompress_data
from bitarray import bitarray
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from app.tasks import handle_buy_stock_solo


def create_stock(seed, total_ticks):
    stock = Stock()

    # set the seed
    random.seed(seed)

    # select a random stock meta data
    with open("app/data/stocks_meta.json", "r") as file:
        data = json.load(file)
    data = random.choice(data)

    # select random historical stock to derive prices from
    stocks = [f for f in os.listdir("app/data/compressed_data")]
    if stocks is None:
        return None
    
    underlying_stock = random.choice(stocks)

    stock.underlying_stock = underlying_stock[:-11]

    # read in the number of entries in this file
    filePath = f'app/data/compressed_data/{underlying_stock}'
    ba = bitarray()
    with open(filePath, 'rb') as f:
        ba.fromfile(f)

    ba = ba.to01()

    # number of data points
    points = int(ba[3:19], 2)

    # pick a random place within the file to act as the starting  point
    start_index = random.randint(0, points - total_ticks - 11)

    # get data points
    prices = uncompress_data(underlying_stock, start_index, total_ticks + 10)

    # set initial prices
    initial_prices = prices[:10]

    stock.first_tick_index = start_index
    stock.ticks_generated = 0
    stock.next_values = prices[10:]
    stock.past_values = initial_prices

    stock.current_price = initial_prices[-1]
    stock.stock_name = data["stock_name"]
    stock.company_name = data["company_name"]
    stock.description = data["description"]
    stock.industries = data["industries"]
    

    stock.save()

    return stock, initial_prices

# creates a new order in a base game
@api_view(['POST'])
def create_base_order(request):
    order_type = request.data.get('order_type')
    player_id = request.data.get('player_id')
    timestamp = request.data.get('timestamp')
    quantity = request.data.get('quantity')
    price = request.data.get('price')
    game_id = request.data.get('game_id')
    stock_id = request.data.get('stock_id')

    if order_type is None or player_id is None or timestamp is None or \
       quantity is None or price is None or game_id is None or stock_id is None:
        return Response({
        "error": "invalid parameters"
        }, status=status.HTTP_400_BAD_REQUEST)
    

    order = Order()
    player = Player.objects.get(id=player_id)
    game = BaseGame.objects.get(id=game_id)
    stock = Stock.objects.get(id=stock_id)

    if player is None or game is None or stock is None:
        return Response({
        "error": "player, game, or stock do not exist"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    order.from_player = player
    order.type = order_type
    order.timestamp = timestamp
    order.quantity = quantity
    order.price = price

    order.save()
    return Response({
    "success": "Order created successfully",
    "order": order.to_dict()
    }, status=status.HTTP_200_OK)


# purchase a stock in solo mode
# player always buys/sells from the system player in solo mode
# handle with the order model
@api_view(['POST'])
def buy_stock_solo(request):
    

    # send request to celery
    #handle_buy_stock_solo()


    return Response({
        #"player": player.to_dict()
        }, status=status.HTTP_200_OK)






    